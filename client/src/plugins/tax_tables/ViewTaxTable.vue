<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';
import { useTaxTableUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import ViewPage from '@/components/ViewPage.vue';
import TaxTiers from '@/plugins/tax_tiers/TaxTiers.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();

const {
  fieldsLayout,
  dataFields,
} = useTaxTableUtils();

const {
  includeKeys,
} = useInputHelper(dataFields);

const { flashMessage } = useBannerStore();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);

const taxTableId = computed(() => {
  return currentRoute.params.id;
});

const currentTaxTable = ref();
const heading = computed(() => {
  if (currentTaxTable.value) {
    return `Tax Table: ${currentTaxTable.value.description}`;
  } else {
    return `Tax Table`;
  }
});

async function loadTaxTable() {
  const params = { include: includeKeys.value };

  await dataAccess
    .view('tax_tables', taxTableId.value, params)
    .then((result) => {
      currentTaxTable.value = result;
      flashMessage(`Loaded tax table successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading tax table!`);
    });
}
/** section:global **/

onMounted(async () => {
  await loadTaxTable();
})
</script>

<template>
  <div class="page-container">
    <ViewPage
      v-if="currentTaxTable"
      :heading="heading"
      :fields-layout="fieldsLayout"
      :data-fields="dataFields"
      :data="currentTaxTable"
    />

    <div class="divider" />

    <TaxTiers
      v-if="taxTableId"
      :tax-table-id="taxTableId"
    />
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
