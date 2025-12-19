// Client-side fingerprinting utilities
export async function generateFingerprint(): Promise<string> {
  const components: string[] = []

  // User agent
  components.push(navigator.userAgent)

  // Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0))

  // Device memory (if available)
  const nav = navigator as Navigator & { deviceMemory?: number }
  components.push(String(nav.deviceMemory || 0))

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = "top"
      ctx.font = "14px Arial"
      ctx.fillStyle = "#f60"
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = "#069"
      ctx.fillText("VersePoints", 2, 15)
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
      ctx.fillText("Fingerprint", 4, 17)
      components.push(canvas.toDataURL())
    }
  } catch {
    components.push("canvas-error")
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      }
    }
  } catch {
    components.push("webgl-error")
  }

  // Create hash from components
  const data = components.join("|||")
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
  }
}
