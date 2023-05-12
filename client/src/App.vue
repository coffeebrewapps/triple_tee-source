<script setup>
import { ref, watch } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import NavMenu from './components/NavMenu.vue'

import { useNavStore } from './stores/nav'

const router = useRouter()
const transitionName = ref('default')

const navigator = useNavStore()

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade'
  navigator.toggle()
})
</script>

<template>
  <NavMenu />

  <div class="content-container">
    <RouterView v-slot="{ Component }">
      <Transition mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
</style>
