<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useValidations } from '@/utils/validations';
import { useFormatter } from '@/utils/formatter';
/** import:utils **/

/** import:stores **/
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** section:props **/
const props = defineProps({
  heading: {
    type: String,
    default: null,
  },
  fieldsLayout: {
    type: Array,
    default() {
      return [];
    },
  },
  dataFields: {
    type: Array,
    default() {
      return [];
    },
  },
  data: {
    type: Object,
    default() {
      return {};
    },
  },
});
/** section:props **/

/** section:utils **/
const {
  includeKeys,
  inputLabel,
  inputValue,
  tagsField,
} = useInputHelper(props.dataFields);

const {
  isEmpty,
  notEmpty,
} = useValidations();

const {
  formatTag,
  tagStyle,
} = useFormatter();

const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

async function formatData() {
  const promises = [];

  if (props.dataFields.length > 0) {
    formattedData.value = props.dataFields.reduce((o, field) => {
      const key = field.key;
      o[key] = props.data[key];
      if (tagsField(key)) {
        promises.push(asyncFormatTag(props.data, key));
      }
      return o;
    }, {});
  } else {
    formattedData.value = {};
  }

  Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        const formattedKey = `${result.key}Formatted`;
        formattedData.value[formattedKey] = result.tags;
      })
    })
}
/** section:utils **/

/** section:tags **/
const formattedData = ref({});

async function asyncFormatTag(record, key) {
  const tags = record[key] || [];
  const promises = tags.map((tag) => {
    return new Promise((resolve, reject) => {
      formatTag(record, tag, key, systemConfigs.tagFormat)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        resolve({ key, tags: results });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function formattedTag(key, index) {
  const formattedKey = `${key}Formatted`;
  return (formattedData.value[formattedKey] || [])[index];
}
/** section:tags **/

onMounted(async () => {
  await formatData();
});
</script>

<template>
  <div class="view-container">
    <h2 class="heading">
      {{ heading }}
    </h2>

    <div
      class="details-container"
    >
      <div
        v-for="(row, i) in fieldsLayout"
        :key="i"
        class="data-row"
      >
        <div
          v-for="(field, j) in Object.keys(row)"
          :key="j"
          class="data-field"
        >
          <div
            class="field-label"
          >
            {{ inputLabel(field) }}
          </div> <!-- field-label -->

          <div
            v-if="!tagsField(field)"
            class="field-value"
          >
            <span
              v-if="notEmpty(data) && notEmpty(data[field])"
            >
              {{ inputValue(field, data, includeKeys, dataFields) }}
            </span>

            <span
              v-if="isEmpty(data) || isEmpty(data[field])"
            >
              --- no value ---
            </span>
          </div> <!-- field-value:notTags -->

          <div
            v-if="tagsField(field)"
            class="field-value"
          >
            <div
              v-for="(tag, j) in data[field]"
              :key="j"
              class="tag"
              :style="tagStyle(data, tag, field)"
            >
              {{ formattedTag(field, j) }}
            </div>

            <div
              v-if="data[field].length === 0"
              class="no-value"
            >
              --- no value ---
            </div>
          </div> <!-- field-value:tags -->

        </div> <!-- data-field -->
      </div> <!-- data-row -->
    </div> <!-- details-container -->
  </div> <!-- view-container -->
</template>

<style scoped>
.view-container {
  margin-top: 1rem;
}

.view-container .heading {
  font-weight: 900;
}

.details-container {
  display: flex;
  flex-direction: column;
}

.data-row {
  display: flex;
}

.data-field {
  display: flex;
  align-items: center;
}

.data-field .field-label {
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.data-field .field-value {
  padding: 0.5rem 1rem;
}

.data-field .field-value .no-value {
  font-size: 0.8rem;
  font-style: oblique;
}
</style>
