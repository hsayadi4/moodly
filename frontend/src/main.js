import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
app.use(createPinia())

// on verifie si l'utilisateur etait deja connecte avant d'afficher l'app
const auth = useAuthStore()
auth.init().then(() => {
  app.use(router)
  app.mount('#app')
})
