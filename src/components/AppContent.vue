<template>
  <div class="app-container">
    <!-- Hiển thị Login nếu chưa đăng nhập -->
    <Login
        v-if="!isAuthenticated"
        @login-success="handleLoginSuccess"
    />

    <!-- Hiển thị AutoControl nếu đã đăng nhập -->
    <template v-else>
      <!-- Header với nút Logout -->
      <div class="app-header">
        <div class="header-info">
          <span class="welcome-text">👋 Xin chào!</span>
          <span class="session-info">
            Token còn: {{ formatTimeRemaining(tokenTimeRemaining) }}
          </span>
        </div>
        <n-button
            type="warning"
            @click="handleLogout"
            size="medium"
            class="logout-btn"
        >
          <template #icon>
            <span style="font-size: 16px;">🚪</span>
          </template>
          Đăng xuất
        </n-button>
      </div>

      <AutoControl />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import Login from './Login.vue'
import AutoControl from './AutoControl.vue'
import authService from '../api/authService'

const message = useMessage()

const isAuthenticated = ref(false)
const tokenTimeRemaining = ref(0)

let tokenCheckInterval = null

// Kiểm tra authentication khi component mount
const checkAuth = () => {
  isAuthenticated.value = authService.isAuthenticated()
  if (isAuthenticated.value) {
    tokenTimeRemaining.value = authService.getTokenTimeRemaining()
  }
}

// Xử lý khi login thành công
const handleLoginSuccess = () => {
  checkAuth()
  message.success('Chào mừng bạn trở lại! 🎉')

  // Bắt đầu đếm ngược token
  startTokenCountdown()
}

// Xử lý logout
const handleLogout = () => {
  authService.logout()
  isAuthenticated.value = false
  message.info('Đã đăng xuất thành công')

  // Dừng đếm ngược token
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }
}

// Lắng nghe event auth:required (token hết hạn)
const handleAuthRequired = () => {
  if (isAuthenticated.value) {
    message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại! ⏰')
    handleLogout()
  }
}

// Đếm ngược thời gian token
const startTokenCountdown = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }

  tokenCheckInterval = setInterval(() => {
    tokenTimeRemaining.value = authService.getTokenTimeRemaining()

    // Cảnh báo khi token sắp hết hạn (còn 5 phút)
    if (tokenTimeRemaining.value === 300) {
      message.warning('Token sẽ hết hạn trong 5 phút! ⚠️')
    }

    // Token đã hết hạn
    if (tokenTimeRemaining.value <= 0 && isAuthenticated.value) {
      handleAuthRequired()
    }
  }, 1000) // Cập nhật mỗi giây
}

// Format thời gian còn lại
const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

onMounted(() => {
  checkAuth()

  if (isAuthenticated.value) {
    startTokenCountdown()
  }

  // Lắng nghe event auth:required
  window.addEventListener('auth:required', handleAuthRequired)
})

onUnmounted(() => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }

  window.removeEventListener('auth:required', handleAuthRequired)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.session-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.logout-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .app-header {
    padding: 10px 16px;
  }

  .welcome-text {
    font-size: 14px;
  }

  .session-info {
    font-size: 12px;
  }
}
</style>
