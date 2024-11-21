<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import router from "@/router";

const login = () => {
  router.push("/login");
};

const register = (role: string) => {
  router.push(`/register-${role}`);
};
</script>

<template>
  <main class="column">
    <h1>Leftover Love</h1>
    <h2>reducing food waste, fighting hunger</h2>
    <button @click="login">log in</button>
    <button @click="register('recipient')">find food</button>
    <button @click="register('donor')">join the mission</button>
    <button @click="register('volunteer')">volunteer today</button>
    <LoginForm />
    <RegisterForm />
  </main>
</template>
