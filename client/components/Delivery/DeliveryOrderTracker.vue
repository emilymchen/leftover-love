<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { fetchy, } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { defineEmits, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import MessageComponent from "../Message/MessageComponent.vue";
import SendMessageForm from "../Message/SendMessageForm.vue";

const route = useRoute();
const claimId = route.params.claimId;
const mapApiKey = process.env.MAP_API_KEY;

const emit = defineEmits(["triggerMessage"]);

const loaded = ref(false);
let claim = ref<Record<string, string>>({});
const statuses = ["Requested", "Driver Confirmed", "Picked Up", "Delivered"];

const statusMapping: Record<string, Array<string>> = {
  "Not Started": ["Requested", "Driver Confirmed"],
  "In Progress": ["Requested", "Driver Confirmed", "Picked Up"],
  Completed: ["Requested", "Driver Confirmed", "Picked Up", "Delivered"],
  Requested: ["Requested"],
};

async function getClaim() {
  let claimResults = { status: "Requested" };
  try {
    claimResults = await fetchy(`/api/deliveries/status/${claimId}`, "GET");
  } catch {
    console.log("A driver has not been assigned to this claim yet.");
  }
  claim.value = claimResults;
  loaded.value = true;
}

function expiredDuringTransit() {
  return claim.value.status !== "Completed" && new Date(claim.value.expiration_time) < new Date();
}
onBeforeMount(async () => {
  await getClaim();
  setSelectedRole("donor");
  await getMessages(currentUsername.value);
  messageLoaded.value = true;
});

let googleMapsApiPromise : any = null;
function loadGoogleMapsApi(apiKey: string) {
  if (!googleMapsApiPromise) {
    googleMapsApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log("Google Maps API loaded successfully");
        resolve(null);
      };
      script.onerror = (error) => {
        console.error("Error loading Google Maps API:", error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }
  return googleMapsApiPromise;
}


// messaging modal infrastructure

const messages = ref<Array<Record<string, string>>>([]);
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const { toast } = storeToRefs(useToastStore());
const messageLoaded = ref(false);
const messageView = ref(false);
const toUser = ref("");
const toRole = ref("");

function setSelectedUser(username: string) {
  toUser.value = username;
}

function setSelectedRole(role: string) {
  toRole.value = role;
}

function setModalVisible(visible: boolean, role?: string) {
  messageView.value = visible;
  if (role) {
    setSelectedRole(role);
  }
  if (visible) {
    getMessages(currentUsername.value);
  }
}

async function getMessages(user: string) {
  console.log(toRole.value);
  const otherUser = toRole.value === "driver" ? claim.value.deliverer : claim.value.postUser;
  setSelectedUser(otherUser);
  let query: Record<string, string> = { currentUser: user, otherUser };
  let messageResults;
  messageResults = await fetchy("/api/messages", "GET", { query });
  messages.value = messageResults;
}

</script>
<template>
  <div class="base">
    <div class="status">
      <h1 v-if="expiredDuringTransit()">Claim Status: Unfortuntately, your claim has expired during transit.</h1>
      <h1 v-else>Claim Status: {{ claim.status || "Loading..." }}</h1>
    </div>

    <div class="progress">
      <template v-for="(status, index) in statuses" :key="index">
        <div v-if="index > 0" class="line" :class="{ active: index <= statusMapping[claim.status || 'Requested'].length }"></div>
        <div
          class="circle"
          :class="{
            solid: statusMapping[claim.status || 'Requested'].includes(status),
            outline: !statusMapping[claim.status || 'Requested'].includes(status),
          }"
        >
          <span v-if="statusMapping[claim.status || 'Requested'].includes(status)" class="check">✓</span>
          <span class="label">{{ status }}</span>
        </div>
      </template>
    </div>

    <iframe v-if="claim.status !== 'Requested'" class="form-group"
        width="600"
        height="300"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="`//www.google.com/maps/embed/v1/directions?key=${mapApiKey}
              &origin=${claim.donorAddress}
              &destination=${claim.destinationAddress}`"
      >
      </iframe>

    <div class="button-container" v-if="claim.status !== 'Requested'">
      <button @click="setModalVisible(true, 'driver')" >Message Your Driver</button>
    </div>
    <button v-if="claim.status!='Requested'" @click="setModalVisible(true, 'donor')" >Message Your Donor</button>

    <div v-if="messageView && claim.status != 'Requested'" class="modal-background">
      <div class="modal">
        <div class="messages-section">
          <h1>Messages</h1>
          <section v-if="messages.length === 0">
            <p>No message history</p>
          </section>
          <article v-for="message in messages" :key="message._id" class="message-container">
            <MessageComponent :message="message" @refreshMessages="getMessages(currentUsername)" />
          </article>
          <SendMessageForm :toUser="toUser" @refreshMessages="getMessages(currentUsername)" class="send-message" /> 
        </div>
        <button @click="setModalVisible(false)">Close</button>
      </div>
    </div>
  </div>
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

.base {
  text-align: center;
  padding: 60px;
}

.status {
  font-size: 24px;
  margin-bottom: 30px;
}

.progress {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  gap: 10px;
  margin-bottom: 40px;
}

.circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  position: relative;
  transition: all 0.3s ease;
  border: 3px solid #ccc;
  background-color: transparent;
}

.circle.solid {
  border-color: var(--dark-green);
  background-color: var(--dark-green);
  color: #fff;
}

.circle.outline {
  border-color: var(--dark-green);
  border-width: 6px;
}

.label {
  position: absolute;
  top: 100%;
  transform: translateY(10px);
  white-space: nowrap;
  font-size: 16px;
  font-weight: bold;
}

.check {
  font-size: 36px;
  color: var(--white);
}

.line {
  flex: 1;
  height: 4px;
  background-color: var(--beige);
  align-self: center;
  transition: background-color 0.3s ease;
}

.line.active {
  background-color: var(--dark-green);
}

.button-container {
  margin-top: 40px;
}

.large-button {
  width: 90%;
  padding: 15px 0;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: var(--pink);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.large-button:hover {
  transform: scale(1.025);
  background-color: var(--light-pink);
}
</style>
