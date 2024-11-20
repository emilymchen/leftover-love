<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { ref, defineProps, defineEmits } from "vue";
import MessageDeleteConfirmationComponent from "./MessageDeleteConfirmationComponent.vue";

const props = defineProps(["message", "toUser"]);
const emit = defineEmits(["editMessage", "refreshMessages"]);
const { currentUsername } = storeToRefs(useUserStore());
const showModal = ref(false);

const deleteMessage = async () => {
  try {
    await fetchy(`/api/messages/${props.message._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshMessages");
};
</script>
<template>
  <div
    :class="{
      'message-sent': props.message.from === currentUsername,
      'message-received': props.message.to == currentUsername,
    }"
  >
    <div class="message-wrapper">
      <p
        class="message-content"
        :style="{
          backgroundColor: props.message.from == currentUsername ? '#93ddd1' : 'lightgrey',
        }"
      >
        {{ props.message.content }}
      </p>
      <button class="delete-btn" @click="showModal = true" aria-label="Delete message" v-if="props.message.from == currentUsername">🗑️</button>
      <MessageDeleteConfirmationComponent :isVisible="showModal" @confirm="deleteMessage" @cancel="showModal = false" />
    </div>
    <div class="base">
      <article class="timestamp">
        <p>Sent: {{ formatDate(props.message.dateCreated) }}</p>
      </article>
    </div>
  </div>
</template>
<style scoped>
.message-sent {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-received {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
}

.message-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.message-content {
  margin: 0;
  word-wrap: break-word;
  padding: 7px;
  border-radius: 10px;
  display: inline-block;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: 10px;
  transition: transform 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.2);
}

.timestamp {
  font-size: 0.7em;
  color: #888;
  opacity: 0;
  transition: opacity 0.3s ease;
  visibility: hidden;
}

.message-sent:hover .timestamp,
.message-received:hover .timestamp {
  opacity: 1;
  visibility: visible;
}

.base {
  display: flex;
}
</style>
