<script setup lang="ts">
import { defineEmits } from "vue";

const props = defineProps(["isVisible"]);
const emit = defineEmits(["confirm", "cancel"]);

const onConfirm = () => {
  emit("confirm");
};

const onCancel = () => {
  emit("cancel");
};
</script>

<template>
  <div class="modal-overlay" v-if="props.isVisible">
    <div class="modal">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete this message?</p>
      <button class="delete" @click="onConfirm">Delete</button>
      <button @click="onCancel">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.delete {
  background-color: var(--red);
  color: white;
  border-color: transparent;
}
.delete:hover {
  background-color: darkred;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

button {
  margin: 5px;
}
</style>
