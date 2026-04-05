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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
    const pressAnimations = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(1))
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
                colors: ["#FFF3B0", "#FFD43B"],
                base: "#D49E00",
                accent: "#FF8FAB",
                iconBg: "#FFE066",
            },
            {
                label: "Alpabeto H–N",
                route: "/lessons/lesson2",
                letters: "H, I, J, K, L, M, N",
                icon: "book",
                colors: ["#FFD8A8", "#FF922B"],
                base: "#C56A05",
                accent: "#74C0FC",
                iconBg: "#FFA94D",
            },
            {
                label: "Alpabeto Ñ–S",
                route: "/lessons/lesson3",
                letters: "Ñ, Ng, O, P, Q, R, S",
                icon: "library",
                colors: ["#D0EBFF", "#74C0FC"],
                base: "#2B7DBD",
                accent: "#69DB7C",
                iconBg: "#A5D8FF",
            },
            {
                label: "Alpabeto T–Z",
                route: "/lessons/lesson4",
                letters: "T, U, V, W, X, Y, Z",
                icon: "color-wand",
                colors: ["#E5DBFF", "#B197FC"],
                base: "#7353BA",
                accent: "#FFD43B",
                iconBg: "#D0BFFF",
            },
            {
                label: "Mga Numero",
                route: "/lessons/lesson5",
                letters: "1, 2, 3, 4, 5...",
                icon: "calculator",
                colors: ["#C3FAE8", "#63E6BE"],
                base: "#1E9E73",
                accent: "#FF8787",
                iconBg: "#96F2D7",
            },
            {
                label: "Mga Kulay",
                route: "/lessons/lesson6",
                letters: "Pula, Asul, Dilaw...",
                icon: "color-palette",
                colors: ["#FFE3E3", "#FF8787"],
                base: "#D9485F",
                accent: "#B197FC",
                iconBg: "#FFC9C9",
            },
            {
                label: "Ang Aking Pamilya",
                route: "/lessons/lesson7",
                letters: "Nanay, Tatay, Kuya...",
                icon: "people",
                colors: ["#FFF3BF", "#FCC419"],
                base: "#D18B00",
                accent: "#74C0FC",
                iconBg: "#FFE066",
            },
            {
                label: "Anong Araw Na?",
                route: "/lessons/lesson8",
                letters: "Lunes hanggang Linggo",
                icon: "calendar",
                colors: ["#DCEEFF", "#4DABF7"],
                base: "#1F78C1",
                accent: "#63E6BE",
                iconBg: "#A5D8FF",
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

    const animatePressIn = useCallback((index) => {
        Animated.spring(pressAnimations[index], {
            toValue: 0.94,
            friction: 5,
            tension: 220,
            useNativeDriver: true,
        }).start();
    }, [pressAnimations]);

    const animatePressOut = useCallback((index) => {
        Animated.spring(pressAnimations[index], {
            toValue: 1,
            friction: 4,
            tension: 220,
            useNativeDriver: true,
        }).start();
    }, [pressAnimations]);

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
                Animated.spring(itemAnimations[index], {
                    toValue: 1,
                    friction: 6,
                    tension: 140,
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

    const handlePressItem = async (route, index) => {
        animatePressOut(index);
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
        outputRange: [1, 1.1],
    });

    const badgeRotate = badgePulse.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-5deg"],
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
                    colors={["#7DD3FC", "#8CE99A", "#FFE066", "#FFD6E7"]}
                    locations={[0, 0.38, 0.72, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.cloudOne} />
                <View style={styles.cloudTwo} />
                <View style={styles.cloudThree} />
                <View style={styles.sunGlow} />
                <View style={styles.handle} />

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Mapa ng Aralin</Text>
                        <Text style={styles.subtitle}>Sundan ang masayang daan ng lessons</Text>
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
                        <ActivityIndicator size="large" color="#124076" />
                        <Text style={styles.loadingText}>Inaayos ang makulay na mapa...</Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.mapContainer}>
                            <View style={styles.pathRail} />

                            {menuItems.map((item, index) => {
                                const entranceTranslateY = itemAnimations[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                });

                                const entranceScale = itemAnimations[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.82, 1],
                                });

                                const pressScale = pressAnimations[index];

                                const isUnlocked = unlockedMap[item.route] === true;
                                const isLocked = !isUnlocked;
                                const isNew = newlyUnlockedMap[item.route] === true;
                                const isLeft = index % 2 === 0;

                                return (
                                    <Animated.View
                                        key={item.route}
                                        style={[
                                            styles.stopWrap,
                                            isLeft ? styles.stopLeft : styles.stopRight,
                                            {
                                                opacity: itemAnimations[index],
                                                transform: [
                                                    { translateY: entranceTranslateY },
                                                    { scale: Animated.multiply(entranceScale, pressScale) },
                                                ],
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.connector,
                                                isLeft ? styles.connectorLeft : styles.connectorRight,
                                            ]}
                                        />

                                        <View
                                            style={[
                                                styles.ellipseBase,
                                                {
                                                    backgroundColor: isLocked ? "#A8A8A8" : item.base,
                                                },
                                            ]}
                                        />

                                        <Pressable
                                            onPressIn={() => animatePressIn(index)}
                                            onPressOut={() => animatePressOut(index)}
                                            onPress={() => handlePressItem(item.route, index)}
                                            style={styles.pressableArea}
                                        >
                                            <LinearGradient
                                                colors={
                                                    isLocked
                                                        ? ["#ECECEC", "#D9D9D9"]
                                                        : isNew
                                                            ? ["#D8FFE5", "#8CF0B5"]
                                                            : item.colors
                                                }
                                                start={{ x: 0.15, y: 0.05 }}
                                                end={{ x: 0.85, y: 1 }}
                                                style={[
                                                    styles.ellipseCard,
                                                    isLocked && styles.ellipseCardLocked,
                                                    isNew && styles.ellipseCardNew,
                                                ]}
                                            >
                                                <View style={styles.topGloss} />
                                                <View style={styles.miniBubbleOne} />
                                                <View style={styles.miniBubbleTwo} />
                                                <View style={styles.miniBubbleThree} />

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
                                                            size={13}
                                                            color="#FFFFFF"
                                                            style={styles.newBadgeIcon}
                                                        />
                                                        <Text style={styles.newBadgeText}>Bago</Text>
                                                    </Animated.View>
                                                )}

                                                <View style={styles.cardTopRow}>
                                                    <View
                                                        style={[
                                                            styles.lessonIndexPill,
                                                            isLocked && styles.lessonIndexPillLocked,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.lessonIndexText,
                                                                isLocked && styles.lessonIndexTextLocked,
                                                            ]}
                                                        >
                                                            Lesson {index + 1}
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.iconCircle,
                                                            {
                                                                backgroundColor: isLocked
                                                                    ? "#F0F0F0"
                                                                    : item.iconBg,
                                                            },
                                                            isLocked && styles.iconCircleLocked,
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name={isLocked ? "lock-closed" : item.icon}
                                                            size={26}
                                                            color={isLocked ? "#6B6B6B" : "#21435E"}
                                                        />
                                                    </View>
                                                </View>

                                                <Text
                                                    style={[
                                                        styles.lessonTitle,
                                                        isLocked && styles.lessonTitleLocked,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.lessonSubtext,
                                                        isLocked && styles.lessonSubtextLocked,
                                                    ]}
                                                >
                                                    {item.letters}
                                                </Text>

                                                <View style={styles.footerRow}>
                                                    <View
                                                        style={[
                                                            styles.playChip,
                                                            isLocked && styles.playChipLocked,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.playChipText,
                                                                isLocked && styles.playChipTextLocked,
                                                            ]}
                                                        >
                                                            {isLocked ? "Locked" : "Play"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </LinearGradient>
                                        </Pressable>
                                    </Animated.View>
                                );
                            })}

                            <View style={styles.finishWrap}>
                                <MaterialIcons name="celebration" size={24} color="#21435E" />
                                <Text style={styles.finishText}>Ang saya ng pag-aaral!</Text>
                            </View>
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
                            <Ionicons name="lock-closed" size={34} color="#5A3900" />
                        </View>

                        <Text style={styles.modalTitle}>Naka-lock pa</Text>
                        <Text style={styles.modalText}>
                            Tapusin muna ang naunang lesson para mabuksan ang susunod na stop sa mapa.
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
        top: 55,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        borderWidth: 4,
        borderColor: "#24557A",
        overflow: "hidden",
        zIndex: 999,
        elevation: 999,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    cloudOne: {
        position: "absolute",
        top: 28,
        left: 18,
        width: 110,
        height: 44,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.28)",
    },

    cloudTwo: {
        position: "absolute",
        top: 88,
        right: 24,
        width: 86,
        height: 32,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.24)",
    },

    cloudThree: {
        position: "absolute",
        top: 145,
        left: 82,
        width: 56,
        height: 22,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
    },

    sunGlow: {
        position: "absolute",
        top: -18,
        right: -18,
        width: 128,
        height: 128,
        borderRadius: 999,
        backgroundColor: "rgba(255, 214, 102, 0.28)",
    },

    handle: {
        alignSelf: "center",
        width: 72,
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.65)",
        marginBottom: 14,
    },

    header: {
        minHeight: 80,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    title: {
        color: "#124076",
        fontSize: 40,
        fontFamily: "HeyComic",
        lineHeight: 46,
    },

    subtitle: {
        color: "#24557A",
        fontSize: 17,
        fontFamily: "HeyComic",
        marginTop: 4,
    },

    closeButton: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#FF7B7B",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#7A2E2E",
    },

    closeButtonPressed: {
        transform: [{ scale: 0.96 }],
    },

    closeButtonText: {
        color: "#2B1111",
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
        color: "#124076",
        fontSize: 20,
        fontFamily: "HeyComic",
    },

    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },

    mapContainer: {
        position: "relative",
        minHeight: 1180,
        paddingTop: 4,
        paddingBottom: 30,
    },

    pathRail: {
        position: "absolute",
        top: 16,
        bottom: 78,
        left: "50%",
        marginLeft: -11,
        width: 22,
        borderRadius: 999,
        backgroundColor: "#FFF0A6",
        borderWidth: 4,
        borderColor: "#A8792A",
        borderStyle: "dashed",
    },

    stopWrap: {
        position: "relative",
        width: "82%",
        marginBottom: 30,
        overflow: "visible",
        zIndex: 1,
    },

    stopLeft: {
        alignSelf: "flex-start",
    },

    stopRight: {
        alignSelf: "flex-end",
    },

    connector: {
        position: "absolute",
        top: 72,
        width: 54,
        height: 18,
        backgroundColor: "#FFF0A6",
        borderWidth: 4,
        borderColor: "#A8792A",
        borderRadius: 999,
        zIndex: 0,
    },

    connectorLeft: {
        right: -30,
    },

    connectorRight: {
        left: -30,
    },

    pressableArea: {
        position: "relative",
        zIndex: 3,
        overflow: "visible",
    },

    ellipseBase: {
        position: "absolute",
        left: 8,
        right: 8,
        bottom: -10,
        height: 162,
        borderRadius: 999,
        zIndex: 1,
        opacity: 0.95,
    },

    ellipseCard: {
        minHeight: 162,
        borderRadius: 999,
        borderWidth: 4,
        borderColor: "#2D5B83",
        paddingTop: 18,
        paddingBottom: 18,
        paddingHorizontal: 20,
        justifyContent: "center",
        overflow: "visible",
        zIndex: 2,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 5 },
        elevation: 6,
    },

    ellipseCardLocked: {
        borderColor: "#989898",
    },

    ellipseCardNew: {
        borderColor: "#0C8B5A",
    },

    topGloss: {
        position: "absolute",
        top: 10,
        left: 24,
        right: 24,
        height: 34,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.24)",
        zIndex: 2,
    },

    miniBubbleOne: {
        position: "absolute",
        top: 16,
        right: 32,
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.24)",
        zIndex: 2,
    },

    miniBubbleTwo: {
        position: "absolute",
        bottom: 18,
        left: 20,
        width: 18,
        height: 18,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.22)",
        zIndex: 2,
    },

    miniBubbleThree: {
        position: "absolute",
        bottom: 16,
        right: 52,
        width: 46,
        height: 18,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.2)",
        zIndex: 2,
    },

    newBadge: {
        position: "absolute",
        top: 12,
        right: 70,
        zIndex: 9999,
        elevation: 9999,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#22B07D",
        borderWidth: 3,
        borderColor: "#0C5B40",
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },

    newBadgeIcon: {
        marginRight: 4,
    },

    newBadgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontFamily: "HeyComic",
        lineHeight: 16,
    },

    cardTopRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        zIndex: 6,
    },

    lessonIndexPill: {
        backgroundColor: "rgba(255,255,255,0.88)",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 2,
        borderColor: "rgba(45,91,131,0.2)",
        zIndex: 5,
    },

    lessonIndexPillLocked: {
        backgroundColor: "rgba(255,255,255,0.72)",
        borderColor: "rgba(120,120,120,0.2)",
    },

    lessonIndexText: {
        color: "#21435E",
        fontSize: 14,
        fontFamily: "HeyComic",
    },

    lessonIndexTextLocked: {
        color: "#666666",
    },

    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "rgba(45,91,131,0.16)",
        zIndex: 5,
    },

    iconCircleLocked: {
        borderColor: "rgba(120,120,120,0.18)",
    },

    lessonTitle: {
        color: "#16324F",
        fontSize: 28,
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 8,
        paddingHorizontal: 20,
        zIndex: 5,
    },

    lessonTitleLocked: {
        color: "#5D5D5D",
    },

    lessonSubtext: {
        color: "#355C7D",
        fontSize: 15,
        fontFamily: "HeyComic",
        lineHeight: 20,
        textAlign: "center",
        paddingHorizontal: 18,
        zIndex: 5,
    },

    lessonSubtextLocked: {
        color: "#757575",
    },

    footerRow: {
        marginTop: 14,
        alignItems: "center",
        zIndex: 5,
    },

    playChip: {
        minWidth: 100,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        borderWidth: 3,
        borderColor: "#2D5B83",
        paddingVertical: 8,
        paddingHorizontal: 18,
    },

    playChipLocked: {
        backgroundColor: "#F5F5F5",
        borderColor: "#A0A0A0",
    },

    playChipText: {
        color: "#21435E",
        fontSize: 14,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    playChipTextLocked: {
        color: "#7B7B7B",
    },

    finishWrap: {
        marginTop: 6,
        alignItems: "center",
    },

    finishEmoji: {
        fontSize: 36,
        marginBottom: 6,
    },

    finishText: {
        color: "#124076",
        fontSize: 20,
        fontFamily: "HeyComic",
        textAlign: "center",
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
        backgroundColor: "#FFF7DA",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#5A3900",
        padding: 24,
        alignItems: "center",
    },

    lockIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 999,
        backgroundColor: "#FFDF8A",
        borderWidth: 4,
        borderColor: "#5A3900",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    modalTitle: {
        color: "#2F1B00",
        fontSize: 30,
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    modalText: {
        color: "#5C3A00",
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