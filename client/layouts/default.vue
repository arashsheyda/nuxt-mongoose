<script lang="ts" setup>
const readyState = computedAsync(async () => await rpc.readyState())
</script>

<template>
  <div h-full of-auto>
    <slot v-if="readyState === 1" />
    <Connection v-else :connection="readyState" />
  </div>
</template>
