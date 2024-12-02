<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "@/utils/fetchy";
import DeliveryListComponent from "@/components/Delivery/DeliveryListComponent.vue";

const { isLoggedIn, isVolunteer } = storeToRefs(useUserStore());
const loaded = ref(false);

let myDeliveries = ref<Array<Record<string, string>>>([]);
let deliveryRequests = ref<Array<Record<string, string>>>([]);

async function getMyDeliveries() {
  let deliveryResults;
  try {
    deliveryResults = await fetchy("/api/deliveries/user", "GET");
  } catch {
    return;
  }
  myDeliveries.value = deliveryResults;
  console.log(myDeliveries.value);
}

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
  await getMyDeliveries();
  await getDeliveryRequests();
  loaded.value = true;
}

onBeforeMount(async () => {
  await updateDeliveries();
});
</script>

<template>
  <main>
    <section v-if="isLoggedIn && isVolunteer">
      <div class="header-container">
        <h1>My Deliveries</h1>
        <DeliveryListComponent :loaded="loaded" :own="true" :deliveries="myDeliveries" @refreshDeliveries="updateDeliveries" />
      </div>

      <div class="header-container">
        <h1>Delivery Requests</h1>
        <DeliveryListComponent :loaded="loaded" :own="false" :deliveries="deliveryRequests" @refreshDeliveries="updateDeliveries" />
      </div>
    </section>
  </main>
</template>

<style scoped>
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
