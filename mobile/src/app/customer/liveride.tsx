import { View, Text, Platform, StatusBar } from "react-native";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { screenHeight } from "@/utils/Constants";
import { useWS } from "@/service/WSProvider";
import { useRoute } from "@react-navigation/native";
import { rideStyles } from "@/styles/rideStyles";

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42];
const iosHeights = [screenHeight * 0.2, screenHeight * 0.5];

const LiveRide = () => {
  const { emit, on, off } = useWS();
  const [rideData, setRideData] = useState<any>(null);
  const [riderCoords, setRiderCoords] = useState<any>(null);
  const route = useRoute() as any;
  const id = route?.params || {};
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(
    () => (Platform.OS === "ios" ? iosHeights : androidHeights),
    []
  );
  const [mapHeight, setMapHeight] = useState(snapPoints[0]);
  const handleSheetChanges = useCallback((index: number) => {
    let height = screenHeight * 0.8;
    if (index == 1) {
      height = screenHeight * 0.5;
    }
    setMapHeight(height);
  }, []);

  return (
    <View style={rideStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />
    </View>
  );
};

export default memo(LiveRide);
