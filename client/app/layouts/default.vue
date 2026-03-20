<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computedAsync } from '@vueuse/core'
import { rpc } from '../composables/rpc'
import { useRoute, ref, computed, watch, useRouter } from '#imports'

const collections = computedAsync(async () => await rpc.value?.listCollections() || [])

const route = useRoute()
const router = useRouter()

const open = ref(false)

const links = computed<NavigationMenuItem[][]>(() => {
  return [
    collections.value?.map(collection => ({
      id: `collection-${collection.name}`,
      label: collection.name,
      icon: 'i-lucide-database',
      to: { name: 'collection', params: { collection: collection.name } },
    })) || [],
  ]
})

const groups = computed(() => [
  {
    id: 'collections',
    label: 'Collections',
    items: links.value[0],
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'source',
        label: 'View page source',
        icon: 'i-simple-icons-github',
        to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
        target: '_blank',
      },
    ],
  },
])

watch(links, () => {
//  navigate to first collection if none selected
  if (links.value[0]?.length) {
    if (!route.params.collection) {
      router.push(links.value[0][0]!.to as string)
    }
  }
}, { immediate: true })
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <!-- <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
        dsg
      </template> -->

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <!-- <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template> -->
    </UDashboardSidebar>
    <UDashboardSearch :groups="groups" />
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar
          title="Nuxt Mongoose"
          :ui="{ right: 'gap-3' }"
        >
          <template #leading>
            <UTooltip
              text="Toggle sidebar"
              arrow
              :delay-duration="0"
            >
              <UDashboardSidebarCollapse />
            </UTooltip>
            <UIcon name="skill-icons:mongodb" />
          </template>

          <template #right>
            <slot name="actions" />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <EmptyScreen v-if="!route.params.collection" />
        <slot v-else />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style>
#dashboard-sidebar-default {
  transition: width 0.3s ease-out;
}
</style>
