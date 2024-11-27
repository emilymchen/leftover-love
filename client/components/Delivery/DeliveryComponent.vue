<script setup lang="ts">
import { onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import { fetchy } from "@/utils/fetchy";

const props = defineProps(["delivery", "own"]);
const emit = defineEmits(["refreshDeliveries"]);
onMounted(async () => {});

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

async function claimDelivery() {
  let query: Record<string, string> = { request: props.delivery };
  try {
    await fetchy(`/api/deliveries`, "POST", { query });
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
  <div class="food_name">
    <div class="food_name">{{ props.delivery.food_name }}</div>
  </div>
  <div class="address">
    <div class="address">{{ props.delivery.address }}</div>
  </div>
  <div class="qty-expiration-details">
    <div class="quantity">Qty: {{ props.delivery.quantity }}</div>
    <div class="expiration-time">Expires: {{ props.delivery.expiration_date }}</div>
  </div>
  <div class="donor-buttons base">
    <div v-if="props.own.value == true && props.delivery.status == 'Not Started'">
      <button class="edit-button" @click="markAsPickedUp">Marked as Picked Up From Restaurant</button>
    </div>
    <div v-else-if="props.own.value == true && props.delivery.status == 'Completed'">
      <button class="expired-button" @click="markAsCompleted">Completed</button>
    </div>
    <div v-else>
      <button class="expired-button" @click="claimDelivery">Claim</button>
    </div>
  </div>
</template>

<style scoped>
.author {
  font-weight: bold;
  font-size: 1.2em;
}

.timestamp {
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
    /* padding: 12px; */
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
    /* padding: 12px; */
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

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author {
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
