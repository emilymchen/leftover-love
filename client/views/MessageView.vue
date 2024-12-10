<script setup lang="ts">
import MessageComponent from "@/components/Message/MessageComponent.vue";
import MessageListComponent from "@/components/Message/MessageListComponent.vue";
import SendMessageComponent from "@/components/Message/SendMessageForm.vue";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const messages = ref<Array<Record<string, string>>>([]);
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const { toast } = storeToRefs(useToastStore());
const loaded = ref(false);
const toUser = ref("");
const emptyUsers = ref(false);

function setSelectedUser(username: string) {
  toUser.value = username;
}

function setEmptyUserMessage() {
  emptyUsers.value = true;
}

async function getMessages(user: string) {
  let query: Record<string, string> = { currentUser: user, otherUser: toUser.value };
  let messageResults;
  loaded.value = false;
  if (toUser.value) {
    try {
      messageResults = await fetchy("/api/messages", "GET", { query });
    } catch {
      return;
    }
    messages.value = messageResults;
  }
  loaded.value = true;
}

onBeforeMount(async () => {
  await getMessages(currentUsername.value);
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <section class="main-container">
      <MessageListComponent @toUser="setSelectedUser" @refreshMessages="getMessages(currentUsername)" @emptyUsers="setEmptyUserMessage" />
      <div class="messages-section">
        <div class="top-section">
          <h2 class="selected-user-header">Chatting with: {{ toUser }}</h2>
        </div>
        <h1>Inbox</h1>
        <div v-if="toUser" class="message-container">
          <section v-if="messages.length === 0 && loaded">
            <p>No message history</p>
          </section>
          <section v-if="!loaded">
            <p>Loading...</p>
          </section>
          <article v-for="message in messages" :key="message._id">
            <MessageComponent :message="message" @refreshMessages="getMessages(currentUsername)" />
          </article>
          <SendMessageComponent :toUser="toUser" @refreshMessages="getMessages(currentUsername)" class="send-message" />
        </div>
        <div class="nonSelectedUserInterface" v-if="!emptyUsers && !toUser">
          <h3>Please select a user to chat with</h3>
        </div>
        <div class="nonSelectedUserInterface" v-if="emptyUsers">
          <h3>No message history from past orders.</h3>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--orange);
  background-color: none;
}

h2.selected-user-header {
  text-align: left;
  font-size: 1.2em;
  margin: 10px 20px;
}

.main-container {
  display: flex;
  height: 80vh;
}

.sidebar {
  width: 180px;
  background-color: var(--sidebar-brown);
  border-right: 2px solid var(--dark-green);
  border-top: 2px solid var(--dark-green);
  height: 85vh;
  overflow-y: auto;
}

.messages-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--light-beige);
  position: relative;
  height: 100%;
}

.message-list {
  padding: 15px;
  border-radius: 20px;
  margin: 10px;
  flex: 1;
}

.send-message {
  position: fixed;
  bottom: 0;
  left: 225px;
  right: 0;
  background-color: var(--light-beige);
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

.top-section {
  height: 80px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  width: 100%;
  background-color: var(--sidebar-brown);
  border-top: 2px solid var(--dark-green);
  border-bottom: 2px solid var(--selected-brown);
}

.message-container{
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

</style>
