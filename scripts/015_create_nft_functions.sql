-- VersePoints Phase 2: NFT System Functions

-- Function to purchase an NFT
CREATE OR REPLACE FUNCTION purchase_nft(
  buyer_id UUID,
  nft_catalog_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_nft_id UUID) AS $$
DECLARE
  nft_record RECORD;
  buyer_record RECORD;
  buyer_rank VARCHAR(20);
  new_user_nft_id UUID;
BEGIN
  -- Get NFT details
  SELECT * INTO nft_record
  FROM nft_catalog
  WHERE id = nft_catalog_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'NFT not found or not available'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check supply
  IF nft_record.max_supply IS NOT NULL AND nft_record.current_supply >= nft_record.max_supply THEN
    RETURN QUERY SELECT false, 'NFT sold out'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get buyer details
  SELECT * INTO buyer_record FROM users WHERE id = buyer_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check buyer rank requirement
  IF nft_record.required_rank IS NOT NULL THEN
    SELECT rank_name INTO buyer_rank FROM user_ranks WHERE user_id = buyer_id;
    
    -- Simple rank hierarchy check
    IF buyer_rank IS NULL OR (
      (nft_record.required_rank = 'citizen' AND buyer_rank != 'citizen') OR
      (nft_record.required_rank = 'diamond' AND buyer_rank NOT IN ('diamond', 'citizen')) OR
      (nft_record.required_rank = 'gold' AND buyer_rank NOT IN ('gold', 'diamond', 'citizen')) OR
      (nft_record.required_rank = 'silver' AND buyer_rank NOT IN ('silver', 'gold', 'diamond', 'citizen'))
    ) THEN
      RETURN QUERY SELECT false, ('Requires ' || nft_record.required_rank || ' rank or higher')::TEXT, NULL::UUID;
      RETURN;
    END IF;
  END IF;

  -- Check balance
  IF buyer_record.points_balance < nft_record.vp_cost THEN
    RETURN QUERY SELECT false, 'Insufficient VersePoints'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Deduct points
  UPDATE users
  SET points_balance = points_balance - nft_record.vp_cost
  WHERE id = buyer_id;

  -- Add NFT to user inventory
  INSERT INTO user_nfts (user_id, nft_id, purchase_cost)
  VALUES (buyer_id, nft_catalog_id, nft_record.vp_cost)
  RETURNING id INTO new_user_nft_id;

  -- Update NFT supply
  UPDATE nft_catalog
  SET current_supply = current_supply + 1
  WHERE id = nft_catalog_id;

  -- Log transaction
  INSERT INTO nft_transactions (user_id, nft_id, transaction_type, vp_amount)
  VALUES (buyer_id, nft_catalog_id, 'purchase', nft_record.vp_cost);

  RETURN QUERY SELECT true, 'NFT purchased successfully'::TEXT, new_user_nft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to equip/unequip NFT
CREATE OR REPLACE FUNCTION toggle_nft_equipped(
  owner_id UUID,
  user_nft_id UUID
)
RETURNS TABLE(success BOOLEAN, is_now_equipped BOOLEAN) AS $$
DECLARE
  nft_record RECORD;
  new_equipped_state BOOLEAN;
BEGIN
  -- Get NFT ownership
  SELECT * INTO nft_record
  FROM user_nfts
  WHERE id = user_nft_id AND user_id = owner_id AND is_burned = false;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  -- Toggle equipped state
  new_equipped_state := NOT nft_record.is_equipped;

  UPDATE user_nfts
  SET is_equipped = new_equipped_state
  WHERE id = user_nft_id;

  RETURN QUERY SELECT true, new_equipped_state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade NFTs (burn 3 of same tier to get 1 of higher tier)
CREATE OR REPLACE FUNCTION upgrade_nfts(
  owner_id UUID,
  nft_ids UUID[],
  target_tier VARCHAR(20)
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_nft_id UUID) AS $$
DECLARE
  combo RECORD;
  nft RECORD;
  input_tier VARCHAR(20);
  output_nft RECORD;
  new_user_nft_id UUID;
  user_balance INTEGER;
BEGIN
  -- Validate we have exactly 3 NFTs
  IF array_length(nft_ids, 1) != 3 THEN
    RETURN QUERY SELECT false, 'Exactly 3 NFTs required for upgrade'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get the tier of the first NFT
  SELECT nc.tier INTO input_tier
  FROM user_nfts un
  JOIN nft_catalog nc ON nc.id = un.nft_id
  WHERE un.id = nft_ids[1] AND un.user_id = owner_id AND un.is_burned = false;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'NFT not found or not owned'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verify all NFTs are same tier and owned by user
  FOR i IN 1..3 LOOP
    SELECT un.*, nc.tier as nft_tier INTO nft
    FROM user_nfts un
    JOIN nft_catalog nc ON nc.id = un.nft_id
    WHERE un.id = nft_ids[i] AND un.user_id = owner_id AND un.is_burned = false;

    IF NOT FOUND OR nft.nft_tier != input_tier THEN
      RETURN QUERY SELECT false, 'All NFTs must be same tier and owned by you'::TEXT, NULL::UUID;
      RETURN;
    END IF;
  END LOOP;

  -- Get upgrade combination
  SELECT * INTO combo
  FROM nft_upgrade_combinations
  WHERE input_tier = input_tier AND output_tier = target_tier AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid upgrade combination'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check VP cost if any
  IF combo.vp_cost > 0 THEN
    SELECT points_balance INTO user_balance FROM users WHERE id = owner_id;
    IF user_balance < combo.vp_cost THEN
      RETURN QUERY SELECT false, 'Insufficient VersePoints for upgrade'::TEXT, NULL::UUID;
      RETURN;
    END IF;

    -- Deduct VP cost
    UPDATE users SET points_balance = points_balance - combo.vp_cost WHERE id = owner_id;
  END IF;

  -- Burn the 3 NFTs
  UPDATE user_nfts
  SET is_burned = true, burned_at = NOW(), is_equipped = false
  WHERE id = ANY(nft_ids);

  -- Log burn transactions
  FOR i IN 1..3 LOOP
    INSERT INTO nft_transactions (user_id, nft_id, transaction_type, metadata)
    SELECT owner_id, nft_id, 'burn', jsonb_build_object('upgrade_to', target_tier)
    FROM user_nfts WHERE id = nft_ids[i];
  END LOOP;

  -- Get a random NFT of the output tier
  SELECT * INTO output_nft
  FROM nft_catalog
  WHERE tier = target_tier AND is_active = true
  ORDER BY RANDOM()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'No NFTs available in target tier'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Create new NFT for user
  INSERT INTO user_nfts (user_id, nft_id, purchase_cost)
  VALUES (owner_id, output_nft.id, 0)
  RETURNING id INTO new_user_nft_id;

  -- Log upgrade transaction
  INSERT INTO nft_transactions (user_id, nft_id, transaction_type, vp_amount, metadata)
  VALUES (owner_id, output_nft.id, 'upgrade', combo.vp_cost, jsonb_build_object('burned_nfts', nft_ids));

  RETURN QUERY SELECT true, ('Upgraded to ' || output_nft.name)::TEXT, new_user_nft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
