<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

let username = ref("");
let currentPassword = ref("");
let newPassword = ref("");
let editUsernameToggled = ref(false);
let editPasswordToggled = ref(false);
const { currentUsername } = storeToRefs(useUserStore());

const { updateUserUsername, updateUserPassword, updateSession } = useUserStore();

async function updateUsername() {
  await updateUserUsername(username.value);
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUserPassword(currentPassword.value, newPassword.value);
  await updateSession();
  currentPassword.value = newPassword.value = "";
}
</script>

<template>
  <div class="update-details-form">
  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Name</legend>
      <div class="setting-display">
        <div>{{currentUsername}}</div>
        <img @click="editUsernameToggled = !editUsernameToggled" src="@/assets/images/editPencil.png">
      </div>
      <div class="edit-components" v-if="editUsernameToggled">
      <input type="text" placeholder="New username" v-model="username" required />
      <button type="submit" class="pure-button pure-button-primary">Update username</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Password</legend>
      <div class="setting-display">
        <div>*********</div>
        <img @click="editPasswordToggled = !editPasswordToggled" src="@/assets/images/editPencil.png">
      </div>
      <div class="edit-components" v-if="editPasswordToggled">
      <input type="password" placeholder="Old password" v-model="currentPassword" required />
      <input type="password" placeholder="New password" v-model="newPassword" required />
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
      </div>
    </fieldset>
  </form>
  </div>
</template>

<style scoped>
legend {
  font-weight: 800;
}

img {
  width: 18px;
  height: 18px;
}

img:hover {
  cursor: pointer;
}

.setting-display {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 360px;
  font-size: 18px;
}

.update-details-form {
  width: 360px;
}

.edit-components {
  input {
    margin: 4px;
  }

  button {
    margin: 4px;
    background-color: var(--pink);
  }
}
</style>