<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <header v-if="auth.isLogged" class="topbar">
      <div class="logo">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Moodly</span>
      </div>
      <button class="link-btn" @click="logout">Déconnexion</button>
    </header>

    <main class="content">
      <router-view />
    </main>

    <!-- onglets visibles seulement pour les managers -->
    <nav v-if="auth.isManager" class="tabs">
      <router-link to="/">😊 Mon humeur</router-link>
      <router-link to="/team">📊 Mon équipe</router-link>
    </nav>
  </div>
</template>
