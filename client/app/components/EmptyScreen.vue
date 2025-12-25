 <!-- TODO: refactor to usable component -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { onMounted, onUnmounted, computed, useTemplateRef } from 'vue'
// @ts-ignore
import logoPath from '../assets/db.svg'

const matrixCanvas = useTemplateRef('matrixCanvas')
let ctx: any, maskCtx: any, animationFrame: any
let pulseProgress = 0

const color = '#11924F'

const statusConfig = computed(() => ({ color, speed: 2.5, range: 20, glow: '#023430', intensity: 0.1 }))

const FONT_SIZE = 10
const SYNTAX = ['0', '1', '<', '>', '/', '{', '}', '[', ']', ';', '(', ')', '+', '=', '*', '!', '?', '"', '_']
let logoBounds = { x: 0, y: 0, w: 0, h: 0, centerX: 0, centerY: 0, maxR: 0 }

const createMask = async () => {
  const canvas = matrixCanvas.value
  if (!canvas) return
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = canvas.width
  maskCanvas.height = canvas.height
  const mCtx = maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })

  return new Promise((resolve) => {
    const img = new Image()
    img.src = logoPath
    img.onload = () => {
      const scale = (canvas.height * 0.45) / img.height
      const w = img.width * scale
      const h = img.height * scale
      const x = (canvas.width - w) / 2
      const y = (canvas.height - h) / 2
      mCtx?.drawImage(img, x, y, w, h)
      resolve({ x, y, w, h, centerX: x + w / 2, centerY: y + h / 2, maxR: Math.max(w, h) * 0.8 })
    }
  })
}

const animate = () => {
  ctx.clearRect(0, 0, matrixCanvas.value?.width, matrixCanvas.value?.height)
  ctx.font = `bold ${FONT_SIZE}px monospace`

  const config = statusConfig.value
  pulseProgress += config.speed
  if (pulseProgress > logoBounds.maxR * 1.5) pulseProgress = 0

  const startCol = Math.floor(logoBounds.x / FONT_SIZE)
  const endCol = Math.ceil((logoBounds.x + logoBounds.w) / FONT_SIZE)
  const startRow = Math.floor(logoBounds.y / FONT_SIZE)
  const endRow = Math.ceil((logoBounds.y + logoBounds.h) / FONT_SIZE)

  for (let c = startCol; c <= endCol; c++) {
    for (let r = startRow; r <= endRow; r++) {
      const x = c * FONT_SIZE
      const y = r * FONT_SIZE
      const pixelData = maskCtx.getImageData(x, y, 1, 1).data
      if (pixelData[3] < 50) continue

      const dx = x - logoBounds.centerX
      const dy = y - logoBounds.centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const diff = Math.abs(dist - pulseProgress)

      const text = SYNTAX[Math.floor(Math.random() * SYNTAX.length)]

      if (diff < config.range) {
        const strength = 1 - (diff / config.range)
        ctx.shadowBlur = 15 * strength
        ctx.shadowColor = config.color
        ctx.fillStyle = Math.random() > 0.8 ? config.glow : config.color
        ctx.globalAlpha = 1.0
      }
      else {
        ctx.shadowBlur = 0
        ctx.fillStyle = config.color
        ctx.globalAlpha = config.intensity
      }
      ctx.fillText(text, x, y)
    }
  }
  animationFrame = requestAnimationFrame(animate)
}

const init = async () => {
  const canvas = matrixCanvas.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  logoBounds = await createMask() as any
  animate()
}

onMounted(init)
onUnmounted(() => cancelAnimationFrame(animationFrame))

// Re-init on window resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrame)
    init()
  })
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden font-mono text-slate-300">
    <div class="absolute inset-0 pointer-events-none z-1">
      <canvas ref="matrixCanvas" />
    </div>
  </div>
</template>

<style scoped>
canvas {
  filter: drop-shadow(0 0 10px v-bind('statusConfig.color'));
}
</style>
