<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const props = defineProps({
  minLeft: {
    type: Number,
    default: 10,
  },
  minRight: {
    type: Number,
    default: 10,
  },
  maxLeft: {
    type: Number,
    default: 90,
  },
  maxRight: {
    type: Number,
    default: 90,
  },
})

const size = ref(props.maxLeft)
</script>

<template>
  <Splitpanes h-full of-hidden @resize="size = $event[0].size">
    <Pane border="r base" h-full class="of-auto!" :size="size" :min-size="minLeft" :max-size="maxLeft">
      <slot name="left" />
    </Pane>
    <Pane relative h-full class="of-auto!" :min-size="minRight">
      <slot name="right" />
    </Pane>
  </Splitpanes>
</template>
