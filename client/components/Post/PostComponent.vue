<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts", "claimPost"]);
const { currentUsername, isDonor, isRecipient } = storeToRefs(useUserStore());

function isExpired(expiration_time: string) {
  return new Date(expiration_time) < new Date();
}

async function checkIfClaimed(postId: string) {
  let claim;
  try {
    claim = await fetchy(`/api/claims/${postId}`, "GET");
  } catch {
    return false;
  }
  pickup.value = claim.method === "Pickup" ? "Pickup" : "Delivery";
  return claim !== null;
}

const claimed = ref(false);
const pickup = ref("");

onMounted(async () => {
  claimed.value = await checkIfClaimed(props.post._id);
});
</script>

<template>
  <div class="top-section">
    <div class="food-name">{{ props.post.food_name }}</div>
  </div>
  <div class="author-details">
    <div class="author">{{ props.post.author }}</div>
  </div>
  <div class="qty-expiration-details">
    <div class="quantity">Qty: {{ props.post.quantity }}</div>
    <div class="expiration-time">Expires: {{ formatDate(new Date(props.post.expiration_time)) }}</div>
  </div>

  <div class="base">
    <button v-if="isExpired(props.post.expiration_time)" class="expired-button">Expired</button>
    <div v-else-if="props.post.author == currentUsername && isDonor">
      <div v-if="claimed">
        <button class="expired-button">Claimed for {{ pickup }}</button>
      </div>
      <div v-else>
        <button class="edit-button" @click="emit('editPost', props.post)">Edit</button>
      </div>
    </div>
    <div v-else-if="isRecipient">
      <button class="edit-button" @click="emit('claimPost', props.post._id)">Claim</button>
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
  }

  .edit-button {
    width: 100%;
    padding: 12px;
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
    padding: 12px;
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
