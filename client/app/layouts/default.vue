<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computedAsync } from '@vueuse/core'
import { rpc } from '../composables/rpc'
import { useRoute, ref, computed, watch, useRouter } from '#imports'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'

const collections = computedAsync(async () => await rpc.value?.listCollections() || [])

const route = useRoute()
const router = useRouter()
const toast = useToast()

const open = ref(false)
const createModalOpen = ref(false)
const searchQuery = ref('')
const deleteConfirmOpen = ref(false)
const collectionToDelete = ref('')

const filteredCollections = computed(() => {
  if (!searchQuery.value) return collections.value
  if (!collections.value || 'error' in collections.value) return []
  return collections.value.filter((collection: any) =>
    collection.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const links = computed<NavigationMenuItem[][]>(() => {
  const filtered = filteredCollections.value
  if (!filtered || 'error' in filtered) return [[]]

  return [
    filtered.map((collection: any) => ({
      id: `collection-${collection.name}`,
      label: collection.name,
      icon: 'i-lucide-database',
      to: { name: 'collection', params: { collection: collection.name } },
    })),
  ]
})

async function refreshCollections() {
  collections.value = await rpc.value?.listCollections() || []
  toast.add({
    title: 'Collections refreshed',
    color: 'success',
  })
}

function confirmDropCollection(collectionName: string) {
  collectionToDelete.value = collectionName
  deleteConfirmOpen.value = true
}

async function dropCollection() {
  const collectionName = collectionToDelete.value
  if (!collectionName) return

  const result = await rpc.value?.dropCollection(collectionName)

  if (result === true) {
    toast.add({
      title: `Collection "${collectionName}" deleted`,
      color: 'success',
    })

    // Refresh collections list
    const newCollections = await rpc.value?.listCollections()
    collections.value = newCollections || []

    // Navigate away if we're on the deleted collection
    if (route.params.collection === collectionName) {
      if (newCollections && !('error' in newCollections) && newCollections.length > 0) {
        const firstCollection = newCollections[0]
        if (firstCollection) {
          router.push({ name: 'collection', params: { collection: firstCollection.name } })
        }
      }
    }
  }
  else {
    toast.add({
      title: `Failed to delete collection "${collectionName}"`,
      color: 'error',
    })
  }

  deleteConfirmOpen.value = false
  collectionToDelete.value = ''
}

const groups = computed(() => [
  {
    id: 'collections',
    label: 'Collections',
    items: links.value[0],
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

const selectedCollection = computed(() => route.params.collection as string || '')
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
      <template #default="{ collapsed }">
        <div class="px-4 pt-3 space-y-3">
          <!-- Search Collections -->
          <UInput
            v-if="!collapsed"
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search collections..."
            size="sm"
            class="w-full"
          />

          <!-- Action Buttons -->
          <div
            v-if="!collapsed"
            class="grid grid-cols-2 gap-2"
          >
            <UButton
              icon="i-lucide-refresh-cw"
              color="primary"
              variant="outline"
              size="sm"
              block
              @click="refreshCollections"
            >
              Refresh
            </UButton>
            <UButton
              icon="i-lucide-plus"
              color="success"
              size="sm"
              block
              @click="createModalOpen = true"
            >
              Create
            </UButton>
          </div>

          <!-- Collapsed action buttons -->
          <div
            v-else
            class="flex flex-col gap-2"
          >
            <UTooltip
              text="Refresh Collections"
              :delay-duration="0"
            >
              <UButton
                icon="i-lucide-refresh-cw"
                color="primary"
                variant="outline"
                size="sm"
                block
                @click="refreshCollections"
              />
            </UTooltip>
            <UTooltip
              text="Create Collection"
              :delay-duration="0"
            >
              <UButton
                icon="i-lucide-plus"
                color="success"
                size="sm"
                block
                @click="createModalOpen = true"
              />
            </UTooltip>
          </div>
        </div>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          class="mt-4"
        >
          <template #trailing="{ item }">
            <UButton
              v-if="!collapsed"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              @click.prevent.stop="confirmDropCollection(item.label)"
            />
          </template>
        </UNavigationMenu>

        <!-- Empty state when no collections -->
        <div
          v-if="!collapsed && links[0] && links[0].length === 0"
          class="px-4 py-8 text-center space-y-3"
        >
          <UIcon
            name="i-lucide-inbox"
            class="w-12 h-12 mx-auto opacity-30"
          />
          <div class="space-y-1">
            <p class="text-sm font-medium">
              No collections found
            </p>
            <p class="text-xs opacity-60">
              Create your first collection to get started
            </p>
          </div>
        </div>
      </template>
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

            <USlideover
              v-if="selectedCollection"
              v-model:open="deleteConfirmOpen"
            >
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="outline"
                @click.prevent.stop="confirmDropCollection(selectedCollection)"
              >
                Delete Collection
              </UButton>

              <template #content>
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-error/10">
                    <UIcon
                      name="i-lucide-alert-triangle"
                      class="w-5 h-5 text-error"
                    />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">
                      Delete Collection
                    </h3>
                    <p class="text-sm opacity-70">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <p>
                    Are you sure you want to delete the collection <strong class="text-error font-mono">{{ collectionToDelete }}</strong>?
                  </p>
                  <p class="text-sm opacity-70">
                    All documents in this collection will be permanently removed from the database.
                  </p>
                </div>

                <div class="flex justify-end gap-3">
                  <UButton
                    color="neutral"
                    variant="outline"
                    @click="deleteConfirmOpen = false"
                  >
                    Cancel
                  </UButton>
                  <UButton
                    color="error"
                    icon="i-lucide-trash-2"
                    @click="dropCollection"
                  >
                    Delete Collection
                  </UButton>
                </div>
              </template>
            </USlideover>

            <CreateCollectionModal
              v-model="createModalOpen"
              @refresh="refreshCollections"
            />
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
