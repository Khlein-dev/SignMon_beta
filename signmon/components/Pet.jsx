import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";

export default function Pet({ hat, dress, necklace }) {

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

        <View style={styles.petWrapper}>

            <Image
                source={require("../assets/images/pet.png")}
                style={styles.petImage}
                resizeMode="contain"
            />

            {hat && (
                <Image source={hat} style={styles.hat} resizeMode="contain" />
            )}

            {dress && (
                <Image source={dress} style={styles.dress} resizeMode="contain" />
            )}

            {necklace && (
                <Image source={necklace} style={styles.necklace} resizeMode="contain" />
            )}

        </View>

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
        width: 380,
        height: 380,
        bottom: -50,
        left: 0,
    },

    // 

    petWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
},

hat: {
    position: "absolute",
    top: -20,
    width: 160,
    height: 160,
},

dress: {
    position: "absolute",
    top: 120,
    width: 200,
    height: 200,
},

necklace: {
    position: "absolute",
    top: 140,
    width: 120,
    height: 120,
},
});