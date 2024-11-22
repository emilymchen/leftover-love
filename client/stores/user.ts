import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");

    const currentRole = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
      currentRole.value = "";
    };

    const registerRecipient = async (username: string, password: string, role: string) => {
      await fetchy("/api/users-recipient", "POST", {
        body: { username, password, role },
      });
    };

    const registerDonor = async (username: string, password: string, role: string, location: string) => {
      await fetchy("/api/users-donor", "POST", {
        body: { username, password, role, location },
      });
    };

    const registerVolunteer = async (username: string, password: string, role: string) => {
      await fetchy("/api/users-volunteer", "POST", {
        body: { username, password, role },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, role } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentRole.value = role;
      } catch {
        currentUsername.value = "";
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
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      currentRole,
      isLoggedIn,
      registerRecipient,
      registerDonor,
      registerVolunteer,
      loginUser,
      updateSession,
      logoutUser,
      updateUserUsername,
      updateUserPassword,
      deleteUser,
    };
  },
  { persist: true },
);
