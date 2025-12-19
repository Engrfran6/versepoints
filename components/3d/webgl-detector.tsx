"use client"

import { useState, useEffect, type ReactNode } from "react"

interface WebGLDetectorProps {
  children: ReactNode
  fallback: ReactNode
}

export function WebGLDetector({ children, fallback }: WebGLDetectorProps) {
  const [supportsWebGL, setSupportsWebGL] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      setSupportsWebGL(!!gl)
    } catch {
      setSupportsWebGL(false)
    }
  }, [])

  // Still loading
  if (supportsWebGL === null) {
    return <>{fallback}</>
  }

  return <>{supportsWebGL ? children : fallback}</>
}
