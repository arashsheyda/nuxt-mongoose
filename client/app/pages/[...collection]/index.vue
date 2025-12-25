<script lang="ts" setup>
import { rpc } from '../../composables/rpc'
import { computedAsync, useEventListener } from '@vueuse/core'
import { computed, reactive, ref, watch, h, resolveComponent, useRoute, useTemplateRef } from '#imports'
import type { TableColumn, ButtonProps } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'

const route = useRoute()
const toast = useToast()

const copy = (text: string) => {
  navigator.clipboard.writeText(text)
}

const collectionName = computed(() => String(route.params?.collection))

const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UTooltip = resolveComponent('UTooltip')

// TODO: save in local storage
const pagination = reactive({ limit: 20, page: 1 })

const totalDocuments = computedAsync<number>(async () => {
  const res = await rpc.value?.countDocuments(collectionName.value)
  updateShadow()

  if (res == null || (typeof res === 'object' && 'error' in res)) {
    return 0
  }

  return res
}, 0)

const documents = computedAsync(async () => {
  const res = await rpc.value?.listDocuments(
    collectionName.value,
    pagination,
  )

  // unwrap RPCResult → always return an array
  if (!res || 'error' in res)
    return []

  return res
}, [])

// onMounted(() => editDocument(documents.value[0]))

watch(pagination, async () => {
  const res = await rpc.value?.listDocuments(collectionName.value, pagination)
  if (!res || 'error' in res) {
    // do something
  }
  else {
    documents.value = res
  }
})

const schema = computedAsync<any>(async () => {
  const result = await rpc.value?.getCollectionSchema(collectionName.value)
  if (!result || 'error' in result) {
    return null
  }
  return result
}, null)

const fields = computed(() => {
  if (schema.value) {
    return Object.keys(schema.value)
  }
  if (documents.value.length > 0) {
    return Object.keys(documents.value[0]!)
  }
  return []
})

const search = ref('')
const editing = ref(false)
const selectedDocument = ref()

const filtered = computed(() => {
  if (!search.value)
    return documents.value
  return documents.value.filter((document: any) => {
    for (const field of fields.value) {
      if (document[field].toString().toLowerCase().includes(search.value.toLowerCase()))
        return true
    }
    return false
  })
})

const isEditingRow = (row: any) => editing.value && selectedDocument.value?._id === row._id
const renderActionButton = ({ title, icon, color, onClick }: Partial<ButtonProps> & { title: string }) => h(UTooltip,
  {
    text: title,
    delayDuration: 0,
  },
  () => h(UButton, {
    title,
    icon,
    color,
    variant: 'outline',
    size: 'md',
    onClick,
  }),
)

