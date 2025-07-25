import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StatusBar, Platform } from "react-native";

import { homeStyles } from "@/styles/homeStyles";
import LocationBar from "@/components/customer/locationBar";
import DraggableMap from "@/components/customer/draggableMap";
import { screenHeight } from "@/utils/Constants";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import SheetContent from "@/components/customer/sheetContent";
import { getMyRides } from "@/service/rideService";

const androidHeights = [
  screenHeight * 0.12,
  screenHeight * 0.42,
  screenHeight * 0.8,
];
const iosHeights = [screenHeight * 0.2, screenHeight * 0.5, screenHeight * 0.8];

const CustomerHome: React.FC = () => {
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(
    () => (Platform.OS === "ios" ? iosHeights : androidHeights),
    []
  );

  const [mapHeight, setMapHeight] = useState(snapPoints[0]);

  const handleSheetChanges = useCallback((index: number) => {
    let height = screenHeight * 0.8;
    if (index === 1) {
      height = screenHeight * 0.5;
    }
    setMapHeight(height);
  }, []);

  useEffect(() => {
    getMyRides();
  }, []);

  return (
    <View style={homeStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />
      <LocationBar />
      <DraggableMap height={mapHeight} />
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
        }}
        enableOverDrag={false}
        enableDynamicSizing={false}
        style={{ zIndex: 4 }}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetScrollView
          contentContainerStyle={homeStyles.scrollContainer}
        >
          <SheetContent />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default CustomerHome;
