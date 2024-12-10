<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { defineEmits, defineProps, ref, onBeforeMount } from "vue";
import { loadGoogleMapsApi } from "@/utils/googleMapsLoader";

const googleMapsApiKey = process.env.MAP_API_KEY;
const props = defineProps(["delivery", "own"]);
const emit = defineEmits(["refreshDeliveries", "claimDelivery", "triggerMessageModal"]);
const distance = ref<string | null>(null);
const loaded = ref(false);

async function markAsPickedUp() {
  try {
    await fetchy(`/api/deliveries/start/${props.delivery._id}`, "POST");
  } catch {
    return;
  }
  emit("refreshDeliveries");
}

async function markAsCompleted() {
  try {
    await fetchy(`/api/deliveries/complete/${props.delivery._id}`, "POST");
  } catch {
    return;
  }
  emit("refreshDeliveries");
}

function isExpired(expiration_time: string) {
  return new Date(expiration_time) < new Date();
}

async function unacceptDelivery() {
  try {
    await fetchy(`/api/deliveries/${props.delivery._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshDeliveries");
}

async function getDistance() {
  if (googleMapsApiKey === undefined) {
    console.error("Map API key is undefined");
    return;
  }
  const pickupAddress = props.delivery.donorAddress;
  const deliveryAddress = props.delivery.destinationAddress;
  try {
    await loadGoogleMapsApi(googleMapsApiKey);
    loaded.value = true;

    const service = new google.maps.DistanceMatrixService();
    const request = {
      origins: [pickupAddress],
      destinations: [deliveryAddress],
      travelMode: google.maps.TravelMode.DRIVING,
    };

    service.getDistanceMatrix(request, (response: any, status: any) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const distanceInMeters = response.rows[0].elements[0].distance.value;
        const distanceInMiles = distanceInMeters / 1609.34;
        distance.value = `${distanceInMiles.toFixed(2)} miles`;
      } else {
        console.error("DistanceMatrix request failed:", status);
      }
      loaded.value = true;
    });
  } catch (error) {
    console.error("Error fetching distance:", error);
    distance.value = "Unable to calculate distance";
    loaded.value = false;
  }
}

onBeforeMount(() => {
  getDistance();
});

</script>

<template>
  <div class="delivery-container">
  <div class="top-section">
    <div class="restaurant-name">{{ props.delivery.postUser }}</div>
  </div>
  <div class="food-name-details">
    <div class="food-name">{{ props.delivery.food_name }}</div>
  </div>
  <div class="delivery-info">
    <div class="location-card">
      <div class="location-header">
        <span class="location-icon">📍</span>
        <span class="location-title">Pickup Location:</span>
      </div>
      <div class="location-address">{{ props.delivery.donorAddress }}</div>
    </div>

    <div class="location-card">
      <div class="location-header">
        <span class="location-icon">📍</span>
        <span class="location-title">Delivery Location:</span>
      </div>
      <div class="location-address">{{ props.delivery.destinationAddress }}</div>
    </div>

    <div class="distance-info" v-if="loaded">
      <strong class="distance-text">Delivery Distance:</strong>
      <span class="distance">{{ distance }}</span>
    </div>
  </div>
  <div class="qty-expiration-details">
    <div class="quantity">Qty: {{ props.delivery.quantity }}</div>
    <div class="expiration-time">Expires: {{ formatDate(props.delivery.expiration_time) }}</div>
  </div>
  <div class="base">
    <div v-if="isExpired(props.delivery.expiration_time)">
      <button class="expired-button">Expired</button>
    </div>
    <div v-if="props.own && props.delivery.status == 'Not Started'">
      <button class="edit-button" @click="markAsPickedUp">Mark as Picked Up From Restaurant</button>
    </div>
    <div v-else-if="props.own && props.delivery.status == 'In Progress'">
      <button class="edit-button" @click="markAsCompleted">Mark as Delivered</button>
    </div>
    <div v-else-if="props.own && props.delivery.status == 'Completed'">
      <button class="expired-button">Completed</button>
    </div>
    <div v-else>
      <button class="edit-button" @click="emit('claimDelivery', props.delivery._id)">Accept Delivery</button>
    </div>
    <div class="messaging-buttons" v-if="props.own">
      <button class="message-button" @click="emit('triggerMessageModal', 'recipient')">Message Recipient</button>
      <button class="message-button" @click="emit('triggerMessageModal', 'donor')">Message Donor</button>
    </div>
    <div v-if="props.own && props.delivery.status == 'Not Started'">
      <button class="expired-button" @click="unacceptDelivery">Unaccept Delivery</button>
    </div>
  </div>
</div>
</template>

<style scoped>
.restaurant-name {
  font-weight: bold;
  font-size: 1.2em;
}
.expiration-time {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}


.base {
  width: 100%;
  margin-top: 12px;

  menu {
    list-style-type: none;
    display: flex;
    flex-direction: row;
    gap: 1em;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .edit-button {
    width: 100%;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
    bottom: 0;
  }

  .message-button {
    width: 100%;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    background-color: var(--darker-green);
    transition: transform 0.2s ease;
    position: relative;
    bottom: 0;
  }

  .expired-button {
    width: 100%;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease;
    background-color: grey;
    color: var(--light-beige);
    margin-top: 12px;
  }

  .messaging-buttons{
    margin-top: 12px;
  }
}

.base article:only-child {
  margin-left: auto;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.food-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.expiration-time {
  font-size: 14px;
  color: var(--dark-green);
  text-align: right;
}

.food-name-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.food-name {
  font-size: 16px;
  color: var(--darker-green);
}

.delivery-distance{
  color: var(--dark-green);
}
.quantity {
  font-size: 14px;
  color: var(--dark-green);
}

.qty-expiration-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-top: 12px;
}

.address-type {
  font-weight: bold;
  color: var(--dark-green);
}

.address {
  display: flex;
  flex-flow: column;
  gap: 0.5em;
}

.delivery-info {
  padding: 3px;
  max-width: 650px;
  margin: 20px auto;
}

.location-card {
  background-color: var(--light-bg);
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-header {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  font-weight: bold;
  color: var(--pink);
}

.location-icon {
  font-size: 1.3em;
  margin-right: 8px;
}

.location-title {
  flex-grow: 1;
}

.location-address {
  font-size: 0.9em;
  color: #666;
  margin-top: 6px;
}

.distance-info {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
  margin-top: 12px;
  color: #333;
}

.distance-text {
  color: var(--dark-green);
  font-weight: bold;
}

</style>
