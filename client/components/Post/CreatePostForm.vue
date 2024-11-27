<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const food_name = ref("");
const qty = ref(1);
const expiration_time = ref("");
const tags = ref("");
const emit = defineEmits(["refreshPosts", "closeCreatePost"]);

const createPost = async (food_name: string, quantity: number, expiration_time: string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { food_name: food_name, quantity: quantity, expiration_time: expiration_time },
    });
  } catch {
    return;
  }
  emit("refreshPosts");
  emit("closeCreatePost");
  emptyForm();
};

const emptyForm = () => {
  food_name.value = "";
  qty.value = 1;
  expiration_time.value = "";
  tags.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(food_name, qty, expiration_time)">
    <h2>List a Meal</h2>
    <div class="form-group">
      <label for="food_name">Food Name</label>
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
      <label for="tags">Tags</label>
      <input type="text" id="tags" v-model="tags" placeholder="Tags (e.g., vegan, spicy)" />
    </div>
    <div class="create-post-buttons">
      <button class="create-post-button" type="submit">Post</button>
      <button class="close-post-button" @click="emit('closeCreatePost')">Close</button>
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
