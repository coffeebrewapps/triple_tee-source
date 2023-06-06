<script setup>
/** import:components **/
import MultiViewContainer from '@/components/MultiViewContainer.vue';
/** import:components **/

/** section:props **/
const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:views **/
const views = [
  { name: 'Contact Details', params: { contactId: props.contactId } },
  { name: 'Contact Invoice Configs', params: { contactId: props.contactId } },
  { name: 'Contact Receipt Configs', params: { contactId: props.contactId } },
  { name: 'Contact Billing Configs', params: { contactId: props.contactId } },
  { name: 'Contact Invoices', params: { contactId: props.contactId } },
  { name: 'Contact Receipts', params: { contactId: props.contactId } },
];
/** section:views **/
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      Contact #{{ contactId }}
    </h2>
    <MultiViewContainer
      :views="views"
    />
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  margin-top: 1rem;
}

.page-container .heading {
  font-weight: 900;
}
</style>
