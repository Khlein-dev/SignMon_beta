import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Audio } from "expo-av";

const QUIZ_KEYS = [
    "quiz1Finished",
    "quiz2Finished",
    "quiz3Finished",
    "quiz4Finished",
    "quiz5Finished",
    "quiz6Finished",
    "quiz7Finished",
    "quiz8Finished",
];

const LEVEL_STYLES = {
    1: { bg: "#8B5CF6", border: "#2B1140", bar: "#A78BFA" },
    2: { bg: "#22C55E", border: "#14532D", bar: "#86EFAC" },
    3: { bg: "#3B82F6", border: "#1E3A8A", bar: "#93C5FD" },
    4: { bg: "#F97316", border: "#9A3412", bar: "#FDBA74" },
    5: { bg: "#EC4899", border: "#9D174D", bar: "#F9A8D4" },
    6: { bg: "#EAB308", border: "#854D0E", bar: "#FDE68A" },
    7: { bg: "#14B8A6", border: "#115E59", bar: "#99F6E4" },
    8: { bg: "#EF4444", border: "#7F1D1D", bar: "#FCA5A5" },
    9: { bg: "#06B6D4", border: "#164E63", bar: "#A5F3FC" },
};

export default function Stats() {
    const [displayLevel, setDisplayLevel] = useState(1);
    const [displayProgress, setDisplayProgress] = useState(0);

    const previousCompletedRef = useRef(0);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const levelScale = useRef(new Animated.Value(1)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;

    const levelUpSoundRef = useRef(null);

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

    const getCompletedCount = async () => {
        const entries = await AsyncStorage.multiGet(QUIZ_KEYS);
        return entries.reduce((count, [, value]) => {
            return value === "true" ? count + 1 : count;
        }, 0);
    };

    // 0 passed = level 1
    // 1 passed = level 2
    // 2 passed = level 3
    const getLevelFromCompleted = (completedCount) => {
        return Math.min(completedCount + 1, 9);
    };

    const resetStats = () => {
        previousCompletedRef.current = 0;
        setDisplayLevel(1);
        setDisplayProgress(0);
        progressAnim.setValue(0);
    };

    const animateOneLevelUp = async (nextLevel) => {
        await playLevelUp();

        return new Promise((resolve) => {
            Animated.sequence([
                Animated.timing(progressAnim, {
                    toValue: 100,
                    duration: 550,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(levelScale, {
                            toValue: 1.2,
                            duration: 180,
                            easing: Easing.out(Easing.back(2)),
                            useNativeDriver: true,
                        }),
                        Animated.timing(levelScale, {
                            toValue: 1,
                            duration: 220,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(sparkleAnim, {
                            toValue: 1,
                            duration: 180,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(sparkleAnim, {
                            toValue: 0,
                            duration: 320,
                            easing: Easing.in(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => {
                setDisplayLevel(nextLevel);
                setDisplayProgress(0);
                progressAnim.setValue(0);
                resolve();
            });
        });
    };

    const syncStats = useCallback(async () => {
        try {
            const completedCount = await getCompletedCount();

            if (completedCount === 0) {
                resetStats();
                return;
            }

            const currentCompleted = previousCompletedRef.current;

            // if progress was cleared or lowered
            if (completedCount < currentCompleted) {
                previousCompletedRef.current = completedCount;
                setDisplayLevel(getLevelFromCompleted(completedCount));
                setDisplayProgress(0);
                progressAnim.setValue(0);
                return;
            }

            // no change
            if (completedCount === currentCompleted) {
                return;
            }

            // animate each newly completed quiz
            for (let step = currentCompleted + 1; step <= completedCount; step += 1) {
                const nextLevel = getLevelFromCompleted(step);
                await animateOneLevelUp(nextLevel);
                previousCompletedRef.current = step;
            }
        } catch (error) {
            console.log("Failed to load stats:", error);
        }
    }, [progressAnim]);

    useFocusEffect(
        useCallback(() => {
            syncStats();

            const interval = setInterval(() => {
                syncStats();
            }, 800);

            return () => clearInterval(interval);
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

    return (
        <View style={styles.container}>
            <View style={styles.bubbleBlue} />
            <View style={styles.bubbleYellow} />
            <View style={styles.bubbleGreen} />

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
                        <Text style={styles.sparkleText}>✨</Text>
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
                    <Text style={styles.subtitle}>
                        Tumataas ito kapag may natapos na quiz
                    </Text>

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
                        <Text style={styles.progressText}>{displayProgress}%</Text>
                        <Text style={styles.progressHint}>Pag-level up</Text>
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
    },

    bubbleBlue: {
        position: "absolute",
        top: -8,
        right: 25,
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: "#7DD3FC",
        opacity: 0.25,
    },

    bubbleYellow: {
        position: "absolute",
        bottom: -10,
        left: 110,
        width: 60,
        height: 60,
        borderRadius: 999,
        backgroundColor: "#FDE68A",
        opacity: 0.3,
    },

    bubbleGreen: {
        position: "absolute",
        top: 30,
        left: -10,
        width: 50,
        height: 50,
        borderRadius: 999,
        backgroundColor: "#86EFAC",
        opacity: 0.28,
    },

    leftSide: {
        width: 108,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    sparkleWrap: {
        position: "absolute",
        top: -8,
        right: 4,
        zIndex: 2,
    },

    sparkleText: {
        fontSize: 28,
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