<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn, isDonor } = storeToRefs(useUserStore());
</script>

<template>
  <main class="main-container">
    <section v-if="isLoggedIn && isDonor" class="listing-section">
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
  padding: 0em 2em;
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
