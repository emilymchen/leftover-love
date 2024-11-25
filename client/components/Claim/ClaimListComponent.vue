<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import ClaimComponent from "../../components/Claim/ClaimComponent.vue";

// const { isDonor, currentUsername, isRecipient } = storeToRefs(useUserStore());
const props = defineProps(["category"]);

const loaded = ref(false);
let claims = ref<Array<Record<string, string>>>([]);
let currentClaim = ref<Record<string, any> | null>(null);

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

async function updateClaims() {
  await getClaims();
  loaded.value = true;
}

onBeforeMount(async () => {
  await updateClaims();
});
</script>

<template>
  <div class="claims-outer-container">
    <p v-if="!loaded">Loading...</p>
    <section class="claims" v-if="loaded">
      <p v-if="claims.length === 0 && props.category === 'pending'">You have no pending claims!</p>
      <p v-if="claims.length === 0 && props.category === 'completed'">You have no completed claims!</p>
      <p v-if="claims.length === 0 && props.category === 'expired'">You have no expired claims!</p>

      <article v-for="claim in claims" :key="claim._id" class="claim-item">
        <ClaimComponent v-if="currentClaim?._id !== claim._id" :claim="claim" :category="props.category" @refreshClaims="updateClaims" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.claims-outer-container {
  margin-bottom: 50px;
}
/* .claims-outer-container {
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
} */

.claims {
  display: grid;
  grid-template-columns: repeat(4, minmax(250px, 1fr));
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
  width: 200px;
  height: 150px;
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
</style>
