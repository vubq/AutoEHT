import http from './http.js'

class AuthService {
  constructor() {
    this.baseUrl = 'https://vubq.serveousercontent.com'
    this.tokenKey = 'autoEHT_token'
    this.expiresKey = 'autoEHT_expires'
  }

  setBaseUrl(domain) {
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
  }

  async login(username, password) {
    try {
      // Tạm thời remove token từ header để login
      const currentToken = this.getToken()
      delete http.defaults.headers.common['Authorization']

      const response = await http.post(`${this.baseUrl}/login`, {
        username,
        password
      })

      if (response.data.success) {
        const expiresAt = Date.now() + (response.data.expires_in * 1000)
        localStorage.setItem(this.tokenKey, response.data.token)
        localStorage.setItem(this.expiresKey, expiresAt.toString())

        // Set token vào header
        this.setAuthHeader()

        return {
          success: true,
          message: response.data.message
        }
      }

      return {
        success: false,
        error: response.data.error || 'Đăng nhập thất bại'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.expiresKey)
    delete http.defaults.headers.common['Authorization']
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  isTokenValid() {
    const token = this.getToken()
    const expiresAt = localStorage.getItem(this.expiresKey)

    if (!token || !expiresAt) {
      return false
    }

    if (Date.now() > parseInt(expiresAt)) {
      this.logout()
      return false
    }

    return true
  }

  isAuthenticated() {
    return this.isTokenValid()
  }

  getTokenTimeRemaining() {
    const expiresAt = localStorage.getItem(this.expiresKey)
    if (!expiresAt) return 0

    const remaining = parseInt(expiresAt) - Date.now()
    return remaining > 0 ? Math.floor(remaining / 1000) : 0
  }

  setAuthHeader() {
    const token = this.getToken()
    if (token) {
      http.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }
}

export default new AuthService()
