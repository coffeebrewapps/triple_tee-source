<script setup>
import MultiViewContainer from '@/components/MultiViewContainer.vue';

const views = [
  { name: 'Configure Currencies', params: {} },
  { name: 'Configure Sequences', params: {} },
  { name: 'Configure Tags', params: {} },
  { name: 'Configure System', params: {} },
];
</script>

<template>
  <MultiViewContainer
    :views="views"
  />
</template>
