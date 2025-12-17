import http from './http.js'

class AutoService {
  constructor() {
    this.baseUrl = 'https://vubq.serveousercontent.com'
  }

  setBaseUrl(domain) {
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
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
}

export default new AutoService()