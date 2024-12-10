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
    <button @click="login" class="login-button">log in</button>
    <h1>Leftover Love</h1>
    <h2>reducing food waste, fighting hunger</h2>
    <button @click="register('recipient')" class="recipient-button">find food</button>
    <button @click="register('donor')" class="donor-button">donate today</button>
    <button @click="register('volunteer')" class="volunteer-button">volunteer for the cause</button>
  </main>
</template>

<style scoped>
h1 {
  color: #194326;
  font-size: 60pt;
  font-weight: lighter;
  margin-bottom: 0px;
}

h2 {
  color: #03240c;
  font-style: italic;
  font-weight: 200;
  margin-bottom: 20px;
}

.column {
  background-image: url("@/assets/images/landing-background.png");
  background-size: cover;
  width: 100vw;
  height: 100vh;
}

.login-button {
  position: absolute;
  top: 3vh;
  right: 3vh;
  margin: 1rem;
  background-color: #d23818;
  color: var(--salmon);
  border: none;
  border-radius: 100px;
  padding: 0.8rem 2rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.login-button:hover {
  background-color: #bf2000;
}

.recipient-button {
  border-radius: 100px;
  padding: 0.8rem 2rem;
  background-color: #43603b;
  color: #cac99b;
  border-color: #43603b;
  font-size: 1.5rem;
}

.recipient-button:hover {
  background-color: #2b4524;
}

.donor-button {
  border-radius: 100px;
  padding: 0.8rem 2rem;
  background-color: #ac5c54;
  color: #f2cab9;
  border-color: #ac5c54;
  font-size: 1.5rem;
}

.donor-button:hover {
  background-color: #a13b32;
}

.volunteer-button {
  border-radius: 100px;
  padding: 0.8rem 2rem;
  background-color: #6f5436;
  color: #d5c8a9;
  border-color: #6f5436;
  font-size: 1.5rem;
}

.volunteer-button:hover {
  background-color: #43311d;
}
</style>
