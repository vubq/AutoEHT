<template>
  <div class="status-card" :class="{ 'status-running': isRunning, 'status-stopped': !isRunning }">
    <div class="status-icon">
      {{ isRunning ? '✅' : '⛔' }}
    </div>
    <div class="status-info">
      <div class="status-title">{{ statusTitle }}</div>
      <div class="status-message">{{ statusMessage }}</div>
      <div v-if="lastUpdate" class="status-time">
        Cập nhật: {{ formatTime(lastUpdate) }}
      </div>
    </div>
    <div class="status-indicator" :class="{ 'indicator-active': isRunning }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isRunning: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Number,
    default: null
  }
})

const statusTitle = computed(() => props.isRunning ? 'Đang hoạt động' : 'Đã dừng')

const statusMessage = computed(() => {
  if (props.loading) return 'Đang kiểm tra trạng thái...'
  return props.isRunning ? 'Auto đang chạy bình thường' : 'Nhấn khởi động để bắt đầu'
})

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('vi-VN')
}
</script>

<style scoped>
.status-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: all 0.3s ease;
}

.status-card.status-running::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.status-icon {
  font-size: 48px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.status-message {
  font-size: 14px;
  color: #6b7280;
}

.status-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  animation: blink 2s ease-in-out infinite;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.status-indicator.indicator-active {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .status-card {
    padding: 16px;
    gap: 12px;
  }

  .status-icon {
    font-size: 36px;
  }

  .status-title {
    font-size: 16px;
  }

  .status-message {
    font-size: 13px;
  }
}
</style>
