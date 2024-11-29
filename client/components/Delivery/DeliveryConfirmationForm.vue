<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, defineProps, nextTick, ref, watch } from "vue";
import { formatDate } from "@/utils/formatDate";

const mapApiKey = process.env.MAP_API_KEY;
const props = defineProps(["delivery"]);
const emit = defineEmits(["refreshDeliveries", "closeClaimDelivery"]);

async function claimDelivery() {
  let query: Record<string, string> = { request: props.delivery._id };
  try {
    await fetchy(`/api/deliveries`, "POST", { query });
  } catch {
    return;
  }
  emit("refreshDeliveries");
  emit("closeClaimDelivery");
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
</script>

<template>
  <form @submit.prevent="claimDelivery()" class="delivery-form">
    <h2>Confirm Accept Delivery</h2>

    <div>
      <h3>{{ props.delivery.food_name }} from {{ props.delivery.postUser }}</h3>
    </div>

    <label for="pickup">Pickup Location</label>
    <div id="pickup">{{ props.delivery.donorAddress }}</div>
    <label for="delivery">Delivery Location</label>
    <div id="delivery">{{ props.delivery.destinationAddress }}</div>
    <iframe class="form-group"
        width="300"
        height="300"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="`//www.google.com/maps/embed/v1/directions?key=${mapApiKey}
              &origin=${props.delivery.donorAddress}
              &destination=${props.delivery.destinationAddress}`"
      >
      </iframe>

    <label for="instructions">Instructions</label>
    <div id="instructions">{{ props.delivery.instructions }}</div>

    <label for="date">Must be completed by:</label>
    <div id="date">{{ formatDate(props.delivery.expiration_time) }}</div>

    <!-- Action buttons -->
    <div class="button-group">
      <button type="submit">Accept Delivery</button>
      <button class="close" @click="emit('closeClaimDelivery')">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.delivery-form {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.5em;
}

h2 {
  margin-bottom: 0.5em;
  font-size: 1.5em;
  text-align: center;
}

h3 {
  margin: 0.5em 0;
  font-size: 1.2em;
  color: #333;
}

label {
  font-weight: bold;
  margin-top: 1em;
}

div {
  font-size: 1rem;
  color: #555;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 1.5em;
}

button {
  padding: 0.5em 1.5em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: var(--orange-dark);
  color: #fff;
}

.close {
  background-color: #ccc;
  color: #333;
}

.close:hover {
  background-color: #999;
}
</style>
