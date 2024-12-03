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
        <h1>Messages</h1>
        <div class="selectedUserInterface" v-if="toUser">
          <section v-if="messages.length === 0 && loaded">
            <p>No message history</p>
          </section>
          <section v-if="!loaded">
            <p>Loading...</p>
          </section>
          <article v-for="message in messages" :key="message._id" class="message-container">
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
  border: 2px solid var(--dark-green);
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

.nonSelectedUserInterface {
  display: flex;
  justify-content: center;
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
