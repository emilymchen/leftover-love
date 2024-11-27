<script setup lang="ts">
import MessageComponent from "@/components/Message/MessageComponent.vue";
import SendMessageComponent from "@/components/Message/SendMessageForm.vue";
import MessageListComponent from "@/components/Message/MessageListComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useToastStore } from "@/stores/toast";

const messages = ref<Array<Record<string, string>>>([]);
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const { toast } = storeToRefs(useToastStore());
const loaded = ref(false);
const toUser = ref("");

function setSelectedUser(username: string) {
  toUser.value = username;
}

async function getMessages(user: string) {
  let query: Record<string, string> = { currentUser: user, otherUser: toUser.value };
  let messageResults;
  if (!toUser.value) {
    toast.value = { message: "Please select a user to chat with", style: "error" };
    setTimeout(() => {
      toast.value = null;
    }, 1000);
  } else {
    try {
      messageResults = await fetchy("/api/messages", "GET", { query });
    } catch {
      return;
    }
    messages.value = messageResults;
  }
}

onBeforeMount(async () => {
  await getMessages(currentUsername.value);
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <section class="main-container">
      <NudgeSeriesComponent :toUser="toUser" />
      <MessageListComponent @toUser="setSelectedUser" @refreshMessages="getMessages(currentUsername)" />
      <div class="messages-section">
        <h1>Messages</h1>
        <section v-if="messages.length === 0">
          <p>No message history</p>
        </section>
        <article v-for="message in messages" :key="message._id" class="message-container">
          <MessageComponent :message="message" @refreshMessages="getMessages(currentUsername)" />
        </article>
        <SendMessageComponent :toUser="toUser" @refreshMessages="getMessages(currentUsername)" class="send-message" />
      </div>
    </section>
  </section>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}

.nudge-form {
  margin-left: auto;
}

.main-container {
  display: flex;
  align-items: flex-start;
  height: calc(100vh - 80px);
}

.sidebar {
  width: 250px;
  background-color: var(--light-pastel-grey);
  border-right: 1px solid #ddd;
  border: 2px solid var(--green);
  height: 100%;
  overflow-y: auto;
}

.messages-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  height: 100%;
}
.send-message {
  position: fixed;
  bottom: 0;
  left: 295px;
  right: 0;
  background-color: var(--white);
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 10px;
}

h3 {
  padding: 15px;
}

p {
  margin-left: 10px;
}
</style>
