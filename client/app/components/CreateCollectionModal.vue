<script lang="ts" setup>
import { computed, reactive, ref } from '#imports'
import { rpc } from '../composables/rpc'
import { useRouter } from 'nuxt/app'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'

interface ColumnInterface {
  name: string
  type: string
  required: boolean
  unique: boolean
  default: any
}

const isOpen = defineModel<boolean>()

const emit = defineEmits<{
  refresh: []
}>()

const router = useRouter()
const toast = useToast()

const schema = ref(true)
const bread = reactive({
  browse: {
    active: true,
    type: 'index',
  },
  read: {
    active: true,
    type: 'show',
    by: '_id',
  },
  edit: {
    active: true,
    type: 'put',
    by: '_id',
  },
  add: {
    active: true,
    type: 'create',
  },
  delete: {
    active: true,
    type: 'delete',
    by: '_id',
  },
})

const hasBread = computed({
  get() {
    return bread.browse.active || bread.read.active || bread.edit.active || bread.add.active || bread.delete.active
  },
  set(value: boolean) {
    bread.browse.active = value
    bread.read.active = value
    bread.edit.active = value
    bread.add.active = value
    bread.delete.active = value
  },
})

const collection = ref('')
const fields = ref<ColumnInterface[]>([
  {
    name: 'name',
    type: 'string',
    required: true,
    unique: false,
    default: '',
  },
  {
    name: 'slug',
    type: 'string',
    required: true,
    unique: true,
    default: '',
  },
])

const allFields = computed(() => {
  return [{ name: '_id', type: 'ObjectId', required: true, unique: true, default: '' }, ...fields.value]
})

const mongoTypes = [
  'string',
  'number',
  'boolean',
  'date',
  'object',
  'array',
  'ObjectId',
]

function addField(index: number) {
  fields.value.splice(index + 1, 0, {
    name: '',
    type: 'string',
    required: false,
    unique: false,
    default: '',
  })
}

function removeField(index: number) {
  fields.value.splice(index, 1)
}

const convertedBread = computed(() => {
  const breads: any[] = []
  // add active breads
  for (const [_key, value] of Object.entries(bread)) {
    if (value.active) {
      const breadItem: any = {
        type: value.type,
      }
      if ('by' in value && value.by) {
        breadItem.by = value.by
      }
      breads.push(breadItem)
    }
  }
  return breads
})

const formattedFields = computed(() => {
  return fields.value.map((field) => {
    const cleanField = { ...field }
    for (const [key, value] of Object.entries(cleanField)) {
      if (!value && key !== 'required' && key !== 'unique') {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete cleanField[key as keyof ColumnInterface]
      }
    }
    return cleanField
  })
})

const isLoading = ref(false)

