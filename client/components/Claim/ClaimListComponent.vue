<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import ClaimComponent from "../../components/Claim/ClaimComponent.vue";

// const { isDonor, currentUsername, isRecipient } = storeToRefs(useUserStore());
const props = defineProps(["category"]);

const loaded = ref(false);
let claims = ref<Array<Record<string, string>>>([]);
let currentClaim = ref<Record<string, any> | null>(null);

const filterType = ref<"pickup" | "delivery" | "all">("all");

let filteredClaims = ref<Array<Record<string, string>>>([]);

async function getClaims() {
  let claimResults;
  try {
    claimResults = await fetchy("/api/claims", "GET");
  } catch {
    return;
  }

  if (props.category === "expired") {
    claims.value = claimResults.filter((claim: Record<string, any>) => new Date(claim.post.expiration_time).toISOString() < new Date().toISOString());
  } else if (props.category === "completed") {
    claims.value = claimResults.filter((claim: Record<string, any>) => new Date(claim.post.expiration_time).toISOString() >= new Date().toISOString() && claim.status === "Completed");
  } else {
    claims.value = claimResults.filter((claim: Record<string, any>) => new Date(claim.post.expiration_time).toISOString() >= new Date().toISOString() && claim.status === "Requested");
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

onBeforeMount(async () => {
  await updateClaims();
});
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
      <p v-if="filteredClaims.length === 0 && props.category === 'pending'">You have no pending claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'completed'">You have no completed claims!</p>
      <p v-if="filteredClaims.length === 0 && props.category === 'expired'">You have no expired claims!</p>

      <article v-for="claim in filteredClaims" :key="claim._id" class="claim-item">
        <ClaimComponent v-if="currentClaim?._id !== claim._id" :claim="claim" :category="props.category" @refreshClaims="updateClaims" />
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
  height: 160px;
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
