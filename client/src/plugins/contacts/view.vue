<script setup>
import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const countriesUrl = `${config.baseUrl}/api/countries`

const fieldsLayout = [
  { name: 'lg', accountNumber: 'md' },
  { addressLine1: 'lg' },
  { addressLine2: 'lg' },
  { addressLine3: 'lg' },
  { city: 'md', state: 'md', country: 'md', postcode: 'md' },
  { contactNumber1: 'md', contactNumber2: 'md', contactNumber3: 'md' },
  { contactPerson1: 'md', contactPerson2: 'md', contactPerson3: 'md' },
  { contactEmail1: 'md', contactEmail2: 'md', contactEmail3: 'md' },
  { url1: 'lg' },
  { url2: 'lg' },
  { url3: 'lg' },
  { logo: 'lg' },
  { customFields: 'lg' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
  { key: 'accountNumber', type: 'text', label: 'Account Number', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'addressLine1', type: 'text', label: 'Address Line 1', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'addressLine2', type: 'text', label: 'Address Line 2', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'addressLine3', type: 'text', label: 'Address Line 3', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'city', type: 'text', label: 'City', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'state', type: 'text', label: 'State', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'country', type: 'singleSelect', label: 'Country',
    reference: { label: countryLabel },
    listable: false, viewable: true, creatable: true, updatable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: countriesUrl,
      value: countryValue,
      label: countryLabel
    }
  },
  { key: 'postcode', type: 'text', label: 'Postcode', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactNumber1', type: 'text', label: 'Contact Number 1', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'contactNumber2', type: 'text', label: 'Contact Number 2', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactNumber3', type: 'text', label: 'Contact Number 3', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactPerson1', type: 'text', label: 'Contact Person 1', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'contactPerson2', type: 'text', label: 'Contact Person 2', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactPerson3', type: 'text', label: 'Contact Person 3', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactEmail1', type: 'text', label: 'Contact Email 1', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'contactEmail2', type: 'text', label: 'Contact Email 2', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contactEmail3', type: 'text', label: 'Contact Email 3', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'url1', type: 'text', label: 'URL 1', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'url2', type: 'text', label: 'URL 2', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'url3', type: 'text', label: 'URL 3', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'logo', type: 'text', label: 'Logo', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'customFields', type: 'text', label: 'Custom Fields', listable: false, viewable: true, creatable: true, updatable: true },
]

const validations = {
}

const filters = {
  initData: {},
  layout: [
    { name: 'lg' }
  ]
}

function countryValue(record) {
  return record.alpha3Code
}

function countryLabel(record) {
  return record.countryName
}
</script>

<template>
  <DataPage
    data-type="Contacts"
    url-base="api/contacts"
    schemas-url-base="api/schemas/contacts"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
