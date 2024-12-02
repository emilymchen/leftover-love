<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post", "tags"]);
const food_name = ref(props.post.food_name);
const qty = ref(props.post.quantity);
const expiration_time = ref(props.post.expiration_time);
// const tags = ref(props.post.tags);
const tagToAdd = ref("");
const tagsToDisplay = ref([...props.tags]);
const emit = defineEmits(["editPost", "refreshPosts", "closeEditPost"]);

const editPost = async (food_name: string, quantity: number, expiration_time: string, tags: string[]) => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { food_name: food_name, quantity: quantity, expiration_time: expiration_time, tags: tags } });
    const dbTags = await fetchy(`/api/tags/${props.post._id}`, "GET");
    for (const tag of dbTags.tags) {
      await fetchy(`/api/tags/${props.post._id}/${tag}`, "DELETE");
    }
    for (const tag of tags) {
      await fetchy(`/api/tags/${props.post._id}`, "POST", { body: { post: props.post._id, tag: tag } });
    }
    // Delete all existing tags
    // Add back each tag in tags as a tag of the post
  } catch {
    return;
  }
  emit("editPost", null);
  emit("refreshPosts");
  emit("closeEditPost");
};
const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
  emit("closeEditPost");
};
const addTag = (tag: string) => {
  if ((tag.split(" ").length === 1) && (tag !== '') && (!tagsToDisplay.value.includes(tag))) {
    tagsToDisplay.value.push(tag);
    tagToAdd.value = "";
  }
  else {
    throw new Error("Tags must be one word that has not already been added");
  }
}
const removeTag = (tag: string) => {
  tagsToDisplay.value.splice(tagsToDisplay.value.indexOf(tag), 1);
}
</script>

<template>
  <form @submit.prevent="editPost(food_name, qty, expiration_time, tagsToDisplay)">
    <h2>Edit Your Meal</h2>
    <div class="form-group">
      <label for="food_name">Food Item</label>
      <input id="food_name" v-model="food_name" placeholder="Unnamed Food" required />
    </div>
    <div class="form-group">
      <label for="qty">Quantity</label>
      <input type="number" id="qty" v-model="qty" min="1" max="5" placeholder="Quantity" required />
    </div>
    <div class="form-group">
      <label for="expiration_time">Expiration Date</label>
      <input type="datetime-local" id="expiration_time" v-model="expiration_time" required />
    </div>
    <div class="form-group">
      <label for="tags">Tags (one word)</label>
      <input type="text" id="tags" v-model="tagToAdd" placeholder="Tags (e.g., vegan, spicy)" />
    </div>
    <button class="add-tag-button" type="button" @click="addTag(tagToAdd)">+</button >
    <div class="tag-display" v-if="tagsToDisplay">
      <div class="tag-box" v-for="tag in tagsToDisplay">
        {{ tag }}
        <button type="button" @click="removeTag(tag)">X</button>
      </div>
    </div>
    <div class="create-post-buttons">
      <button class="btn-small pure-button-primary pure-button" type="submit">Save</button>
      <button class="btn-small pure-button" @click="emit('closeEditPost')">Cancel</button>
      <button class="button-error btn-small pure-button" @click="deletePost">Delete</button>
    </div>
  </form>
</template>

<style scoped>
form {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: black;
  max-width: 30em;
  background: white;
  padding: 50px;
}

.add-tag-button {
  align-self: center;
  padding: 0.5em 1.5em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tag-display {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
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

h2 {
  margin-bottom: 0.5em;
  font-size: 1.5em;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea,
input {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

textarea {
  resize: none;
  height: 6em;
}

button {
  align-self: center;
  padding: 0.5em 1.5em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-post-buttons {
  display: flex;
  flex-flow: row, nowrap;
  justify-content: center;

  button {
    margin: 8px;
  }

  .create-post-button {
    background-color: var(--pink);
  }

  .close-post-button {
    background-color: var(--light-grey);
  }
}
</style>
