<template>
  <n-card class="glass-card screen-card" :bordered="false">
    <template #header>
      <div class="card-header">
        <span>📱 Screen</span>
        <n-space :size="8">
          <n-tag :type="isStreaming ? 'success' : 'default'" :bordered="false">
            <template #icon>
              <span>{{ isStreaming ? '🟢' : '⚫' }}</span>
            </template>
          </n-tag>

          <n-button
              v-if="!isStreaming"
              @click="handleStartStream"
              type="success"
              :loading="loading"
              size="small"
          >
            <template #icon>
              <span>▶️</span>
            </template>
          </n-button>

          <n-button
              v-else
              @click="handleStopStream"
              type="error"
              :loading="loading"
              size="small"
          >
            <template #icon>
              <span>⏹️</span>
            </template>
          </n-button>

          <n-button
              @click="handleRefresh"
              :disabled="!isStreaming"
              :loading="refreshing"
              tertiary
              size="small"
          >
            <template #icon>
              <span>🔄</span>
            </template>
          </n-button>
        </n-space>
      </div>
    </template>

    <div class="screen-container">
      <n-spin :show="loading && !screenImage">
        <div v-if="screenImage" class="screen-wrapper">
          <img
              :src="screenImage"
              alt="Device Screen"
              class="screen-image"
              :class="{ 'screen-updating': isUpdating }"
          />

          <div class="screen-overlay">
            <div class="screen-info">
              <n-tag size="small" :bordered="false" type="info">
                {{ screenWidth }} x {{ screenHeight }}
              </n-tag>
              <n-tag size="small" :bordered="false" type="success">
                FPS: {{ currentFPS }}
              </n-tag>
              <n-tag size="small" :bordered="false">
                {{ formatTimestamp(lastUpdate) }}
              </n-tag>
            </div>
          </div>
        </div>

        <n-empty
            v-else
            description="Chưa có màn hình"
            class="empty-state"
        >
          <template #icon>
            <span>📱</span>
          </template>
          <template #extra>
            <n-button
                @click="handleStartStream"
                type="primary"
                :loading="loading"
            >
              Bắt đầu xem màn hình
            </n-button>
          </template>
        </n-empty>
      </n-spin>
    </div>

    <!-- Stats -->
    <div v-if="isStreaming" class="screen-stats">
      <n-space :size="16" justify="space-around">
        <div class="stat-item">
          <span class="stat-label">Frames nhận:</span>
          <span class="stat-value">{{ frameCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Thời gian chạy:</span>
          <span class="stat-value">{{ formatDuration(streamDuration) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Trễ:</span>
          <span class="stat-value" :class="{ 'stat-warning': latency > 1000 }">
            {{ latency }}ms
          </span>
        </div>
      </n-space>
    </div>
  </n-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { NCard, NSpin, NEmpty, NButton, NSpace, NTag, useMessage } from 'naive-ui'
import screenService from '../api/screenService.js'

const message = useMessage()

const loading = ref(false)
const refreshing = ref(false)
const isStreaming = ref(false)
const screenImage = ref(null)
const screenWidth = ref(0)
const screenHeight = ref(0)
const lastUpdate = ref(null)
const frameCount = ref(0)
const streamStartTime = ref(null)
const isUpdating = ref(false)
const latency = ref(0)

const currentFPS = ref(2)
const streamDuration = computed(() => {
  if (!streamStartTime.value) return 0
  return Math.floor((Date.now() - streamStartTime.value) / 1000)
})

const handleStartStream = async () => {
  try {
    loading.value = true
    const result = await screenService.startStream()

    if (result.success) {
      isStreaming.value = true
      streamStartTime.value = Date.now()
      frameCount.value = 0
      message.success('Đã bắt đầu xem màn hình')

      // Bắt đầu polling để lấy ảnh
      screenService.startPolling(handleScreenUpdate, currentFPS.value)
    } else {
      message.error(result.error || 'Không thể bắt đầu stream')
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleStopStream = async () => {
  try {
    loading.value = true
    const result = await screenService.stopStream()

    if (result.success) {
      isStreaming.value = false
      streamStartTime.value = null
      message.info('Đã dừng xem màn hình')
    } else {
      message.error(result.error || 'Không thể dừng stream')
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  if (!isStreaming.value) return

  try {
    refreshing.value = true
    const result = await screenService.getLatestScreen()

    if (result.success) {
      handleScreenUpdate(result.data)
      message.success('Đã làm mới')
    } else {
      message.error('Không thể làm mới')
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    refreshing.value = false
  }
}

const handleScreenUpdate = (data) => {
  if (!data || !data.image) return

  const startTime = Date.now()

  isUpdating.value = true
  screenImage.value = `data:image/jpeg;base64,${data.image}`
  screenWidth.value = data.width
  screenHeight.value = data.height
  lastUpdate.value = data.timestamp
  frameCount.value++

  // Tính latency
  latency.value = Date.now() - startTime

  setTimeout(() => {
    isUpdating.value = false
  }, 100)
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '--:--:--'
  return new Date(timestamp).toLocaleTimeString('vi-VN')
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

onMounted(() => {
  // Auto start nếu cần
})

onUnmounted(() => {
  if (isStreaming.value) {
    screenService.stopStream()
  }
})
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

.screen-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
}

.screen-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.screen-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.screen-updating {
  opacity: 0.95;
}

.screen-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  border-radius: 8px 8px 0 0;
}

.screen-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.screen-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.stat-warning {
  color: #ef4444;
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

  .screen-container {
    min-height: 300px;
  }

  .screen-stats {
    font-size: 12px;
  }

  .stat-value {
    font-size: 14px;
  }
}
</style>
