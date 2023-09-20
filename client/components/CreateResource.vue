<script lang="ts" setup>
import { useRouter } from 'nuxt/app'
import { computed, reactive, ref } from 'vue'
import { rpc } from '../composables/rpc'

interface ColumnInterface {
  name: string
  type: string
  required: boolean
  unique: boolean
  default: any
}

const emit = defineEmits(['refresh'])
const router = useRouter()

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

const fieldsLabels = ['name', 'type', 'required', 'unique', 'default']
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
  const breads: any = []
  // add active breads
  // eslint-disable-next-line unused-imports/no-unused-vars
  for (const [key, value] of Object.entries(bread) as any) {
    if (value.active) {
      breads.push({
        type: value.type,
        by: value?.by,
      })
    }
  }
  return breads
})

const formattedFields = computed(() => {
  return fields.value.map((field) => {
    for (const [key, value] of Object.entries(field)) {
      if (!value)
        delete field[key]
    }

    return field
  })
})

async function generate() {
  await rpc.value?.generateResource(
    {
      name: collection.value,
      fields: schema.value ? formattedFields.value : undefined,
    },
    convertedBread.value,
  ).then(() => {
    emit('refresh')
    router.push(`/?table=${collection.value}`)
  })
}

// TODO: remove this
const toggleSchema = computed({
  get() {
    if (hasBread.value)
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return schema.value = true
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
  <div relative h-full>
    <div sticky top-0 px8 py4 glass-effect z-1>
      <div mb2 flex items-center>
        <span text-2xl font-bold mt1>
          <NCheckbox v-model="hasBread" n="green">
            BREAD
            |
          </NCheckbox>
        </span>
        <span flex gap4 mt2 ml2>
          <NCheckbox v-model="bread.browse.active" n="blue">
            Browse
          </NCheckbox>
          <div flex gap2>
            <NCheckbox v-model="bread.read.active" n="cyan">
              Read
            </NCheckbox>
            <NSelect v-if="bread.read.active" v-model="bread.read.by">
              <option v-for="field in allFields" :key="field.name" :value="field.name">
                {{ field.name }}
              </option>
            </NSelect>
          </div>
          <div flex gap2>
            <NCheckbox v-model="bread.edit.active" n="purple">
              Edit
            </NCheckbox>
            <NSelect v-if="bread.edit.active" v-model="bread.edit.by">
              <option v-for="field in allFields" :key="field.name" :value="field.name">
                {{ field.name }}
              </option>
            </NSelect>
          </div>
          <NCheckbox v-model="bread.add.active" n="green">
            Add
          </NCheckbox>
          <div flex gap2>
            <NCheckbox v-model="bread.delete.active" n="red">
              Delete
            </NCheckbox>
            <NSelect v-if="bread.delete.active" v-model="bread.delete.by">
              <option v-for="field in allFields" :key="field.name" :value="field.name">
                {{ field.name }}
              </option>
            </NSelect>
          </div>
        </span>
      </div>
      <div flex gap4>
        <NTextInput v-model="collection" flex-auto placeholder="Collection name" />
        <NCheckbox v-model="toggleSchema" n="green">
          Generate Schema
        </NCheckbox>
      </div>
    </div>
    <div v-if="schema" px8>
      <div grid="~ cols-1" gap-2 my4>
        <div grid="~ cols-6" text-center>
          <div v-for="label in fieldsLabels" :key="label">
            {{ label }}
          </div>
          <div>
            Actions
          </div>
        </div>
        <div v-for="(column, index) in fields" :key="index" grid="~ cols-6" items-center text-center gap4>
          <div>
            <NTextInput v-model="column.name" />
          </div>
          <div>
            <NSelect v-model="column.type">
              <option v-for="mongoType of mongoTypes" :key="mongoType" :value="mongoType">
                {{ mongoType }}
              </option>
            </NSelect>
          </div>
          <div>
            <NCheckbox v-model="column.required" n="green" />
          </div>
          <div>
            <NCheckbox v-model="column.unique" n="cyan" />
          </div>
          <div>
            <NTextInput v-if="column.type === 'string'" v-model="column.default" type="string" n="orange" />
            <NTextInput v-else-if="column.type === 'number'" v-model="column.default" type="number" n="orange" />
            <NCheckbox v-else-if="column.type === 'boolean'" v-model="column.default" n="orange" />
            <NTextInput v-else-if="column.type === 'date'" v-model="column.default" type="date" n="orange" />
            <NTextInput v-else-if="column.type === 'ObjectId'" placeholder="no-default" disabled n="orange" />
            <NTextInput v-else v-model="column.default" n="orange" />
          </div>
          <div flex justify-center gap2>
            <NIconButton icon="carbon-add" n="cyan" @click="addField(index)" />
            <NIconButton icon="carbon-trash-can" n="red" @click="removeField(index)" />
          </div>
        </div>
      </div>
    </div>
    <NButton glass-effect fixed right-10 bottom-8 px8 py2 icon="carbon-magic-wand-filled" n="green" @click="generate">
      Create
    </NButton>
  </div>
</template>
