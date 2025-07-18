import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { authStyles } from "@/styles/authStyles";
import { commonStyles } from "@/styles/commonStyles";
import CustomText from "@/components/shared/customText";
import PhoneInput from "@/components/shared/phoneInput";
import { useWS } from "@/service/WSProvider";
import CustomButton from "@/components/shared/customButton";
import { signin } from "@/service/auth";
import { router } from "expo-router";

const CustomerAuth = () => {
  const { updateAccessToken } = useWS();
  const [phone, setPhone] = useState("");

  const handleNext = () => {
    if (!phone && phone.length !== 10) {
      Alert.alert("Enter your phone number");
      return;
    }
    signin({ role: "customer", phone }, updateAccessToken);
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.container}>
        <View style={commonStyles.flexRowBetween}>
          <Image
            source={require("@/assets/images/logo_t.png")}
            style={authStyles.logo}
          />
          <TouchableOpacity style={authStyles.flexRowGap}>
            <MaterialIcons name="help" size={18} color="grey" />
            <CustomText fontFamily="Medium" variant="h7">
              Help
            </CustomText>
          </TouchableOpacity>
        </View>

        <CustomText
          fontFamily="Medium"
          variant="h7"
          style={commonStyles.lightText}
        >
          Enter your phone number to continue
        </CustomText>

        <PhoneInput onChangeText={setPhone} value={phone} />
      </ScrollView>

      <View style={authStyles.footerContainer}>
        <CustomText
          variant="h8"
          fontFamily="Regular"
          style={[
            commonStyles.lightText,
            { textAlign: "center", marginHorizontal: 20 },
          ]}
        >
          By continuing, you agree to the terms and privacy policy of the app.
        </CustomText>
        <CustomButton
          title="Next"
          onPress={handleNext}
          // onPress={() => router.push("/customer/home")}
          loading={false}
          disabled={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomerAuth;
