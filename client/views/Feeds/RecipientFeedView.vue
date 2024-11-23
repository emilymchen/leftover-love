<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn, isRecipient } = storeToRefs(useUserStore());
</script>

<template>
  <main class="main-container">
    <section v-if="isLoggedIn && isRecipient" class="listing-section">
      <div class="header-container">
        <h1>Delivery</h1>
      </div>
      <div class="spacer"></div>

      <PostListComponent />
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: left;
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
