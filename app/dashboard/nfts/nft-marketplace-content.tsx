"use client";

import {useState, Suspense} from "react";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {NFTCard} from "@/components/nft/nft-card";
import {NFTInventoryCard} from "@/components/nft/nft-inventory-card";
import {NFTUpgradePanel} from "@/components/nft/nft-upgrade-panel";
import {Store, Package, Flame, Zap, Coins} from "lucide-react";
import type {
  NFTCatalog,
  UserNFT,
  NFTUpgradeCombination,
  RankName,
  NFTTier,
} from "@/lib/types/phase2";
import {NFTCardVisual} from "@/components/3d/nft-card-3d";
import {toast} from "sonner";
import {
  useMarketplaceUser,
  useNFTCatalog,
  useNFTUpgradeCombinations,
  useUserNFTs,
} from "@/lib/hooks/useNftMarketplace";
import {NFTMarketplaceSkeleton} from "@/components/skeleton/nft-marketplace-skeleton";

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);

interface NFTMarketplaceContentProps {
  userId: string;
}

export function NFTMarketplaceContent({userId}: NFTMarketplaceContentProps) {
  const router = useRouter();

  const {data: user, isLoading: isUserLoading} = useMarketplaceUser(userId);
  const {data: nftCatalog, isLoading: isNftCatalogLoading} = useNFTCatalog();
  const {data: userNftsData, isLoading: isUserNftsLoading} = useUserNFTs(userId);
  const {data: upgradeCombinations, isLoading: isUpgradeCombinationsLoading} =
    useNFTUpgradeCombinations();

  const isLoading =
    isUserLoading || isNftCatalogLoading || isUserNftsLoading || isUpgradeCombinationsLoading;

  const userRank = (user?.user_current_rank || "rookie") as RankName;
  const initialBalance = user?.points_balance || 0;
  const [userBalance, setUserBalance] = useState(initialBalance);
  const [userNfts, setUserNfts] = useState(userNftsData || []);
  const ownedNftIds = new Set(userNfts?.map((n) => n.nft_id));

  // Calculate total boost from equipped NFTs
  const totalBoost = userNfts!
    .filter((n) => n.is_equipped && n.nft)
    .reduce((sum, n) => sum + (n.nft?.mining_boost || 0), 0);

  const featuredNft =
    nftCatalog?.find((n) => n.tier === "legendary") ||
    nftCatalog?.find((n) => n.tier === "diamond") ||
    nftCatalog?.[0];

  const handlePurchase = async (nftId: string) => {
    const response = await fetch("/api/nft/purchase", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({nftId}),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("NFT purchase successful");
      setUserBalance((prev: number) => prev - (data.cost || 0));
      router.refresh();
    } else {
      toast.error(data.error || "Purchase failed");
    }
  };

  const handleEquip = async (userNftId: string) => {
    const response = await fetch("/api/nft/equip", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({userNftId}),
    });

    const data = await response.json();

    if (data.success) {
      setUserNfts((prev: UserNFT[]) =>
        prev.map((n) => (n.id === userNftId ? {...n, is_equipped: data.isEquipped} : n))
      );
    }
  };

  const handleUpgrade = async (nftIds: string[], targetTier: NFTTier) => {
    const response = await fetch("/api/nft/upgrade", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({nftIds, targetTier}),
    });

    const data = await response.json();

    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "Upgrade failed");
    }
  };

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {isLoading ? (
        <NFTMarketplaceSkeleton />
      ) : (
        <>
          <Suspense fallback={null}>
            <FloatingParticles className="opacity-20" color="#8b5cf6" count={1200} />
          </Suspense>

          {/* Header */}
          <div className="relative z-10 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              NFT Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Purchase and equip NFTs to boost your mining power
            </p>
          </div>

          {/* Stats Cards with Featured 3D NFT */}
          <div className="relative z-10 grid grid-cols-2 items-center md:grid-cols-5 gap-4 mb-8">
            {featuredNft && (
              <div className="col-span-2 md:col-span-1 row-span-2 backdrop-blur-sm border-border mx-auto">
                <p className="text-xs text-muted-foreground mb-2">Featured NFT</p>
                <Suspense
                  fallback={<div className="w-20 h-32 bg-muted/20 rounded-lg animate-pulse" />}>
                  <NFTCardVisual
                    tier={featuredNft.tier as NFTTier}
                    name={featuredNft.name}
                    imageUrl={featuredNft.image_url!}
                    className="w-32 h-44"
                  />
                </Suspense>
              </div>
            )}

            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {userBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">VP Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userNfts.length}</p>
                    <p className="text-xs text-muted-foreground">NFTs Owned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">+{totalBoost}%</p>
                    <p className="text-xs text-muted-foreground">Mining Boost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {userNfts?.filter((n) => n.is_equipped).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Equipped</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="relative z-10">
            <Tabs defaultValue="marketplace" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/80 backdrop-blur-sm">
                <TabsTrigger value="marketplace" className="gap-2">
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Marketplace</span>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger value="forge" className="gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">Forge</span>
                </TabsTrigger>
              </TabsList>

              {/* Marketplace Tab */}
              <TabsContent value="marketplace" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {nftCatalog?.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      userRank={userRank}
                      userBalance={userBalance}
                      owned={ownedNftIds.has(nft.id)}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </div>

                {nftCatalog?.length === 0 && (
                  <Card className="bg-card/90 backdrop-blur-sm border-border">
                    <CardContent className="p-12 text-center">
                      <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No NFTs available</p>
                      <p className="text-sm text-muted-foreground">
                        Check back soon for new items!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6">
                {userNfts?.length! > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {userNfts?.map((userNft) => (
                      <NFTInventoryCard key={userNft.id} userNft={userNft} onEquip={handleEquip} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card/90 backdrop-blur-sm border-border">
                    <CardContent className="p-12 text-center">
                      <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No NFTs in your inventory</p>
                      <p className="text-sm text-muted-foreground">
                        Purchase NFTs from the marketplace!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Forge Tab */}
              <TabsContent value="forge">
                <NFTUpgradePanel
                  userNfts={userNfts}
                  upgradeCombinations={upgradeCombinations || []}
                  userBalance={userBalance}
                  onUpgrade={handleUpgrade}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
