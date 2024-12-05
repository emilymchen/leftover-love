<script setup lang="ts">
import DeliveryListComponent from "@/components/Delivery/DeliveryListComponent.vue";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn, isVolunteer, currentUsername } = storeToRefs(useUserStore()); 
const loaded = ref(false);
let deliveryRequests = ref<Array<Record<string, string>>>([]);

async function getDeliveryRequests() {
  let deliveryResults;
  try {
    deliveryResults = await fetchy("/api/deliveries/requests", "GET");
  } catch {
    return;
  }
  deliveryRequests.value = deliveryResults;
  console.log(deliveryRequests.value);
}

async function updateDeliveries() {
  await getDeliveryRequests();
  loaded.value = true;
}

onBeforeMount(async () => {
  await updateDeliveries();
});


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

</script>

<template>
  <main>
    <section v-if="isLoggedIn && isVolunteer">
 
      <div class="header-container">
        <h1>Delivery Requests</h1>
        <DeliveryListComponent :loaded="loaded" :own="false" :deliveries="deliveryRequests" @refreshDeliveries="updateDeliveries" />
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
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  overflow-y: auto;
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
