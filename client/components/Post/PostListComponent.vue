<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isDonor, currentUsername, isRecipient } = storeToRefs(useUserStore());

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
  console.log(posts.value);
});
</script>

<template>
  <div class="posts-outer-container">
    <section class="posts" v-if="loaded">
      <article v-if="isDonor" class="create-post-box" @click="isCreatingPost = true">
        <div class="create-post-content">
          <span class="plus-icon">+</span>
        </div>
      </article>

      <article v-for="post in posts" :key="post._id" class="post-item">
        <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="updatePosts" @editPost="updateEditing" />
        <EditPostForm v-else :post="post" @refreshPosts="updatePosts" @editPost="updateEditing" />
      </article>
    </section>

    <div v-if="isCreatingPost" class="modal-background">
      <div class="modal">
        <CreatePostForm @refreshPosts="updatePosts" @closeCreatePost="isCreatingPost = false" />
      </div>
    </div>

    <p v-else-if="!posts.length && loaded">No posts found</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.posts-outer-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1em;
  margin-top: 1em;
  flex-grow: 1;
}

.create-post-box {
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

.create-post-content {
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 400px;
  max-width: 75vw;
}

.plus-icon {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
}
</style>
