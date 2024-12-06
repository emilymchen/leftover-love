<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
</script>

<template>
  <!-- <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.png" alt="Logo" />
        <RouterLink :to="{ name: 'Home' }">
          <h2>Leftover Love</h2>
        </RouterLink>
      </div>
    </nav>
  </header> -->
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
