<script setup>
import { computed, ref } from 'vue'

import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
import TButton from 'coffeebrew_vue_components/src/components/form/TButton.vue'
import TSelect from 'coffeebrew_vue_components/src/components/form/TSelect.vue'
import TCheckbox from 'coffeebrew_vue_components/src/components/form/TCheckbox.vue'
import TDatePicker from 'coffeebrew_vue_components/src/components/form/TDatePicker.vue'
import TTable from 'coffeebrew_vue_components/src/components/table/TTable.vue'

const model = ref({
  username: '',
  name: '',
  description: '',
  password: '',
  country1: '',
  country2: '',
  country3: '',
  subscribe: false,
  agree: false,
  startDate: null,
  endDate: null,
  dateRange: {
    start: null,
    end: null
  }
})

const countryOptions = ref([
  { value: 'sg', label: 'Singapore' },
  { value: 'my', label: 'Malaysia' },
  { value: 'th', label: 'Thailand' },
  { value: 'vn', label: 'Vietnam' }
])

const tableData = ref({
  headers: [
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'description', label: 'Description' }
  ],
  data: [
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-27 09:31:48', endTime: null, description: 'Implemention' },
  ],
  tableActions: [
    {
      name: 'Add',
      icon: 'fa-solid fa-circle-plus fa-xl',
      click: function(data) {
        alert(`Adding data to count: ${data.length}`)
      }
    },
    {
      name: 'Export',
      icon: 'fa-solid fa-file-arrow-down fa-xl',
      click: function(data) {
        alert(`Export data count: ${data.length}`)
      }
    }
  ],
  actions: [
    {
      name: 'View',
      icon: 'fa-solid fa-magnifying-glass',
      click: function(row, index) {
        alert(`Row[${index}]: ${JSON.stringify(row)}`)
      }
    },
    {
      name: 'Edit',
      icon: 'fa-solid fa-pen-to-square',
      click: function(row, index) {
        alert(`Row[${index}]: editing ${JSON.stringify(row)}`)
      }
    },
    {
      name: 'Delete',
      icon: 'fa-solid fa-trash-can',
      click: function(row, index) {
        alert(`Row[${index}]: deleting ${JSON.stringify(row)}`)
      }
    }
  ]
})

const serverData = ref({
  headers: [
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'description', label: 'Description' }
  ],
  data: [
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-23 12:42:14', endTime: '2023-01-23 18:34:29', description: 'Requirements' },
    { startTime: '2023-01-24 08:23:57', endTime: '2023-01-24 16:27:18', description: 'Implementation' },
    { startTime: '2023-01-25 10:32:19', endTime: '2023-01-25 12:23:53', description: 'Documentation' },
    { startTime: '2023-01-25 13:32:58', endTime: '2023-01-25 19:28:43', description: 'Implementation' },
    { startTime: '2023-01-26 17:28:47', endTime: '2023-01-26 22:13:02', description: 'Testing' },
    { startTime: '2023-01-27 09:31:48', endTime: null, description: 'Implemention' },
  ]
})

const FakeAPI = {
  async fetch (offset, limit) {
    return new Promise(resolve => {
      setTimeout(() => {
        const items = serverData.value.data.slice(offset, limit + offset)
        resolve({ data: items, total: serverData.value.length })
      }, 500)
    })
  }
}

const offset = ref(0)
const limit = ref(3)
const paginatedData = ref([])

function fetchServerData() {
  FakeAPI
    .fetch(offset.value, limit.value)
    .then(({ data, total }) => {
      paginatedData.value = data
    })
}

function hello(text) {
  alert(text)
}

function offsetChange(val) {
  offset.value = val
}

function loadDataOnOffsetChange(val) {
  offsetChange(val)
  fetchServerData()
}
</script>

