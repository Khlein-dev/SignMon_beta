import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Image, Easing } from "react-native";

const monkeyIdle = require("../assets/images/monkeyIDLE.png");
const monkeyLeap = require("../assets/images/monkeyLeap.png");
const monkeyHappy = require("../assets/images/monkeyHappy.png");

export default function Pet({ hat, dress, necklace }) {
    const jumpAnim = useRef(new Animated.Value(0)).current;
    const scaleXAnim = useRef(new Animated.Value(1)).current;
    const scaleYAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const [monkeyImage, setMonkeyImage] = useState(monkeyIdle);

    const happyTimeoutRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const doJump = () => {
            setMonkeyImage(monkeyLeap);

            Animated.sequence([
                // little squash before jump
                Animated.parallel([
                    Animated.timing(scaleXAnim, {
                        toValue: 1.08,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleYAnim, {
                        toValue: 0.92,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: -1,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // jump up and stretch
                Animated.parallel([
                    Animated.timing(jumpAnim, {
                        toValue: -55,
                        duration: 260,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleXAnim, {
                        toValue: 0.94,
                        duration: 260,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleYAnim, {
                        toValue: 1.1,
                        duration: 260,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 260,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),

                // land with a stronger squash
                Animated.parallel([
                    Animated.timing(jumpAnim, {
                        toValue: 0,
                        duration: 220,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleXAnim, {
                        toValue: 1.12,
                        duration: 220,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleYAnim, {
                        toValue: 0.88,
                        duration: 220,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: -0.6,
                        duration: 220,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // tiny rebound bounce
                Animated.parallel([
                    Animated.timing(jumpAnim, {
                        toValue: -12,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleXAnim, {
                        toValue: 0.98,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleYAnim, {
                        toValue: 1.04,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0.5,
                        duration: 120,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // settle
                Animated.parallel([
                    Animated.timing(jumpAnim, {
                        toValue: 0,
                        duration: 140,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleXAnim, {
                        toValue: 1,
                        duration: 140,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleYAnim, {
                        toValue: 1,
                        duration: 140,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 140,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                setMonkeyImage(monkeyHappy);

                happyTimeoutRef.current = setTimeout(() => {
                    setMonkeyImage(monkeyIdle);
                }, 350);
            });
        };

        intervalRef.current = setInterval(doJump, 4000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (happyTimeoutRef.current) clearTimeout(happyTimeoutRef.current);
        };
    }, [jumpAnim, scaleXAnim, scaleYAnim, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-6deg", "6deg"],
    });

    return (
        <Animated.View
            style={[
                styles.petContainer,
                {
                    transform: [
                        { translateY: jumpAnim },
                        { scaleX: scaleXAnim },
                        { scaleY: scaleYAnim },
                        { rotate },
                    ],
                },
            ]}
        >
            <View style={styles.petWrapper}>
                <Image
                    source={monkeyImage}
                    style={styles.monkeyImage}
                    resizeMode="contain"
                />

                {hat && (
                    <Image
                        source={hat}
                        style={styles.hat}
                        resizeMode="contain"
                    />
                )}

                {dress && (
                    <Image
                        source={dress}
                        style={styles.dress}
                        resizeMode="contain"
                    />
                )}

                {necklace && (
                    <Image
                        source={necklace}
                        style={styles.necklace}
                        resizeMode="contain"
                    />
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

    petWrapper: {
        position: "relative",
        width: 300,
        height: 300,
        alignItems: "center",
        justifyContent: "center",
    },

    monkeyImage: {
        width: 320,
        height: 320,
        top: 20,

    },

    hat: {
        position: "absolute",
        top: -120,
        width: 320,
        height: 320,
        zIndex: 4,
    },

    dress: {
        position: "absolute",
        bottom: -55,
        width: 175,
        height: 175,
        zIndex: 2,
    },

    necklace: {
        position: "absolute",
        top: 180,
        width: 175,
        height: 175,
        left: -25,
        zIndex: 4,
    },
});