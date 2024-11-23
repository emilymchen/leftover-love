<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, currentRole, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
      <h2 v-if="isLoggedIn">You are a {{ currentRole }}!</h2>
    </section>
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
h2 {
  text-align: center;
  font-style: italic;
}
</style>