<template>
  <h1>Demo Form Elements</h1>
  <div class="form-container">
    <div class="form">
      <div class="tags">
        <div class="tag">
          <div class="category">tag</div>
          <div class="divider">:</div>
          <div class="name">default</div>
        </div>

        <div class="tag sm">
          <div class="category">tag</div>
          <div class="divider">:</div>
          <div class="name">small</div>
        </div>

        <div class="tag md">
          <div class="category">tag</div>
          <div class="divider">:</div>
          <div class="name">medium</div>
        </div>

        <div class="tag lg">
          <div class="category">tag</div>
          <div class="divider">:</div>
          <div class="name">large</div>
        </div>
      </div>

      <div class="hyperlink">
        <a href="#">This is a Hyperlink</a>
      </div>

      <TInput v-model="model.username" type="text" label="Username"/>
      <TInput v-model="model.name" type="text" size="md" label="Name"/>
      <TInput v-model="model.description" type="text" size="lg" label="Description"/>
      <TInput v-model="model.password" type="password" label="Password" error-message="Min 8 characters"/>

      <TButton button-type="text" value="Very Long Button" icon="fa-sharp fa-solid fa-circle-down" @click="hello('Hello World!')"/>
      <TButton button-type="text" size="lg" value="Very Long Long Button with Icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TButton button-type="icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TSelect v-model="model.country1" label="Country" name="country" id="country-1" :options="countryOptions"/>
      <TSelect v-model="model.country2" size="sm" label="Country" name="country" id="country-2" :options="countryOptions"/>
      <TSelect v-model="model.country3" size="lg" label="Country" name="country" id="country-3" :options="countryOptions" error-message="Min 8 characters"/>

      <TCheckbox v-model="model.subscribe" label="Subscribe newsletter"/>
      <TCheckbox v-model="model.agree" label="Agree T&C" error-message="Required!"/>

      <TDatePicker v-model="model.startDate" label="Start Date"/>
      <TDatePicker v-model="model.endDate" label="End Date" error-message="Cannot be earlier than start date!"/>

      <div class="date-range">
        <TDatePicker v-model="model.dateRange.start" label="Start Date"/>
        <div class="to">to</div>
        <TDatePicker v-model="model.dateRange.end" label="End Date" error-message="Cannot be earlier than start date!"/>
      </div>

      <TTable :headers="tableData.headers" :data="tableData.data" />
      <TTable name="Work Logs" :headers="tableData.headers" :data="tableData.data" :actions="tableData.actions" :table-actions="tableData.tableActions" @offset-change="offsetChange"/>
      <TTable name="Work Logs (out of bound)" :headers="tableData.headers" :data="tableData.data" :pagination="{ limit: 3, client: true }"/>
      <TTable name="Work Logs (server pagination)" :headers="serverData.headers" :data="paginatedData" :pagination="{ limit: 3, client: false }" :total-data="serverData.data.length" @offset-change="loadDataOnOffsetChange" />

      <TTable
        name="Work Logs (custom templates)"
        :headers="tableData.headers"
        :data="tableData.data"
        :actions="tableData.actions"
        :table-actions="tableData.tableActions"
        @offset-change="offsetChange"
      >
        <template #table-name="{ name }">
          Table: {{ name }}
        </template>

        <template #table-action="{ action, data }">
          {{ action.name }}
        </template>

        <template #header-row="{ headers, actions }">
          <th
            style="width: 30px;"
            class="col"
          >
            #
          </th>
          <th
            v-for="(header, i) in headers"
            class="col"
          >
            {{ header.label }}
          </th>

          <th
            class="col"
          >
            <span v-if="actions.length === 0">
              No action
            </span>
          </th>
        </template>

        <template #data-row="{ headers, row, actions, i }">
          <td
            class="col"
          >
            {{ i + 1 }}
          </td>

          <td
            v-for="header in headers"
            class="col"
          >
            {{ row[header.key] }}
          </td>

          <td
            v-if="actions.length > 0"
            class="col"
          >
            <div
              class="data-actions"
            >
              <div
                v-for="action in actions"
                class="data-action"
                @click="action.click(row, i)"
              >
                {{ action.name }}
              </div>
            </div>
          </td>
        </template>

        <template #pagination="{ pageLeft, pageRight, start, end, total }">
          <div class="pager-left" @click="pageLeft()">
            Left
          </div>

          <div class="page-number">
            {{ start }} - {{ end }} of {{ total }}
          </div>

          <div class="pager-right" @click="pageRight()">
            Right
          </div>
        </template>
      </TTable>

      <TTable
        name="Work Logs (custom templates 2)"
        :headers="tableData.headers"
        :data="tableData.data"
        :actions="tableData.actions"
        :table-actions="tableData.tableActions"
        @offset-change="offsetChange"
      >
        <template #table-name="{ name }">
          Table: {{ name }}
        </template>

        <template #table-action="{ action, data }">
          {{ action.name }}
        </template>

        <template #header-col="{ header, i }">
          {{ i }} | {{ header.label }}
        </template>

        <template #header-actions="{ actions }">
          No action
        </template>

        <template #data-col="{ header, row, i }">
          {{ i }} | {{ row[header.key] }}
        </template>

        <template #data-action="{ row, action, i }">
          <div class="data-action">{{ action.name }}</div>
        </template>

        <template #pager-left>
          <i class="fa-solid fa-circle-arrow-left"></i>
        </template>

        <template #page-number="{ start, end, total }">
          {{ start }} - {{ end }} of {{ total }}
        </template>

        <template #pager-right>
          <i class="fa-solid fa-circle-arrow-right"></i>
        </template>
      </TTable>
    </div>

    <div class="result">
      <h2>Output</h2>
      <div
        v-for="key in Object.keys(model)"
      >
        {{ key }}: {{ model[key] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
}

.form {
  width: 60%;
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.date-range .to {
  font-size: 0.8rem;
  top: -0.8rem;
  align-self: center;
}

.tags {
  display: flex;
}

.col {
  text-align: left;
  padding: 1rem;
  border: 1px solid var(--color-border);
}

.data-actions {
  display: flex;
  flex-direction: column;
}

.data-action:hover {
  cursor: pointer;
  color: var(--color-border-hover);
}

.pager-left {
  margin-right: 1rem;
}

.pager-right {
  margin-left: 1rem;
}

.pager-left:hover,
.pager-right:hover {
  cursor: pointer;
  color: var(--color-border-hover);
}
</style>
