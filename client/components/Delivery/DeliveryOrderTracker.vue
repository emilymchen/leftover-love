<script setup lang="ts">
import { onBeforeMount } from "vue";
import { fetchy } from "@/utils/fetchy";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const claimId = route.params.claimId;
const mapApiKey = process.env.MAP_API_KEY;

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
    return;
  }
  claim.value = claimResults;
  loaded.value = true;
  console.log(claimResults);
}

function expiredDuringTransit() {
  return claim.value.status !== "Completed" && new Date(claim.value.expiration_time) < new Date();
}
onBeforeMount(async () => {
  await getClaim();
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

    <iframe class="form-group"
        width="300"
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

    <div class="button-container">
      <button class="large-button">Message Your Driver</button>
    </div>
  </div>
</template>

<style scoped>
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
