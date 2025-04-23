import { SplashScreen } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import Rive from "rive-react-native";

interface AnimatedScreenProps {
    handleAnimationEnd: () => void
}

export default function Splash({
    handleAnimationEnd,
}: AnimatedScreenProps) {

    return (
        <View style={styles.container}>
            <Rive
                autoplay
                resourceName="neuland.app-native-splashscreen"
                style={styles.animation}
                onStop={handleAnimationEnd}
                onPause={handleAnimationEnd}
                onError={e => console.error("Splash screen animation error:", e)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#ffffff", 
    },
    animation: {
        width: "100%",
        height: "100%",
    },
});