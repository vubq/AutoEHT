import http from './http.js'
import authService from './authService.js'

class ScreenService {
  constructor() {
    this.baseUrl = 'vubq.serveousercontent.com'
    this.clientId = this.generateClientId()
    this.isStreaming = false
    this.pollInterval = null
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9)
  }

  setBaseUrl(domain) {
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
    authService.setBaseUrl(domain)
  }

  async startStream() {
    try {
      const response = await http.post(`${this.baseUrl}/screen/start?clientId=${this.clientId}`)

      if (response.data.success) {
        this.isStreaming = true
        return {
          success: true,
          data: response.data
        }
      }

      return {
        success: false,
        error: response.data.error || 'Failed to start stream'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async stopStream() {
    try {
      const response = await http.post(`${this.baseUrl}/screen/stop?clientId=${this.clientId}`)

      this.isStreaming = false
      this.stopPolling()

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getLatestScreen() {
    try {
      const response = await http.get(`${this.baseUrl}/screen/latest`)

      if (response.data.success) {
        return {
          success: true,
          data: response.data
        }
      }

      return {
        success: false,
        error: response.data.error || 'Failed to get screen'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  startPolling(callback, fps = 2) {
    this.stopPolling()

    const interval = 1000 / fps

    this.pollInterval = setInterval(async () => {
      if (!this.isStreaming) {
        this.stopPolling()
        return
      }

      const result = await this.getLatestScreen()
      if (result.success && callback) {
        callback(result.data)
      }
    }, interval)
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  getStreamingStatus() {
    return this.isStreaming
  }
}

export default new ScreenService()