// Define columns dynamically based on fields
const columns = computed<TableColumn<any>[]>(() => {
  const cols: TableColumn<any>[] = fields.value.map(field => ({
    id: field,
    accessorKey: field,
    size: 232,
    maxSize: 232,
    minSize: 232,
    header: () => {
      const fieldType = schema.value?.[field]?.type || 'unknown'
      return h('div', { class: 'font-medium' }, [
        field,
        h('span', { class: 'ml-2 text-xs opacity-50 font-mono' }, fieldType),
      ])
    },
    cell: ({ row }) => {
      const hasField = field in row.original

      return isEditingRow(row.original)
        ? h(UInput, {
            'class': 'custom-input',
            'id': `${row.original._id}-${field}`,
            'modelValue': selectedDocument.value[field],
            'onUpdate:modelValue': (value: any) => selectedDocument.value[field] = value,
            'disabled': field === '_id',
          })
        : h('span',
            {
              class: hasField ? 'table-cell-content' : 'table-cell-content opacity-40 italic no-field select-none',
            },
            hasField
              ? (typeof row.original[field] === 'string' ? row.original[field] : JSON.stringify(row.original[field]))
              : 'no field',
          )
    },
  }))

  // Add actions column
  cols.push({
    id: 'actions',
    header: 'Actions',
    enablePinning: true,
    meta: {
      class: {
        th: 'shadow-test bg-neutral-900',
        td: 'shadow-test bg-neutral-900',
      },
    },
    cell: ({ row }) => {
      if (isEditingRow(row.original)) {
        return h('div', { class: 'flex justify-center gap-2 px-4' }, [
          renderActionButton({
            title: 'Save Document',
            icon: 'carbon-save',
            color: 'primary',
            onClick: () => saveDocument(selectedDocument.value, !selectedDocument.value?._id),
          }),
          renderActionButton({
            title: 'Cancel Editing',
            icon: 'carbon-close',
            color: 'error',
            onClick: discardEditing,
          }),
        ])
      }

      return h('div', { class: 'group flex justify-center gap-2 px-4' }, [
        renderActionButton({
          title: 'Edit Document',
          icon: 'carbon-edit',
          color: 'primary',
          onClick: () => editDocument(row.original),
        }),
        renderActionButton({
          title: 'Delete Document',
          icon: 'carbon-trash-can',
          color: 'error',
          onClick: () => deleteDocument(row.original),
        }),
        renderActionButton({
          title: 'Duplicate Document',
          icon: 'carbon-document-multiple-02',
          color: 'info',
          onClick: () => saveDocument(row.original),
        }),
        renderActionButton({
          title: 'Copy Document JSON',
          icon: 'carbon-copy',
          color: 'secondary',
          onClick: () => copy(JSON.stringify(row.original)),
        }),
      ])
    },
  })

  return cols
})

// Prepare data for table (include new document row if editing)
const tableData = computed(() => {
  const data = [...(filtered.value || [])]
  if (editing.value && !selectedDocument.value?._id) {
    data.push(selectedDocument.value)
  }
  return data
})

function addDocument() {
  if (editing.value)
    return
  editing.value = true
  selectedDocument.value = {}
  // if (schema.value) {
  //   for (const field of Object.keys(schema.value))
  //     selectedDocument.value[field] = ''
  // }
  // else {
  for (const field of fields.value) {
    if (field !== '_id')
      selectedDocument.value[field] = ''
  }
  // }
}

function editDocument(document: any) {
  if (editing.value)
    return
  editing.value = true
  selectedDocument.value = { ...document }
}

async function saveDocument(document: any, create = true) {
  const method = create ? rpc.value?.createDocument : rpc.value?.updateDocument
  if (!method)
    return
  const newDocument = await method(collectionName.value, document)
  toast.add({
    title: create ? 'Document created successfully' : 'Document updated successfully',
    color: 'success',
  })
  // TODO: show toast
  if (!newDocument || 'error' in newDocument) {
    toast.add({
      title: create ? 'Failed to create document' : 'Failed to update document',
      color: 'error',
    })
    return
  }

  if (create) {
    if (!documents.value.length) {
      const res = await rpc.value?.listDocuments(collectionName.value, pagination)
      if (!res || 'error' in res) {
        // do something
      }
      else {
        documents.value = res
      }
      return discardEditing()
    }
    documents.value.push({ _id: newDocument.insertedId, ...document })
  }
  else {
    const index = documents.value.findIndex((doc: any) => doc._id === newDocument.insertedId)
    documents.value[index] = document
  }

  discardEditing()
}

function discardEditing() {
  editing.value = false
  selectedDocument.value = null
}

async function deleteDocument(document: any) {
  const newDocument = await rpc.value?.deleteDocument(collectionName.value, document._id)
  console.log('deleted', newDocument)
  // TODO: show toast
  if (newDocument?.deletedCount === 0)
    return

  documents.value = documents.value.filter((doc: any) => doc._id !== document._id)
}

const columnPinning = ref({
  right: ['actions'],
})

const hasRoomForScroll = ref(false)
const tableRef = useTemplateRef('tableRef')

