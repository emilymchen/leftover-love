<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
</script>

<template>
  <div class="food-item-post">
    <div class="top-section">
      <div class="food-name">{{ props.post.food_item }}</div>
      <div class="expiration-time">Expires: {{ formatDate(props.post.expiration_item) }}</div>
    </div>
    <div class="details">
      <div class="author">{{ props.post.author }}</div>
      <div class="quantity">Qty: {{ props.post.quantity }}</div>
    </div>
    <div class="base">
      <menu v-if="props.post.author == currentUsername">
        <li><button @click="emit('editPost', props.post._id)">Edit</button></li>
      </menu>
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

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background-color: #f9f9f9;
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
  color: var(--green);
  text-align: right;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author {
  font-size: 16px;
  color: var(--dark-green);
}

.quantity {
  font-size: 14px;
  color: #777;
}
</style>
