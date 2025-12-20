"use client";

import {useEffect, useState} from "react";

export function DecimalCounter(decimalPart: string) {
  const [value, setValue] = useState(Number(decimalPart));

  useEffect(() => {
    // Always sync local state when prop changes
    setValue(Number(decimalPart));

    // If it's "00", do NOT start counting
    if (decimalPart === "00") return;

    const interval = setInterval(() => {
      setValue((prev) => (prev === 99 ? 0 : prev + 1));
    }, 100);

    return () => clearInterval(interval);
  }, [decimalPart]); // 👈 restart logic lives here

  return value.toString().padStart(2, "0");
}
