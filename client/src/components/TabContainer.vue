<script setup>
/*** import:global ***/
import { ref, computed, watch, onMounted } from 'vue'
/*** import:global ***/

/*** section:props ***/
const props = defineProps({
  tabs: {
    type: Array,
    default() {
      return []
    }
  }
})
/*** section:props ***/

/*** section:global ***/
const selectedTab = ref(0)

function isActive(i) {
  return selectedTab.value === i
}

function selectTab(tab) {
  selectedTab.value = tab
}
/*** section:global ***/

/*** section:style ***/
function tabStyle(i) {
  if (i === selectedTab.value) {
    return `tab active`
  } else {
    return `tab`
  }
}

function tabContentStyle(i) {
  if (i === selectedTab.value) {
    return `tab-content active`
  } else {
    return `tab-content`
  }
}
/*** section:style ***/
</script>

<template>
  <div class="tab-container">
    <div class="tabs">
      <div
        :class="tabStyle(i)"
        v-for="(tab, i) in tabs"
        @click="selectTab(i)"
      >
        {{ tab.label }}
      </div>
    </div>

    <div
      v-for="(tab, i) in tabs"
      :class="tabContentStyle(i)"
    >
      <slot
        v-bind="{ tab, i }"
        :name="`tab-${i}`"
      >
      </slot>
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  margin: 1rem 0;
}

.tabs {
  display: flex;
}

.tab {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.tab.active {
  border-bottom: 3px solid var(--color-border);
}

.tab:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
  transition: background-color 0.5s linear;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
  padding: 1rem;
  border-radius: 0 0 4px 4px;
}
</style>
