<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const food_item = ref(props.post.food_item);
const qty = ref(props.post.quantity);
const expiration_time = ref(props.post.expiration_time);
const tags = ref(props.post.tags);
const emit = defineEmits(["editPost", "refreshPosts", "closeEditPost"]);

const editPost = async (food_item: string, quantity: number, expiration_time: string, tags: string[]) => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { food_item: food_item, quantity: quantity, expiration_time: expiration_time, tags: tags } });
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
</script>

<template>
  <form @submit.prevent="editPost(food_item, qty, expiration_time, tags)">
    <h2>Edit Your Meal</h2>
    <div class="form-group">
      <label for="food_item">Food Item</label>
      <input id="food_item" v-model="food_item" placeholder="Unnamed Food" required />
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
      <label for="tags">Tags</label>
      <input type="text" id="tags" v-model="tags" placeholder="Tags (e.g., vegan, spicy)" />
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
