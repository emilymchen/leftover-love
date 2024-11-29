<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import DeliveryComponent from "./DeliveryComponent.vue";
import DeliveryConfirmationForm from "@/components/Delivery/DeliveryConfirmationForm.vue";
import { defineProps, defineEmits } from "vue";
import { ref } from "vue";

const { isVolunteer } = storeToRefs(useUserStore());
const props = defineProps(["loaded", "deliveries", "own"]);
const emit = defineEmits(["refreshDeliveries"]);
let currentDelivery = ref<Record<string, string> | null>(null);
let isClaimingDelivery = ref(false);

async function refreshDeliveries() {
  emit("refreshDeliveries");
}

function startClaiming(delivery: Record<string, string>) {
  currentDelivery.value = delivery;
  isClaimingDelivery.value = true;
}
</script>

<template>
  <div class="deliveries-outer-container" v-if="isVolunteer">
    <p v-if="!loaded">Loading...</p>
    <section class="deliveries" v-if="loaded">
      <p v-if="deliveries.length === 0">There are no deliveries!</p>

      <article v-for="delivery in props.deliveries" :key="delivery._id">
        <DeliveryComponent :delivery="delivery" :own="props.own" @refreshDeliveries="refreshDeliveries" @claimDelivery="startClaiming(delivery)" />
      </article>
    </section>
  </div>
  <div v-if="isClaimingDelivery" class="modal-background">
    <div class="modal">
      <DeliveryConfirmationForm
        :delivery="currentDelivery"
        @refreshDeliveries="refreshDeliveries"
        @closeClaimDelivery="
          isClaimingDelivery = false;
          currentDelivery = null;
        "
      />
    </div>
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
  height: 250px;
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

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  position: fixed;
  padding: 2em;
  border-radius: 12px;
  width: 90vw; /* Scale dynamically to viewport */
  max-width: 800px; /* Optional max width */
  max-height: 80vh; /* Allow vertical scrolling */
  overflow-y: auto; /* Enable scrolling when content exceeds height */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: #fff;
}

</style>
