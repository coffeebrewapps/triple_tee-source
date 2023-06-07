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
    <MultiViewContainer
      :views="views"
      :heading="`Contact #${contactId}`"
    />
  </div> <!-- page-container -->
</template>
