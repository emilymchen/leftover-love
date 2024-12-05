<script setup lang="ts">
import { defineEmits, ref, computed } from "vue";
import { fetchy } from "../../utils/fetchy";
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";

const { toast } = storeToRefs(useToastStore());
const food_name = ref("");
const qty = ref(1);
const expiration_time = ref("");
const tag = ref("");
let tags = ref(new Array<string>());
const emit = defineEmits(["refreshPosts", "closeCreatePost"]);

const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
});

const createPost = async (food_name: string, quantity: number, expiration_time: string) => {
  try {
    const created = await fetchy("/api/posts", "POST", {
      body: { food_name: food_name, quantity: quantity, expiration_time: expiration_time },
    });
    const postId = created.post._id;
    for (const tag of tags.value) {
      await fetchy(`/api/tags/${postId}`, "POST", {
        body: { post: postId, tag: tag },
      });
    }
  } catch {
    return;
  }
  emit("refreshPosts");
  emit("closeCreatePost");
  emptyForm();
};

const addTag = (tag: string) => {
  if (!validateTag(tag)) {
    return;
  }
  
  tags.value.push(tag);
  emptyTags();
};

const validateTag = (tag: string) => {
  if (tag.split(" ").length === 1 && tag !== "" && !tags.value.includes(tag)) {
    toast.value = null;
    return true;
  } else {
    toast.value = { message: "Tags must be one word and not have been added before.", style: "error" };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
    return false;
  }
};

const removeTag = (tag: string) => {
  tags.value.splice(tags.value.indexOf(tag), 1);
};

const emptyForm = () => {
  food_name.value = "";
  qty.value = 1;
  expiration_time.value = "";
  tag.value = "";
};

const emptyTags = () => {
  tag.value = "";
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
      <input type="datetime-local" id="expiration_time" :min="minDateTime" v-model="expiration_time" required />
    </div>
    <div class="form-group">
      <label for="tag">Tags (one word)</label>
      <div class="form-group-tag" style="display: flex; align-items: center; gap: 10px;">
        <input type="text" id="tag" v-model="tag" placeholder="Tags (e.g., vegan, spicy)" style="flex: 1;" />
        <button class="add-tag-button" type="button" @click="addTag(tag)">add</button>
      </div>
    </div>

    <div class="form-group">
      <label for="tags">Current Tags:</label>
      <div class="tag-display">
        <div class="tag-box" v-for="tag in tags">
          {{ tag }}
          <button type="button" @click="removeTag(tag)">X</button>
        </div>
      </div>
    </div>

    <div class="create-post-buttons">
      <button class="create-post-button" type="submit">Post</button>
      <button class="close-post-button" type="button" @click="emit('closeCreatePost')">Close</button>
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
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.form-group-tag {
  display: flex;
  align-items: center;
  gap: 10px; 
}

.form-group-tag input {
  flex: 1; 
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
