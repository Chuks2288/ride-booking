import { View, Image, Alert, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useState } from "react";
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
import { router } from "expo-router";

interface DecodedToken {
  exp: number;
}

const Main = () => {
  const [loaded] = useFonts({
    Bold: require("@/assets/fonts/NotoSans-Bold.ttf"),
    Regular: require("@/assets/fonts/NotoSans-Regular.ttf"),
    Medium: require("@/assets/fonts/NotoSans-Medium.ttf"),
    Light: require("@/assets/fonts/NotoSans-Light.ttf"),
    Semibold: require("@/assets/fonts/NotoSans-SemiBold.ttf"),
  });

  const user = useUserStore((state) => state.user);
  const [hasNavigated, setHasNavigated] = useState(false);

  const tokenCheck = async () => {
    const access_token = tokenStorage.getString("access_token") as string;
    const refresh_token = tokenStorage.getString("refresh_token") as string;

    const currentTime = Date.now() / 1000;

    if (access_token && refresh_token) {
      try {
        const decodedAccess = jwtDecode<DecodedToken>(access_token);
        const decodedRefresh = jwtDecode<DecodedToken>(refresh_token);

        if (decodedRefresh.exp < currentTime) {
          logout();
          Alert.alert("Session Expired", "Please log in again.");
          resetAndNavigate("/role");
          return;
        }

        if (decodedAccess.exp < currentTime) {
          await refresh_tokens(); // Make sure this updates tokens in storage
        }

        // Navigate based on user role
        if (user?.role === "customer") {
          resetAndNavigate("/customer/home");
        } else if (user?.role === "rider") {
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

  useEffect(() => {
    if (loaded && !hasNavigated) {
      setHasNavigated(true);
      const timeout = setTimeout(() => {
        tokenCheck();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [loaded, hasNavigated]);

  return (
    <View style={commonStyles.container}>
      <Image
        source={require("@/assets/images/logo_t.png")}
        style={splashStyles.img}
      />
      <TouchableOpacity onPress={() => router.push("/customer/home")}>
        <Text>Role Page</Text>
      </TouchableOpacity>
      <CustomText variant="h5" fontFamily="Medium" style={splashStyles.text}>
        Made in Nigeria
      </CustomText>
    </View>
  );
};

export default Main;
