import axios from 'axios'

const http = axios.create({
  timeout: 30000,  // Tăng lên 30s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor - Tự động thêm token vào header
http.interceptors.request.use(
  config => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('autoEHT_token')

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Log request cho debugging
    if (import.meta.env.DEV) {
      console.log(`[HTTP] ${config.method.toUpperCase()} ${config.url}`)
      if (token) {
        console.log('[HTTP] Token:', token.substring(0, 20) + '...')
      }
    }

    return config
  },
  error => Promise.reject(error)
)

// Response interceptor - Xử lý lỗi và token hết hạn
http.interceptors.response.use(
  response => {
    // Log response cho debugging
    if (import.meta.env.DEV) {
      console.log(`[HTTP] Response:`, response.data)
    }
    return response
  },
  error => {
    let errorMessage = 'Lỗi không xác định'

    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      // Xử lý lỗi 401 - Unauthorized (token hết hạn hoặc không hợp lệ)
      if (status === 401) {
        // Xóa token cũ
        localStorage.removeItem('autoEHT_token')
        localStorage.removeItem('autoEHT_expires')

        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'

        // Dispatch event để component biết cần đăng nhập lại
        window.dispatchEvent(new CustomEvent('auth:required'))
      } else {
        errorMessage = data.error || data.message || `Lỗi ${status}`
      }

      // Log chi tiết lỗi
      if (import.meta.env.DEV) {
        console.error(`[HTTP] Error ${status}:`, errorMessage)
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    } else {
      errorMessage = error.message || 'Lỗi khi gửi request'
    }

    return Promise.reject(new Error(errorMessage))
  }
)

export default http
