import http from './http.js'
import authService from './authService.js'

class AutoService {
  constructor() {
    this.baseUrl = 'vubq.serveousercontent.com'
  }

  setBaseUrl(domain) {
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
    authService.setBaseUrl(domain)
  }

  async checkStatus() {
    try {
      const response = await http.get(`${this.baseUrl}/status`)
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

  async startAuto(type, scenario = '', searchB = false) {
    try {
      const params = new URLSearchParams()
      if (scenario) params.append('scenario', scenario)
      params.append('searchB', searchB.toString())

      const url = `${this.baseUrl}/start/${encodeURIComponent(type)}${params.toString() ? '?' + params.toString() : ''}`
      const response = await http.post(url)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async stopAuto() {
    try {
      const response = await http.post(`${this.baseUrl}/stop`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getFiles() {
    try {
      const response = await http.get(`${this.baseUrl}/files`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message,
        files: []
      }
    }
  }

  async viewFile(filename) {
    try {
      const response = await http.get(`${this.baseUrl}/logs/${encodeURIComponent(filename)}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deleteFile(filename) {
    try {
      const response = await http.delete(`${this.baseUrl}/files/${encodeURIComponent(filename)}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updateFile(filename, content) {
    try {
      const response = await http.post(
        `${this.baseUrl}/files/${encodeURIComponent(filename)}`,
        { content }
      )
      return {
        success: true,
        message: response.data.message || 'Cập nhật thành công',
        data: response.data
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Lỗi cập nhật file'
      return { success: false, error: errMsg }
    }
  }

  async createFile(filename, content = '') {
    try {
      const response = await http.post(
        `${this.baseUrl}/files/create`,
        { filename, content }
      )
      return {
        success: true,
        message: response.data.message || 'Tạo file thành công',
        data: response.data
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Lỗi tạo file'
      return { success: false, error: errMsg }
    }
  }
}

export default new AutoService()
