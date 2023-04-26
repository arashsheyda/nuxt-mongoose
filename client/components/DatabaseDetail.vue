<script lang="ts" setup>
const props = defineProps({
  collection: {
    type: String,
    required: true,
  },
})

const documents = computedAsync(async () => {
  return await rpc.listDocuments(props.collection)
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

async function saveDocument(document: any) {
  await rpc.createDocument(props.collection, document)
  editing.value = false
  selectedDocument.value = undefined
  documents.value = await rpc.listDocuments(props.collection)
}

async function updateDocument() {
  // TODO: validate & show errors
  await rpc.updateDocument(props.collection, selectedDocument.value)
  editing.value = false
  selectedDocument.value = undefined
  documents.value = await rpc.listDocuments(props.collection)
}

function discardEditing() {
  editing.value = false
  selectedDocument.value = null
}

async function deleteDocument(document: any) {
  rpc.deleteDocument(props.collection, document._id)
  documents.value = await rpc.listDocuments(props.collection)
}
</script>

<template>
  <div ref="dbContainer" :class="{ 'h-full': !documents?.length }">
    <Navbar v-model:search="search" sticky top-0 px4 py2 backdrop-blur z-10>
      <template #actions>
        <NButton icon="carbon:add" n="green" @click="addDocument">
          Add Document
        </NButton>
      </template>
      <div op50>
        <span v-if="search">{{ filtered.length }} matched · </span>
        <span>{{ documents?.length }} documents in total</span>
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
        <!-- hover-bg-green hover-bg-opacity-5 hover-text-green cursor-pointer -->
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
            <div flex justify-center gap2>
              <template v-if="editing && selectedDocument._id === document._id">
                <NIconButton icon="carbon-save" @click="updateDocument" />
                <NIconButton icon="carbon-close" @click="discardEditing" />
              </template>
              <template v-else>
                <NIconButton icon="carbon-edit" @click="editDocument(document)" />
                <NIconButton icon="carbon-delete" @click="deleteDocument(document)" />
                <NIconButton icon="carbon-document-multiple-02" @click="saveDocument(document)" />
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
