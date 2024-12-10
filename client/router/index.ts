import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import AvailableClaimsView from "../views/AvailableClaimsView.vue";
import ClaimView from "../views/ClaimView.vue";
import DeliveryView from "../views/DeliveryView.vue";
import RecipientFeedView from "../views/Feeds/RecipientFeedView.vue";
import RestaurantHomeView from "../views/Feeds/RestaurantHomeView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MessageView from "../views/MessageView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import OrderTrackerView from "../views/OrderTrackerView.vue";
import DonorRegistrationView from "../views/Registration/DonorRegistrationView.vue";
import RecipientRegistrationView from "../views/Registration/RecipientRegistrationView.vue";
import VolunteerRegistrationView from "../views/Registration/VolunteerRegistrationView.vue";
import SettingView from "../views/SettingView.vue";
import WelcomeView from "../views/WelcomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
      meta: { requiresAuth: true },
      beforeEnter: (to, from) => {
        const { isDonor, isRecipient, isVolunteer } = storeToRefs(useUserStore());
        if (isDonor.value) {
          return { name: "Restaurant-Food-Listings" };
        } else if (isRecipient.value) {
          return { name: "Recipient-Feed" };
        } else if (isVolunteer.value) {
          return { name: "AvailableClaims" };
        }
      },
    },
    {
      path: "/restaurant",
      name: "Restaurant-Food-Listings",
      component: RestaurantHomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/recipient",
      name: "Recipient-Feed",
      component: RecipientFeedView,
      meta: { requiresAuth: true },
    },
    {
      path: "/volunteer",
      name: "AvailableClaims",
      component: AvailableClaimsView,
      meta: { requiresAuth: true },
    },

    {
      path: "/mydeliveries",
      name: "MyDeliveries",
      component: DeliveryView,
      meta: { requiresAuth: true },
    },

    {
      path: "/order-tracker/:claimId",
      name: "Order-Tracker",
      component: OrderTrackerView,
      meta: { requiresAuth: true },
      props: true,
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
      beforeEnter: (to, from) => {
        const { isDonor, isRecipient, isVolunteer } = storeToRefs(useUserStore());
        if (isDonor.value) {
          return { name: "Restaurant-Food-Listings" };
        } else if (isRecipient.value) {
          return { name: "Recipient-Feed" };
        } else if (isVolunteer.value) {
          return { name: "AvailableClaims" };
        }
      },
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
      path: "/claims",
      name: "Claims",
      component: ClaimView,
      meta: { requiresAuth: true },
      beforeEnter: (to, from) => {
        const { isRecipient } = storeToRefs(useUserStore());
        if (!isRecipient.value) {
          return { name: "Home" };
        }
      },
    },
    {
      path: "/restaurant",
      name: "MyFoodListings",
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
      path: "/messages",
      name: "Messages",
      meta: { requiresAuth: true },
      component: MessageView,
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (!isLoggedIn.value) {
          return { name: "Home" };
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
  const { isLoggedIn, isVolunteer, isDonor, isRecipient } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Welcome" };
  }
  if (to.path === "/" && isLoggedIn.value) {
    if (isDonor.value) return { name: "Restaurant-Food-Listings" };
    if (isRecipient.value) return { name: "Recipient-Feed" };
    if (isVolunteer.value) return { name: "AvailableClaims" };
  }
  if (to.name === "Login" || to.name === "Recipient-Registration" || to.name === "Donor-Registration" || to.name === "Volunteer-Registration") {
    if (isLoggedIn.value) return { name: "Home" };
  }

  if (to.name === "Restaurant-Food-Listings" && !isDonor.value) {
    return { name: "Home" };
  }

  if (to.name === "Recipient-Feed" && !isRecipient.value) {
    return { name: "Home" };
  }

  if (to.name === "AvailableClaims" && !isVolunteer.value) {
    return { name: "Home" };
  }
});

export default router;
