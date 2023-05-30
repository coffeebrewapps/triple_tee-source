import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useBannerStore = defineStore('banner', () => {
  const banner = ref(false);
  const bannerMessage = ref();

  function show(message = null) {
    banner.value = true;
    if (message) { bannerMessage.value = message; }
  }

  function hide() {
    banner.value = false;
  }

  function toggle() {
    banner.value = !banner.value;
  }

  function setMessage(message) {
    bannerMessage.value = message;
  }

  function clearMessage() {
    bannerMessage.value = null;
  }

  return { banner, bannerMessage, show, hide, toggle, setMessage, clearMessage };
});
