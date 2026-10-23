import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import api, { setToken, setApiUrl } from '../api'

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
    // (Preferences = stockage natif sur android, localStorage sur le web)
    async init() {
      const { value: url } = await Preferences.get({ key: 'apiUrl' })
      if (url) setApiUrl(url)

      const { value: saved } = await Preferences.get({ key: 'token' })
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
      await Preferences.set({ key: 'token', value: res.jwt })
    },

    async changeServer(url) {
      setApiUrl(url)
      await Preferences.set({ key: 'apiUrl', value: url })
    },

    logout() {
      this.token = null
      this.user = null
      setToken(null)
      Preferences.remove({ key: 'token' })
    },
  },
})
