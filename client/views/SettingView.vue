<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="account-settings">
    <div class="settings">
    <h1>Account Settings</h1>
    <UpdateUserForm />
    <div class="logout-delete-buttons">
      <button class="delete-button" @click="delete_">Delete User</button>
      <button class="logout-button" @click="logout">Sign Out</button>
    </div>
  </div>
  </main>
</template>

<style scoped>
h1 {
  color: var(--red);
  text-align: center;
}

.account-settings {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.settings {
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--light-bg);
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  max-height: 90vh; 
  overflow-y: auto;
  padding: 20px;
  margin: 20px auto;
}

.logout-delete-buttons {
  display: flex;
  flex-flow: row nowrap;

  button {
    margin: 4px;
    border-style: none;
  }

  .logout-button {
    background-color: var(--pink);
  }

  .delete-button {
    background-color: var(--orange);
  }
}
</style>
