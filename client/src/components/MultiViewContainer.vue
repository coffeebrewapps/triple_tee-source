<script setup>
/** import:global **/
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** section:props **/
const props = defineProps({
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

function selectView(view) {
  viewRefs.value[view].blur();
  selectedView.value = view;
  router.push(props.views[view]);
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

onMounted(() => {
  selectView(0);
});
</script>

<template>
  <div class="view-container">
    <div class="views">
      <div
        v-for="(view, i) in views"
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
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.view-container {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
}

.views {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 15vw;
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
  width: 85vw;
}
</style>
