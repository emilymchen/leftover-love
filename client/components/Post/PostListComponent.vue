<script setup lang="ts">
import ClaimConfirmationForm from "@/components/Claim/ClaimConfirmationForm.vue";
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
let tags = new Map<string, any>();
let currentPost = ref<Record<string, any> | null>(null);
let searchAuthor = ref("");
let isCreatingPost = ref(false);
let isEditingPost = ref(false);
let isClaimingPost = ref(false);
let tagToAdd = ref("");

// State for toggle filter
let suggestedTags = ref<Array<string>>(["dairy", "gluten", "vegan", "vegetarian", "gluten-free", "dairy-free", "meat"]);
const filterType = ref<"all" | "claimed" | "unclaimed">("all");
let postIdtoClaimStatus = new Map<string, boolean>();
let filteredPosts = ref<Array<Record<string, any>>>([]);

let filterTags = ref<Array<string>>([]);

// Computed filtered posts
function filterPosts() {
  if (filterType.value === "claimed") {
    filteredPosts.value = posts.value.filter((post) => postIdtoClaimStatus.get(post._id));
  } else if (filterType.value === "unclaimed") {
    filteredPosts.value = posts.value.filter((post) => !postIdtoClaimStatus.get(post._id));
  } else {
    filteredPosts.value = posts.value;
  }

  if (filterTags.value.length > 0) {
    filteredPosts.value = filteredPosts.value.filter((post) => hasAllFilterTags(post));
  }
}
let selectedTag = ref<string | null>(null);

const addTagFromDropdown = (tag: string | null) => {
  if (tag && !filterTags.value.includes(tag)) {
    filterTags.value.push(tag);
    // Remove the added tag from the suggestedTags list
    suggestedTags.value = suggestedTags.value.filter((suggestedTag) => suggestedTag !== tag);
    selectedTag.value = null; // Clear the dropdown selection
    filterPosts();
  }
};

const removeTag = (tag: string) => {
  // Remove the tag from filterTags
  filterTags.value.splice(filterTags.value.indexOf(tag), 1);
  // Add the removed tag back to the suggestedTags list
  if (!suggestedTags.value.includes(tag)) {
    suggestedTags.value.push(tag);
  }
  filterPosts();
};

function hasAllFilterTags(post: Record<string, any>) {
  const postTags = tags.get(post._id);
  if (!postTags) {
    return false;
  }

  for (const tag of filterTags.value) {
    if (!postTags.tags.includes(tag)) {
      return false;
    }
  }

  return true;
}

const addTag = (tag: string) => {
  if (tag.split(" ").length === 1 && tag !== "" && !filterTags.value.includes(tag)) {
    filterTags.value.push(tag);
    tagToAdd.value = "";
    suggestedTags.value = suggestedTags.value.filter((suggestedTag) => suggestedTag !== tag);

    filterPosts();
  } else {
    throw new Error("Tags must be one word that has not already been added");
  }
};


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

