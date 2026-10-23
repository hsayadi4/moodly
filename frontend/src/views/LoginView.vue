<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getApiUrl } from '../api'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showServer = ref(false)
const serverUrl = ref(getApiUrl())

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push(auth.isManager ? '/team' : '/')
  } catch (e) {
    if (e.status === 400) error.value = 'Email ou mot de passe incorrect.'
    else if (e.status === 429) error.value = 'Trop de tentatives, réessayez dans une minute.'
    else error.value = e.message
  } finally {
    loading.value = false
  }
}

// adresse du serveur strapi (utile sur telephone : ip du pc sur le wifi)
async function saveServer() {
  await auth.changeServer(serverUrl.value)
  showServer.value = false
}

// pour la demo
function fillDemo(type) {
  email.value = type === 'manager' ? 'manager@moodly.demo' : 'employe@moodly.demo'
  password.value = 'Moodly2026!'
}
</script>

<template>
  <div class="login">
    <div class="brand">
      <img src="/favicon.svg" alt="" width="52" height="52" />
      <h1>Moodly</h1>
      <p class="muted">Baromètre du bien-être au travail</p>
    </div>

    <form class="card" @submit.prevent="submit">
      <label for="email">Adresse email</label>
      <input id="email" v-model="email" type="email" autocomplete="username" required />

      <label for="password">Mot de passe</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <p class="demo muted small">
      Comptes de démonstration :
      <button class="link-btn" @click="fillDemo('employee')">Employé</button>
      ·
      <button class="link-btn" @click="fillDemo('manager')">Manager</button>
    </p>

    <div class="server">
      <button class="link-btn muted small" @click="showServer = !showServer">Paramètres du serveur</button>
      <div v-if="showServer" class="card">
        <label for="server">Adresse de l'API</label>
        <input id="server" v-model="serverUrl" type="url" placeholder="http://192.168.1.20:1337" />
        <button class="btn" @click="saveServer">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  padding-top: 48px;
}
.brand {
  text-align: center;
  margin-bottom: 28px;
}
.brand h1 {
  margin: 14px 0 4px;
  color: var(--primary);
}
.brand p {
  margin: 0;
  font-size: 14px;
}
form label:first-child {
  margin-top: 0;
}
.demo {
  text-align: center;
}
.server {
  margin-top: 28px;
  text-align: center;
}
.server .card {
  text-align: left;
  margin-top: 12px;
}
</style>
