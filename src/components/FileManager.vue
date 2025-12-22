<template>
  <n-card class="glass-card file-card" :bordered="false">
    <template #header>
      <div class="card-header">
        <span>📁 Quản lý File</span>
        <n-space :size="8">
          <n-button
              @click="$emit('create')"
              type="primary"
              tertiary
          >
            <template #icon>
              <span style="font-size: 18px;">➕</span>
            </template>
            <span v-if="!isMobile">Tạo file</span>
          </n-button>

          <n-button
              @click="$emit('refresh')"
              :loading="loading"
              tertiary
          >
            <template #icon>
              <span style="font-size: 18px;">🔄</span>
            </template>
          </n-button>
        </n-space>
      </div>
    </template>

    <n-spin :show="loading">
      <div v-if="files.length > 0" class="file-grid">
        <div
            v-for="file in sortedFiles"
            :key="file.name"
            class="file-card-item"
            :class="{ 'file-active': currentFilename === file.name }"
            @click="$emit('view', file.name)"
        >
          <div class="file-icon">{{ getFileIcon(file.name) }}</div>
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-date">{{ formatDate(file.modified) }}</span>
            </div>
          </div>
          <div class="file-actions" @click.stop>
            <n-button
                text
                type="primary"
                @click="$emit('view', file.name)"
                class="action-icon-btn"
                size="tiny"
            >
              <template #icon>
                <span style="font-size: 13px;">👀</span>
              </template>
            </n-button>
            <n-button
                text
                type="info"
                @click="$emit('edit', file.name)"
                class="action-icon-btn"
                size="tiny"
            >
              <template #icon>
                <span style="font-size: 13px;">✏️</span>
              </template>
            </n-button>
            <n-button
                text
                type="error"
                @click="$emit('delete', file.name)"
                class="action-icon-btn"
                size="tiny"
            >
              <template #icon>
                <span style="font-size: 13px;">🗑️</span>
              </template>
            </n-button>
          </div>
        </div>
      </div>
      <n-empty
          v-else
          description="Chưa có file nào"
          class="empty-state"
      >
        <template #icon>
          <span style="font-size: 48px;">📂</span>
        </template>
        <template #extra>
          <n-button @click="$emit('refresh')" type="primary" size="small">
            Tải lại
          </n-button>
        </template>
      </n-empty>
    </n-spin>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import { NCard, NSpin, NEmpty, NButton, NSpace } from 'naive-ui'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  currentFilename: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view', 'edit', 'delete', 'create', 'refresh'])

const sortedFiles = computed(() => {
  return [...props.files].sort((a, b) => b.modified - a.modified)
})

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Vừa xong'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' phút trước'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' giờ trước'

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const icons = {
    'log': '📄',
    'txt': '📝',
    'json': '📊'
  }
  return icons[ext] || '📄'
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.file-card-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.file-card-item:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

.file-active {
  border-color: #667eea;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.file-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.file-size {
  color: #6b7280;
}

.file-date {
  color: #9ca3af;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-icon-btn {
  font-size: 20px;
  padding: 8px;
  transition: transform 0.2s ease;
}

.action-icon-btn:hover {
  transform: scale(1.2);
}

.empty-state {
  padding: 60px 20px;
}

@media (max-width: 768px) {
  .glass-card :deep(.n-card-header) {
    padding: 16px;
    font-size: 16px;
  }

  .glass-card :deep(.n-card__content) {
    padding: 16px;
  }

  .file-grid {
    grid-template-columns: 1fr;
  }

  .file-card-item {
    padding: 12px;
  }
}
</style>
