import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import LoginView from './views/LoginView.vue'
import MoodView from './views/MoodView.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', component: MoodView, meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // hash history : marche aussi dans l'app capacitor
  history: createWebHashHistory(),
  routes,
})

// gestion des droits cote front
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isLogged) return '/login'
  if (to.path === '/login' && auth.isLogged) return '/'
})

export default router
