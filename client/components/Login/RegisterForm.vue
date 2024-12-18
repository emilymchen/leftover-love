<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { loadGoogleMapsApi } from "@/utils/googleMapsLoader";
import { defineProps, onMounted, ref, watch } from "vue";

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
  await router.push({ name: "Home" });
}

async function initAutocomplete() {
  if (mapApiKey === undefined) {
    console.error("Map API key is undefined");
    return;
  }
  try {
    await loadGoogleMapsApi(mapApiKey);
    const addressInput = document.getElementById("aligned-address") as HTMLInputElement;
    if (addressInput) {
      const autocomplete = new google.maps.places.Autocomplete(addressInput);
      autocomplete.addListener("place_changed", () => {
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
  if (props.role === "Donor") {
    initAutocomplete();
  }
});

const debouncedAddress = ref("");

function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const updateDebouncedAddress = debounce((newValue: string) => {
  debouncedAddress.value = newValue;
}, 2000); // 2000ms delay

watch(address, (newValue) => {
  updateDebouncedAddress(newValue);
});
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
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
      <div v-if="props.role === 'Donor'" class="map-display">
        <iframe
          v-if="debouncedAddress"
          width="500"
          height="300"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          :src="`//www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${debouncedAddress}`"
        >
        </iframe>
        <iframe
          v-else
          width="500"
          height="300"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          :src="`//www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=Boston,MA`"
        >
        </iframe>
      </div>
      <div class="pure-controls">
        <button type="submit" class="pure-button submit-button">Register</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}

.pure-control-group {
  font-size: 20px;
  margin-left: -100px;
}

.map-display {
  margin-left: -50px;
  margin-top: 30px;
}

.submit-button {
  background-color: #d23818;
  color: #f7bfa8;
  border: none;
  border-radius: 100px;
  padding: 0.8rem 2rem;
  font-size: 1.3rem;
  margin-left: -40px;
}

.submit-button:hover {
  background-color: #bf2000;
}
</style>
