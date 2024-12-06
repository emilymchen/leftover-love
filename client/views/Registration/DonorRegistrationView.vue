<script setup lang="ts">
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="column">
    <div class="header">
      <RouterLink to="/" class="pull-left">
        <img src="@/assets/images/arrow_back.png" />
      </RouterLink>
      <h1>Sign up your business</h1>
    </div>
    <h2>Let's find your store to turn your leftovers into impact in just a few minutes:</h2>
    <RegisterForm role="Donor" />
    <div class="register-section">
      <h3>Already have an account? <RouterLink to="/login" class="register-link">Log in</RouterLink></h3>
    </div>
  </main>
</template>

<style scoped>
h1 {
  margin-top: 5vh;
  color: #d23818;
  font-size: 40pt;
  font-weight: lighter;
  margin-bottom: 0vh;
  margin: 0 auto;
  margin-top: 5vh;
}

h2 {
  color: #03240c;
  font-weight: 200;
}

.header {
  display: flex;
  align-items: center;
  position: relative;
  width: 57vw;
  margin: auto;
}

.pull-left {
  position: absolute;
  left: 0;
}

img {
  margin-top: 5vh;
  width: 50px;
  height: 50px;
}

.column {
  background-image: url("@/assets/images/landing-background.png");
  background-size: cover;
  width: 100vw;
  height: 100vh;
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
