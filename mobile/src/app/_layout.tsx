import React from "react";
import { Stack } from "expo-router";
import { WSProvider } from "@/service/WSProvider";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";

const Layout = () => {
  return (
    <WSProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="role" />
      </Stack>
    </WSProvider>
  );
};

export default gestureHandlerRootHOC(Layout);
