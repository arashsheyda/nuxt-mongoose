<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'
import { rpc } from '../composables/rpc'

const readyState = computedAsync(async () => await rpc.value?.readyState())
</script>

<template>
  <div h-full of-auto>
    <slot v-if="readyState === 1" />
    <Connection v-else :code="readyState" />
  </div>
</template>
