<script setup>
import { computed } from 'vue'
import { useBannerStore } from '../stores/banner'

const banner = useBannerStore()

const showBanner = computed(() => {
  return banner.banner
})

const message = computed(() => {
  return banner.bannerMessage
})

const bannerContainerClass = computed(() => {
  if (showBanner.value) {
    return `banner-container show`
  } else {
    return `banner-container hide`
  }
})
</script>

<template>
  <div
    :class="bannerContainerClass"
  >
    <div class="message">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  padding: 2rem;
  top: 1rem;
  right: 0;
  width: 400px;
  height: 50px;
  background-color: var(--color-border);
  border-radius: 4px;
  transition: all 0.5s linear;
}

.banner-container.show {
  transform: translate(0px, 0);
}

.banner-container.hide {
  transform: translate(400px, 0);
}
</style>
