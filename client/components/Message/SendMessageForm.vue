<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

const message = ref("");
const props = defineProps(["toUser"]);
const emit = defineEmits(["refreshMessages"]);

async function sendMessage(message: string, to: string) {
  try {
    await fetchy("/api/messages", "POST", { body: { content: message, to: to } });
  } catch {
    return;
  }
  emit("refreshMessages");
  emptyForm();
}
const emptyForm = () => {
  message.value = "";
};
async function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    await sendMessage(message.value, props.toUser);
  }
}
</script>

<template>
  <form @submit.prevent="sendMessage(message, props.toUser)" class="message-form">
    <textarea v-model="message" id="message" name="message" rows="4" required placeholder="Type your message here..." class="message-input" @keydown="onKeyDown">></textarea>
    <button type="submit" class="btn-small pure-button send-button">
      <img src="@/assets/images/deliver.png" alt="send icon" />
    </button>
  </form>
</template>

<style scoped>
.message-form {
  display: flex;
  align-items: flex-start;
  border: 2px solid var(--green);
}

img {
  width: 20px;
  height: 20px;
}

.message-input {
  flex: 1;
  resize: none;
  padding: 10px;
  border: 1px solid #ddd;
  margin-right: 10px;
}

.send-button {
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px 15px;
  transition: background 0.3s;
  border: 2px solid var(--green);
}

.send-button:hover {
  background: var(--light-green);
}
</style>
