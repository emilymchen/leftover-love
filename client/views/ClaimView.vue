<script setup lang="ts">
import ClaimListComponent from "@/components/Claim/ClaimListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, currentRole, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <div class="header-container">
      <h1 v-if="isLoggedIn">Pending claims</h1>
    </div>
    <ClaimListComponent :category="'pending'" />

    <h1 v-if="isLoggedIn">Completed claims</h1>

    <ClaimListComponent :category="'completed'" />

    <h1 v-if="isLoggedIn">Expired claims</h1>

    <ClaimListComponent :category="'expired'" />
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
