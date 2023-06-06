<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentRoute = ref(router.currentRoute);

function findParentRoute(thisRoute) {
  return router.getRoutes().find((route) => {
    if (!thisRoute.meta) { return false; }
    if (!thisRoute.meta.parentRoute) { return false; }

    return route.name === thisRoute.meta.parentRoute.name;
  });
}

function buildHierarchy(stack, thisRoute) {
  const myParent = findParentRoute(thisRoute);
  if (myParent) {
    buildHierarchy(stack, myParent);
  }
  stack.push(thisRoute);
}

const navs = computed(() => {
  const routes = [];
  buildHierarchy(routes, currentRoute.value);
  return routes;
});

function goToNav(nav) {
  if (nav.meta.buildParams) {
    router.push({ name: nav.name, ...nav.meta.buildParams(currentRoute.value) });
  } else {
    router.push({ name: nav.name });
  }
}
</script>

<template>
  <div
    class="breadcrumbs"
  >
    <div
      v-for="(nav, i) in navs"
      :key="i"
      class="nav"
      @click="goToNav(nav)"
    >
      <i class="fa-solid fa-caret-right" />
      <div class="name">
        {{ nav.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.breadcrumbs {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.breadcrumbs .nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumbs .nav .name {
  font-size: 0.8rem;
  font-weight: 600;
}

.breadcrumbs .nav .name:hover {
  cursor: pointer;
  color: var(--color-border-hover);
}
</style>
