import { View, Image, Alert, Text } from "react-native";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { jwtDecode } from "jwt-decode";

import { commonStyles } from "@/styles/commonStyles";
import { splashStyles } from "@/styles/splashStyles";
import CustomText from "@/components/shared/customText";
import { useUserStore } from "@/store/userStore";
import { tokenStorage } from "@/store/storage";
import { resetAndNavigate } from "@/utils/Helpers";
import { refresh_tokens } from "@/service/api";
import { logout } from "@/service/auth";

interface DecodedToken {
  exp: number;
}

const Main = () => {
  const [fontsLoaded] = useFonts({
    Bold: require("@/assets/fonts/NotoSans-Bold.ttf"),
    Regular: require("@/assets/fonts/NotoSans-Regular.ttf"),
    Medium: require("@/assets/fonts/NotoSans-Medium.ttf"),
    Light: require("@/assets/fonts/NotoSans-Light.ttf"),
    Semibold: require("@/assets/fonts/NotoSans-SemiBold.ttf"),
  });

  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (!fontsLoaded) return;

    const checkTokensAndNavigate = async () => {
      const accessToken = tokenStorage.getString("accessToken");
      const refreshToken = tokenStorage.getString("refreshToken");

      const currentTime = Date.now() / 1000;

      if (accessToken && refreshToken) {
        try {
          const decodedAccess = jwtDecode<DecodedToken>(accessToken);
          const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);

          if (decodedRefresh.exp < currentTime) {
            logout();
            Alert.alert("Session Expired", "Please log in again.");
            resetAndNavigate("/role");
            return;
          }

          if (decodedAccess.exp < currentTime) {
            await refresh_tokens();
          }

          // Load user from backend if needed
          const storedUser = useUserStore.getState().user;
          if (storedUser?.role === "customer") {
            resetAndNavigate("/customer/home");
          } else if (storedUser?.role === "rider") {
            resetAndNavigate("/rider/home");
          } else {
            resetAndNavigate("/role");
          }
        } catch (err) {
          console.error("Token error:", err);
          logout();
          resetAndNavigate("/role");
        }
      } else {
        resetAndNavigate("/role");
      }
    };

    checkTokensAndNavigate();
  }, [fontsLoaded]);

  return (
    <View style={commonStyles.container}>
      <Image
        source={require("@/assets/images/logo_t.png")}
        style={splashStyles.img}
      />
      <CustomText variant="h5" fontFamily="Medium" style={splashStyles.text}>
        Made in Nigeria
      </CustomText>
    </View>
  );
};

export default Main;
