<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
 <!-- TODO: refactor to usable component -->
<script lang="ts" setup>
import { onMounted, onUnmounted, computed, useTemplateRef } from 'vue'
// @ts-ignore
import logoPath from '../assets/logo.svg'
import type { DatabaseConnectionInfo } from '~/src/types'

const {
  code = 0,
  info,
} = defineProps<{
  code?: number
  info?: DatabaseConnectionInfo
}>()

const matrixCanvas = useTemplateRef('matrixCanvas')
let ctx: any, maskCtx: any, animationFrame: any
let pulseProgress = 0

// DYNAMIC CONFIGURATION BASED ON STATUS
const statusConfig = computed(() => {
  const configs = [
    { color: '#ef4444', speed: 2.5, range: 20, glow: '#fee2e2', intensity: 0.1 }, // Error (Red) - Slow/Broken
    { color: '#22c55e', speed: 2.5, range: 20, glow: '#ffffff', intensity: 0.3 }, // OK (Green) - Fast/Healthy
    { color: '#eab308', speed: 2.5, range: 20, glow: '#fefce8', intensity: 0.2 }, // Pending (Yellow) - Rapid/Searching
    { color: '#f97316', speed: 2.5, range: 20, glow: '#fff7ed', intensity: 0.15 }, // Disconnecting (Orange) - Fading
    { color: '#94a3b8', speed: 2.5, range: 30, glow: '#f1f5f9', intensity: 0.05 }, // Initializing (Gray) - Slow/Starting
  ]
  return configs[code] || configs[0]!
})

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

const connections = [
  { code: '00', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50', status: 'DISCONNECTED', description: 'No active database connection' },
  { code: '01', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/50', status: 'CONNECTED', description: 'Database connection established' },
  { code: '02', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', status: 'CONNECTING', description: 'Attempting to establish database link' },
  { code: '03', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', status: 'DISCONNECTING', description: 'Gracefully closing database connection' },
  {
    code: '99',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/50',
    status: 'INITIALIZING',
    description: 'Connection state not yet initialized',
  },
]
const connection = computed(() => connections[code]!)
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden font-mono text-slate-300">
    <div
      class="absolute inset-0 pointer-events-none
         bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]
         bg-size-[40px_40px]
         mask-[radial-gradient(circle_at_center,transparent_0%,transparent_15%,black_100%)]
         [-webkit-mask-image:radial-gradient(circle_at_center,transparent_0%,transparent_15%,black_100%)]"
    />

    <div class="absolute inset-0 pointer-events-none z-1">
      <canvas ref="matrixCanvas" />
    </div>

    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div class="mt-[50vh] transition-all duration-500 flex flex-col items-center">
        <div
          class="status-badge px-8 py-2 border rounded-sm text-sm font-black tracking-[0.4em] uppercase transition-colors duration-500 mb-4"
          :class="[connection.color, connection.border, connection.bg]"
        >
          {{ connection.status }}
        </div>
        <div class="text-[10px] tracking-[0.6em] uppercase opacity-30 mt-4 animate-pulse">
          // {{ connection.description }}
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-8 flex justify-center gap-4 bg-linear-to-t from-neutral-900 to-transparent">
      <div
        v-for="(item, index) in connections"
        :key="index"
        class="group relative cursor-pointer"
      >
        <div
          class="px-6 py-3 rounded-lg border transition-all duration-300 flex flex-col items-center min-w-35 bg-white/5 hover:opacity-100 hover:grayscale-0"
          :class="[
            item.color,
            index === code ? `${item.border}` : 'border-white/5 grayscale opacity-40',
          ]"
        >
          <span class="text-[10px] opacity-40 mb-1">0x{{ item.code }}</span>
          <span class="text-xs font-bold tracking-tighter">
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="info"
      class="absolute top-10 left-10 hidden lg:block pointer-events-none text-[10px] text-white/20"
    >
      <p>DB: {{ info.name }}</p>
      <p>{{ info.host === 'localhost' ? 'LOCAL_HOST 127.0.0.1' : info.host }}</p>
      <p>DRIVER_VERSION: {{ info.driverVersion }}</p>
    </div>
  </div>
</template>

<style scoped>
canvas {
  filter: drop-shadow(0 0 10px v-bind('statusConfig.color'));
}
</style>
