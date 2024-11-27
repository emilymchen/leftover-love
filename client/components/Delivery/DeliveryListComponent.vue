<script setup lang="ts">
import DeliveryComponent from "./DeliveryComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isVolunteer } = storeToRefs(useUserStore());
const props = defineProps(["loaded", "deliveries", "own"]);
const emit = defineEmits(["refreshDeliveries"]);

async function refreshDeliveries() {
  emit("refreshDeliveries");
}
</script>

<template>
  <div class="deliveries-outer-container" v-if="isVolunteer">
    <p v-if="!loaded">Loading...</p>
    <section class="deliveries" v-if="loaded">
      <p v-if="deliveries.length === 0">There are no deliveries!</p>

      <article v-for="delivery in props.deliveries" :key="delivery._id">
        <DeliveryComponent :delivery="delivery" :own="props.own" @refreshDeliveries="refreshDeliveries" />
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
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin: 0 auto;
  max-width: 60em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}
article {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  background-color: var(--light-beige);
  width: 250px;
  height: 160px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.row {
  display: flex;
  position: fixed;

  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
