<script setup lang="ts">
import RecipientSidebarForm from "@/components/Sidebar/RecipientSidebarForm.vue";
import RestaurantSidebarForm from "@/components/Sidebar/RestaurantSidebarForm.vue";
import VolunteerSidebarForm from "./components/Sidebar/VolunteerSidebarForm.vue";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, isDonor, isRecipient, isVolunteer } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>
<template>
  <header v-if="isLoggedIn">
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.png" alt="Logo" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>Leftover Love</h1>
        </RouterLink>

        <ul v-if="isLoggedIn && isRecipient">
          <RecipientSidebarForm />
        </ul>

        <ul v-if="isLoggedIn && isDonor">
          <RestaurantSidebarForm />
        </ul>

        <ul v-if="isLoggedIn && isVolunteer">
          <VolunteerSidebarForm />
        </ul>
      </div>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
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
  transition:
    left 0.3s ease-in-out,
    background-color 0.3s ease-in-out,
    overlay 0.3s ease-in-out;
  z-index: 20;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.sidebar.open {
  background-color: var(--green);
  transition: left 0.3s ease-in-out;
  left: 0;
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
}

.sidebar-item:hover {
  color: black;
}

.sidebar-item {
  color: var(--darker-green);
}

.sidebar-username {
  font-size: 40px;
  color: var(--darker-green);
  margin-bottom: 0.5em;
  width: 100%;
  padding-left: 1em;
  padding-top: 0.05em;
}

.sidebar-button {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-block;
  position: fixed;
  top: 1.5em;
  left: 1em;
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
  font-size: 15px;
  cursor: pointer;
}

.logout-button:hover {
  color: black;
}
</style>
