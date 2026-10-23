<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push(auth.isManager ? '/team' : '/')
  } catch (e) {
    if (e.status === 400) error.value = 'Email ou mot de passe incorrect'
    else if (e.status === 429) error.value = 'Trop de tentatives, réessayez dans une minute'
    else error.value = e.message
  } finally {
    loading.value = false
  }
}

// pour la demo
function fillDemo(type) {
  email.value = type === 'manager' ? 'manager@moodly.demo' : 'employe@moodly.demo'
  password.value = 'Moodly2026!'
}
</script>

<template>
  <div class="login">
    <img src="/favicon.svg" alt="" width="72" height="72" />
    <h1>Moodly</h1>
    <p class="muted">Comment ça va au travail aujourd'hui ?</p>

    <form class="card" @submit.prevent="submit">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" autocomplete="username" required />

      <label for="password">Mot de passe</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <div class="demo">
      <p class="muted small">Comptes de démo :</p>
      <button class="link-btn" @click="fillDemo('employee')">Employé</button>
      <button class="link-btn" @click="fillDemo('manager')">Manager</button>
    </div>
  </div>
</template>

<style scoped>
.login {
  text-align: center;
  padding-top: 40px;
}
.login h1 {
  margin: 12px 0 4px;
  color: var(--primary);
}
form {
  text-align: left;
  margin-top: 28px;
}
.demo {
  margin-top: 20px;
}
.demo .link-btn {
  margin: 0 8px;
}
</style>
