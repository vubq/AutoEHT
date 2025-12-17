import axios from 'axios'

const http = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
http.interceptors.request.use(
  config => {
    // Log request cho debugging
    if (import.meta.env.DEV) {
      console.log(`[HTTP] ${config.method.toUpperCase()} ${config.url}`)
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
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
      // Server trả về response với status code lỗi
      const data = error.response.data
      errorMessage = data.error || data.message || `Lỗi ${error.response.status}`
      
      // Log chi tiết lỗi
      if (import.meta.env.DEV) {
        console.error(`[HTTP] Error ${error.response.status}:`, errorMessage)
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    } else {
      // Lỗi trong quá trình setup request
      errorMessage = error.message || 'Lỗi khi gửi request'
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default http