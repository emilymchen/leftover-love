<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn, isVolunteer } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <div class="header-container">
      <h1 v-if="isLoggedIn && isVolunteer">My Deliveries</h1>
    </div>

    <div class="header-container">
      <h1>Delivery Requests</h1>
    </div>
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
