import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Audio } from "expo-av";
import Octicons from "@expo/vector-icons/Octicons";

const MAX_LEVEL = 9;

const LEVEL_STYLES = {
    1: { bg: "#8B5CF6", border: "#2B1140", bar: "#A78BFA", stripeA: "#C4B5FD", stripeB: "#DDD6FE" },
    2: { bg: "#22C55E", border: "#14532D", bar: "#86EFAC", stripeA: "#BBF7D0", stripeB: "#DCFCE7" },
    3: { bg: "#3B82F6", border: "#1E3A8A", bar: "#93C5FD", stripeA: "#BFDBFE", stripeB: "#DBEAFE" },
    4: { bg: "#F97316", border: "#9A3412", bar: "#FDBA74", stripeA: "#FED7AA", stripeB: "#FFEDD5" },
    5: { bg: "#EC4899", border: "#9D174D", bar: "#F9A8D4", stripeA: "#FBCFE8", stripeB: "#FCE7F3" },
    6: { bg: "#EAB308", border: "#854D0E", bar: "#FDE68A", stripeA: "#FEF08A", stripeB: "#FEF9C3" },
    7: { bg: "#14B8A6", border: "#115E59", bar: "#99F6E4", stripeA: "#CCFBF1", stripeB: "#F0FDFA" },
    8: { bg: "#EF4444", border: "#7F1D1D", bar: "#FCA5A5", stripeA: "#FECACA", stripeB: "#FEE2E2" },
    9: { bg: "#06B6D4", border: "#164E63", bar: "#A5F3FC", stripeA: "#CFFAFE", stripeB: "#ECFEFF" },
};

