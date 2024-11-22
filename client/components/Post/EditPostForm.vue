<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const food_item = ref(props.post.food_item);
const qty = ref(props.post.quantity);
const expiration_time = ref(props.post.expiration_time);
const tags = ref(props.post.tags);
const emit = defineEmits(["editPost", "refreshPosts"]);

const editPost = async (food_item: string, quantity: number, expiration_time: string, tags: string[]) => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { food_item: food_item, quantity: quantity, expiration_time: expiration_time, tags: tags } });
  } catch (e) {
    return;
  }
  emit("editPost");
  emit("refreshPosts");
};
const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
</script>

<template>
  <form @submit.prevent="editPost(food_item, qty, expiration_time, tags)">
    <h2>Edit Your Meal</h2>
    <div class="form-group">
      <label for="food_item">Food Item</label>
      <textarea id="food_item" v-model="food_item" placeholder="Unnamed Food" required></textarea>
    </div>
    <div class="form-group">
      <label for="qty">Quantity</label>
      <input type="number" id="qty" v-model="qty" min="1" placeholder="Quantity" required />
    </div>
    <div class="form-group">
      <label for="expiration_time">Expiration Date</label>
      <input type="date" id="expiration_time" v-model="expiration_time" required />
    </div>
    <div class="form-group">
      <label for="tags">Tags</label>
      <input type="text" id="tags" v-model="tags" placeholder="Tags (e.g., vegan, spicy)" />
    </div>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('editPost')">Cancel</button></li>
      </menu>
      <button class="button-error btn-small pure-button" @click="deletePost">Delete</button>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
