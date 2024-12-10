<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from "vue";
import { fetchy } from "../../utils/fetchy";
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";

const { toast } = storeToRefs(useToastStore());
const props = defineProps(["post", "tags"]);
const food_name = ref(props.post.food_name);
const qty = ref(props.post.quantity);
const expiration_time = ref(props.post.expiration_time);
// const tags = ref(props.post.tags);
const tagToAdd = ref("");
const tagsToDisplay = ref([...props.tags]);
const emit = defineEmits(["editPost", "refreshPosts", "closeEditPost"]);

const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
});

const editPost = async (food_name: string, quantity: number, expiration_time: string, tags: string[]) => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { food_name: food_name, quantity: quantity, expiration_time: expiration_time, tags: tags } });
    // Delete all existing tags
    // Add back each tag in tags as a tag of the post
    if (new Date(props.post.expiration_time).toISOString() > new Date().toISOString()) {
      const dbTags = await fetchy(`/api/tags/${props.post._id}`, "GET");
      for (const tag of dbTags.tags) {
        await fetchy(`/api/tags/${props.post._id}/${tag}`, "DELETE");
      }
    }
  } catch {
    console.log("No tags to delete");
  }
  try {
    for (const tag of tags) {
      await fetchy(`/api/tags/${props.post._id}`, "POST", { body: { post: props.post._id, tag: tag } });
    }
  } catch {
    console.log("No tags to add");
  }
  emit("refreshPosts");
  emit("editPost", null);
  emit("closeEditPost");
};

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("closeEditPost");
  emit("refreshPosts");
};

const addTag = (tag: string) => {
  if (!validateTag(tag)) {
    return;
  }
  tagsToDisplay.value.push(tag.toLowerCase());
  tagToAdd.value = "";
};

const validateTag = (tag: string) => {
  if (tag.split(" ").length === 1 && tag !== "" && !tagsToDisplay.value.includes(tag.toLowerCase())) {
    toast.value = null;
    return true;
  } else if ((tag.split(" ").length !== 1 || tag == "") && tagsToDisplay.value.includes(tag.toLowerCase())) {
    toast.value = { message: "Tags must be one word and not have been added before.", style: "error" };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
    return false;
  } else if (tag.split(" ").length !== 1 || tag == "") {
    toast.value = { message: "Tags must be one word.", style: "error" };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
    return false;
  } else if (tagsToDisplay.value.includes(tag.toLowerCase())) {
    toast.value = { message: "Tags must not have been added before.", style: "error" };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
    return false;
  }
};

const removeTag = (tag: string) => {
  tagsToDisplay.value.splice(tagsToDisplay.value.indexOf(tag), 1);
};

// Watch for quantity changes, enforce a maximum quantity of 5
watch(qty, (newQty) => {
  if (newQty > 5) {
    toast.value = {
      message: "Maximum quantity allowed is 5.",
      style: "error",
    };
    setTimeout(() => {
      toast.value = null;
    }, 3000);

    // Reset quantity to the maximum value
    qty.value = 5;
  }
});
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
      <input type="number" id="qty" v-model="qty" min="1" max="6" placeholder="Quantity" required />
    </div>
    <div class="form-group">
      <label for="expiration_time">Expiration Date</label>
      <input type="datetime-local" id="expiration_time" v-model="expiration_time" :min="minDateTime" required />
    </div>

    <div class="form-group">
      <label for="tags">Tags (one word)</label>
      <div class="form-group-tag" style="display: flex; align-items: center; gap: 10px;">
        <input type="text" id="tags" v-model="tagToAdd" placeholder="Tags (e.g., vegan, spicy)" @keydown.enter.prevent="addTag(tagToAdd)"/>
        <button class="add-tag-button" type="button" @click="addTag(tagToAdd)">Add</button>
      </div>
    </div>

    <div class="form-group">
      <label for="tags">Current Tags:</label>
      <div class="tag-display" v-if="tagsToDisplay">
        <div class="tag-box" v-for="tag in tagsToDisplay">
          {{ tag }}
          <button type="button" @click="removeTag(tag)">X</button>
        </div>
      </div>
    </div>

    <div class="create-post-buttons">
      <button class="close-post-button"  @click="emit('closeEditPost')">Cancel</button>
      <button class="delete-post-button" type="button" @click="deletePost">Delete</button>
      <button class="save-post-button" type="submit">Save</button>
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

  .save-post-button{
    background-color: var(--pink);
  }

  .delete-post-button{
    background-color: var(--orange);
  }
}
</style>