export default function Stats() {
    const [displayLevel, setDisplayLevel] = useState(1);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [isAnimatingBar, setIsAnimatingBar] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const levelScale = useRef(new Animated.Value(1)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;
    const stripeTranslateAnim = useRef(new Animated.Value(0)).current;

    const levelUpSoundRef = useRef(null);
    const stripeLoopRef = useRef(null);

    // 🔊 Load sound
    useEffect(() => {
        let isActive = true;

        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require("../assets/images/audio/levelup.mp3")
                );

                if (isActive) {
                    levelUpSoundRef.current = sound;
                } else {
                    await sound.unloadAsync();
                }
            } catch (error) {
                console.log("Failed to load levelup sound:", error);
            }
        };

        loadSound();

        return () => {
            isActive = false;

            if (stripeLoopRef.current) {
                stripeLoopRef.current.stop();
                stripeLoopRef.current = null;
            }

            if (levelUpSoundRef.current) {
                levelUpSoundRef.current.unloadAsync();
                levelUpSoundRef.current = null;
            }
        };
    }, []);

    const playLevelUp = async () => {
        try {
            if (!levelUpSoundRef.current) return;
            await levelUpSoundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play levelup sound:", error);
        }
    };

    const stopStripeAnimation = () => {
        if (stripeLoopRef.current) {
            stripeLoopRef.current.stop();
            stripeLoopRef.current = null;
        }
        stripeTranslateAnim.setValue(0);
    };

    const startStripeAnimation = () => {
        stopStripeAnimation();

        stripeTranslateAnim.setValue(0);

        stripeLoopRef.current = Animated.loop(
            Animated.timing(stripeTranslateAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        stripeLoopRef.current.start();
    };

    const animateLevelUp = async (newLevel) => {
        await playLevelUp();

        setIsAnimatingBar(true);
        startStripeAnimation();

        return new Promise((resolve) => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(progressAnim, {
                        toValue: 100,
                        duration: 800,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }),
                    Animated.sequence([
                        Animated.timing(levelScale, {
                            toValue: 1.2,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(levelScale, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(sparkleAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(sparkleAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => {
                stopStripeAnimation();
                setIsAnimatingBar(false);
                setDisplayLevel(newLevel);
                progressAnim.setValue(0);
                resolve();
            });
        });
    };

    // 🔥 MAIN SYNC WITH USER DATA
    const syncStats = useCallback(async () => {
        //     if (!user) return;

        //     let level = user.level || 1;
        //     let xp = user.xp || 0;

        //     const expNeeded = level * 100;
        //     const progressPercent = Math.min((xp / expNeeded) * 100, 100);

        //     setDisplayLevel(level);
        //     setDisplayProgress(progressPercent);

        //     progressAnim.setValue(progressPercent);
    }, []);

    useFocusEffect(
        useCallback(() => {
            syncStats();
        }, [syncStats])
    );

    const levelStyle = LEVEL_STYLES[displayLevel] || LEVEL_STYLES[9];

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    const sparkleScale = sparkleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1.4],
    });

    const sparkleOpacity = sparkleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const stripeTranslate = stripeTranslateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-40, 40],
    });

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.leftSide}>
                    <Animated.View
                        style={[
                            styles.sparkleWrap,
                            {
                                opacity: sparkleOpacity,
                                transform: [{ scale: sparkleScale }],
                            },
                        ]}
                    >
                        <Octicons name="sparkles-fill" size={30} color="white" />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.levelCircle,
                            {
                                backgroundColor: levelStyle.bg,
                                borderColor: levelStyle.border,
                                transform: [{ scale: levelScale }],
                            },
                        ]}
                    >
                        <Text style={styles.levelLabel}>LEVEL</Text>
                        <Text style={styles.levelText}>{displayLevel}</Text>
                    </Animated.View>
                </View>

                <View style={styles.levelSection}>
                    <Text style={styles.title}>Antas ng Bayani</Text>

                    <View style={styles.barShell}>
                        <View style={styles.barBackground}>
                            <Animated.View
                                style={[
                                    styles.barFill,
                                    {
                                        width: progressWidth,
                                        backgroundColor: levelStyle.bar,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.progressRow}>
                        <Text style={styles.progressText}>
                            {Math.round(displayProgress)}%
                        </Text>
                        <Text style={styles.progressHint}>
                            {/* {user?.xp || 0} EXP */}
                                0 EXP
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 70,
        left: 20,
        right: 20,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF4C7",
        borderRadius: 28,
        borderWidth: 5,
        borderColor: "#000000",
        paddingVertical: 14,
        paddingHorizontal: 14,
        overflow: "hidden",
        position: "relative",
    },

    cardBubble: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.35,
    },

    cardBubblePurple: {
        width: 92,
        height: 92,
        top: -22,
        right: -12,
        backgroundColor: "#C4B5FD",
    },

    cardBubbleBlue: {
        width: 64,
        height: 64,
        top: 16,
        right: 90,
        backgroundColor: "#7DD3FC",
    },

    cardBubbleYellow: {
        width: 56,
        height: 56,
        bottom: -14,
        left: 118,
        backgroundColor: "#FDE68A",
    },

    cardBubbleGreen: {
        width: 44,
        height: 44,
        top: 24,
        left: -8,
        backgroundColor: "#86EFAC",
    },

    cardBubblePink: {
        width: 34,
        height: 34,
        bottom: 18,
        right: 28,
        backgroundColor: "#F9A8D4",
    },

    leftSide: {
        width: 108,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        zIndex: 2,
    },

    sparkleWrap: {
        position: "absolute",
        top: -8,
        right: 4,
        zIndex: 3,
    },

    levelCircle: {
        width: 98,
        height: 98,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 6,
    },

    levelLabel: {
        color: "#1F0A2E",
        fontFamily: "HeyComic",
        fontSize: 14,
        lineHeight: 16,
    },

    levelText: {
        color: "#1F0A2E",
        fontFamily: "HeyComic",
        fontSize: 42,
        lineHeight: 46,
    },

    levelSection: {
        flex: 1,
        zIndex: 2,
    },

    title: {
        color: "#3B1D00",
        fontFamily: "HeyComic",
        fontSize: 23,
        marginBottom: 2,
    },

    subtitle: {
        color: "#6B4E16",
        fontFamily: "HeyComic",
        fontSize: 12,
        marginBottom: 10,
    },

    barShell: {
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 4,
        borderColor: "#000000",
        padding: 4,
    },

    barBackground: {
        width: "100%",
        height: 30,
        backgroundColor: "#E9D5FF",
        borderRadius: 999,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        borderRadius: 999,
        overflow: "hidden",
        justifyContent: "center",
    },

    stripeLayer: {
        flexDirection: "row",
        position: "absolute",
        left: -40,
        top: 0,
        bottom: 0,
        width: "140%",
        height: "100%",
    },

    stripeBlock: {
        width: 40,
        height: "100%",
    },

    progressRow: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    progressText: {
        color: "#2D1B00",
        fontFamily: "HeyComic",
        fontSize: 18,
    },

    progressHint: {
        color: "#6B4E16",
        fontFamily: "HeyComic",
        fontSize: 11,
    },
});