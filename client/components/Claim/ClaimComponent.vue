<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { defineProps, onMounted } from "vue";

const props = defineProps(["claim", "category"]);
const emit = defineEmits(["refreshClaims"]);
onMounted(async () => {});

async function track_order() {
  void router.push(`/order-tracker/${props.claim._id}`);
}

async function unclaim() {
  console.log(props.claim);
  console.log(props.claim.post._id);
  try {
    await fetchy(`/api/claims/${props.claim.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshClaims");
}
</script>

<template>
  <div class="top-section">
    <div class="food-name">{{ props.claim.post.food_name }}</div>
  </div>
  <div class="author-details">
    <div class="author">{{ props.claim.post.author }}</div>
  </div>
  <div class="qty-expiration-details">
    <div class="quantity">Qty: {{ props.claim.post.quantity }}</div>
    <div class="expiration-time">Expires: {{ formatDate(new Date(props.claim.post.expiration_time)) }}</div>
  </div>

  <div class="pickup-delivery-details">
    <div>Claimed for {{ props.claim.method }}</div>
  </div>

  <div class="donor-buttons base">
    <div v-if="props.category === 'pending'">
      <div v-if="props.claim.method === 'Delivery'">
        <button class="edit-button" @click="track_order">Track Order</button>
      </div>
      <div v-else>
        <button class="edit-button">Please pick it up!</button>
      </div>
    </div>
    <div v-else-if="props.category === 'completed'">
      <button class="expired-button">Completed</button>
    </div>
    <div v-else-if="props.category === 'expired'">
      <button class="expired-button">Expired</button>
    </div>
  </div>
  <div class="base" v-if="props.category === 'pending'">
    <button class="unclaim-button" @click="unclaim">Unclaim</button>
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

  .unclaim-button {
    width: 100%;
    /* padding: 12px; */
    border-radius: 8px;
    background-color: var(--light-beige);
    color: black;
    border-color: #333;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
    bottom: 0;
  }

  .unclaim-button:hover {
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
