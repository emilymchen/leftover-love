<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const users = ref<Array<Record<string, string>>>([]);
const { isLoggedIn, currentUsername, currentRole } = storeToRefs(useUserStore());
const loaded = ref(false);
const emit = defineEmits(["toUser", "refreshMessages", "emptyUsers"]);
const selectedUser = ref<string | null>(null);

// Gets users only with a message history with the current user
async function getUsers() {
  let userResults = [];
  try {
    userResults = await fetchy("/api/messages/users", "GET");
  } catch {
    return;
  }
  console.log(userResults);
  users.value = userResults;
  if (users.value.length == 0) {
    emit("emptyUsers");
  }
}
onBeforeMount(async () => {
  await getUsers();
  loaded.value = true;
});
function selectUser(username: string) {
  selectedUser.value = username;
  emit("toUser", username);
  emit("refreshMessages");
}
</script>

<template>
  <div class="sidebar" v-if="isLoggedIn && loaded">
    <h2>Select User</h2>
    <div class="user-container">
      <div class="user-block" v-for="user in users" :key="user.id" @click="selectUser(user.username)" :class="{ selected: user.username === selectedUser }">
        <div class="text"> {{ user.username }} </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  padding: 20px;
}

.sidebar h2 {
  margin: 0 0 20px;
  font-size: 1.5em;
  color: #333;
}

.user-container {
  display: flex;
  flex-direction: column;
}

.user-block {
  display: flex;
  position: relative;
  padding: 15px;
  width: 100%;
  cursor: pointer;
  background: var(--pastel-white);
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.user-block::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0%;
  width: 90%;
  height: 1px;
  background-color: var(--dark-green);
}

.user-block:hover {
  transform: scale(1.02);
}

.user-block {
  display: flex;
  position: relative;
  padding: 15px;
  width: 100%;
  cursor: pointer;
  background: var(--pastel-white);
  transition: background-color 0.3s, transform 0.2s;
}

.user-block::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0%;
  width: 90%;
  height: 1px; 
  background-color: var(--dark-green);
  transition: background-color 0.3s;
}

.user-block:hover {
  transform: scale(1.02);
}

.selected {
  font-weight: bold;
  color: #000;
  background: none;
}

.user-block.selected {
  background: none;
  position: relative;
}

.user-block.selected::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0%;
  width: 90%;
  height: 100%;
  background-color: var(--selected-brown);
}

.text {
  z-index: 1;
}
</style>
