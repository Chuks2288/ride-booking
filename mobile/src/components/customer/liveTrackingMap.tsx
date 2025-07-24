import { View, Text } from "react-native";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import MapView from "react-native-maps";
import { indiaIntialRegion } from "@/utils/CustomMap";

const apikey = process.env.EXPO_PUBLIC_MAP_API_KEY || "";

const LiveTrackingMap: FC<{
  height: number;
  drop: any;
  pickup: any;
  rider: any;
  status: string;
}> = ({ drop, status, height, pickup, rider }) => {
  const mapRef = useRef<MapView>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const fitToMarkers = async () => {
    if (isUserInteracting) return;

    const coordinates = [];

    if (pickup?.latitude && pickup?.longitude && status === "START") {
      coordinates.push({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      });
    }

    if (drop?.latitude && drop?.longitude && status === "ARRIVED") {
      coordinates.push({
        latitude: drop.latitude,
        longitude: drop.longitude,
      });
    }

    if (rider?.latitude && rider?.longitude) {
      coordinates.push({
        latitude: rider.latitude,
        longitude: rider.longitude,
      });
    }

    if (coordinates.length === 0) return;

    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } catch (error) {
      console.error("Error fitting to markers", error);
    }
  };

  const calculateInitialRegion = () => {
    if (pickup?.latitude && drop?.latitude) {
      const latitude = (pickup.latitude + drop.latitude) / 2;
      const longitude = (pickup.longitude + drop.longitude) / 2;

      return {
        latitude,
        longitude,
        longitudeDelta: 0.05,
        latitudeDelta: 0.05,
      };
    }
    return indiaIntialRegion;
  };

  useEffect(() => {
    if (pickup?.latitude && drop?.latitude) fitToMarkers();
  }, [drop?.latitude, pickup?.latitude, rider.latitude]);

  return (
    <View>
      <Text>LiveTrackingMap</Text>
    </View>
  );
};

export default memo(LiveTrackingMap);
