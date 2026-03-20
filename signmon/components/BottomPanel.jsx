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
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const QUIZ_KEYS = [
    "quiz1Finished",
    "quiz2Finished",
    "quiz3Finished",
    "quiz4Finished",
    "quiz5Finished",
    "quiz6Finished",
    "quiz7Finished",
];

const getSeenKey = (route) => `lessonUnlockedSeen:${route}`;

export default function BottomPanel({ visible, onClose, onPlaySfx }) {
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

    const [newlyUnlockedMap, setNewlyUnlockedMap] = useState({
        "/lessons/lesson1": false,
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
    const badgePulse = useRef(new Animated.Value(0)).current;
    const isClosingRef = useRef(false);

    const menuItems = useMemo(
        () => [
            {
                label: "Alpabeto A–G",
                route: "/lessons/lesson1",
                letters: "A, B, C, D, E, F, G",
                icon: "school",
            },
            {
                label: "Alpabeto H–N",
                route: "/lessons/lesson2",
                letters: "H, I, J, K, L, M, N",
                icon: "book",
            },
            {
                label: "Alpabeto Ñ–S",
                route: "/lessons/lesson3",
                letters: "Ñ, Ng, O, P, Q, R, S",
                icon: "library",
            },
            {
                label: "Alpabeto T–Z",
                route: "/lessons/lesson4",
                letters: "T, U, V, W, X, Y, Z",
                icon: "color-wand",
            },
            {
                label: "Mga Numero",
                route: "/lessons/lesson5",
                letters: "1, 2, 3, 4, 5...",
                icon: "calculator",
            },
            {
                label: "Mga Kulay",
                route: "/lessons/lesson6",
                letters: "Pula, Asul, Dilaw...",
                icon: "color-palette",
            },
            {
                label: "Ang Aking Pamilya",
                route: "/lessons/lesson7",
                letters: "Nanay, Tatay, Kuya...",
                icon: "people",
            },
            {
                label: "Anong Araw Na?",
                route: "/lessons/lesson8",
                letters: "Lunes hanggang Linggo",
                icon: "calendar",
            },
        ],
        []
    );

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const playPop = useCallback(async () => {
        try {
            await onPlaySfx?.();
        } catch (error) {
            console.log("Failed to play shared pop sound:", error);
        }
    }, [onPlaySfx]);

    const playTriplePop = useCallback(async () => {
        try {
            if (!onPlaySfx) return;
            await onPlaySfx();
            await sleep(140);
            await onPlaySfx();
            await sleep(140);
            await onPlaySfx();
        } catch (error) {
            console.log("Failed to play triple pop:", error);
        }
    }, [onPlaySfx]);

    const startBadgeAnimation = useCallback(() => {
        badgePulse.setValue(0);

        Animated.loop(
            Animated.sequence([
                Animated.timing(badgePulse, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(badgePulse, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [badgePulse]);

    const loadUnlockStatus = useCallback(async () => {
        try {
            setIsLoadingLocks(true);

            const seenKeys = [
                getSeenKey("/lessons/lesson2"),
                getSeenKey("/lessons/lesson3"),
                getSeenKey("/lessons/lesson4"),
                getSeenKey("/lessons/lesson5"),
                getSeenKey("/lessons/lesson6"),
                getSeenKey("/lessons/lesson7"),
                getSeenKey("/lessons/lesson8"),
            ];

            const entries = await AsyncStorage.multiGet([...QUIZ_KEYS, ...seenKeys]);
            const values = Object.fromEntries(entries);

            const nextUnlockedMap = {
                "/lessons/lesson1": true,
                "/lessons/lesson2": values.quiz1Finished === "true",
                "/lessons/lesson3": values.quiz2Finished === "true",
                "/lessons/lesson4": values.quiz3Finished === "true",
                "/lessons/lesson5": values.quiz4Finished === "true",
                "/lessons/lesson6": values.quiz5Finished === "true",
                "/lessons/lesson7": values.quiz6Finished === "true",
                "/lessons/lesson8": values.quiz7Finished === "true",
            };

            const nextNewlyUnlockedMap = {
                "/lessons/lesson1": false,
                "/lessons/lesson2":
                    nextUnlockedMap["/lessons/lesson2"] &&
                    values[getSeenKey("/lessons/lesson2")] !== "true",
                "/lessons/lesson3":
                    nextUnlockedMap["/lessons/lesson3"] &&
                    values[getSeenKey("/lessons/lesson3")] !== "true",
                "/lessons/lesson4":
                    nextUnlockedMap["/lessons/lesson4"] &&
                    values[getSeenKey("/lessons/lesson4")] !== "true",
                "/lessons/lesson5":
                    nextUnlockedMap["/lessons/lesson5"] &&
                    values[getSeenKey("/lessons/lesson5")] !== "true",
                "/lessons/lesson6":
                    nextUnlockedMap["/lessons/lesson6"] &&
                    values[getSeenKey("/lessons/lesson6")] !== "true",
                "/lessons/lesson7":
                    nextUnlockedMap["/lessons/lesson7"] &&
                    values[getSeenKey("/lessons/lesson7")] !== "true",
                "/lessons/lesson8":
                    nextUnlockedMap["/lessons/lesson8"] &&
                    values[getSeenKey("/lessons/lesson8")] !== "true",
            };

            setUnlockedMap(nextUnlockedMap);
            setNewlyUnlockedMap(nextNewlyUnlockedMap);
        } catch (error) {
            console.log("Failed to load unlock status:", error);
        } finally {
            setIsLoadingLocks(false);
        }
    }, []);

    const animateItemsWithPop = useCallback(() => {
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
    }, [itemAnimations, menuItems]);

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
        startBadgeAnimation();
    }, [startBadgeAnimation]);

    useEffect(() => {
        if (visible) {
            isClosingRef.current = false;
            setIsMounted(true);
            loadUnlockStatus();
            playTriplePop();

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
    }, [
        visible,
        isMounted,
        backdropOpacity,
        panelTranslateY,
        loadUnlockStatus,
        playTriplePop,
        animateItemsWithPop,
    ]);

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

    const markLessonAsSeen = useCallback(async (route) => {
        try {
            await AsyncStorage.setItem(getSeenKey(route), "true");
            setNewlyUnlockedMap((prev) => ({
                ...prev,
                [route]: false,
            }));
        } catch (error) {
            console.log("Failed to mark lesson as seen:", error);
        }
    }, []);

    const handlePressItem = async (route) => {
        await playPop();

        if (isLoadingLocks) return;

        const isUnlocked = unlockedMap[route] === true;

        if (!isUnlocked) {
            setLockedModalVisible(true);
            animateLockedModal();
            return;
        }

        if (newlyUnlockedMap[route]) {
            await markLessonAsSeen(route);
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

    const badgeScale = badgePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.08],
    });

    const badgeRotate = badgePulse.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-4deg"],
    });

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

                <View style={styles.headerBubbleOne} />
                <View style={styles.headerBubbleTwo} />
                <View style={styles.headerBubbleThree} />
                <View style={styles.headerBubbleFour} />

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
                                const isNew = newlyUnlockedMap[item.route] === true;

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
                                                isNew && styles.gridButtonNew,
                                                pressed && styles.gridButtonPressed,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.cardBubble,
                                                    styles.cardBubbleSmall,
                                                    styles.cardBubbleBlue,
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.cardBubble,
                                                    styles.cardBubbleMedium,
                                                    isNew
                                                        ? styles.cardBubbleMint
                                                        : styles.cardBubblePink,
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.cardBubble,
                                                    styles.cardBubbleLarge,
                                                    isLocked
                                                        ? styles.cardBubbleGray
                                                        : isNew
                                                        ? styles.cardBubbleLime
                                                        : styles.cardBubbleYellow,
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.cardBubble,
                                                    styles.cardBubbleTiny,
                                                    styles.cardBubblePurple,
                                                ]}
                                            />

                                            {isNew && (
                                                <Animated.View
                                                    style={[
                                                        styles.newBadge,
                                                        {
                                                            transform: [
                                                                { scale: badgeScale },
                                                                { rotate: badgeRotate },
                                                            ],
                                                        },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name="sparkles"
                                                        size={12}
                                                        color="#ffffff"
                                                        style={styles.newBadgeIcon}
                                                    />
                                                    <Text style={styles.newBadgeText}>Bago</Text>
                                                </Animated.View>
                                            )}

                                            <View style={styles.lessonTopRow}>
                                                <View
                                                    style={[
                                                        styles.lessonBadgePill,
                                                        isLocked && styles.lessonBadgePillLocked,
                                                        isNew && styles.lessonBadgePillNew,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.lessonBadge,
                                                            isLocked && styles.lessonBadgeLocked,
                                                            isNew && styles.lessonBadgeNewText,
                                                        ]}
                                                    >
                                                        Lesson {index + 1}
                                                    </Text>
                                                </View>

                                                <View
                                                    style={[
                                                        styles.iconCircle,
                                                        isLocked && styles.iconCircleLocked,
                                                        isNew && styles.iconCircleNew,
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={isLocked ? "lock-closed" : item.icon}
                                                        size={18}
                                                        color={
                                                            isLocked
                                                                ? "#5b4b4b"
                                                                : isNew
                                                                ? "#0C5B40"
                                                                : "#4a2d00"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            <Text
                                                style={[
                                                    styles.gridButtonText,
                                                    isLocked && styles.gridButtonTextLocked,
                                                    isNew && styles.gridButtonTextNew,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>

                                            <Text
                                                style={[
                                                    styles.gridButtonSubtext,
                                                    isLocked && styles.gridButtonSubtextLocked,
                                                    isNew && styles.gridButtonSubtextNew,
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
        borderColor: "#000000",
        borderWidth: 4,
        overflow: "hidden",
        zIndex: 999,
        elevation: 999,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    headerBubbleOne: {
        position: "absolute",
        top: -10,
        right: 20,
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    headerBubbleTwo: {
        position: "absolute",
        top: 55,
        left: -10,
        width: 58,
        height: 58,
        borderRadius: 999,
        backgroundColor: "rgba(255,214,102,0.18)",
    },

    headerBubbleThree: {
        position: "absolute",
        top: 120,
        right: 100,
        width: 42,
        height: 42,
        borderRadius: 999,
        backgroundColor: "rgba(125,211,252,0.18)",
    },

    headerBubbleFour: {
        position: "absolute",
        top: 30,
        right: 135,
        width: 24,
        height: 24,
        borderRadius: 999,
        backgroundColor: "rgba(167,139,250,0.16)",
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
        minHeight: 142,
        backgroundColor: "#ffbe55",
        justifyContent: "center",
        borderRadius: 28,
        borderColor: "#5a3900",
        borderWidth: 4,
        paddingVertical: 18,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        overflow: "hidden",
    },

    gridButtonLocked: {
        backgroundColor: "#d9d4cf",
        borderColor: "#8a817c",
    },

    gridButtonNew: {
        backgroundColor: "#8CF0B5",
        borderColor: "#0C5B40",
        shadowOpacity: 0.22,
    },

    gridButtonPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.94,
    },

    cardBubble: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.33,
    },

    cardBubbleSmall: {
        width: 38,
        height: 38,
        top: 12,
        right: 12,
    },

    cardBubbleMedium: {
        width: 56,
        height: 56,
        bottom: -8,
        right: 14,
    },

    cardBubbleLarge: {
        width: 78,
        height: 78,
        top: 38,
        left: -16,
    },

    cardBubbleTiny: {
        width: 22,
        height: 22,
        top: 44,
        right: 38,
    },

    cardBubbleBlue: {
        backgroundColor: "#93C5FD",
    },

    cardBubblePink: {
        backgroundColor: "#F9A8D4",
    },

    cardBubbleYellow: {
        backgroundColor: "#FDE68A",
    },

    cardBubblePurple: {
        backgroundColor: "#C4B5FD",
    },

    cardBubbleMint: {
        backgroundColor: "#A7F3D0",
    },

    cardBubbleLime: {
        backgroundColor: "#D9F99D",
    },

    cardBubbleGray: {
        backgroundColor: "#E7E5E4",
    },

    newBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 5,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#22B07D",
        borderWidth: 3,
        borderColor: "#0C5B40",
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },

    newBadgeIcon: {
        marginRight: 4,
    },

    newBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "HeyComic",
        lineHeight: 14,
    },

    lessonTopRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        zIndex: 2,
    },

    lessonBadgePill: {
        backgroundColor: "rgba(255,247,218,0.72)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 2,
        borderColor: "rgba(90,57,0,0.28)",
    },

    lessonBadgePillLocked: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderColor: "rgba(91,75,75,0.25)",
    },

    lessonBadgePillNew: {
        backgroundColor: "rgba(255,255,255,0.72)",
        borderColor: "rgba(12,91,64,0.18)",
    },

    lessonBadge: {
        color: "#4a2d00",
        fontSize: 13,
        fontFamily: "HeyComic",
    },

    lessonBadgeLocked: {
        color: "#5b4b4b",
    },

    lessonBadgeNewText: {
        color: "#0C5B40",
    },

    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,247,218,0.75)",
        borderWidth: 2,
        borderColor: "rgba(90,57,0,0.28)",
    },

    iconCircleLocked: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderColor: "rgba(91,75,75,0.25)",
    },

    iconCircleNew: {
        backgroundColor: "rgba(255,255,255,0.72)",
        borderColor: "rgba(12,91,64,0.2)",
    },

    gridButtonText: {
        color: "#2f1b00",
        fontSize: 23,
        fontFamily: "HeyComic",
        marginBottom: 6,
        textAlign: "center",
        zIndex: 2,
    },

    gridButtonTextLocked: {
        color: "#4f4a46",
    },

    gridButtonTextNew: {
        color: "#084C35",
    },

    gridButtonSubtext: {
        color: "#5c3a00",
        fontSize: 13,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 18,
        zIndex: 2,
    },

    gridButtonSubtextLocked: {
        color: "#6b6460",
    },

    gridButtonSubtextNew: {
        color: "#136149",
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