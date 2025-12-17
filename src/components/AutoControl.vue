<template>
  <div class="auto-control-panel">
    <!-- Header with Gradient -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-title">
          <div class="icon-wrapper">🎮</div>
          <div>
            <h1>AutoEHT Control</h1>
            <p class="subtitle">Hệ thống điều khiển tự động</p>
          </div>
        </div>
        <n-button 
          type="primary" 
          :size="isMobile ? 'medium' : 'large'"
          @click="handleRefreshStatus"
          :loading="loading"
          class="refresh-btn"
        >
          <template #icon>
            <span style="font-size: 18px;">🔄</span>
          </template>
          <span v-if="!isMobile">Làm mới</span>
        </n-button>
      </div>
    </div>

    <div class="content-wrapper">
      <n-grid :cols="isMobile ? 1 : 24" :x-gap="16" :y-gap="16">
        <!-- Left Column: Status & Controls -->
        <n-gi :span="isMobile ? 1 : 16">
          <n-space vertical :size="16">
            <!-- Status Card with Animation -->
            <div class="status-card" :class="{ 'status-running': isRunning, 'status-stopped': !isRunning }">
              <div class="status-icon">
                {{ isRunning ? '✅' : '⛔' }}
              </div>
              <div class="status-info">
                <div class="status-title">{{ statusTitle }}</div>
                <div class="status-message">{{ statusMessage }}</div>
              </div>
              <div class="status-indicator" :class="{ 'indicator-active': isRunning }"></div>
            </div>

            <!-- Control Card -->
            <n-card title="⚙️ Điều khiển" class="glass-card" :bordered="false">
              <n-form :label-placement="isMobile ? 'top' : 'left'" label-width="120">
                <n-form-item label="🌐 Domain Server">
                  <n-input 
                    v-model:value="domainServer" 
                    placeholder="vubq.serveousercontent.com"
                    @update:value="handleDomainChange"
                    size="large"
                  >
                    <template #prefix>
                      <span style="opacity: 0.6;">https://</span>
                    </template>
                  </n-input>
                </n-form-item>

                <n-form-item label="🎯 Loại Auto">
                  <n-select 
                    v-model:value="autoType" 
                    :options="autoTypeOptions"
                    size="large"
                  />
                </n-form-item>

                <n-form-item label="📝 Scenario">
                  <n-input 
                    v-model:value="scenario" 
                    placeholder="Ví dụ: Giáp, Găng, Giày..."
                    size="large"
                  >
                    <template #suffix>
                      <span style="opacity: 0.4; font-size: 12px;">Tùy chọn</span>
                    </template>
                  </n-input>
                </n-form-item>

                <n-space :vertical="isMobile" :size="12" style="width: 100%; margin-top: 8px;">
                  <n-button 
                    type="success" 
                    @click="handleStart"
                    :loading="startLoading"
                    size="large"
                    :block="isMobile"
                    class="action-btn start-btn"
                  >
                    <template #icon>
                      <span style="font-size: 16px;">▶️</span>
                    </template>
                    Khởi động Auto
                  </n-button>
                  <n-button 
                    type="error" 
                    @click="handleStop"
                    :loading="stopLoading"
                    size="large"
                    :block="isMobile"
                    class="action-btn stop-btn"
                  >
                    <template #icon>
                      <span style="font-size: 16px;">⏹️</span>
                    </template>
                    Dừng Auto
                  </n-button>
                </n-space>
              </n-form>
            </n-card>

            <!-- Log Viewer (Mobile only here) -->
            <n-card v-if="isMobile" title="📋 Log" class="glass-card" :bordered="false">
              <n-spin :show="logLoading">
                <div class="log-container">
                  <pre class="log-content">{{ logContent }}</pre>
                </div>
              </n-spin>
            </n-card>
          </n-space>
        </n-gi>

        <!-- Right Column: Files & Logs (Desktop only) -->
        <n-gi v-if="!isMobile" :span="8">
          <n-space vertical :size="16">
            <!-- Log Viewer -->
            <n-card title="📋 Log Viewer" class="glass-card log-card" :bordered="false">
              <n-spin :show="logLoading">
                <div class="log-container">
                  <pre class="log-content">{{ logContent }}</pre>
                </div>
              </n-spin>
            </n-card>
          </n-space>
        </n-gi>

        <!-- File Manager (Full width) -->
        <n-gi :span="isMobile ? 1 : 24">
          <n-card class="glass-card file-card" :bordered="false">
            <template #header>
              <div class="card-header">
                <span>📁 Quản lý File</span>
                <n-button 
                  type="primary" 
                  @click="handleLoadFiles"
                  :loading="filesLoading"
                  size="medium"
                >
                  <template #icon>
                    <span>📂</span>
                  </template>
                  {{ isMobile ? 'Tải' : 'Tải danh sách' }}
                </n-button>
              </div>
            </template>

            <n-spin :show="filesLoading">
              <div v-if="files.length > 0" class="file-grid">
                <div 
                  v-for="file in files" 
                  :key="file.name" 
                  class="file-card-item"
                  @click="handleViewFile(file.name)"
                >
                  <div class="file-icon">📄</div>
                  <div class="file-info">
                    <div class="file-name" :title="file.name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <div class="file-actions" @click.stop>
                    <n-button 
                      text
                      type="primary" 
                      @click="handleViewFile(file.name)"
                      class="action-icon-btn"
                    >
                      👁️
                    </n-button>
                    <n-button 
                      text
                      type="error" 
                      @click="handleDeleteFile(file.name)"
                      class="action-icon-btn"
                    >
                      🗑️
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
              </n-empty>
            </n-spin>
          </n-card>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  NCard, NSpace, NButton, NFormItem, NInput, NForm,
  NSelect, NSpin, NEmpty, NGrid, NGi,
  useMessage, useDialog
} from 'naive-ui'
import autoService from '../api/autoService'

