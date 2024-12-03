<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { defineEmits, defineProps } from "vue";

const props = defineProps(["delivery", "own"]);
const emit = defineEmits(["refreshDeliveries", "claimDelivery", "triggerMessageModal"]);

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
</script>

<template>
  <div class="top-section">
    <div class="restaurant-name">{{ props.delivery.postUser }}</div>
  </div>
  <div class="food-name-details">
    <div class="food-name">{{ props.delivery.food_name }}</div>
  </div>
  <div class="address">
    <div class="address">Pickup Location: {{ props.delivery.donorAddress }}</div>
    <div class="address">Delivery Location: {{ props.delivery.destinationAddress }}</div>
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
      <button class="edit-button" @click="markAsPickedUp">Marked as Picked Up From Restaurant</button>
    </div>
    <div v-else-if="props.own && props.delivery.status == 'In Progress'">
      <button class="edit-button" @click="markAsCompleted">Marked as Delivered</button>
    </div>
    <div v-else-if="props.own && props.delivery.status == 'Completed'">
      <button class="expired-button">Completed</button>
    </div>
    <div v-else>
      <button class="edit-button" @click="emit('claimDelivery', props.delivery._id)">Claim</button>
    </div>
    <div v-if="props.own">
      <button class="edit-button" @click="emit('triggerMessageModal')">Message Recipient</button>
    </div>
    <div v-if="props.own && props.delivery.status == 'Not Started'">
      <button class="expired-button" @click="unacceptDelivery">Unclaim</button>
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
    background-color: var(--orange);
    transition: transform 0.2s ease;
    position: relative;
    bottom: 0;
  }

  .edit-button:hover {
    transform: scale(1.05);
  }

  .expired-button {
    width: 100%;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
    bottom: 0;
    background-color: grey;
    color: var(--light-beige);
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

.quantity {
  font-size: 14px;
  color: var(--dark-green);
}

.qty-expiration-details {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>
