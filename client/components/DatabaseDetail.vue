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

const fields = computed(() => {
  if (documents.value && documents.value.length > 0)
    return Object.keys(documents.value[0])
})

const editing = ref(false)
const selectedDocument = ref()

function editDocument(document: any) {
  if (editing.value)
    return
  editing.value = true
  selectedDocument.value = { ...document }
}

async function saveDocument() {
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
  <div w-full h-full p4>
    <template v-if="fields?.length">
      <div flex justify-between>
        <div flex-auto />
        <NButton icon="carbon:add" n="green" @click="drawer = !drawer">
          Add Document
        </NButton>
      </div>
      <table w-full mt4 :class="{ 'editing-mode': editing }">
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
          <tr v-for="document in documents" :key="document._id" :class="{ isEditing: editing && selectedDocument._id === document._id }">
            <td v-for="field of fields" :key="field" hover-bg-green hover-bg-opacity-5 hover-text-green cursor-pointer @dblclick="editDocument(document)">
              <template v-if="editing && selectedDocument._id === document._id">
                <input v-model="selectedDocument[field]">
              </template>
              <span v-else>
                {{ document[field] }}
              </span>
            </td>
            <td flex justify-center gap2 class="actions">
              <template v-if="editing && selectedDocument._id === document._id">
                <NIconButton icon="carbon-save" @click="saveDocument" />
                <NIconButton icon="carbon-close" @click="discardEditing" />
              </template>
              <template v-else>
                <NIconButton icon="carbon-edit" @click="editDocument(document)" />
                <NIconButton icon="carbon-delete" @click="deleteDocument(document)" />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <div v-else flex justify-center items-center h-full text-2xl>
      <NIcon icon="carbon-document" mr1 />
      No documents found
    </div>
  </div>
</template>

<style lang="scss">
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
    }
  }
}
</style>
