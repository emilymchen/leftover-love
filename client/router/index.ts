import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import RestaurantHomeView from "../views/Feeds/RestaurantHomeView.vue";
import RecipientFeedView from "../views/Feeds/RecipientFeedView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import DonorRegistrationView from "../views/Registration/DonorRegistrationView.vue";
import RecipientRegistrationView from "../views/Registration/RecipientRegistrationView.vue";
import VolunteerRegistrationView from "../views/Registration/VolunteerRegistrationView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
      meta: { requiresAuth: true },
      beforeEnter: (to, from) => {
        const { isRecipient, isDonor } = storeToRefs(useUserStore());
        if (isDonor.value) {
          return { name: "Restaurant Food Listings" };
        } else if (isRecipient.value) {
          return { name: "Recipient Feed" };
        }
      },
    },
    {
      path: "/restaurant",
      name: "Restaurant Food Listings",
      component: RestaurantHomeView,
      meta: { requiresAuth: true },
      beforeEnter: (to, from) => {
        const { isDonor } = storeToRefs(useUserStore());
        if (!isDonor.value) {
          return { name: "Home" };
        }
      },
    },
    {
      path: "/recipient",
      name: "Recipient Feed",
      component: RecipientFeedView,
      meta: { requiresAuth: true },
      beforeEnter: (to, from) => {
        const { isRecipient } = storeToRefs(useUserStore());
        if (!isRecipient.value) {
          return { name: "Home" };
        }
      },
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/welcome",
      name: "Welcome",
      component: WelcomeView,
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/register-recipient",
      name: "Recipient-Registration",
      component: RecipientRegistrationView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/register-donor",
      name: "Donor-Registration",
      meta: { requiresAuth: false },
      component: DonorRegistrationView,
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/register-volunteer",
      name: "Volunteer-Registration",
      meta: { requiresAuth: false },
      component: VolunteerRegistrationView,
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Welcome" };
  }
});

export default router;
