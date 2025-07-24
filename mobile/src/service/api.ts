// import axios from "axios";
// import { BASE_URL } from "./config";
// import { tokenStorage } from "@/store/storage";
// import { logout } from "./auth";

// export const refresh_tokens = async () => {
//   try {
//     const refreshToken = tokenStorage.getString("refreshToken");
//     const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
//       refreshToken: refreshToken,
//     });

//     const new_accessToken = response.data.accessToken;
//     const new_refreshToken = response.data.refreshToken;

//     tokenStorage.set("accessToken", new_accessToken);
//     tokenStorage.set("refreshToken", new_refreshToken);
//     return new_accessToken;
//   } catch (error) {
//     console.log("REFRESH TOKEN ERROR");
//     logout();
//   }
// };

// export const apiAxios = axios.create({
//   baseURL: BASE_URL,
// });

// apiAxios.interceptors.request.use(async (config) => {
//   const accessToken = tokenStorage.getString("accessToken");
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// apiAxios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response && error.response.status === 401) {
//       try {
//         const newAccessToken = await refresh_tokens();
//         if (newAccessToken) {
//           error.config.headers.Authorization = `Bearer ${newAccessToken}`;
//           return axios(error.config);
//         }
//       } catch (error) {
//         console.error("Error refreshing token:");
//       }
//     }

//     return Promise.reject(error);
//   }
// );

import axios from "axios";
import { BASE_URL } from "./config";
import { tokenStorage } from "@/store/storage";
import { logout } from "./auth";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const refresh_tokens = async () => {
  try {
    const refreshToken = tokenStorage.getString(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken;

    tokenStorage.set(ACCESS_TOKEN_KEY, newAccessToken);
    tokenStorage.set(REFRESH_TOKEN_KEY, newRefreshToken);

    return newAccessToken;
  } catch (error) {
    console.log("REFRESH TOKEN ERROR");
    logout();
    return null;
  }
};

export const apiAxios = axios.create({
  baseURL: BASE_URL,
});

apiAxios.interceptors.request.use(async (config) => {
  const accessToken = tokenStorage.getString(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      const newAccessToken = await refresh_tokens();

      if (newAccessToken) {
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(error.config);
      }
    }

    return Promise.reject(error);
  }
);
