import { View, Text, Alert } from "react-native";
import React from "react";
import { router } from "expo-router";
import { apiAxios } from "./api";
import { resetAndNavigate } from "@/utils/Helpers";

interface coords {
  address: string;
  latitude: number;
  longitude: number;
}

export const createRide = async (payload: {
  vehicle: "bike" | "auto" | "cabEconomy" | "cabPremium";
  pickup: coords;
  drop: coords;
}) => {
  try {
    const res = await apiAxios.post(`/ride/create`, payload);
    router?.navigate({
      pathname: "/customer/liveride",
      params: {
        id: res?.data?.ride?._id,
      },
    });
  } catch (error) {
    Alert.alert("Oh, Dang there was an error");
    console.log("Error: Create Ride", error);
  }
};

export const getMyRides = async (isCustomer: boolean = true) => {
  try {
    const res = await apiAxios.get(`/ride/rides`);
    const filterRides = res.data.rides?.filter(
      (ride: any) => ride?.status != "COMPLETED"
    );
    if (filterRides?.length > 0) {
      router?.navigate({
        pathname: isCustomer ? "/customer/liveride" : "/rider/liveride",
        params: {
          id: filterRides![0]?._id,
        },
      });
    }
  } catch (error) {
    Alert.alert("Oh, Dang there was an error");
    console.log("Error: GET Y Ride", error);
  }
};

export const acceptRideOffer = async (rideId: string) => {
  try {
    const res = await apiAxios.patch(`/ride/accept/${rideId}`);
    resetAndNavigate({
      pathname: "/rider/liveride",
      params: { id: rideId },
    });
  } catch (error) {
    Alert.alert("Oh! Dang there was an error");
    console.log(error);
  }
};
