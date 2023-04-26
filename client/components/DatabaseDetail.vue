<script lang="ts" setup>
const props = defineProps({
  collection: {
    type: String,
    required: true,
  },
})

// TODO: save in local storage
const pagination = reactive({ limit: 20, page: 1 })

const countDocuments = computedAsync(async () => {
  return await rpc.countDocuments(props.collection)
})

const documents = computedAsync(async () => {
  return await rpc.listDocuments(props.collection, pagination)
})

watch(pagination, async () => {
  documents.value = await rpc.listDocuments(props.collection, pagination)
})

const schema = computedAsync<any>(async () => {
  return await rpc.resourceSchema(props.collection)
})

const fields = computed(() => {
  if (documents.value && documents.value.length > 0)
    return Object.keys(documents.value[0])
  if (schema.value)
    return Object.keys(schema.value)
  return []
})

const search = ref('')
const editing = ref(false)
const dbContainer = ref<HTMLElement>()
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

function addDocument() {
  // TODO: validate & show errors
  if (editing.value)
    return
  editing.value = true
  selectedDocument.value = {}
  if (schema.value) {
    for (const field of Object.keys(schema.value))
      selectedDocument.value[field] = ''
  }
  else {
    for (const field of fields.value) {
      if (field !== '_id')
        selectedDocument.value[field] = ''
    }
  }

  const parent = dbContainer.value?.parentElement
  parent?.scrollTo(0, parent.scrollHeight)
}

function editDocument(document: any) {
  if (editing.value)
    return
  editing.value = true
  selectedDocument.value = { ...document }
}

async function saveDocument(document: any, create = true) {
  const method = create ? rpc.createDocument : rpc.updateDocument
  const newDocument = await method(props.collection, document)
  if (newDocument?.error)
    return alert(newDocument.error.message)

  if (create) {
    if (!documents.value.length) {
      documents.value = await rpc.listDocuments(props.collection, pagination)
      return discardEditing()
    }
    documents.value.push({ _id: newDocument.insertedId, ...document })
  }
  else {
    const index = documents.value.findIndex((doc: any) => doc._id === newDocument.value._id)
    documents.value[index] = document
  }
  discardEditing()
}

function discardEditing() {
  editing.value = false
  selectedDocument.value = null
}

async function deleteDocument(document: any) {
  const newDocument = await rpc.deleteDocument(props.collection, document._id)
  if (newDocument.deletedCount === 0)
    return alert('Failed to delete document')

  documents.value = documents.value.filter((doc: any) => doc._id !== document._id)
}

const copy = useCopy()
</script>

<template>
  <div ref="dbContainer" :class="{ 'h-full': !documents?.length }">
    <Navbar v-model:search="search" sticky top-0 px4 py2 backdrop-blur z-10>
      <template #actions>
        <NButton icon="carbon:add" n="green" @click="addDocument">
          Add Document
        </NButton>
      </template>
      <div v-if="countDocuments" flex items-center>
        <div op50>
          <span v-if="search">{{ filtered.length }} matched · </span>
          <span>{{ documents?.length }} of {{ countDocuments }} documents in total</span>
        </div>
        <div flex-auto />
        <div flex gap-2>
          <NSelect v-if="pagination.limit !== 0" v-model="pagination.page">
            <option v-for="i in Math.ceil(countDocuments / pagination.limit)" :key="i" :value="i">
              page:
              {{ i }}
            </option>
          </NSelect>
          <NSelect v-model="pagination.limit">
            <option v-for="i in [1, 2, 3, 4, 5]" :key="i" :value="i * 10">
              show:
              {{ i * 10 }}
            </option>
            <option :value="0">
              show all
            </option>
          </NSelect>
        </div>
      </div>
    </Navbar>
    <table v-if="documents?.length || selectedDocument" w-full mb10 :class="{ 'editing-mode': editing }">
      <thead>
        <tr>
          <th v-for="field of fields" :key="field" text-start>
            {{ field }}
          </th>
          <th text-center>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="document in filtered" :key="document._id" :class="{ isEditing: editing && selectedDocument._id === document._id }">
          <td v-for="field of fields" :key="field" @dblclick="editDocument(document)">
            <template v-if="editing && selectedDocument._id === document._id">
              <input v-model="selectedDocument[field]" :disabled="field === '_id'">
            </template>
            <span v-else>
              {{ document[field] }}
            </span>
          </td>
          <td class="actions">
            <div flex justify-center gap2 class="group">
              <template v-if="editing && selectedDocument._id === document._id">
                <NIconButton icon="carbon-save" @click="saveDocument(selectedDocument, false)" />
                <NIconButton icon="carbon-close" @click="discardEditing" />
              </template>
              <template v-else>
                <NIconButton icon="carbon-edit" @click="editDocument(document)" />
                <NIconButton icon="carbon-delete" @click="deleteDocument(document)" />
                <NIconButton icon="carbon-document-multiple-02" @click="saveDocument(document)" />
                <NIconButton absolute right-4 opacity-0 group-hover="opacity-100" transition-all icon="carbon-copy" @click="copy(JSON.stringify(document))" />
              </template>
            </div>
          </td>
        </tr>
        <tr v-if="editing && !selectedDocument?._id" :class="{ isEditing: editing && !selectedDocument?._id }">
          <td v-for="field of fields" :key="field">
            <input v-if="field !== '_id'" v-model="selectedDocument[field]" :placeholder="field">
            <input v-else placeholder="ObjectId(_id)" disabled>
          </td>
          <td flex justify-center gap2 class="actions">
            <NIconButton icon="carbon-save" @click="saveDocument(selectedDocument)" />
            <NIconButton icon="carbon-close" @click="discardEditing" />
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else flex justify-center items-center h-full text-2xl>
      <NIcon icon="carbon-document" mr1 />
      No documents found
    </div>
  </div>
</template>

<style lang="scss">
// TODO:
.actions .n-icon {
  margin: 0;
}

table {
  table-layout: fixed;
  tr {
    width: 100%;
    td, th {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  input {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    width: 100%;
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    &:focus {
      outline: none;
    }
  }
}

th {
  border-right: 1px solid #272727;
  border-left: 1px solid #272727;
  border-top: 1px solid #272727;
  padding: 5px 10px;
}

td {
  border: 1px solid #272727;
  &:last-child {
    border-left: none;
  }
  padding: 5px 10px;
  color: rgba(255, 255, 255, 0.7);
  &:hover {
    color: #fff;
  }
}

.editing-mode {
  tr {
    &:not(.isEditing) {
      opacity: 0.3;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        opacity: 0.3;
      }
    }
    &.isEditing {
      opacity: 1;
      color: #fff;
      input {
        &::placeholder {
          color: #3ede80;
        }
      }
    }
  }
}
</style>
