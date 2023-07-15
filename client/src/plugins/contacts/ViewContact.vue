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
  { name: 'Contact Create Invoice', params: { contactId: props.contactId }, hidden: true },
  { name: 'Contact Create Receipt', params: { contactId: props.contactId }, hidden: true },
  { name: 'Contact View Invoice', params: { contactId: props.contactId }, hidden: true },
  { name: 'Contact View Receipt', params: { contactId: props.contactId }, hidden: true },
];
/** section:views **/
</script>

<template>
  <div class="page-container">
    <MultiViewContainer
      :views="views"
    />
  </div> <!-- page-container -->
</template>
