import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Audio } from "expo-av";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const UNLOCK_RULES = {
    "/lessons/lesson1": null,
    "/lessons/lesson2": "quiz1Finished",
    "/lessons/lesson3": "quiz2Finished",
    "/lessons/lesson4": "quiz3Finished",
    "/lessons/lesson5": "quiz4Finished",
    "/lessons/lesson6": "quiz5Finished",
    "/lessons/lesson7": "quiz6Finished",
    "/lessons/lesson8": "quiz7Finished",
};

export default function BottomPanel({ visible, onClose }) {
    const [isMounted, setIsMounted] = useState(visible);
    const [lockedModalVisible, setLockedModalVisible] = useState(false);
    const [isLoadingLocks, setIsLoadingLocks] = useState(true);
    const [unlockedMap, setUnlockedMap] = useState({
        "/lessons/lesson1": true,
        "/lessons/lesson2": false,
        "/lessons/lesson3": false,
        "/lessons/lesson4": false,
        "/lessons/lesson5": false,
        "/lessons/lesson6": false,
        "/lessons/lesson7": false,
        "/lessons/lesson8": false,
    });

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const panelTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const itemAnimations = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
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
                    require("../assets/images/audio/pop.mp3")
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

    const loadUnlockStatus = useCallback(async () => {
        try {
            setIsLoadingLocks(true);

            const keys = [
                "quiz1Finished",
                "quiz2Finished",
                "quiz3Finished",
                "quiz4Finished",
                "quiz5Finished",
                "quiz6Finished",
                "quiz7Finished",
            ];

            const entries = await AsyncStorage.multiGet(keys);
            const values = Object.fromEntries(entries);

            setUnlockedMap({
                "/lessons/lesson1": true,
                "/lessons/lesson2": values.quiz1Finished === "true",
                "/lessons/lesson3": values.quiz2Finished === "true",
                "/lessons/lesson4": values.quiz3Finished === "true",
                "/lessons/lesson5": values.quiz4Finished === "true",
                "/lessons/lesson6": values.quiz5Finished === "true",
                "/lessons/lesson7": values.quiz6Finished === "true",
                "/lessons/lesson8": values.quiz7Finished === "true",
            });
        } catch (error) {
            console.log("Failed to load unlock status:", error);
        } finally {
            setIsLoadingLocks(false);
        }
    }, []);

    const animateItemsWithPop = () => {
        itemAnimations.forEach((anim) => anim.setValue(0));

        menuItems.forEach((_, index) => {
            setTimeout(() => {
                Animated.timing(itemAnimations[index], {
                    toValue: 1,
                    duration: 320,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }).start();
            }, index * 90);
        });
    };

    const animateLockedModal = () => {
        modalScale.setValue(0.88);
        Animated.spring(modalScale, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        if (visible) {
            isClosingRef.current = false;
            setIsMounted(true);

            loadUnlockStatus();

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
    }, [visible, isMounted, backdropOpacity, panelTranslateY, loadUnlockStatus]);

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

        if (isLoadingLocks) return;

        const isUnlocked = unlockedMap[route] === true;

        if (!isUnlocked) {
            setLockedModalVisible(true);
            animateLockedModal();
            return;
        }

        closePanel(true);

        setTimeout(() => {
            router.push(route);
        }, 280);
    };

    const handleClosePress = async () => {
        await playPop();
        closePanel(true);
    };

    const closeLockedModal = async () => {
        await playPop();
        setLockedModalVisible(false);
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

                {isLoadingLocks ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#fff4c2" />
                        <Text style={styles.loadingText}>Inaayos ang mga lesson...</Text>
                    </View>
                ) : (
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

                                const isUnlocked = unlockedMap[item.route] === true;
                                const isLocked = !isUnlocked;

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
                                                isLocked && styles.gridButtonLocked,
                                                pressed && styles.gridButtonPressed,
                                            ]}
                                        >
                                            <View style={styles.lessonTopRow}>
                                                <Text
                                                    style={[
                                                        styles.lessonBadge,
                                                        isLocked && styles.lessonBadgeLocked,
                                                    ]}
                                                >
                                                    Lesson {index + 1}
                                                </Text>

                                                {isLocked && (
                                                    <Ionicons name="lock-closed" size={18} color="#5b4b4b" />
                                                )}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.gridButtonText,
                                                    isLocked && styles.gridButtonTextLocked,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>

                                            <Text
                                                style={[
                                                    styles.gridButtonSubtext,
                                                    isLocked && styles.gridButtonSubtextLocked,
                                                ]}
                                            >
                                                {item.letters}
                                            </Text>
                                        </Pressable>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </Animated.View>

            <Modal visible={lockedModalVisible} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [{ scale: modalScale }],
                            },
                        ]}
                    >
                        <View style={styles.lockIconCircle}>
                            <Ionicons name="lock-closed" size={34} color="#5a3900" />
                        </View>

                        <Text style={styles.modalTitle}>Naka-lock pa</Text>
                        <Text style={styles.modalText}>
                            Kailangan munang tapusin ang huling lesson upang mabuksan.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={closeLockedModal}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
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
        borderBlockColor: "#000000",
        borderWidth: 4,
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

    loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 50,
    },

    loadingText: {
        marginTop: 12,
        color: "#fff4c2",
        fontSize: 18,
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

    gridButtonLocked: {
        backgroundColor: "#d9d4cf",
        borderColor: "#8a817c",
    },

    gridButtonPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.92,
    },

    lessonTopRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },

    lessonBadge: {
        color: "#4a2d00",
        fontSize: 14,
        fontFamily: "HeyComic",
    },

    lessonBadgeLocked: {
        color: "#5b4b4b",
    },

    gridButtonText: {
        color: "#2f1b00",
        fontSize: 23,
        fontFamily: "HeyComic",
        marginBottom: 6,
        textAlign: "center",
    },

    gridButtonTextLocked: {
        color: "#4f4a46",
    },

    gridButtonSubtext: {
        color: "#5c3a00",
        fontSize: 13,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 18,
    },

    gridButtonSubtextLocked: {
        color: "#6b6460",
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    modalCard: {
        width: "100%",
        backgroundColor: "#fff7da",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#5a3900",
        padding: 24,
        alignItems: "center",
    },

    lockIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 999,
        backgroundColor: "#ffdf8a",
        borderWidth: 4,
        borderColor: "#5a3900",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    modalTitle: {
        color: "#2f1b00",
        fontSize: 30,
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    modalText: {
        color: "#5c3a00",
        fontSize: 18,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 26,
        marginBottom: 18,
    },

    modalButton: {
        minWidth: 150,
        backgroundColor: "#22B07D",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: "center",
    },

    modalButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});