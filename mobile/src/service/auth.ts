// import { Alert } from "react-native";
// import axios from "axios";

// import { useUserStore } from "@/store/userStore";
// import { useRiderStore } from "@/store/riderStore";
// import { tokenStorage } from "@/store/storage";
// import { resetAndNavigate } from "@/utils/Helpers";
// import { BASE_URL } from "./config";

// export const signin = async (
//   payload: {
//     role: "customer" | "rider";
//     phone: string;
//   },
//   updateAccessToken: () => void
// ) => {
//   const { setUser } = useUserStore.getState();
//   const { setUser: setRider } = useRiderStore.getState();

//   try {
//     const res = await axios.post(`${BASE_URL}/auth/signin`, payload);

//     const { user, access_token, refresh_token } = res.data;

//     if (typeof access_token !== "string" || typeof refresh_token !== "string") {
//       throw new Error("Invalid token types received from server.");
//     }

//     tokenStorage.set("access_token", access_token);
//     tokenStorage.set("refresh_token", refresh_token);

//     if (user.role === "customer") {
//       setUser(user);
//       resetAndNavigate("/customer/home");
//     } else {
//       setRider(user);
//       resetAndNavigate("/rider/home");
//     }

//     updateAccessToken();
//   } catch (error: any) {
//     console.error(
//       "Sign-in error:",
//       error?.response?.data?.msg || error.message
//     );
//     Alert.alert("Login Error", "Something went wrong. Please try again.");
//   }
// };

// export const logout = async (disconnect?: () => void) => {
//   if (disconnect) {
//     disconnect();
//   }

//   const { clearData } = useUserStore.getState();
//   const { clearRiderData } = useRiderStore.getState();
//   clearData();
//   clearRiderData();

//   tokenStorage.delete("access_token");
//   tokenStorage.delete("refresh_token");

//   resetAndNavigate("/role");
// };

import { Alert } from "react-native";
import axios from "axios";

import { useUserStore } from "@/store/userStore";
import { useRiderStore } from "@/store/riderStore";
import { tokenStorage } from "@/store/storage";
import { resetAndNavigate } from "@/utils/Helpers";
import { BASE_URL } from "./config";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const signin = async (
  payload: {
    role: "customer" | "rider";
    phone: string;
  },
  updateAccessToken: () => void
) => {
  const { setUser } = useUserStore.getState();
  const { setUser: setRider } = useRiderStore.getState();

  try {
    const res = await axios.post(`${BASE_URL}/auth/signin`, payload);

    const { user, access_token, refresh_token } = res.data;

    if (typeof access_token !== "string" || typeof refresh_token !== "string") {
      throw new Error("Invalid token types received from server.");
    }

    tokenStorage.set(ACCESS_TOKEN_KEY, access_token);
    tokenStorage.set(REFRESH_TOKEN_KEY, refresh_token);

    if (user.role === "customer") {
      setUser(user);
      resetAndNavigate("/customer/home");
    } else {
      setRider(user);
      resetAndNavigate("/rider/home");
    }

    updateAccessToken();
  } catch (error: any) {
    console.error(
      "Sign-in error:",
      error?.response?.data?.msg || error.message
    );
    Alert.alert("Login Error", "Something went wrong. Please try again.");
  }
};

export const logout = async (disconnect?: () => void) => {
  if (disconnect) {
    disconnect();
  }

  const { clearData } = useUserStore.getState();
  const { clearRiderData } = useRiderStore.getState();
  clearData();
  clearRiderData();

  tokenStorage.delete(ACCESS_TOKEN_KEY);
  tokenStorage.delete(REFRESH_TOKEN_KEY);

  resetAndNavigate("/role");
};