async function generate() {
  if (!collection.value) {
    toast.add({
      title: 'Collection name is required',
      color: 'error',
    })
    return
  }

  isLoading.value = true

  try {
    await rpc.value?.generateResource(
      {
        name: collection.value,
        fields: schema.value ? formattedFields.value as any : undefined,
      } as any,
      convertedBread.value,
    )

    toast.add({
      title: 'Collection created successfully',
      color: 'success',
    })

    emit('refresh')
    isOpen.value = false
    router.push({ name: 'collection', params: { collection: collection.value } })

    // Reset form
    collection.value = ''
    fields.value = [
      {
        name: 'name',
        type: 'string',
        required: true,
        unique: false,
        default: '',
      },
      {
        name: 'slug',
        type: 'string',
        required: true,
        unique: true,
        default: '',
      },
    ]
  }
  catch {
    toast.add({
      title: 'Failed to create collection',
      color: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
}

const toggleSchema = computed({
  get() {
    if (hasBread.value) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return schema.value = true
    }
    return schema.value
  },
  set(value: boolean) {
    schema.value = value
    if (!schema.value)
      return hasBread.value = false
    hasBread.value = true
  },
})
</script>

<template>
  <USlideover v-model:open="isOpen">
    <UButton
      icon="i-lucide-wand-sparkles"
      color="info"
      variant="ghost"
      @click="isOpen = true"
    >
      Create Collection
    </UButton>
    <template #content>
      <UCard
        :ui="{
          body: { base: 'flex-1 overflow-y-auto' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">
              Create Collection
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- BREAD Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <UCheckbox
                v-model="hasBread"
                label="Generate BREAD Routes"
                class="font-semibold"
              />
            </div>

            <div
              v-if="hasBread"
              class="flex flex-wrap gap-4 pl-6"
            >
              <UCheckbox
                v-model="bread.browse.active"
                label="Browse"
              />

              <div class="flex items-center gap-2">
                <UCheckbox
                  v-model="bread.read.active"
                  label="Read by"
                />
                <USelect
                  v-if="bread.read.active"
                  v-model="bread.read.by"
                  :options="allFields.map(f => ({ label: f.name, value: f.name }))"
                  size="sm"
                  class="w-28"
                />
              </div>

              <div class="flex items-center gap-2">
                <UCheckbox
                  v-model="bread.edit.active"
                  label="Edit by"
                />
                <USelect
                  v-if="bread.edit.active"
                  v-model="bread.edit.by"
                  :options="allFields.map(f => ({ label: f.name, value: f.name }))"
                  size="sm"
                  class="w-28"
                />
              </div>

              <UCheckbox
                v-model="bread.add.active"
                label="Add"
              />

              <div class="flex items-center gap-2">
                <UCheckbox
                  v-model="bread.delete.active"
                  label="Delete by"
                />
                <USelect
                  v-if="bread.delete.active"
                  v-model="bread.delete.by"
                  :options="allFields.map(f => ({ label: f.name, value: f.name }))"
                  size="sm"
                  class="w-28"
                />
              </div>
            </div>
          </div>

          <!-- Collection Name -->
          <div class="space-y-2">
            <UInput
              v-model="collection"
              placeholder="Collection name (e.g., users, posts, products)"
              size="lg"
            />
          </div>

          <!-- Schema Toggle -->
          <div class="flex items-center">
            <UCheckbox
              v-model="toggleSchema"
              label="Generate Schema"
              class="font-semibold"
            />
          </div>

          <!-- Schema Fields -->
          <div
            v-if="schema"
            class="space-y-4"
          >
            <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr] gap-3 text-sm font-medium opacity-70">
              <div>Name</div>
              <div>Type</div>
              <div>Required</div>
              <div>Unique</div>
              <div>Default</div>
              <div>Actions</div>
            </div>

            <div
              v-for="(column, index) in fields"
              :key="index"
              class="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr] gap-3 items-center"
            >
              <UInput
                v-model="column.name"
                placeholder="Field name"
                size="sm"
              />

              <USelect
                v-model="column.type"
                :options="mongoTypes.map(t => ({ label: t, value: t }))"
                size="sm"
              />

              <div class="flex justify-center">
                <UCheckbox v-model="column.required" />
              </div>

              <div class="flex justify-center">
                <UCheckbox v-model="column.unique" />
              </div>

              <UInput
                v-if="column.type === 'string'"
                v-model="column.default"
                type="text"
                placeholder="Default value"
                size="sm"
              />
              <UInput
                v-else-if="column.type === 'number'"
                v-model="column.default"
                type="number"
                placeholder="Default value"
                size="sm"
              />
              <UCheckbox
                v-else-if="column.type === 'boolean'"
                v-model="column.default"
              />
              <UInput
                v-else-if="column.type === 'date'"
                v-model="column.default"
                type="datetime-local"
                size="sm"
              />
              <UInput
                v-else-if="column.type === 'ObjectId'"
                placeholder="no default"
                disabled
                size="sm"
              />
              <UInput
                v-else
                v-model="column.default"
                placeholder="Default value"
                size="sm"
              />

              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-plus"
                  color="info"
                  variant="outline"
                  size="sm"
                  @click="addField(index)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="outline"
                  size="sm"
                  @click="removeField(index)"
                />
              </div>
            </div>

            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="outline"
              block
              @click="addField(fields.length - 1)"
            >
              Add Field
            </UButton>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="isOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              icon="i-lucide-wand-sparkles"
              color="success"
              :loading="isLoading"
              @click="generate"
            >
              Create Collection
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </USlideover>
</template>
