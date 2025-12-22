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
            <!-- Status Card -->
            <StatusCard
                :is-running="isRunning"
                :loading="loading"
                :last-update="lastUpdate"
            />

            <!-- Control Form -->
            <ControlForm
                v-model:domain-server="domainServer"
                v-model:auto-type="autoType"
                v-model:scenario="scenario"
                v-model:search-b="searchB"
                :is-running="isRunning"
                :start-loading="startLoading"
                :stop-loading="stopLoading"
                :is-mobile="isMobile"
                @domain-change="handleDomainChange"
                @start="handleStart"
                @stop="handleStop"
            />

            <!-- Screen Viewer (Mobile only) -->
            <ScreenViewer v-if="isMobile" />

            <!-- Log Viewer (Mobile only) -->
            <LogViewer
                v-if="isMobile"
                :content="logContent"
                :current-filename="currentFilename"
                :loading="logLoading"
                :save-loading="saveLoading"
                v-model:edit-content="editContent"
                v-model:is-edit-mode="isEditMode"
                :rows="15"
                @toggle-edit="toggleEditMode"
                @save="handleSaveEdit"
                @clear="handleClearLog"
            />
          </n-space>
        </n-gi>

        <!-- Right Column: Screen Viewer & Log Viewer (Desktop only) -->
        <n-gi v-if="!isMobile" :span="8">
          <n-space vertical :size="16">
            <!-- Screen Viewer -->
            <ScreenViewer />

            <!-- Log Viewer -->
            <LogViewer
                :content="logContent"
                :current-filename="currentFilename"
                :loading="logLoading"
                :save-loading="saveLoading"
                v-model:edit-content="editContent"
                v-model:is-edit-mode="isEditMode"
                :rows="15"
                @toggle-edit="toggleEditMode"
                @save="handleSaveEdit"
                @clear="handleClearLog"
            />
          </n-space>
        </n-gi>

        <!-- File Manager (Full width) -->
        <n-gi :span="isMobile ? 1 : 24">
          <FileManager
              :files="files"
              :current-filename="currentFilename"
              :loading="filesLoading"
              :is-mobile="isMobile"
              @view="handleViewFile"
              @edit="handleEditFile"
              @delete="handleDeleteFile"
              @create="showCreateDialog = true"
              @refresh="handleLoadFiles"
          />
        </n-gi>
      </n-grid>
    </div>

    <!-- Create File Modal -->
    <CreateFileModal
        v-model:show="showCreateDialog"
        v-model:form="createForm"
        :loading="createLoading"
        @create="handleCreateFile"
        @cancel="handleCancelCreate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { NGrid, NGi, NSpace, NButton, useMessage, useDialog } from 'naive-ui'
import autoService from '../api/autoService.js'
import screenService from '../api/screenService.js'

// Import components
import StatusCard from './StatusCard.vue'
import ControlForm from './ControlForm.vue'
import ScreenViewer from './ScreenViewer.vue'
import LogViewer from './LogViewer.vue'
import FileManager from './FileManager.vue'
import CreateFileModal from './CreateFileModal.vue'

const message = useMessage()
const dialog = useDialog()

// State (giữ nguyên code cũ)
const loading = ref(false)
const startLoading = ref(false)
const stopLoading = ref(false)
const filesLoading = ref(false)
const logLoading = ref(false)
const saveLoading = ref(false)
const createLoading = ref(false)

const isRunning = ref(false)
const lastUpdate = ref(null)
const domainServer = ref('vubq.serveousercontent.com')
const autoType = ref('Trang bị')
const scenario = ref('Giáp')
const searchB = ref(false)
const files = ref([])
const logContent = ref('Chọn file để xem nội dung...')
const currentFilename = ref('')
const showCreateDialog = ref(false)

const createForm = ref({
  filename: '',
  extension: '.txt',
  content: ''
})

// Edit mode
const isEditMode = ref(false)
const editContent = ref('')
const originalContent = ref('')

// Responsive
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// Methods (giữ nguyên tất cả methods cũ)
const handleDomainChange = (value) => {
  autoService.setBaseUrl(value)
  screenService.setBaseUrl(value) // Thêm dòng này
  message.info('Đã cập nhật domain server')
}

