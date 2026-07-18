import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CameraGradientsProps {
    topHeight: number;
    bottomHeight: number;
}

export function CameraGradients({ topHeight, bottomHeight }: Readonly<CameraGradientsProps>) {
    return (
        <>
            <LinearGradient
                colors={["rgba(0,0,0,0.55)", "transparent"]}
                style={[styles.gradient, styles.top, { height: topHeight }]}
            />
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={[styles.gradient, styles.bottom, { height: bottomHeight }]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
    },

    top: {
        top: 0,
    },

    bottom: {
        bottom: 0,
    },
});
