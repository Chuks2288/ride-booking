import { View, Text, StyleSheet } from "react-native";
import { CustomTextProps } from "../../utils/types";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "@/utils/Constants";

const fontSizes = {
  h1: 24,
  h2: 22,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  h7: 10,
  h8: 9,
};

const CustomText = ({
  variant = "h6",
  fontFamily = "Regular",
  fontSize,
  numberOfLines,
  children,
  style,
}: CustomTextProps) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: RFValue(fontSize ? fontSize : fontSizes[variant]),
          fontFamily: `NotoSans-${fontFamily}`,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
  },
});

export default CustomText;
