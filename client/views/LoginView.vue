<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
</script>

<template>
  <main class="column">
    <h1>Log In</h1>
    <LoginForm />
  </main>
</template>

<style scoped>
h1 {
  color: #d23818;
  font-size: 40pt;
  font-weight: lighter;
  margin-bottom: 5vh;
}

.column {
  background-image: url("@/assets/images/landing-background.png");
  background-size: cover;
  width: 100vw;
  height: 100vh;
}
</style>
