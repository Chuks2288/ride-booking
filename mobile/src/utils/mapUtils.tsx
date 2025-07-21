// import axios from "axios";
// import { useUserStore } from "@/store/userStore";

// export const getLatLong = async (placeId: string) => {
//     try {
//         const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
//             params: {
//                 placeid: placeId,
//                 key: process.env.EXPO_PUBLIC_MAP_API_KEY,
//             },
//         });
//         const data = response.data;
//         if (data.status === 'OK' && data.result) {
//             const location = data.result.geometry.location;
//             const address = data.result.formatted_address;

//             return {
//                 latitude: location.lat,
//                 longitude: location.lng,
//                 address: address,
//             };
//         } else {
//             throw new Error('Unable to fetch location details');
//         }
//     } catch (error) {
//         throw new Error('Unable to fetch location details');
//     }
// }

// export const reverseGeocode = async (latitude: number, longitude: number) => {
//     try {
//         const response = await axios.get(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_MAP_API_KEY}`
//         );
//         if (response.data.status === 'OK') {
//             const address = response.data.results[0].formatted_address;
//             return address
//         } else {
//             console.log('Geocoding failed: ', response.data.status);
//             return ""
//         }
//     } catch (error) {
//         console.log('Error during reverse geocoding: ', error);
//         return ""
//     }
// };

// function extractPlaceData(data: any) {
//     return data.map((item: any) => ({
//         place_id: item.place_id,
//         title: item.structured_formatting.main_text,
//         description: item.description
//     }));
// }

// export const getPlacesSuggestions = async (query: string) => {
//     const { location } = useUserStore.getState();
//     try {
//         const response = await axios.get(
//             `https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
//             params: {
//                 input: query,
//                 location: `${location?.latitude},${location?.longitude}`,
//                 radius: 50000,
//                 components: 'country:IN',
//                 key: process.env.EXPO_PUBLIC_MAP_API_KEY,
//             }
//         }
//         );
//         return extractPlaceData(response.data.predictions)

//     } catch (error) {
//         console.error('Error fetching autocomplete suggestions:', error);
//         return [];
//     }
// };

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateFare = (distance: number) => {
  const rateStructure = {
    bike: { baseFare: 10, perKmRate: 5, minimumFare: 25 },
    auto: { baseFare: 15, perKmRate: 7, minimumFare: 30 },
    cabEconomy: { baseFare: 20, perKmRate: 10, minimumFare: 50 },
    cabPremium: { baseFare: 30, perKmRate: 15, minimumFare: 70 },
  };

  const fareCalculation = (
    baseFare: number,
    perKmRate: number,
    minimumFare: number
  ) => {
    const calculatedFare = baseFare + distance * perKmRate;
    return Math.max(calculatedFare, minimumFare);
  };

  return {
    bike: fareCalculation(
      rateStructure.bike.baseFare,
      rateStructure.bike.perKmRate,
      rateStructure.bike.minimumFare
    ),
    auto: fareCalculation(
      rateStructure.auto.baseFare,
      rateStructure.auto.perKmRate,
      rateStructure.auto.minimumFare
    ),
    cabEconomy: fareCalculation(
      rateStructure.cabEconomy.baseFare,
      rateStructure.cabEconomy.perKmRate,
      rateStructure.cabEconomy.minimumFare
    ),
    cabPremium: fareCalculation(
      rateStructure.cabPremium.baseFare,
      rateStructure.cabPremium.perKmRate,
      rateStructure.cabPremium.minimumFare
    ),
  };
};

function quadraticBezierCurve(
  p1: any,
  p2: any,
  controlPoint: any,
  numPoints: any
) {
  const points = [];
  const step = 1 / (numPoints - 1);

  for (let t = 0; t <= 1; t += step) {
    const x =
      (1 - t) ** 2 * p1[0] + 2 * (1 - t) * t * controlPoint[0] + t ** 2 * p2[0];
    const y =
      (1 - t) ** 2 * p1[1] + 2 * (1 - t) * t * controlPoint[1] + t ** 2 * p2[1];
    const coord = { latitude: x, longitude: y };
    points.push(coord);
  }

  return points;
}

