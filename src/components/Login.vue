<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">🔐</div>
        <h1>Đăng nhập</h1>
        <p class="login-subtitle">AutoEHT Control Panel</p>
      </div>

      <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
      >
        <n-form-item path="username" :show-label="false">
          <n-input
              v-model:value="formData.username"
              placeholder="Tên đăng nhập"
              @keyup.enter="handleLogin"
              :disabled="loading"
              style="text-align: left;"
          >
            <template #prefix>
              <span style="font-size: 18px;">👤</span>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password" :show-label="false">
          <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="Mật khẩu"
              show-password-on="click"
              @keyup.enter="handleLogin"
              :disabled="loading"
              style="text-align: left;"
          >
            <template #prefix>
              <span style="font-size: 18px;">🔑</span>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item :show-label="false">
          <n-checkbox v-model:checked="rememberMe" :disabled="loading">
            Ghi nhớ đăng nhập
          </n-checkbox>
        </n-form-item>

        <n-button
            type="primary"
            size="large"
            block
            @click="handleLogin"
            :loading="loading"
            class="login-btn"
        >
          <template #icon>
            <span style="font-size: 18px;">🚀</span>
          </template>
          Đăng nhập
        </n-button>
      </n-form>

      <div class="login-footer">
        <n-divider style="margin: 24px 0;" />
        <p class="footer-text">
          <span style="font-size: 16px; margin-right: 8px;">⚠️</span>
          Chỉ dành cho người dùng được ủy quyền
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { NForm, NFormItem, NInput, NButton, NCheckbox, NDivider, useMessage } from 'naive-ui'
import authService from '../api/authService'

const emit = defineEmits(['login-success'])
const message = useMessage()

const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    // Validate form
    await formRef.value?.validate()

    loading.value = true
    const result = await authService.login(formData.username, formData.password)

    if (result.success) {
      message.success('Đăng nhập thành công! 🎉')

      // Emit event để parent component biết đã login thành công
      emit('login-success')
    } else {
      message.error(result.error || 'Đăng nhập thất bại')
    }
  } catch (error) {
    if (error?.errors) {
      // Form validation error
      message.warning('Vui lòng kiểm tra lại thông tin đăng nhập')
    } else {
      message.error('Lỗi: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-btn {
  margin-top: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.login-footer {
  margin-top: 24px;
}

.footer-text {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-icon {
    font-size: 48px;
  }
}
</style>
