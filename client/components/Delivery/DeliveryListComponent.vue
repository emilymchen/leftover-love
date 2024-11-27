<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import DeliveryComponent from "./DeliveryComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isVolunteer } = storeToRefs(useUserStore());
const props = defineProps(["own"]);

const loaded = ref(false);
let deliveries = ref<Array<Record<string, string>>>([]);

async function getDeliveries(deliverer?: string) {
  let deliveryResults;
  if (!props.own) {
    deliveryResults = await fetchy("/api/deliveries/requests", "GET");
  } else {
    let query: Record<string, string> = deliverer !== undefined ? { deliverer } : {};
    try {
      deliveryResults = await fetchy("/api/deliveries", "GET", { query });
    } catch {
      return;
    }
  }
  deliveries.value = deliveryResults;
  console.log(deliveries.value, props.own);
}

async function updateDeliveries() {
  if (props.own) {
    await getDeliveries(currentUsername.value);
  } else {
    await getDeliveries();
  }
  loaded.value = true;
}

onBeforeMount(async () => {
  await updateDeliveries();
});
</script>

<template>
  <div class="deliveries-outer-container" v-if="isVolunteer">
    <p v-if="!loaded">Loading...</p>
    <section class="deliveries" v-if="loaded">
      <p v-if="deliveries.length === 0">There are no deliveries!</p>

      <article v-for="delivery in deliveries" :key="delivery._id">
        <DeliveryComponent :delivery="delivery" :own="props.own" @refreshDeliveries="updateDeliveries" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.deliveries-outer-container {
  margin-bottom: 50px;
}

.deliveries {
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  margin-top: 1em;
  flex-grow: 1;
}
</style>
