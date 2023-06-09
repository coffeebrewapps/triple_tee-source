<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter, onBeforeRouteUpdate } from 'vue-router';
/** import:global **/

/** section:props **/
const props = defineProps({
  heading: {
    type: String,
    default: null,
  },
  views: {
    type: Array,
    default() {
      return [];
    },
  },
});
/** section:props **/

/** section:global **/
const selectedView = ref(0);
const viewRefs = ref([]);

const router = useRouter();

const displayableViews = computed(() => {
  return props.views.filter((view) => {
    return !view.hidden;
  });
});

function selectView(view) {
  viewRefs.value[view].blur();
  selectedView.value = view;
  router.push({ name: props.views[view].name });
}

function navigateView(view) {
  if (view < 0) { return; }
  if (view > props.views.length - 1) { return; }

  viewRefs.value[view].focus();
}
/** section:global **/

/** section:style **/
function viewStyle(i) {
  if (i === selectedView.value) {
    return `view active`;
  } else {
    return `view`;
  }
}
/** section:style **/

onBeforeRouteUpdate((to, from) => {
  const currentViewIndex = props.views.findIndex(v => v.name === to.name);
  if (currentViewIndex > -1) {
    return true;
  } else {
    selectView(0);
    return false;
  }
});

onMounted(() => {
  selectView(0);
});
</script>

<template>
  <div class="view-container">
    <div class="views">
      <div
        v-for="(view, i) in displayableViews"
        :key="i"
        ref="viewRefs"
        :class="viewStyle(i)"
        tabindex="0"
        @click="selectView(i)"
        @keydown.enter="selectView(i)"
        @keydown.arrow-left="navigateView(i-1)"
        @keydown.arrow-right="navigateView(i+1)"
      >
        {{ view.name }}
      </div>
    </div>

    <div class="view-content">
      <h3
        v-if="heading"
        class="heading"
      >
        {{ heading }}
      </h3>

      <router-view />
    </div>
  </div>
</template>

<style scoped>
.view-container {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  width: 100%;
}

.views {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 15%;
}

.view {
  padding: 0.5rem 0;
  font-size: 0.8rem;
  outline: none;
}

.view.active {
  font-size: 0.9rem;
  font-weight: 900;
}

.view:hover {
  cursor: pointer;
  transition: background-color 0.5s linear;
  font-size: 0.9rem;
  font-weight: 900;
}

.view:focus {
  outline: 5px solid var(--color-border-hover);
}

.view-content {
  width: 85%;
}

.view-content .heading {
  font-weight: 900;
  margin-bottom: 0.5rem;
}
</style>
