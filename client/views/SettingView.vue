<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
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
    <!-- <h1>Settings for {{ currentUsername }}</h1> -->
    <h1>Account Settings</h1>
    <UpdateUserForm />
    <div class="logout-delete-buttons">
      <button class="logout-button" @click="logout">Logout</button>
      <button class="delete-button" @click="delete_">Delete User</button>
    </div>
  </main>
</template>

<style scoped>
h1 {
  color: var(--red);
}

.account-settings {
  display: flex;
  flex-flow: column nowrap;
  margin-left: 40px;
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
    background-color: var(--light-grey);
  }
}
</style>
