<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername, isDonor } = storeToRefs(useUserStore());

function isExpired(expiration_time: string) {
  return new Date(expiration_time) < new Date();
}
</script>

<template>
  <div class="food-item-post">
    <div class="top-section">
      <div class="food-name">{{ props.post.food_item }}</div>
    </div>
    <div class="author-details">
      <div class="author">{{ props.post.author }}</div>
    </div>
    <div class="qty-expiration-details">
      <div class="quantity">Qty: {{ props.post.quantity }}</div>
      <div class="expiration-time">Expires: {{ formatDate(props.post.expiration_item) }}</div>
    </div>
    <div class="base">
      <div class="donor-buttons">
        <menu v-if="isExpired(props.post.expiration_time)">
          <button class="edit-button">Expired</button>
        </menu>
        <menu v-else-if="props.post.author == currentUsername && isDonor">
          <button class="edit-button" @click="emit('editPost', props.post._id)">Edit</button>
        </menu>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

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
    margin-top: 8px;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    border-radius: 8px;
  }
}

.base article:only-child {
  margin-left: auto;
}

.food-item-post {
  display: flex;
  flex-direction: column;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  font-family: Arial, sans-serif;
  background-color: var(--light-bg);
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
