import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Audio } from "expo-av";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomPanel({ visible, onClose }) {
    const [isMounted, setIsMounted] = useState(visible);

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const panelTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const itemAnimations = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    const isClosingRef = useRef(false);
    const soundRef = useRef(null);

    const menuItems = useMemo(
        () => [
            {
                label: "Alpabeto A–G",
                route: "/lessons/lesson1",
                letters: "A, B, C, D, E, F, G",
            },
            {
                label: "Alpabeto H–N",
                route: "/lessons/lesson2",
                letters: "H, I, J, K, L, M, N",
            },
            {
                label: "Alpabeto Ñ–S",
                route: "/lessons/lesson3",
                letters: "Ñ, Ng, O, P, Q, R, S",
            },
            {
                label: "Alpabeto T–Z",
                route: "/lessons/lesson4",
                letters: "T, U, V, W, X, Y, Z",
            },
            {
                label: "Mga Numero",
                route: "/lessons/lesson5",
                letters: "1, 2, 3, 4, 5...",
            },
            {
                label: "Mga Kulay",
                route: "/lessons/lesson6",
                letters: "Pula, Asul, Dilaw...",
            },
            {
                label: "Ang Aking Pamilya",
                route: "/lessons/lesson7",
                letters: "Nanay, Tatay, Kuya...",
            },
            {
                label: "Anong Araw Na?",
                route: "/lessons/lesson8",
                letters: "Lunes hanggang Linggo",
            },
        ],
        []
    );

    useEffect(() => {
        let isActive = true;

        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require("../assets/images/audio/pop.mp3") // adjust path if needed
                );

                if (isActive) {
                    soundRef.current = sound;
                } else {
                    await sound.unloadAsync();
                }
            } catch (error) {
                console.log("Failed to load pop sound:", error);
            }
        };

        loadSound();

        return () => {
            isActive = false;

            if (soundRef.current) {
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        };
    }, []);

    const playPop = async () => {
        try {
            if (!soundRef.current) return;
            await soundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    };

    const animateItemsWithPop = () => {
        itemAnimations.forEach((anim) => anim.setValue(0));

        menuItems.forEach((_, index) => {
            setTimeout(() => {
                playPop();

                Animated.timing(itemAnimations[index], {
                    toValue: 1,
                    duration: 320,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }).start();
            }, index * 90);
        });
    };

    useEffect(() => {
        if (visible) {
            isClosingRef.current = false;
            setIsMounted(true);

            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(panelTranslateY, {
                    toValue: 0,
                    duration: 360,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) {
                    animateItemsWithPop();
                }
            });
        } else if (isMounted && !isClosingRef.current) {
            closePanel(false);
        }
    }, [visible]);

    const closePanel = (callOnClose = true) => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(panelTranslateY, {
                toValue: SCREEN_HEIGHT,
                duration: 280,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                setIsMounted(false);
                if (callOnClose && onClose) onClose();
            }
            isClosingRef.current = false;
        });
    };

    const handlePressItem = async (route) => {
        await playPop();
        closePanel(true);

        setTimeout(() => {
            router.push(route);
        }, 280);
    };

    const handleClosePress = async () => {
        await playPop();
        closePanel(true);
    };

    if (!isMounted) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.backdrop,
                    {
                        opacity: backdropOpacity,
                    },
                ]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClosePress} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.panel,
                    {
                        transform: [{ translateY: panelTranslateY }],
                    },
                ]}
            >
                <LinearGradient
                    colors={["#2b6cb0", "#184a8c", "#0d2f5e"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.handle} />

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Aralin</Text>
                        <Text style={styles.subtitle}>Piliin ang gustong lesson</Text>
                    </View>

                    <Pressable
                        onPress={handleClosePress}
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && styles.closeButtonPressed,
                        ]}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </Pressable>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.grid}>
                        {menuItems.map((item, index) => {
                            const translateY = itemAnimations[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [24, 0],
                            });

                            const scale = itemAnimations[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.85, 1],
                            });

                            return (
                                <Animated.View
                                    key={item.route}
                                    style={[
                                        styles.cardWrapper,
                                        {
                                            opacity: itemAnimations[index],
                                            transform: [{ translateY }, { scale }],
                                        },
                                    ]}
                                >
                                    <Pressable
                                        onPress={() => handlePressItem(item.route)}
                                        style={({ pressed }) => [
                                            styles.gridButton,
                                            pressed && styles.gridButtonPressed,
                                        ]}
                                    >
                                        <Text style={styles.lessonBadge}>Lesson {index + 1}</Text>
                                        <Text style={styles.gridButtonText}>{item.label}</Text>
                                        <Text style={styles.gridButtonSubtext}>{item.letters}</Text>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
        zIndex: 998,
    },

    panel: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 70,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: "hidden",
        zIndex: 999,
        elevation: 999,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    handle: {
        alignSelf: "center",
        width: 70,
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.55)",
        marginBottom: 14,
    },

    header: {
        minHeight: 68,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    title: {
        color: "#fff4c2",
        fontSize: 42,
        fontFamily: "HeyComic",
        lineHeight: 48,
    },

    subtitle: {
        color: "#dbeafe",
        fontSize: 16,
        fontFamily: "HeyComic",
        marginTop: 2,
    },

    closeButton: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#ff7b7b",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#3a1a1a",
    },

    closeButtonPressed: {
        transform: [{ scale: 0.96 }],
    },

    closeButtonText: {
        color: "#2b1111",
        fontSize: 28,
        fontFamily: "HeyComic",
    },

    scrollContent: {
        paddingBottom: 30,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 14,
    },

    cardWrapper: {
        width: "48%",
    },

    gridButton: {
        minHeight: 128,
        backgroundColor: "#ffbe55",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 28,
        borderColor: "#5a3900",
        borderWidth: 4,
        paddingVertical: 18,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    gridButtonPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.92,
    },

    lessonBadge: {
        color: "#4a2d00",
        fontSize: 14,
        fontFamily: "HeyComic",
        marginBottom: 6,
    },

    gridButtonText: {
        color: "#2f1b00",
        fontSize: 23,
        fontFamily: "HeyComic",
        marginBottom: 6,
        textAlign: "center",
    },

    gridButtonSubtext: {
        color: "#5c3a00",
        fontSize: 13,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 18,
    },
});