import { View, Text, StatusBar } from "react-native";
import React from "react";
import { homeStyles } from "@/styles/homeStyles";
import LocationBar from "@/components/customer/locationBar";

const LocationSelection = () => {
  return (
    <View style={homeStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />
      <LocationBar />
    </View>
  );
};

export default LocationSelection;
