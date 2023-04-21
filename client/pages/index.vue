<script lang="ts" setup>
const route = useRoute()

const selectedCollection = ref()
// TODO: check connection
const connected = ref(true)
const drawer = ref(false)
const search = ref('')

const collections = computedAsync(async () => {
  return await rpc.listCollections()
})

const filtered = computed(() => {
  if (!search.value)
    return collections.value
  return collections.value.filter((c: any) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})

onMounted(() => {
  if (route.query.table)
    selectedCollection.value = route.query.table
})
</script>

<template>
  <PanelLeftRight :min-left="13" :max-left="20">
    <template #left>
      <div py1 px4>
        <Navbar v-model:search="search" :placeholder="`${collections?.length ?? '-'} collection in total`" mt1>
          <div flex items-center gap2>
            <NIconButton w-full mb1.5 icon="carbon-reset" title="Refresh" />
            <NIconButton w-full mb1.5 icon="carbon-data-base" title="Connection Name" :class="connected ? 'text-green-5' : 'text-orange-5'" />
            <NIconButton w-full mb1.5 icon="carbon-add" title="Create Table" @click="drawer = !drawer" />
          </div>
        </Navbar>
        <div grid gird-cols-1 my2 mx1>
          <NuxtLink v-for="table in filtered" :key="table.name" :to="{ name: 'index', query: { table: table.name } }" flex justify-between p2 my1 hover-bg-green hover-bg-opacity-5 hover-text-green rounded-lg :class="{ 'bg-green bg-opacity-5 text-green': selectedCollection === table.name }" @click="selectedCollection = table.name">
            <span>
              <NIcon icon="carbon-db2-database" />
              {{ table.name }}
            </span>
            <!-- TODO: -->
            <NIconButton icon="carbon-overflow-menu-horizontal" />
          </NuxtLink>
        </div>
      </div>
    </template>
    <template #right>
      <DatabaseDetail v-if="selectedCollection" :collection="selectedCollection" />
    </template>
  </PanelLeftRight>
</template>
