<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { rpc } from './composables/rpc'

const connectionInfo = computedAsync(async () => await rpc.value?.connectionInfo())
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout v-if="connectionInfo?.connectionState === 1">
      <NuxtPage />
    </NuxtLayout>
    <LoadingScreen
      v-else
      :info="connectionInfo"
    />
  </UApp>
</template>
