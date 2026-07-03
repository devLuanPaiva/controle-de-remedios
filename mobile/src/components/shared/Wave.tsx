import Svg, { Path } from "react-native-svg";
import { Dimensions, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/theme";

const { width } = Dimensions.get("window");

interface WaveProps {
  color?: string;
  flip?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Wave({ color = Colors.background, flip = false, style }: Readonly<WaveProps>) {
  return (
    <Svg
      width={width}
      height={130}
      viewBox={`0 0 ${width} 130`}
      style={[{ transform: [{ scaleY: flip ? -1 : 1 }] }, style]}
    >
      <Path
        d={`
          M0,60
          C${width * 0.22},14 ${width * 0.4},96 ${width * 0.63},58
          C${width * 0.8},32 ${width * 0.9},70 ${width},46
          L${width},130
          L0,130
          Z
        `}
        fill={color}
        opacity={0.35}
      />
      <Path
        d={`
          M0,88
          C${width * 0.28},42 ${width * 0.55},112 ${width * 0.78},70
          C${width * 0.9},48 ${width * 0.96},58 ${width},52
          L${width},130
          L0,130
          Z
        `}
        fill={color}
      />
    </Svg>
  );
}
