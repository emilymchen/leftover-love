<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn, isDonor, currentUsername, isRecipient } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let isCreatingPost = ref(false);

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

async function updatePosts() {
  if (isDonor) {
    // If it's a donor, we only want to have them see their food listings
    await getPosts(currentUsername.value);
  } else if (isRecipient) {
    // If it's a recipient, we want them to see all the available non-claimed food listings
    // TODO: we need to replace this endpoint later
    await getPosts();
  }
  loaded.value = true;
}

onBeforeMount(async () => {
  await updatePosts();
});
</script>

<template>
  <section v-if="isLoggedIn && isDonor">
    <button class="expand-create-post-button" @click="isCreatingPost = true" v-if="!isCreatingPost">Create a post</button>
    <CreatePostForm @refreshPosts="updatePosts" @closeCreatePost="isCreatingPost = false" v-else />
  </section>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="updatePosts" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @refreshPosts="updatePosts" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
}

.posts {
  padding: 1em;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.expand-create-post-button {
  background-color: var(--pink);
  border-style: none;
  border-radius: 8px;
}
</style>
