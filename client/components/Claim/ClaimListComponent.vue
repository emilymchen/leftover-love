<script setup lang="ts">
import { defineEmits, ref, watch } from "vue";
import ClaimComponent from "../../components/Claim/ClaimComponent.vue";

const props = defineProps(["category", "claims"]);

const loaded = ref(false);
let claims = ref<Array<Record<string, string>>>([]);
let currentClaim = ref<Record<string, any> | null>(null);
let emit = defineEmits(["triggerMessageModal", "refreshAllClaims"]);

const filterType = ref<"pickup" | "delivery" | "all">("all");

let filteredClaims = ref<Array<Record<string, string>>>([]);

async function getClaims() {
  let claimResults = props.claims;
  loaded.value = true;
  if (props.category === "completed") {
    claims.value = claimResults.filter((claim: Record<string, any>) => claim.status === "Completed");
  } else if (props.category === "expired") {
    claims.value = claimResults.filter((claim: Record<string, any>) => new Date(claim.expiration_time).toISOString() < new Date().toISOString());
  } else {
    claims.value = claimResults.filter((claim: Record<string, any>) => new Date(claim.expiration_time).toISOString() >= new Date().toISOString() && claim.status === "Requested");
  }
}
function filterClaims() {
  if (filterType.value === "pickup") {
    filteredClaims.value = claims.value.filter((claim) => claim.method === "Pickup");
  } else if (filterType.value === "delivery") {
    filteredClaims.value = claims.value.filter((claim) => claim.method === "Delivery");
  } else {
    filteredClaims.value = claims.value;
  }
}

async function updateClaims() {
  await getClaims();
  filterClaims();
  loaded.value = true;
}

watch(
  () => props.claims,
  async () => {
    if (props.claims && props.claims.length > 0) {
      await updateClaims();
    }
    else {
      loaded.value = true;
    }
  },
);

</script>

<template>
  <div class="claims-outer-container">
    <p v-if="!loaded">Loading...</p>

    <div class="filter-buttons">
      <button
        :class="{ active: filterType === 'all' }"
        class="button-click"
        @click="
          () => {
            filterType = 'all';
            filterClaims();
          }
        "
      >
        All
      </button>
      <button
        :class="{ active: filterType === 'pickup' }"
        class="button-click"
        @click="
          () => {
            filterType = 'pickup';
            filterClaims();
          }
        "
      >
        Pickup
      </button>
      <button
        :class="{ active: filterType === 'delivery' }"
        class="button-click"
        @click="
          () => {
            filterType = 'delivery';
            filterClaims();
          }
        "
      >
        Delivery
      </button>
    </div>

    <section class="claims" v-if="loaded">
      <p v-if="filteredClaims.length === 0 && props.category === 'pending' && filterType === 'all'">You have no pending claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'pending' && filterType === 'pickup'">You have no pending pickup claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'pending' && filterType === 'delivery'">You have no pending delivery claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'completed' && filterType === 'all'">You have no completed claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'completed' && filterType === 'pickup'">You have no completed pickup claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'completed' && filterType === 'delivery'">You have no completed delivery claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'expired' && filterType === 'all'">You have no expired claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'expired' && filterType === 'pickup'">You have no expired pickup claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'expired' && filterType === 'delivery'">You have no expired delivery claims!</p>

      <article v-for="claim in filteredClaims" :key="claim._id" class="claim-item">
        <ClaimComponent
          v-if="currentClaim?._id !== claim._id"
          :claim="claim"
          :category="props.category"
          @refreshClaims="emit('refreshAllClaims')"
          @triggerMessageModal="(type) => emit('triggerMessageModal', type === 'driver' ? claim.deliverer : claim.postUser)"
        />
      </article>
    </section>
  </div>
</template>

<style scoped>
.claims-outer-container {
  margin-bottom: 50px;
}

.claims {
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  margin-top: 1em;
  flex-grow: 1;
}

.claim-item {
  height: fit-content;
}

.create-claim-box {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: var(--pink);
  color: white;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.create-claim-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  height: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.row {
  display: flex;
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
  padding: 2em;
  border-radius: 12px;
  min-width: 400px;
  max-width: 75vw;
}

.plus-icon {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.filter-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.button-click {
  background-color: var(--green);
  color: white;
  border: 2px solid var(--green);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.button-click:hover {
  background-color: #e0e0e0;
  color: black;
}

.button-click.active {
  background-color: var(--lighter-green);
  color: black;
  border: 2px solid var(--lighter-green);
  transform: scale(1.05);
}
</style>
