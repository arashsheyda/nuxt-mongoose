<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import { useRouter } from 'nuxt/app'
import { rpc } from '../composables/rpc'

const route = useRouter()
const router = useRouter()

const selectedCollection = ref()
const drawer = ref(false)
const search = ref('')

const collections = computedAsync(async () => {
  return await rpc.value?.listCollections()
})

const filtered = computed(() => {
  if (!search.value)
    return collections.value
  return collections.value.filter((c: any) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})

onMounted(() => {
  // if (route.query.table)
  //   selectedCollection.value = route.query.table
})

async function dropCollection(table: any) {
  await rpc.value?.dropCollection(table.name)
  collections.value = await rpc.value?.listCollections()
  if (selectedCollection.value === table.name) {
    selectedCollection.value = undefined
    router.push({ name: 'index' })
  }
}

async function refresh() {
  collections.value = await rpc.value?.listCollections()
  drawer.value = false
}
</script>

<template>
  <SplitPanel :min-left="13" :max-left="20">
    <template #left>
      <div px4>
        <Navbar v-model:search="search" :placeholder="`${collections?.length ?? '-'} collection in total`" mt2>
          <div flex items-center gap2>
            <NIconButton w-full mb1.5 icon="carbon-reset" title="Refresh" @click="refresh" />
            <NIconButton w-full mb1.5 icon="carbon-data-base" title="Default" text-green-5 />
            <NIconButton id="open-drawer-right" w-full mb1.5 icon="carbon-add" title="Create Collection" @click="drawer = true" />
          </div>
        </Navbar>
        <div grid gird-cols-1 my2 mx1>
          <NuxtLink v-for="table in filtered" :key="table.name" :to="{ name: 'index', query: { table: table.name } }" flex justify-between p2 my1 hover-bg-green hover-bg-opacity-5 hover-text-green rounded-lg :class="{ 'bg-green bg-opacity-5 text-green': selectedCollection === table.name }" @click="selectedCollection = table.name">
            <span>
              <NIcon icon="carbon-db2-database" />
              {{ table.name }}
            </span>
            <div flex gap2>
              <NIconButton block n="red" icon="carbon-trash-can" @click="dropCollection(table)" />
              <!-- <NIconButton icon="carbon-overflow-menu-horizontal" /> -->
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
    <template #right>
      <DatabaseDetail v-if="selectedCollection" :collection="selectedCollection" />
      <div v-else class="n-panel-grids-center">
        <div class="n-card n-card-base" px6 py2>
          <span op75 flex items-center>
            <NIcon icon="carbon:db2-buffer-pool" mr2 />
            Select a collection to start
          </span>
        </div>
      </div>
    </template>
  </SplitPanel>
  <Drawer v-model="drawer" style="width: calc(80.5%);" auto-close @close="drawer = false">
    <CreateResource @refresh="refresh" />
  </Drawer>
</template>
