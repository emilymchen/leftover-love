<script setup lang="ts">
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="column">
    <h1>Make a difference today</h1>
    <RegisterForm role="Volunteer" />
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
