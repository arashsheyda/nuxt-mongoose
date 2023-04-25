<script lang="ts" setup>
import './styles/global.css'

const readyState = computedAsync(async () => await rpc.readyState())
</script>

<template>
  <Html>
    <Body h-screen>
      <NuxtLayout v-if="readyState === 1">
        <NuxtPage />
      </NuxtLayout>
      <Connection v-else :connection="readyState" />
    </Body>
  </Html>
</template>

<style>
#__nuxt {
  height: 100%;
}
</style>
