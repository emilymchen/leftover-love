<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
</script>

<template>
  <main class="column">
    <div class="header">
      <RouterLink to="/" class="pull-left">
        <img src="@/assets/images/arrow_back.png" />
      </RouterLink>
      <h1>Log In</h1>
    </div>
    <LoginForm />
  </main>
</template>

<style scoped>
h1 {
  color: #d23818;
  font-size: 40pt;
  font-weight: lighter;
  margin-bottom: 5vh;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  position: relative;
  width: 25vw;
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

h2 {
  font-size: 2em;
  margin: 0;
  font-weight: bold;
  color: var(--darker-green);
}
</style>
