<script setup lang="ts">
import ClaimListComponent from "@/components/Claim/ClaimListComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import MessageComponent from "../components/Message/MessageComponent.vue";
import SendMessageForm from "../components/Message/SendMessageForm.vue";

const { isLoggedIn, isRecipient, currentUsername } = storeToRefs(useUserStore());

const claims = ref<Array<Record<string, any>>>([]);
const claimsLoaded = ref(false);

// messaging modal infrastructure

const messages = ref<Array<Record<string, string>>>([]);
const messageLoaded = ref(false);
const messageView = ref(false);
const toUser = ref("");

function setSelectedUser(username: string) {
  toUser.value = username;
}

function triggerMessage(claimUser: string) {
  setModalVisible(true, claimUser);
}

function setModalVisible(visible: boolean, claimUser: string) {
  messageView.value = visible;
  if (visible) {
    getMessages(currentUsername.value, claimUser);
  }
  else {
    messages.value = [];
    messageLoaded.value = false;
  }
}

async function getMessages(user: string, claimUser: string) {
  setSelectedUser(claimUser);
  let query: Record<string, string> = { currentUser: user, otherUser: claimUser};
  let messageResults;
  messageResults = await fetchy("/api/messages", "GET", { query });
  messages.value = messageResults;
  messageLoaded.value = true;
}

async function fetchAllClaims() {
  try {
    const claimResults = await fetchy("/api/claims", "GET");
    claims.value = claimResults;
    claimsLoaded.value = true;
  } catch (e) {
    console.error(e);
  }
}

onBeforeMount(async () => {
  await fetchAllClaims();
  console.log(claims.value);
});

</script>

<template>
  <main>
    <section v-if="isLoggedIn && isRecipient">
      <div class="header-container">
        <h1>Pending claims</h1>
      </div>
      <ClaimListComponent @triggerMessageModal="triggerMessage" @refreshAllClaims="fetchAllClaims" :claims=claims :category="'pending'" />

      <h1>Completed claims</h1>

      <ClaimListComponent @triggerMessageModal="triggerMessage" @refreshAllClaims="fetchAllClaims" :claims="claims" :category="'completed'" />

      <h1>Expired claims</h1>

      <ClaimListComponent @triggerMessageModal="triggerMessage" @refreshAllClaims="fetchAllClaims" :claims="claims" :category="'expired'" />

      <div v-if="messageView" class="modal-background">
        <div class="modal">
          <div class="messages-section">
            <h1>Messages</h1>
            <section v-if="messages.length === 0 && messageLoaded">
              <p>No message history</p>
            </section>
            <section v-if="!messageLoaded">
              <p>Loading...</p>
            </section>
            <article v-for="message in messages" :key="message._id" class="message-container">
              <MessageComponent :message="message" @refreshMessages="getMessages(currentUsername, toUser)" />
            </article>
          </div>
            <SendMessageForm :toUser="toUser" @refreshMessages="getMessages(currentUsername, toUser)" class="send-message" /> 
          <button class="close-button" @click="setModalVisible(false, toUser)">Close</button>
        </div>
       </div>
    </section>
  </main>
</template>

<style scoped>
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 80vh;
}

.messages-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.send-message {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 10px;
}

.close-button {
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: var(--orange-dark);
  transform: none;
}

h1 {
  text-align: center;
  color: var(--orange);
  font-size: 2em;
  margin: 0;
  font-weight: 900;
}
h2 {
  text-align: center;
  font-style: italic;
}
.main-container {
  padding: 1.5em;
}

.listing-section {
  display: flex;
  flex-direction: column;
}

.spacer {
  height: 2em;
}
</style>
