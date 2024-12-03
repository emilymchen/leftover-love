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
        {{ user.username }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
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
  border: 1px solid var(--dark-green);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  background: var(--pastel-white);
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.user-block:hover {
  background: var(--light-pastel-grey);
  transform: scale(1.02);
  border: 2px solid var(--green);
  border-radius: 20px;
}

.selected {
  font-weight: bold;
  color: #000;
  background: var(--green);
  border: 2px solid var(--green);
  border-radius: 20px;
}
</style>
