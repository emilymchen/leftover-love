<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { defineProps, ref } from "vue";

const username = ref("");
const password = ref("");
const address = ref(""); // TODO: not sure how to validate it's a real address? placeholder for now
const { registerRecipient, registerDonor, registerVolunteer, loginUser, updateSession } = useUserStore();

const props = defineProps({ role: "Recipient" | "Volunteer" | "Donor" });

async function register() {
  switch (props.role) {
    case "Recipient":
      await registerRecipient(username.value, password.value);
      break;
    case "Volunteer":
      await registerVolunteer(username.value, password.value);
      break;
    case "Donor":
      await registerDonor(username.value, password.value, address.value);
      break;
    default:
      throw new Error("Invalid role");
  }
  // await createUser(username.value, password.value, props.role, address.value);
  await loginUser(username.value, password.value);
  await updateSession();
  void router.push({ name: "Home" });
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
    <h3>Register User</h3>
    <h3>{{ props.role }}</h3>
    <fieldset>
      <div class="pure-control-group">
        <label for="aligned-name">Username</label>
        <input v-model.trim="username" type="text" id="aligned-name" placeholder="Username" required />
      </div>
      <div class="pure-control-group">
        <label for="aligned-password">Password</label>
        <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
      </div>
      <div v-if="props.role === 'Donor'" class="pure-control-group">
        <label for="aligned-address">Address</label>
        <input type="text" v-model.trim="address" id="aligned-address" placeholder="Address" required />
      </div>
      <div class="pure-controls">
        <button type="submit" class="pure-button pure-button-primary">Register</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
</style>
