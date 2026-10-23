import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import LoginView from './views/LoginView.vue'
import MoodView from './views/MoodView.vue'
import TeamView from './views/TeamView.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', component: MoodView, meta: { auth: true } },
  { path: '/team', component: TeamView, meta: { auth: true, manager: true } },
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
  if (to.meta.manager && !auth.isManager) return '/'
  if (to.path === '/login' && auth.isLogged) return '/'
})

export default router
