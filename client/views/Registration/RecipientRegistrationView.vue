<script setup lang="ts">
import RegisterForm from "@/components/Login/RegisterForm.vue";
import router from "@/router";

async function back() {
  void router.push("/");
}
</script>

<template>
  <main class="column">
    <button @click="back" class="back-button">back</button>
    <h1>Find food today</h1>
    <h2>Need a meal? We've got you covered.</h2>
    <RegisterForm role="Recipient" />
    <div class="register-section">
      <h3>Already have an account? <RouterLink to="/login" class="register-link">Log in</RouterLink></h3>
    </div>
  </main>
</template>

<style scoped>
h1 {
  color: #d23818;
  font-size: 40pt;
  font-weight: lighter;
  margin-bottom: 0px;
}

h2 {
  color: #03240c;
  font-weight: 200;
}

.column {
  background-image: url("@/assets/images/landing-background.png");
  background-size: cover;
  width: 100vw;
  height: 100vh;
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

.register-section {
  text-align: center;
  margin-top: -1.5rem;
  font-size: 1rem;
  color: #194326;
  width: 30vw;
}

.register-link {
  color: #43603b;
  text-decoration: underline;
  font-weight: bold;
}

.register-link:hover {
  color: #2f4d2e;
  text-decoration: none;
}
</style>
