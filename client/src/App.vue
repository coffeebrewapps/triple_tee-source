<script setup>
import { ref, watch } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import NavMenu from './components/NavMenu.vue'

const router = useRouter()
const transitionName = ref('default')

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade'
  console.log(transitionName.value)
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
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
