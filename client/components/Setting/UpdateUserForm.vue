<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

let username = ref("");
let currentPassword = ref("");
let newPassword = ref("");
let editUsernameToggled = ref(false);
let editPasswordToggled = ref(false);
let address = ref("");
let editAddressToggled = ref(false);
const { currentUsername, currentAddress } = storeToRefs(useUserStore());

const { updateUserUsername, updateUserPassword, updateUserAddress, updateSession, isDonor } = useUserStore();

async function updateUsername() {
  await updateUserUsername(username.value);
  await updateSession();
  username.value = "";
  editUsernameToggled.value = false;
}

async function updatePassword() {
  await updateUserPassword(currentPassword.value, newPassword.value);
  await updateSession();
  currentPassword.value = newPassword.value = "";
  editPasswordToggled.value = false;
}

async function updateAddress() {
  await updateUserAddress(address.value);
  await updateSession();
  address.value = "";
  editAddressToggled.value = false;
}
</script>

<template>
  <div class="update-details-form">
    <form @submit.prevent="updateUsername" class="pure-form">
      <fieldset>
        <legend>Name</legend>
        <div class="setting-display">
          <div>{{ currentUsername }}</div>
          <img @click="editUsernameToggled = !editUsernameToggled" src="@/assets/images/editPencil.png" />
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
          <img @click="editPasswordToggled = !editPasswordToggled" src="@/assets/images/editPencil.png" />
        </div>
        <div class="edit-components" v-if="editPasswordToggled">
          <input type="password" placeholder="Old password" v-model="currentPassword" required />
          <input type="password" placeholder="New password" v-model="newPassword" required />
          <button type="submit" class="pure-button pure-button-primary">Update password</button>
        </div>
      </fieldset>
    </form>

    <form @submit.prevent="updateAddress" v-if="isDonor" class="pure-form">
      <fieldset>
        <legend>Address</legend>
        <div class="setting-display">
          <div>{{ currentAddress }}</div>
          <img @click="editAddressToggled = !editAddressToggled" src="@/assets/images/editPencil.png" />
        </div>
        <div class="edit-components" v-if="editAddressToggled">
          <input type="text" placeholder="New address" v-model="address" required />
          <button type="submit" class="pure-button pure-button-primary">Update address</button>
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
