<script lang="ts" setup>
defineProps({
  connection: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <NPanelGrids>
    <div flex="~ gap-2" animate-pulse items-center text-yellow>
      <NIcon icon="carbon-flow-connection" />
      Please check your mongodb connection
    </div>
    <div flex="~ gap-2" items-center text-light>
      Your current connection is: {{ connection }}
    </div>
    <div absolute bottom-10 left-10 right-10 flex justify-around>
      <NCard p2 text-red-5>
        0: Not connected
      </NCard>
      <NCard p2 text-green-5>
        1: Connected
      </NCard>
      <NCard p2 text-yellow-5>
        2: Connecting
      </NCard>
      <NCard p2 text-orange-5>
        3: Disconnecting
      </NCard>
    </div>
  </NPanelGrids>
</template>
