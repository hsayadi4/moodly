import { defineStore } from 'pinia'
import api, { setToken } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isLogged: (state) => !!state.user,
    isManager: (state) => state.user && state.user.role === 'manager',
  },

  actions: {
    // au lancement de l'app : on recupere le token sauvegarde
    async init() {
      const saved = localStorage.getItem('token')
      if (!saved) return
      setToken(saved)
      this.token = saved
      try {
        const res = await api.me()
        this.user = res.data
      } catch (e) {
        this.logout()
      }
    },

    async login(email, password) {
      const res = await api.login(email, password)
      setToken(res.jwt)
      try {
        const me = await api.me()
        this.user = me.data
      } catch (e) {
        setToken(null)
        throw new Error("Ce compte n'a pas accès à l'application")
      }
      this.token = res.jwt
      localStorage.setItem('token', res.jwt)
    },

    logout() {
      this.token = null
      this.user = null
      setToken(null)
      localStorage.removeItem('token')
    },
  },
})
