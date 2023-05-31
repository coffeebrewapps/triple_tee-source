<script setup>
import { computed } from 'vue';
import { useBannerStore } from '@/stores/banner';

const banner = useBannerStore();

const showBanner = computed(() => {
  return banner.banner;
});

const message = computed(() => {
  return banner.bannerMessage;
});

const bannerContainerClass = computed(() => {
  if (showBanner.value) {
    return `banner-container show`;
  } else {
    return `banner-container hide`;
  }
});

function closeBanner() {
  banner.hide();
}
</script>

<template>
  <div
    :class="bannerContainerClass"
  >
    <div
      class="close-button"
      @click="closeBanner"
    >
      <i class="fa-solid fa-xmark" />
    </div>

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
  z-index: 9999;
}

.banner-container.show {
  transform: translate(0px, 0);
}

.banner-container.hide {
  transform: translate(400px, 0);
}

.banner-container .close-button {
  position: absolute;
  top: -20px;
  left: -20px;
  border-radius: 50%;
  display: grid;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
  background-color: var(--color-border);
}

.banner-container.hide .close-button {
  display: none;
}

.banner-container .close-button:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}
</style>
