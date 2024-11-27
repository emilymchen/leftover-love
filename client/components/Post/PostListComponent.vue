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
let posts = ref<Array<Record<string, any>>>([]);
let currentPost = ref<Record<string, any> | null>(null);
let searchAuthor = ref("");
let isCreatingPost = ref(false);
let isEditingPost = ref(false);

// State for toggle filter
const filterType = ref<"all" | "claimed" | "unclaimed">("all");
let postIdtoClaimStatus = new Map<string, boolean>();
let filteredPosts = ref<Array<Record<string, any>>>([]);

// Computed filtered posts
function filterPosts() {
  if (filterType.value === "claimed") {
    filteredPosts.value = posts.value.filter((post) => postIdtoClaimStatus.get(post._id));
  } else if (filterType.value === "unclaimed") {
    filteredPosts.value = posts.value.filter((post) => !postIdtoClaimStatus.get(post._id));
  } else {
    filteredPosts.value = posts.value;
  }
}

async function checkIfClaimed(postId: string) {
  let claim;
  try {
    claim = await fetchy(`/api/claims/${postId}`, "GET");
  } catch {
    return false;
  }
  return claim !== null;
}

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch {
    return;
  }
  searchAuthor.value = author ? author : "";
  if (isRecipient.value) {
    posts.value = postResults.filter((post: Record<string, any>) => post.expiration_time > new Date().toISOString());
  } else {
    posts.value = postResults;
  }
}

async function getAllAvailablePosts() {
  let postResults;
  try {
    postResults = await fetchy("/api/posts/non-expired-non-claimed", "GET");
  } catch {
    return;
  }
  posts.value = postResults;
}

function startEditing(post: Record<string, any>) {
  currentPost.value = post;
  isEditingPost.value = true;
}

async function updatePosts() {
  if (isDonor.value) {
    // If it's a donor, we only want to have them see their food listings
    await getPosts(currentUsername.value);
    for (const post of posts.value) {
      postIdtoClaimStatus.set(post._id, await checkIfClaimed(post._id));
    }
  } else if (isRecipient.value) {
    // If it's a recipient, we want them to see all the available non-claimed food listings
    await getAllAvailablePosts();
  }
  filterPosts();
  loaded.value = true;
}

async function claimPost(post: Record<string, any>) {
  try {
    await fetchy(`/api/claims/delivery`, "POST", { body: { post: post._id } });
  } catch {
    return;
  }
  await updatePosts();
}

async function claimPostForPickup(post: Record<string, any>) {
  try {
    await fetchy(`/api/claims/pickup`, "POST", { body: { post: post._id } });
  } catch {
    return;
  }
  await updatePosts();
}

onBeforeMount(async () => {
  await updatePosts();
  console.log(filteredPosts.value);
});
</script>
<template>
  <div class="posts-outer-container">
    <p v-if="!loaded">Loading...</p>

    <div v-if="isDonor" class="filter-buttons">
      <button
        :class="{ active: filterType === 'all' }"
        class="button-click"
        @click="
          () => {
            filterType = 'all';
            filterPosts();
          }
        "
      >
        All
      </button>
      <button
        :class="{ active: filterType === 'claimed' }"
        class="button-click"
        @click="
          () => {
            filterType = 'claimed';
            filterPosts();
          }
        "
      >
        Claimed
      </button>
      <button
        :class="{ active: filterType === 'unclaimed' }"
        class="button-click"
        @click="
          () => {
            filterType = 'unclaimed';
            filterPosts();
          }
        "
      >
        Unclaimed
      </button>
    </div>

    <section class="posts" v-if="loaded">
      <p v-if="filteredPosts.length === 0">No posts available!</p>
      <article v-if="isDonor" class="create-post-box" @click="isCreatingPost = true">
        <div class="create-post-content">
          <span class="plus-icon">+</span>
        </div>
      </article>

      <article v-for="post in filteredPosts" :key="post._id" class="post-item">
        <PostComponent v-if="!isEditingPost || currentPost?._id !== post._id" :post="post" @refreshPosts="updatePosts" @editPost="startEditing(post)" @claimPost="claimPost(post)" />
      </article>
    </section>

    <div v-if="isDonor && isCreatingPost" class="modal-background">
      <div class="modal">
        <CreatePostForm @refreshPosts="updatePosts" @closeCreatePost="isCreatingPost = false" />
      </div>
    </div>

    <div v-if="isDonor && isEditingPost" class="modal-background">
      <div class="modal">
        <EditPostForm
          :post="currentPost"
          @refreshPosts="updatePosts"
          @closeEditPost="
            isEditingPost = false;
            currentPost = null;
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.posts-outer-container {
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.posts {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
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
  padding: 16px;
  border-radius: 16px;
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
  width: 250px;
  height: 160px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.row {
  display: flex;
  position: fixed;

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
  position: fixed;
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
  position: fixed;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: -70px;
  margin-left: 400px;
  gap: 10px;
}
.button-click {
  background-color: var(--green);
  color: black;
  border: 2px solid var(--green);
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-click:hover {
  background-color: #e0e0e0;
}
.button-click.active {
  background-color: var(--lighter-green);
  color: black;
}
</style>
