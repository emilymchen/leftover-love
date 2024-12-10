import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");
    const currentAddress = ref("");
    const currentRole = ref("");
    const currentPasswordLength = ref(0);

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const isDonor = computed(() => currentRole.value === "Donor");
    const isRecipient = computed(() => currentRole.value === "Recipient");
    const isVolunteer = computed(() => currentRole.value === "Volunteer");

    const resetStore = () => {
      currentUsername.value = "";
      currentRole.value = "";
      currentAddress.value = "";
      currentPasswordLength.value = 0;
    };

    const createUser = async (username: string, password: string, role: string, location: string) => {
      await fetchy("/api/users", "POST", {
        body: { username, password, role, location },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, role, location } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentRole.value = role;
        currentAddress.value = location;
      } catch {
        currentUsername.value = "";
        currentRole.value = "";
        currentAddress.value = "";
      }

      try {
        const length = await fetchy("/api/user-password", "GET", { alert: false });
        currentPasswordLength.value = length;
      } catch {
        currentPasswordLength.value = 0;
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUserUsername = async (username: string) => {
      await fetchy("/api/users/username", "PATCH", { body: { username } });
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
      await fetchy("/api/users/password", "PATCH", { body: { currentPassword, newPassword } });
      await updateSession();
    };

    const updateUserAddress = async (address: string) => {
      await fetchy("/api/users/address", "PATCH", { body: { address } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      currentRole,
      currentAddress,
      currentPasswordLength,
      isLoggedIn,
      isDonor,
      isRecipient,
      isVolunteer,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUserUsername,
      updateUserPassword,
      updateUserAddress,
      deleteUser,
    };
  },
  { persist: true },
);
