<script setup>
import { ref, watch } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import Banner from './components/Banner.vue'
import NavMenu from './components/NavMenu.vue'
import TopNav from './components/TopNav.vue'
import Alerts from './components/Alerts.vue'

import { useNavStore } from './stores/nav'

const router = useRouter()
const transitionName = ref('default')

const navigator = useNavStore()

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade'
  navigator.hide()
})
</script>

<template>
  <div class="app-container">
    <NavMenu />

    <div class="content-container">
      <Banner />

      <RouterView v-slot="{ Component }">
        <TopNav />

        <div class="divider"></div>

        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>

      <Alerts />
    </div>
  </div>
</template>

<style scoped>
</style>
