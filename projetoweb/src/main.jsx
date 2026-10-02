import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './pages/css/style.css'

axios.defaults.withCredentials = true
axios.interceptors.request.use((config) => {
  const requestUrl = new URL(config.url || "", config.baseURL || window.location.origin)
  const method = (config.method || "get").toUpperCase()
  const path = requestUrl.pathname
  const isPublicRequest =
    (method === "POST" && (path === "/usuarios" || path === "/usuarios/login")) ||
    (method === "GET" && (path === "/ongs" || /^\/ongs\/\d+$/.test(path))) ||
    ((method === "GET" || method === "POST") && /^\/chat(?:\/\d+)?$/.test(path))

  if (requestUrl.origin === "http://localhost:8080" && !isPublicRequest) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null")
    if (usuario?.token) {
      config.headers.Authorization = `Bearer ${usuario.token}`
    }
  }

  return config
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
