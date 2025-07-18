import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React from "react";
import { CustomButtonProps } from "@/utils/types";
import CustomText from "./customText";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "@/utils/Constants";

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: disabled ? Colors.secondary : Colors.primary,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <CustomText
          fontFamily="Medium"
          style={{
            fontSize: RFValue(12),
            color: disabled ? "#fff" : Colors.text,
          }}
        >
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    margin: 10,
    padding: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default CustomButton;
