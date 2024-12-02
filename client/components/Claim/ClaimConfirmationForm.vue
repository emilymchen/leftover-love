<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, defineProps, nextTick, ref, watch } from "vue";

const props = defineProps(["post"]);
const emit = defineEmits(["refreshPosts", "closeClaimPost"]);
const address = ref("");
const addressInput = ref<HTMLInputElement | null>(null);
const instructions = ref("");
const deliveryOption = ref("pickup");
const mapApiKey = process.env.MAP_API_KEY;

async function claimPostDelivery(post: Record<string, any>, address: string, instructions: string) {
  try {
    await fetchy(`/api/claims/delivery`, "POST", { body: { post: post._id, address, instructions } });
  } catch {
    return;
  }
  emit("refreshPosts");
  emit("closeClaimPost");
}

async function claimPostPickup(post: Record<string, any>) {
  try {
    await fetchy(`/api/claims/pickup`, "POST", { body: { post: post._id } });
  } catch {
    return;
  }
  emit("refreshPosts");
  emit("closeClaimPost");
}

async function claimPost(post: Record<string, any>) {
  if (deliveryOption.value === "pickup") {
    await claimPostPickup(post);
  } else {
    await claimPostDelivery(post, address.value, instructions.value);
  }
}

watch(deliveryOption, (newValue) => {
  if (newValue === 'delivery') {
    // Only initialize the autocomplete when the delivery option is selected
    nextTick(() => {
      initAutocomplete();
      debouncedAddress.value = "";
    });
  }
});

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
    const addressInput = document.getElementById('address') as HTMLInputElement;
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
  <form @submit.prevent="claimPost(props.post)">
    <div class="filter-buttons form-group">
      <div class="toggle-wrapper">
        <div class="custom-input">
          <input type="radio" id="pickup" name="style" v-model="deliveryOption" value="pickup" />
          <label for="pickup">Pickup</label>
        </div>
        <div class="custom-input">
          <input type="radio" id="delivery" name="style" v-model="deliveryOption" value="delivery" />
          <label for="delivery">Delivery</label>
        </div>
      </div>
    </div>
    <h2>Confirm {{ deliveryOption }} details</h2>
    <div>
      <h3>{{ props.post.food_name }} from {{ props.post.author }}</h3>
    </div>
   
    <div v-if="deliveryOption == 'pickup'" class="form-group">
      <label> Pick up at {{ props.post.location }}</label>
      <iframe
        width="300"
        height="300"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="`//www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${props.post.location}`"
      >
      </iframe>
    </div>
    <div v-else class="form-group"> 
      <label> Deliver from  {{ props.post.location }} to: </label>
      <div v-if="deliveryOption == 'delivery'" class="form-group">
        <label for="address"> Address </label>
        <input ref="addressInput" id="address" v-model="address" placeholder="Your address" required />
      </div>
      <div class="form-group">
        <label for="instructions"> Instructions </label>
        <input id="instructions" v-model="instructions" placeholder="e.g. leave at door" required />
      </div>
      <iframe v-if="debouncedAddress" class="form-group"
        width="300"
        height="200"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="`//www.google.com/maps/embed/v1/directions?key=${mapApiKey}
              &origin=${props.post.location}
              &destination=${debouncedAddress}`"
      >
      </iframe>
      <iframe v-else class="form-group"
        width="300"
        height="200"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="`//www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${props.post.location}`"
      >
      </iframe>
    </div>
    <div class="create-post-buttons">
      <button class="btn-small" type="submit">Claim</button>
      <button class="btn-small pure-button" @click="emit('closeClaimPost')">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
form {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: black;
  max-width: 30em;
  background: white;
  padding: 50px;
}

h2 {
  margin-bottom: 0.5em;
  font-size: 1.5em;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea,
input {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

textarea {
  resize: none;
  height: 6em;
}

button {
  align-self: center;
  padding: 0.5em 1.5em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-post-buttons {
  display: flex;
  flex-flow: row, nowrap;
  justify-content: center;

  button {
    margin: 8px;
  }

  .create-post-button {
    background-color: var(--pink);
  }

  .close-post-button {
    background-color: var(--light-grey);
  }
}

.toggle-wrapper {
  display: flex;
  padding: 4px;
  background-color: var(--green);
  border-radius: 20px;
}

.custom-input {
  flex-grow: 1;
  border-radius: 20px;
}

.custom-input input[type="radio"] {
  display: none;
  border-radius: 20px;
}

.custom-input label {
  display: block;
  border-radius: 20px;
  padding: 6px 8px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.custom-input:hover {
  background-color: var(--lighter-green);
  color: black;
}

.custom-input input[type="radio"]:checked + label {
  background-color: var(--lighter-green);
  border-radius: 20px;
  color: #000;
}
</style>