const calculateControlPoint = (p1: any, p2: any) => {
  const d = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
  const scale = 1; // Scale factor to reduce bending
  const h = d * scale; // Reduced distance from midpoint
  const w = d / 2;
  const x_m = (p1[0] + p2[0]) / 2;
  const y_m = (p1[1] + p2[1]) / 2;

  const x_c =
    x_m +
    ((h * (p2[1] - p1[1])) /
      (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
      (w / d);
  const y_c =
    y_m -
    ((h * (p2[0] - p1[0])) /
      (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
      (w / d);

  const controlPoint = [x_c, y_c];
  return controlPoint;
};

export const getPoints = (places: any) => {
  const p1 = [places[0].latitude, places[0].longitude];
  const p2 = [places[1].latitude, places[1].longitude];
  const controlPoint = calculateControlPoint(p1, p2);

  return quadraticBezierCurve(p1, p2, controlPoint, 100);
};

export const vehicleIcons: Record<
  "bike" | "auto" | "cabEconomy" | "cabPremium",
  { icon: any }
> = {
  bike: { icon: require("@/assets/icons/bike.png") },
  auto: { icon: require("@/assets/icons/auto.png") },
  cabEconomy: { icon: require("@/assets/icons/cab.png") },
  cabPremium: { icon: require("@/assets/icons/cab_premium.png") },
};

//

import axios from "axios";
import { useUserStore } from "@/store/userStore";
import Constants from "expo-constants";
import haversine from "haversine-distance";

const appName = Constants.manifest?.name || "rideapp";
const userAgent = `${appName}/1.0 (chuksdumbiri87@gmail.com)`;

// export const getLatLong = async (placeId: string) => {
//   try {
//     const response = await axios.get(
//       "https://nominatim.openstreetmap.org/search",
//       {
//         params: {
//           q: placeId,
//           format: "json",
//           addressdetails: 1,
//           limit: 1,
//         },
//         headers: {
//           "User-Agent": userAgent,
//         },
//       }
//     );

//     const data = response.data;

//     if (data.length > 0) {
//       const location = data[0];
//       const address = location.display_name;

//       return {
//         latitude: parseFloat(location.lat),
//         longitude: parseFloat(location.lon),
//         address: address,
//       };
//     } else {
//       throw new Error("Unable to fetch location details");
//     }
//   } catch (error) {
//     throw new Error("Unable to fetch location details");
//   }
// };

export const getLatLong = async (osm_id: number, osm_type: string) => {
  try {
    const osmTypeLetter = osm_type.toUpperCase(); // N, W, or R

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/lookup",
      {
        params: {
          osm_ids: `${osmTypeLetter}${osm_id}`,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": userAgent,
        },
      }
    );

    const data = response.data;

    if (data.length > 0) {
      const location = data[0];
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        address: location.display_name,
      };
    } else {
      throw new Error("Unable to fetch location details");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Unable to fetch location details");
  }
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "rideapp/1.0 (chuksdumbiri87@gmail.com)",
        },
      }
    );

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "";
  }
};

// function extractPlaceData(data: any) {
//   return data.map((item: any) => {
//     const props = item.properties;

//     const descriptionParts = [
//       props.housenumber,
//       props.street,
//       props.suburb,
//       props.city,
//       props.state,
//       props.postcode,
//       props.country,
//     ].filter(Boolean); // Remove any undefined or null values

//     return {
//       place_id: props.osm_id.toString(),
//       title: props.name || props.street || "Unnamed Place",
//       description: descriptionParts.join(", "),
//       geometry: item.geometry,
//     };
//   });
// }

function extractPlaceData(data: any) {
  return data.map((item: any) => {
    const props = item.properties;

    const descriptionParts = [
      props.housenumber,
      props.street,
      props.suburb,
      props.city,
      props.state,
      props.postcode,
      props.country,
    ].filter(Boolean);

    return {
      place_id: props.osm_id.toString(), // keep this as UI key
      osm_id: props.osm_id, // needed for lookup
      osm_type: props.osm_type, // needed for lookup
      title: props.name || props.street || "Unnamed Place",
      description: descriptionParts.join(", "),
      geometry: item.geometry,
    };
  });
}

export const getPlacesSuggestions = async (query: string) => {
  const { location } = useUserStore.getState();

  if (!location || !location.latitude || !location.longitude) {
    console.warn("User location is missing");
    return [];
  }

  try {
    const response = await axios.get("https://photon.komoot.io/api/", {
      params: {
        q: query,
        limit: 10,
        lat: location?.latitude,
        lon: location?.longitude,
        lang: "en",
      },
      headers: {
        "User-Agent": "rideapp/1.0 (chuksdumbiri87@gmail.com)",
      },
    });

    const filtered = response.data.features.filter((item: any) => {
      const coords = item.geometry.coordinates; // [lon, lat]
      const placeLat = coords[1];
      const placeLon = coords[0];

      const distanceInMeters = haversine(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: placeLat, longitude: placeLon }
      );

      // 50 km radius
      return (
        item.properties?.country === "Nigeria" && distanceInMeters <= 50000
      );
    });

    return extractPlaceData(filtered);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};
