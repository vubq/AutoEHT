import http from './http.js'

class AutoService {
  constructor() {
    this.baseUrl = 'https://vubq.serveousercontent.com'
  }

  setBaseUrl(domain) {
    this.baseUrl = `https://${domain}`
  }

  async checkStatus() {
    const response = await http.get(`${this.baseUrl}/status`)
    return response.data
  }

  async startAuto(type, scenario = '') {
    const url = `${this.baseUrl}/start/${encodeURIComponent(type)}`
    const params = scenario ? { scenario } : {}
    const response = await http.post(url, null, { params })
    return response.data
  }

  async stopAuto() {
    const response = await http.post(`${this.baseUrl}/stop`)
    return response.data
  }

  async getFiles() {
    const response = await http.get(`${this.baseUrl}/files`)
    return response.data
  }

  async viewFile(filename) {
    const response = await http.get(`${this.baseUrl}/logs/${encodeURIComponent(filename)}`)
    return response.data
  }

  async deleteFile(filename) {
    const response = await http.delete(`${this.baseUrl}/files/${encodeURIComponent(filename)}`)
    return response.data
  }
}

export default new AutoService()