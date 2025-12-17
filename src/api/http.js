import axios from 'axios'

const http = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor response để xử lý lỗi chung (tùy chọn)
http.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server trả lỗi
      return Promise.reject(new Error(error.response.data.message || error.response.data.error || 'Lỗi server'))
    } else if (error.request) {
      // Không kết nối được
      return Promise.reject(new Error('Không thể kết nối đến server'))
    }
    return Promise.reject(error)
  }
)

export default http