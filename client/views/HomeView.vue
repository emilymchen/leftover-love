<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref, onBeforeMount } from "vue";
import { fetchy } from "@/utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const userRole = ref("");
const loaded = ref(false);

const getUserRole = async () => {
  let role;
  try {
    role = await fetchy("/api/user-role", "GET");
    userRole.value = role;
    console.log(role);
  } catch (error) {
    console.error("Error fetching user role: ", error);
  }
};

onBeforeMount(async () => {
  await getUserRole();
  loaded.value = true;
});
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
      <h1 v-if="loaded">role: {{ userRole }}</h1>
    </section>
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
