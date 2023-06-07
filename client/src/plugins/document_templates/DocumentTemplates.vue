<script setup>
/** import:global **/
import { ref } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:components **/
import DataPage from '@/components/DataPage.vue';
import TabContainer from '@/components/TabContainer.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
/** section:utils **/

/** section:global **/
const templateType = ref();

const fieldsLayout = [
  { name: 'lg' },
  { contentMarkup: 'lg' },
  { contentStyles: 'lg' },
];

const dataFields = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
    listable: true,
    viewable: true,
    creatable: false,
    updatable: false,
    sortable: true,
  },
  {
    key: 'name',
    type: 'text',
    label: 'Name',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'contentMarkup',
    type: 'textarea',
    label: 'Content Markup',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'contentStyles',
    type: 'textarea',
    label: 'Content Styles',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
];

const validations = {
};

const filters = {
  initData: {},
  layout: [
    { name: 'lg' },
  ],
};
/** section:global **/

/** section:tab **/
const selectedTab = ref(0);
const tabs = [
  { label: 'Invoice', onchange: updateInvoiceTemplates },
  { label: 'Receipt', onchange: updateReceiptTemplates },
];

async function updateInvoiceTemplates() {
  templateType.value = 'invoice_templates';
}

async function updateReceiptTemplates() {
  templateType.value = 'receipt_templates';
}

async function triggerTabEvent(i) {
  await tabs[i].onchange();
  selectedTab.value = i;
}
/** section:tab **/

/** section:dataPage **/
const invoiceActions = {
  create: {
    click: async function(data) {
      templateType.value = 'invoice_templates';
      await openCreatePage();
    },
  },
  view: {
    click: async function(row, index) {
      templateType.value = 'invoice_templates';
      await openViewPage(row.id);
    },
  },
  update: {
    click: async function(row, index) {
      templateType.value = 'invoice_templates';
      await openUpdatePage(row.id);
    },
  },
};

const receiptActions = {
  create: {
    click: async function(data) {
      templateType.value = 'receipt_templates';
      await openCreatePage();
    },
  },
  view: {
    click: async function(row, index) {
      templateType.value = 'receipt_templates';
      await openViewPage(row.id);
    },
  },
  update: {
    click: async function(row, index) {
      templateType.value = 'receipt_templates';
      await openUpdatePage(row.id);
    },
  },
};

async function openCreatePage() {
  router.push({ name: 'Create Template', params: { templateType: templateType.value } });
}

async function openViewPage(id) {
  router.push({ name: 'View Template', params: { id, templateType: templateType.value } });
}

async function openUpdatePage(id) {
  router.push({ name: 'Update Template', params: { id, templateType: templateType.value } });
}
/** section:dataPage **/
</script>

<template>
  <div class="view-container">
    <TabContainer
      :tabs="tabs"
      :selected-tab="selectedTab"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <DataPage
          v-if="selectedTab === 0"
          model-class="invoice_templates"
          data-type="Invoice Templates"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
          :actions="invoiceActions"
        />
      </template>

      <template #tab-1>
        <DataPage
          v-if="selectedTab === 1"
          model-class="receipt_templates"
          data-type="Receipt Templates"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
          :actions="receiptActions"
        />
      </template>
    </TabContainer>
  </div>
</template>

<style scoped>
.view-container {
  margin: 1rem 0;
}

.template-editor {
  text-align: left !important;
}
</style>