const message = useMessage()
const dialog = useDialog()

// State
const loading = ref(false)
const startLoading = ref(false)
const stopLoading = ref(false)
const filesLoading = ref(false)
const logLoading = ref(false)

const isRunning = ref(false)
const domainServer = ref('vubq.serveousercontent.com')
const autoType = ref('Trang bị')
const scenario = ref('')
const files = ref([])
const logContent = ref('Chọn file để xem nội dung...')

// Responsive
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// Auto type options
const autoTypeOptions = [
  { label: '🛡️ Trang bị', value: 'Trang bị' },
  { label: '⚔️ Cường hóa', value: 'Cường hóa' },
  { label: '✨ Tẩy thuộc tính', value: 'Tẩy thuộc tính' },
  { label: '🐎 Thú cưỡi', value: 'Thú cưỡi' },
  { label: '🎁 Rương boss', value: 'Rương boss' },
  { label: '🎭 Tính cách', value: 'Tính cách' },
  { label: '🎁 Rương trang bị thú', value: 'Rương trang bị thú' },
  { label: '👔 Đai lưng', value: 'Đai lưng' },
  { label: '👔 Đai lưng MAX', value: 'Đai lưng MAX' },
  { label: '🏰 Hầm ngục', value: 'Hầm ngục' }
]

// Computed
const statusTitle = computed(() => isRunning.value ? 'Đang hoạt động' : 'Đã dừng')
const statusMessage = computed(() => {
  if (loading.value) return 'Đang kiểm tra trạng thái...'
  return isRunning.value ? 'Auto đang chạy bình thường' : 'Nhấn khởi động để bắt đầu'
})

// Methods
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleDomainChange = (value) => {
  autoService.setBaseUrl(value)
}

const checkStatus = async () => {
  try {
    loading.value = true
    const data = await autoService.checkStatus()
    isRunning.value = data.running
  } catch (error) {
    message.error('Không thể kết nối đến server')
    isRunning.value = false
  } finally {
    loading.value = false
  }
}

const handleRefreshStatus = () => {
  checkStatus()
  message.info('Đang làm mới trạng thái...')
}

const handleStart = async () => {
  try {
    startLoading.value = true
    const data = await autoService.startAuto(autoType.value, scenario.value)
    message.success(data.message)
    await checkStatus()
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    startLoading.value = false
  }
}

const handleStop = async () => {
  try {
    stopLoading.value = true
    const data = await autoService.stopAuto()
    message.success(data.message)
    await checkStatus()
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    stopLoading.value = false
  }
}

const handleLoadFiles = async () => {
  try {
    filesLoading.value = true
    const data = await autoService.getFiles()
    if (data.success) {
      files.value = data.files
      message.success(`Đã tải ${data.files.length} file`)
    } else {
      files.value = []
    }
  } catch (error) {
    message.error('Không thể tải danh sách file')
    files.value = []
  } finally {
    filesLoading.value = false
  }
}

const handleViewFile = async (filename) => {
  try {
    logLoading.value = true
    const data = await autoService.viewFile(filename)
    if (data.success) {
      logContent.value = data.content || '(File trống)'
      message.success('Đã tải file: ' + filename)
    } else {
      logContent.value = 'Lỗi: ' + data.error
      message.error('Không thể đọc file')
    }
  } catch (error) {
    logContent.value = 'Lỗi: ' + error.message
    message.error('Không thể tải file')
  } finally {
    logLoading.value = false
  }
}

const handleDeleteFile = (filename) => {
  dialog.warning({
    title: '🗑️ Xác nhận xóa',
    content: `Bạn có chắc muốn xóa file "${filename}"?`,
    positiveText: 'Xóa',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      try {
        const data = await autoService.deleteFile(filename)
        message.success(data.message)
        await handleLoadFiles()
      } catch (error) {
        message.error('Không thể xóa file')
      }
    }
  })
}

// Auto refresh status
let statusInterval = null

onMounted(() => {
  autoService.setBaseUrl(domainServer.value)
  checkStatus()
  statusInterval = setInterval(checkStatus, 5000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.auto-control-panel {
  min-height: 100vh;
  padding-bottom: 40px;
}

/* Header Section */
.header-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  margin-bottom: 24px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0 0;
}

.refresh-btn {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Status Card */
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

/* Glass Card */
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

/* Action Buttons */
.action-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.start-btn {
  flex: 1;
}

.stop-btn {
  flex: 1;
}

/* Log Container */
.log-card {
  position: sticky;
  top: 20px;
}

.log-container {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.log-content {
  color: #10b981;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* File Grid */
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

.file-size {
  font-size: 12px;
  color: #6b7280;
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

/* Scrollbar */
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

/* Mobile Styles */
@media (max-width: 768px) {
  .header-section {
    padding: 16px;
  }

  .header-title h1 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }

  .icon-wrapper {
    font-size: 36px;
  }

  .content-wrapper {
    padding: 0 12px;
  }

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

  .log-container {
    max-height: 300px;
  }

  .log-content {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 12px;
  }

  .header-title {
    gap: 12px;
  }

  .icon-wrapper {
    font-size: 32px;
  }

  .header-title h1 {
    font-size: 18px;
  }

  .status-card {
    padding: 12px;
  }

  .file-card-item {
    padding: 12px;
  }
}
</style>