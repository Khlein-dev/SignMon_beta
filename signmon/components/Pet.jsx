import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";

export default function Pet() {

    const jumpAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {

        const jump = () => {
            Animated.sequence([
                Animated.timing(jumpAnim, {
                    toValue: -40,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(jumpAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const interval = setInterval(() => {
            jump();
        }, 4000); // jump every 4 seconds

        return () => clearInterval(interval);

    }, []);

    return (
        <Animated.View
            style={[
                styles.petContainer,
                { transform: [{ translateY: jumpAnim }] }
            ]}
        >
            <Image
                source={require("../assets/images/pet.png")}
                style={styles.petImage}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({

    petContainer: {
        width: 300,
        height: 300,
        justifyContent: "center",
        alignItems: "center",
    },

    petImage: {
        width: 300,
        height: 300,
    },

});