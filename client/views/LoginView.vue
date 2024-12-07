<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import router from "@/router";
import { useToastStore } from "@/stores/toast";

async function back() {
  void router.push("/");
}
const { toast } = useToastStore();
</script>

<template>
  <main class="column">
    <button @click="back" class="back-button">back</button>
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


.back-button {
  position: absolute;
  top: 3vh;
  right: 3vh;
  margin: 1rem;
  background-color: #d23818;
  color: #f7bfa8;
  border: none;
  border-radius: 100px;
  padding: 0.8rem 2rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.column {
  background-image: url("@/assets/images/landing-background.png");
  background-size: cover;
  width: 100vw;
  height: 100vh;
}

h2 {
  font-size: 2em;
  margin: 0;
  font-weight: bold;
  color: var(--darker-green);
}

nav {
  padding: 1em 4em;
  background-color: var(--beige);
  display: flex;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}
</style>
