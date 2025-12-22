<template>
  <n-card class="glass-card log-card" :bordered="false">
    <template #header>
      <div class="card-header">
        <span>📋 Log Viewer</span>
        <n-space :size="8">
          <n-button
              v-if="isEditMode"
              @click="handleSave"
              type="success"
              :loading="saveLoading"
              size="small"
              tertiary
          >
            <template #icon>
              <span>💾</span>
            </template>
          </n-button>
          <n-button
              v-if="currentFilename"
              @click="toggleEdit"
              :type="isEditMode ? 'warning' : 'info'"
              size="small"
              tertiary
          >
            <template #icon>
              <span>{{ isEditMode ? '❌' : '✏️' }}</span>
            </template>
          </n-button>
          <n-button
              @click="handleClear"
              :loading="loading"
              tertiary
              size="small"
          >
            <template #icon>
              <span>🗑️</span>
            </template>
          </n-button>
        </n-space>
      </div>
    </template>
    <n-spin :show="loading">
      <div class="log-container">
        <n-input
            v-if="isEditMode"
            v-model:value="localEditContent"
            type="textarea"
            :rows="rows"
            class="edit-textarea"
            style="border: none !important; text-align: left;"
        />
        <div v-else class="log-lines">
          <div
              v-for="(line, index) in logLines"
              :key="index"
              class="log-line-item"
              :class="{ 'log-line-even': index % 2 === 1 }"
          >
            {{ line || '&nbsp;' }}
          </div>
          <div v-if="!logLines.length" class="log-empty">
            {{ content }}
          </div>
        </div>
      </div>
    </n-spin>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NSpin, NInput, NButton, NSpace } from 'naive-ui'

const props = defineProps({
  content: {
    type: String,
    default: 'Chọn file để xem nội dung...'
  },
  currentFilename: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  saveLoading: {
    type: Boolean,
    default: false
  },
  editContent: {
    type: String,
    default: ''
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['toggle-edit', 'save', 'clear', 'update:editContent', 'update:isEditMode'])

const localEditContent = ref(props.editContent)

const logLines = computed(() => {
  if (!props.content || props.content.includes('Chọn file') || props.content.includes('Lỗi:')) {
    return []
  }
  const lines = props.content
      .split('\n')
      .filter(line => line.trim() !== '')
  return lines.reverse()
})

watch(() => props.editContent, (val) => {
  localEditContent.value = val
})

watch(localEditContent, (val) => {
  emit('update:editContent', val)
})

const toggleEdit = () => {
  emit('toggle-edit')
}

const handleSave = () => {
  emit('save')
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.glass-card :deep(.n-card-header) {
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.glass-card :deep(.n-card__content) {
  padding: 24px;
}

.log-card {
  position: sticky;
  top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.log-container {
  background: #1f2937;
  border-radius: 12px;
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
}

.log-lines {
  padding: 8px 0;
}

.log-line-item {
  padding: 6px 16px;
  color: #10b981;
  font-family: 'VNF-ComicSans', cursive, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  border-bottom: 1px solid #374151;
  text-align: left;
}

.log-line-item:last-child {
  border-bottom: none;
}

.log-line-even {
  background: rgba(55, 65, 81, 0.3);
}

.log-empty {
  color: #10b981;
  text-align: center;
  padding: 20px 20px;
}

.edit-textarea {
  width: 100%;
}

.edit-textarea :deep(textarea){
  border: none !important;
}

.edit-textarea :deep(.n-input-wrapper) {
  padding: 0;
}

.edit-textarea :deep(.n-input__border),
.edit-textarea :deep(.n-input__state-border) {
  border: none !important;
  box-shadow: none !important;
}

.edit-textarea :deep(.n-input__textarea-el) {
  font-family: 'VNF-ComicSans', 'Courier New', monospace !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  color: #10b981 !important;
  background: #1f2937 !important;
  border-radius: 8px !important;
  padding: 12px !important;
  transition: all 0.3s ease;
  min-height: 400px;
}

.edit-textarea :deep(.n-input__textarea-el):focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
  outline: none !important;
}

.edit-textarea :deep(.n-input__textarea-el)::selection {
  background: rgba(16, 185, 129, 0.3);
  color: #fff;
}

.edit-textarea :deep(.n-input__textarea-el)::-webkit-scrollbar {
  width: 8px;
}

.edit-textarea :deep(.n-input__textarea-el)::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.edit-textarea :deep(.n-input__textarea-el)::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.edit-textarea :deep(.n-input__textarea-el)::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

@media (max-width: 768px) {
  .glass-card :deep(.n-card-header) {
    padding: 16px;
    font-size: 16px;
  }

  .glass-card :deep(.n-card__content) {
    padding: 16px;
  }
}
</style>
