<script lang="ts" setup>
import './styles/global.css'
</script>

<template>
  <Html>
    <Body h-screen>
      <Notification />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<style>
#__nuxt {
  height: 100%;
}
</style>