function updateShadow() {
  const el = tableRef.value?.$el as HTMLElement
  if (!el) {
    return
  }

  // how much can we scroll horizontally?
  const maxScroll = el.scrollWidth - el.clientWidth

  // show shadow if there's scrollable content AND we're not at the far right
  hasRoomForScroll.value = maxScroll > 0 && el.scrollLeft < maxScroll
}

useEventListener(tableRef, 'scroll', updateShadow)
</script>

<template>
  <div class="px-4 py-2 backdrop-blur z-10 flex items-center gap-4 border-b border-default">
    <UInput
      v-model="search"
      placeholder="Search..."
      class="flex-1"
    />
    <UButton
      icon="carbon:add"
      color="success"
      @click="addDocument"
    >
      Add Document
    </UButton>
  </div>

  <div
    v-if="totalDocuments"
    class="flex items-center px-4 py-2 border-b border-default"
  >
    <div class="opacity-50">
      <span v-if="search">{{ filtered.length }} matched · </span>
      <span>{{ documents?.length }} of {{ totalDocuments }} documents in total</span>
    </div>
    <div class="flex-auto" />
    <div class="flex gap-2">
      <select
        v-if="pagination.limit !== 0"
        v-model="pagination.page"
        class="px-3 py-1.5 rounded border border-default bg-default"
      >
        <option
          v-for="i in Math.ceil(totalDocuments / pagination.limit)"
          :key="i"
          :value="i"
        >
          page: {{ i }}
        </option>
      </select>
      <select
        v-model="pagination.limit"
        class="px-3 py-1.5 rounded border border-default bg-default"
      >
        <option
          v-for="i in [1, 2, 3, 4, 5]"
          :key="i"
          :value="i * 10"
        >
          show: {{ i * 10 }}
        </option>
        <option :value="0">
          show all
        </option>
      </select>
    </div>
  </div>

  <UTable
    v-if="documents?.length || selectedDocument"
    ref="tableRef"
    v-model:column-pinning="columnPinning"
    :data="tableData"
    :columns="columns"
    sticky
    :ui="{
      tr: editing ? 'data-[editing=true]:bg-elevated' : '',
    }"
  >
    <template #_id-cell="{ row }">
      ObjectId('{{ row.original._id }}')
    </template>
  </UTable>

  <div
    v-else
    class="flex justify-center items-center h-full text-2xl"
  >
    <span class="mr-1">📄</span>
    No documents found
  </div>
</template>

<style lang="scss">
  th, td {
    &:first-child {
      border-left: 1px solid #1f1f1f;
    }
  }

  td {
    border-right: 1px solid #1f1f1f;
  }

th {
  position: sticky;
  left: 0;
  background-color: var(--color-neutral-900);
  box-shadow:
      inset  1px 0 0 #1f1f1f, /* left border */
      inset 1px 0 0 #1f1f1f; /* right border */
}

  tr {
    &:first-child {
      border-top: 1px solid #1f1f1f;
    }
    &:last-child {
      border-bottom: 1px solid #1f1f1f;
    }
  }

  .shadow-test {
    right: -1px!important;
    text-align: center;
    box-shadow:
      inset  1px 0 0 #1f1f1f, /* left border */
      inset -1.5px 0 0 #1f1f1f; /* right border */

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: -50px;
      width: 50px;
      height: 100%;
      z-index: 9;
      background: linear-gradient(to right, transparent, #131313);
      pointer-events: none;
      /* hide when scrolled to the left or no scroll */
      opacity: v-bind('hasRoomForScroll ? 1 : 0');
      transition: opacity 0.3s ease;
    }
  }

.custom-input {
  width: 100%;

  input {
    border-radius: 0px;
  }
}

td {
  padding: 0px 0px;
  span.table-cell-content {
    padding: 0px 15px;
  }

  &:has(.no-field) {
    background: #131313;
  }
}
</style>
