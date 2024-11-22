<script setup lang="ts">
import router from "@/router";

async function login() {
  void router.push("/login");
}

async function register(role: string) {
  void router.push(`/register-${role}`);
}
</script>

<template>
  <main class="column">
    <h1>Leftover Love</h1>
    <h2>reducing food waste, fighting hunger</h2>
    <button @click="login">log in</button>
    <button @click="register('recipient')">find food</button>
    <button @click="register('donor')">join the mission</button>
    <button @click="register('volunteer')">volunteer today</button>
  </main>
</template>
