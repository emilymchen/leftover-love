<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, computed } from "vue";
import { on } from "connect-mongo";

let username = ref("");
let currentPassword = ref("");
let newPassword = ref("");
let editUsernameToggled = ref(false);
let editPasswordToggled = ref(false);
let address = ref("");
let editAddressToggled = ref(false);
const { currentUsername, currentAddress } = storeToRefs(useUserStore());
const mapApiKey = process.env.MAP_API_KEY;

const { updateUserUsername, updateUserPassword, updateUserAddress, updateSession, isDonor, currentPasswordLength } = useUserStore();

let googleMapsApiPromise: any = null;

function loadGoogleMapsApi(apiKey: string) {
  if (!googleMapsApiPromise) {
    googleMapsApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
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
    const addressInput = document.getElementById("address") as HTMLInputElement;
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

watch(editAddressToggled, (newValue) => {
  if (newValue === true) {
    initAutocomplete();
  }
});

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

const passwordStars = computed(() => "*".repeat(currentPasswordLength));
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
          <div>{{ passwordStars }}</div>
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
          <input type="text" v-model.trim="address" id="address" placeholder="New address" required />
        </div>
        <iframe
          v-if="debouncedAddress"
          width="350"
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
          width="350"
          height="300"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          :src="`//www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${currentAddress}`"
        ></iframe>
        <div class="edit-components" v-if="editAddressToggled">
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
