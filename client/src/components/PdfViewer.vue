<script setup>
/** import:global **/
import { ref } from 'vue';
/** import:global **/

/** import:components **/
import {
  TButton,
  TProgressBar
} from 'coffeebrew-vue-components';
/** import:components **/

/** section:props **/
defineProps({
  templatePdfData: {
    type: Object,
    default: null,
  },
  downloadLink: {
    type: String,
    default: null,
  },
  downloadFile: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:actions **/
const downloadAnchor = ref('downloadAnchor');

function downloadPdf() {
  downloadAnchor.value.click();
}
/** section:actions **/
</script>

<template>
  <div class="viewer-container">
    <div class="viewer-header">
      <h2 class="heading">
        View PDF
      </h2>

      <div class="actions">
        <TButton
          value="Download"
          icon="fa-solid fa-file-arrow-down"
          @click="downloadPdf"
        />

        <a
          ref="downloadAnchor"
          class="hidden"
          rel="noreferrer"
          :download="downloadFile"
          :href="downloadLink"
        />
      </div>
    </div>

    <div class="viewer-content">
      <TProgressBar
        v-if="!templatePdfData"
      />

      <iframe
        v-if="templatePdfData"
        class="preview-panel"
        :src="templatePdfData"
      />
    </div>
  </div>
</template>

<style scoped>
.viewer-header {
  display: flex;
  align-items: center;
  justify-content: left;
}

.viewer-header .heading {
  font-weight: 900;
  margin: 0 0 8px 0;
  padding: 1rem 0;
}

.viewer-header .actions {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.viewer-content {
  height: 70vh;
}

.preview-panel {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
