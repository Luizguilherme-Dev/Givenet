import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './pages/css/style.css'

axios.defaults.withCredentials = false

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = false
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const refreshToken = localStorage.getItem('refresh_token')
    if (error.response?.status !== 401 || original?._retry || !refreshToken || original?.url?.includes('/usuarios/refresh')) {
      if (error.response?.status === 401 && !original?.url?.includes('/usuarios/login') && localStorage.getItem('access_token')) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('usuarioLogado')
        if (window.location.pathname !== '/login') window.location.assign('/login')
      }
      return Promise.reject(error)
    }
    original._retry = true
    if (refreshing) return Promise.reject(error)
    refreshing = true
    try {
      const response = await axios.post('http://localhost:8080/usuarios/refresh', { refresh_token: refreshToken })
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      original.headers.Authorization = `Bearer ${response.data.access_token}`
      return axios(original)
    } catch (refreshError) {
      if (window.location.pathname !== '/login') window.location.assign('/login')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('usuarioLogado')
      return Promise.reject(refreshError)
    } finally {
      refreshing = false
    }
  },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
