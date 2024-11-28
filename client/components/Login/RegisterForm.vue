<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { defineProps, onMounted, ref } from "vue";

const username = ref("");
const password = ref("");
const address = ref("");
const { createUser, loginUser, updateSession } = useUserStore();
const mapApiKey = process.env.MAP_API_KEY;

const props = defineProps<{
  role: "Recipient" | "Volunteer" | "Donor";
}>();

async function register() {
  await createUser(username.value, password.value, props.role, address.value);
  await loginUser(username.value, password.value);
  await updateSession();
  void router.push({ name: "Home" });
}

let googleMapsApiPromise : any = null;

function loadGoogleMapsApi(apiKey: string) {
  if (!googleMapsApiPromise) {
    googleMapsApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log("Google Maps API loaded successfully");
        resolve(null);
      };
      script.onerror = (error) => {
        console.error("Error loading Google Maps API:", error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }
  return googleMapsApiPromise;
}

async function initAutocomplete() {
  if (mapApiKey === undefined) {
    console.error("Map API key is undefined");
    return;
  }
  try {
    await loadGoogleMapsApi(mapApiKey);
    const addressInput = document.getElementById('aligned-address') as HTMLInputElement;
    if (addressInput) {
    const autocomplete = new google.maps.places.Autocomplete(addressInput);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.formatted_address) {
        address.value = place.formatted_address;
      }
    });
    } else {
      console.error("Address input element not found");
    }
  } catch (error) {
    console.error("Error initializing autocomplete:", error);
  }
}

onMounted(() => {
  if (props.role === 'Donor') {
    initAutocomplete();
  }
});

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
