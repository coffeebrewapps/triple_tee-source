<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

import { useNavStore } from '../stores/nav'

const router = useRouter()
const routes = reactive(router.getRoutes())

const navigator = useNavStore()

const renderedRoutes = computed(() => {
  return routes.filter((route) => {
    return route && (!route.meta || !route.meta.hidden)
  })
})

const showNav = computed(() => {
  return navigator.nav
})

function toggleNav() {
  navigator.toggle()
}

const navContainerClass = computed(() => {
  if (showNav.value) {
    return `nav-container show`
  } else {
    return `nav-container hide`
  }
})
</script>

<template>
  <div
    :class="navContainerClass"
  >
    <div
      class="nav"
    >
      <RouterLink
        class="nav-item"
        v-for="route in renderedRoutes"
        :key="route.name"
        :to="route.path"
        active-class="active"
      >
        {{ route.name }}
      </RouterLink>
    </div>

    <div
      class="nav-toggle"
      @click="toggleNav"
    >
      <i class="fa-solid fa-caret-left"></i>
      <i class="fa-solid fa-caret-right"></i>
    </div>
  </div>
</template>

<style scoped>
.nav-container {
  position: fixed;
  display: flex;
  align-items: center;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 999;
  transition: all 0.5s linear;
}

.nav-container.show {
  transform: translate(0px, 0);
}

.nav-container.hide {
  transform: translate(-230px, 0);
}

.nav {
  display: flex;
  flex-direction: column;
  width: 230px;
  height: 100%;
  border: 1px solid var(--color-border);
  overflow-y: auto;
  background-color: var(--color-background);
}

.nav-item {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
}

.nav-container .nav-item.active {
  background-color: var(--color-background-mute);
}

.nav-toggle {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 20px;
  background-color: var(--color-border);
  border-radius: 0 4px 4px 0;
}

.nav-toggle:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}

.nav-container.show .nav-toggle i.fa-caret-left {
  display: inline-block;
}

.nav-container.hide .nav-toggle i.fa-caret-left {
  display: none;
}

.nav-container.show .nav-toggle i.fa-caret-right {
  display: none;
}

.nav-container.hide .nav-toggle i.fa-caret-right {
  display: inline-block;
}
</style>
