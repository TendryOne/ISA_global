import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || 'https://api.isa-ambato.mg'

  // Configure axios defaults
  axios.defaults.baseURL = apiUrl
  axios.defaults.withCredentials = true
  axios.defaults.timeout = 30000
  axios.defaults.headers.common['Content-Type'] = 'application/json'

  return {
    provide: {
      axios
    }
  }
})