const checkStatus = async () => {
  try {
    loading.value = true
    const result = await autoService.checkStatus()

    if (result.success) {
      isRunning.value = result.data.running
      lastUpdate.value = result.data.timestamp
    } else {
      isRunning.value = false
      if (import.meta.env.DEV) {
        console.warn('Status check failed:', result.error)
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Status check error:', error)
    }
    isRunning.value = false
  } finally {
    loading.value = false
  }
}

const handleRefreshStatus = async () => {
  await checkStatus()
  message.info('Đã làm mới trạng thái')
}

const handleStart = async () => {
  if (!autoType.value) {
    message.warning('Vui lòng chọn loại auto')
    return
  }

  try {
    startLoading.value = true
    const result = await autoService.startAuto(autoType.value, scenario.value, searchB.value)

    if (result.success) {
      message.success(result.message)
      await checkStatus()
    } else {
      message.error(result.error || 'Không thể khởi động auto')
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    startLoading.value = false
  }
}

const handleStop = async () => {
  try {
    stopLoading.value = true
    const result = await autoService.stopAuto()

    if (result.success) {
      message.success(result.message)
      await checkStatus()
    } else {
      message.error(result.error || 'Không thể dừng auto')
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
  } finally {
    stopLoading.value = false
  }
}

const handleLoadFiles = async () => {
  try {
    filesLoading.value = true
    const result = await autoService.getFiles()

    if (result.success) {
      files.value = result.files || []
      message.success(`Đã tải ${files.value.length} file`)
    } else {
      files.value = []
      message.warning(result.error || 'Không có file nào')
    }
  } catch (error) {
    message.error('Không thể tải danh sách file')
    files.value = []
  } finally {
    filesLoading.value = false
  }
}

const handleViewFile = async (filename) => {
  if (isEditMode.value && currentFilename.value !== filename) {
    isEditMode.value = false
  }

  try {
    logLoading.value = true
    currentFilename.value = filename
    const result = await autoService.viewFile(filename)

    if (result.success) {
      logContent.value = result.content || '(File trống)'
      originalContent.value = result.content || ''
      message.success(`Đã tải file: ${filename}`)
    } else {
      logContent.value = `Lỗi: ${result.error}`
      currentFilename.value = ''
      message.error('Không thể đọc file')
    }
  } catch (error) {
    logContent.value = `Lỗi: ${error.message}`
    currentFilename.value = ''
    message.error('Không thể tải file')
  } finally {
    logLoading.value = false
  }
}

const handleEditFile = async (filename) => {
  await handleViewFile(filename)
  setTimeout(() => {
    if (!isEditMode.value) {
      toggleEditMode()
    }
  }, 100)
}

const toggleEditMode = () => {
  if (!currentFilename.value) {
    message.warning('Chưa chọn file nào để chỉnh sửa')
    return
  }

  if (isEditMode.value) {
    dialog.warning({
      title: '❌ Hủy chỉnh sửa',
      content: 'Bạn có chắc muốn hủy các thay đổi?',
      positiveText: 'Hủy thay đổi',
      negativeText: 'Tiếp tục sửa',
      onPositiveClick: () => {
        isEditMode.value = false
        editContent.value = ''
      }
    })
  } else {
    isEditMode.value = true
    editContent.value = originalContent.value
    message.info('Đã vào chế độ chỉnh sửa')
  }
}

const handleSaveEdit = async () => {
  if (!currentFilename.value) {
    message.warning('Không có file để lưu')
    return
  }

  if (editContent.value === originalContent.value) {
    message.info('Không có thay đổi nào')
    return
  }

  dialog.info({
    title: '💾 Xác nhận lưu',
    content: `Bạn có chắc muốn lưu thay đổi vào file "${currentFilename.value}"?`,
    positiveText: 'Lưu',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      try {
        saveLoading.value = true
        const result = await autoService.updateFile(currentFilename.value, editContent.value)

        if (result.success) {
          message.success(result.message)
          isEditMode.value = false
          logContent.value = editContent.value
          originalContent.value = editContent.value
          await handleLoadFiles()
        } else {
          message.error(result.error || 'Không thể lưu file')
        }
      } catch (error) {
        message.error('Lỗi: ' + error.message)
      } finally {
        saveLoading.value = false
      }
    }
  })
}

const handleClearLog = () => {
  logContent.value = 'Chọn file để xem nội dung...'
  currentFilename.value = ''
  isEditMode.value = false
  editContent.value = ''
  originalContent.value = ''
  message.info('Đã xóa log')
}

const handleDeleteFile = (filename) => {
  dialog.warning({
    title: '🗑️ Xác nhận xóa',
    content: `Bạn có chắc muốn xóa file "${filename}"?`,
    positiveText: 'Xóa',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      try {
        const result = await autoService.deleteFile(filename)

        if (result.success) {
          message.success(result.message)
          await handleLoadFiles()
          if (currentFilename.value === filename) {
            handleClearLog()
          }
        } else {
          message.error(result.error || 'Không thể xóa file')
        }
      } catch (error) {
        message.error('Không thể xóa file')
      }
    }
  })
}

const handleCreateFile = async (form) => {
  if (!form.filename.trim()) {
    message.warning('Vui lòng nhập tên file')
    return false
  }

  const filename = form.filename.trim() + form.extension

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    message.error('Tên file không được chứa ký tự đặc biệt')
    return false
  }

  if (files.value.some(f => f.name === filename)) {
    message.warning('File này đã tồn tại')
    return false
  }

  try {
    createLoading.value = true
    const result = await autoService.createFile(filename, form.content)

    if (result.success) {
      message.success(result.message || `Đã tạo file: ${filename}`)

      createForm.value = {
        filename: '',
        extension: '.txt',
        content: ''
      }

      await handleLoadFiles()
      showCreateDialog.value = false

      setTimeout(() => {
        handleViewFile(filename)
      }, 300)

      return true
    } else {
      message.error(result.error || 'Không thể tạo file')
      return false
    }
  } catch (error) {
    message.error('Lỗi: ' + error.message)
    return false
  } finally {
    createLoading.value = false
  }
}

const handleCancelCreate = () => {
  createForm.value = {
    filename: '',
    extension: '.txt',
    content: ''
  }
  showCreateDialog.value = false
}

// Auto refresh status
let statusInterval = null

onMounted(() => {
  autoService.setBaseUrl(domainServer.value)
  screenService.setBaseUrl(domainServer.value) // Thêm dòng này
  checkStatus()
  handleLoadFiles()

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
/* Giữ nguyên tất cả CSS cũ */
.auto-control-panel {
  min-height: 100vh;
  padding-bottom: 40px;
}

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

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
}
</style>
