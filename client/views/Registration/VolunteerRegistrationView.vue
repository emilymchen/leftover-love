<script setup lang="ts">
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="column">
    <div class="header">
      <RouterLink to="/" class="pull-left">
        <img src="@/assets/images/arrow_back.png" />
      </RouterLink>
      <h1>Make a difference today</h1>
    </div>

    <h2>Volunteer to change the world, one meal at a time.</h2>
    <RegisterForm role="Volunteer" />
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
  margin: 0 auto;
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
  margin: 0 auto;
}

.pull-left {
  position: absolute;
  left: 0;
}

img {
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