async function getPostTags(postId: string, expirationTime: string) {
  try {
    if (new Date(expirationTime).toISOString() > new Date().toISOString()) {
      return await fetchy(`/api/tags/${postId}`, "GET");
    }
    return [];
  } catch {
    return false;
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
  console.log("Updating posts");
  if (isDonor.value) {
    // If it's a donor, we only want to have them see their food listings
    await getPosts(currentUsername.value);
    for (const post of posts.value) {
      postIdtoClaimStatus.set(post._id, await checkIfClaimed(post._id));
      tags.set(post._id, await getPostTags(post._id, post.expiration_time));
    }
  } else if (isRecipient.value) {
    // If it's a recipient, we want them to see all the available non-claimed food listings
    await getAllAvailablePosts();
    for (const post of posts.value) {
      tags.set(post._id, await getPostTags(post._id, post.expiration_time));
    }
  }
  filterPosts();
  loaded.value = true;
}

function startClaiming(post: Record<string, any>) {
  currentPost.value = post;
  isClaimingPost.value = true;
}

onBeforeMount(async () => {
  await updatePosts();
  console.log(filteredPosts.value);
});
</script>


<template>
  <div class="posts-outer-container">
    <p v-if="!loaded">Loading...</p>

    <div v-if="isDonor" class="header-container">
      <h1>My Food Listings</h1>

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
      <div class="spacer"></div>
    </div>

    
    <div class="recipient-tag-filter" v-if="isRecipient">
      <div class="filter-search-bar">
        <input type="text" id="tags" v-model="tagToAdd" placeholder="Input tags to filter by (one word)" />
          
          <select v-model="selectedTag" @change="addTagFromDropdown(selectedTag)">
            <option value="" disabled>Select a tag</option>
            <option v-for="tag in suggestedTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
        </select>
      </div>

      <div class="add-filter">
        <button class="add-tag-button" type="button" @click="addTag(tagToAdd)" >
            Add Tag
          </button>
      </div>

      <!-- Display Added Tags -->
      <div class="tag-display">
        <div class="tag-box" v-for="tag in filterTags" :key="tag">
          {{ tag }}
          <button type="button" @click="removeTag(tag)" aria-label="Remove tag">
            X
          </button>
        </div>
      </div>
    </div>




    <section class="posts" v-if="loaded">
      <p v-if="filteredPosts.length === 0">No posts available!</p>
      <article v-if="isDonor" class="create-post-box" @click="isCreatingPost = true">
        <div class="create-post-content">
          <span class="plus-icon">+</span>
        </div>
      </article>

      <article v-for="post in filteredPosts" :key="post._id" class="post-item">
        <PostComponent
          v-if="!isEditingPost || currentPost?._id !== post._id"
          :post="post"
          :tags="tags.get(post._id)"
          @refreshPosts="updatePosts"
          @editPost="startEditing(post)"
          @claimPost="startClaiming(post)"
        />
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
          :tags="tags.get(currentPost?._id).tags ?? []"
          @refreshPosts="updatePosts"
          @closeEditPost="
            isEditingPost = false;
            currentPost = null;
          "
        />
      </div>
    </div>

    <div v-if="isRecipient && isClaimingPost" class="modal-background">
      <div class="modal">
        <ClaimConfirmationForm
          :post="currentPost"
          @refreshPosts="updatePosts"
          @closeClaimPost="
            isClaimingPost = false;
            currentPost = null;
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  flex-flow: row nowrap;

  h1 {
    text-align: left;
    color: var(--orange);
    font-size: 2em;
    margin: 0;
    font-weight: 900;
    padding: 0em 2em;
  }
}

.spacer {
  height: 2em;
}

.recipient-tag-filter {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  input {
    width: 90%;
    margin: 16px;
    border: none;
    background-color: transparent;
    outline: none;
  }

  .filter-search-bar {
    display: flex;
    width: 300px;
    flex-flow: row nowrap;
    justify-content: space-between;
    border: 2px solid var(--darker-green);
    border-radius: 16px;
  }

  input::placeholder {
    color: var(--darker-green);
    opacity: 60%;
  }

  .add-tag-button {
    background-color: transparent;
    color: var(--light-beige);
    border: none;
  }

  .tag-display {
    margin: 8px;
    max-width: 500px;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;

    button {
      padding: 0px;
      color: black;
      background-color: transparent;
      border: none;
      margin: 1px;
    }
  }

  .tag-box {
    background-color: var(--green);
    padding: 4px 8px;
    border-radius: 16px;
    margin: 8px;
    color: var(--darker-green);
  }
}

.posts-outer-container {
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.posts {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  margin-top: 3em;
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

.post-item {
  position: relative;
}

article {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  background-color: var(--light-beige);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  box-sizing: border-box;
  overflow: visible; 
  align-items: stretch; 
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
  flex-direction: row;
  justify-content: center;
  align-items: center;
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

select {
  background-color: transparent;
  border: transparent;
  width: 14px;
  flex-flow: row nowrap;
  justify-content: space-between;
  border: transparent;
  border-radius: 16px;
  margin-right: 13px;
}

select:focus {
  outline: none;
}

.add-filter {
  display: flex;
  background-color: var(--pink);
  font-size: 12px;
  margin-top: 10px;
  flex-flow: row nowrap;
  justify-content: space-between;
  border-radius: 16px;
}

</style>
