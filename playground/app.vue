<script setup lang="ts">
const { data } = await useFetch('/api/users')
</script>

<template>
  <div>
    Nuxt module playground!
    <br>
    <pre
      v-html="JSON.stringify(data, null, 2)"
      style="background: #131313;color: #4EA65A;padding: 20px;border-radius: 7px;text-shadow: 0px 0px 10px #00ff22;"
    />
  </div>
</template>
