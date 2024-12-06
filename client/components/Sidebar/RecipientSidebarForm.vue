<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const userStore = useUserStore();
const { logoutUser } = useUserStore();

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <button class="sidebar-button" @click="toggleSidebar">
    <img class="sidebar-icon" src="@/assets/images/lines.png" />
  </button>
  <div v-if="isSidebarOpen" class="overlay" @click="toggleSidebar"></div>
  <aside class="sidebar" :class="{ open: isSidebarOpen }">
    <ul>
      <li class="sidebar-recipient">
        recipient:
      </li>
      <li class="sidebar-username">{{ userStore.currentUsername }} </li>
      <li class="sidebar-items">
        <RouterLink :to="{ name: 'Recipient-Feed' }" @click="toggleSidebar" class="sidebar-item"> available donations </RouterLink>
      </li>
      <li class="sidebar-items">
        <RouterLink :to="{ name: 'Claims' }" @click="toggleSidebar" class="sidebar-item"> my claims </RouterLink>
      </li>
      <li class="sidebar-items">
        <RouterLink :to="{name: 'Messages'}" @click="toggleSidebar" class="sidebar-item"> messages </RouterLink>
      </li>
      <li class="sidebar-items">
        <RouterLink :to="{ name: 'Settings' }" @click="toggleSidebar" class="sidebar-item"> account settings </RouterLink>
      </li>
    </ul>
    <button class="logout-button" @click="logout">Sign Out</button>
  </aside>
</template>

<style scoped>
nav {
  padding: 1em 4em;
  background-color: var(--beige);
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
  color: var(--darker-green);
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

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100%;
  padding: 1em;
  overflow-y: auto;
  overflow-x: hidden;
  transition:
    transform 0.3s ease-in-out,
    background-color 0.3s ease-in-out;
  z-index: 20;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transform: translateX(-100%);
}

.sidebar.open {
  background-color: var(--green);
  transform: translateX(90%);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(86, 86, 86, 0.5);
  transition: left 0.3s ease-in-out;
  z-index: 10;
}

.sidebar ul {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.sidebar-items {
  text-align: left;
  padding: 1em, 1em;
  width: 100%;
  text-decoration: underline;

}

.sidebar-item:hover {
  color: black;
}

.sidebar-item {
  color: var(--darker-green);
}

.sidebar-username {
  text-align: left;
  color: var(--darker-green);
  font-size: 30px;
  width: 100%;
  word-wrap: break-word;
}
.sidebar-button {
  background: none;
  border: none;
  cursor: pointer;
  position: absolute; /* Use absolute positioning */
  top: 1.2em;
  left: 1em; /* Align it to the left of the page */
  z-index: 1000;
}

.sidebar-icon {
  width: 20px;
  height: 25px;
  display: block;
}

.logout-button {
  position: absolute;
  bottom: 2em;
  left: 1em;
  background: none;
  border: none;
  color: var(--darker-green);
  text-decoration: underline;
  font-size: 20px;
  cursor: pointer;
}

.logout-button:hover {
  color: black;
}
.sidebar-recipient {
  text-align: left;
  font-size: 30px;
  margin-top: 5px;
  margin-left: 10px;
  width: 100%;
}
</style>
