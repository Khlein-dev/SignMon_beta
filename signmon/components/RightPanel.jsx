import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
    Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const BATCH_UNLOCK_KEYS = {
    batch2: "quiz1Finished",
    batch3: "quiz2Finished",
    batch4: "quiz3Finished",
    batch5: "quiz4Finished",
    batch6: "quiz5Finished",
    batch7: "quiz6Finished",
    batch8: "quiz7Finished",
};

export default function RightPanel({ setHat, setDress, setNecklace }) {
    const [section, setSection] = useState("hat");
    const [unlockState, setUnlockState] = useState({
        batch1: true,
        batch2: false,
        batch3: false,
        batch4: false,
        batch5: false,
        batch6: false,
        batch7: false,
        batch8: false,
    });
    const [lockedModalVisible, setLockedModalVisible] = useState(false);

    const soundRef = useRef(null);
    const modalScale = useRef(new Animated.Value(0.88)).current;
    const sectionScale = useRef({
        hat: new Animated.Value(1),
        dress: new Animated.Value(1),
        necklace: new Animated.Value(1),
    }).current;

    const itemAnimations = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    const loadUnlockState = useCallback(async () => {
        try {
            const entries = await AsyncStorage.multiGet([
                "quiz1Finished",
                "quiz2Finished",
                "quiz3Finished",
                "quiz4Finished",
                "quiz5Finished",
                "quiz6Finished",
                "quiz7Finished",
            ]);

            const values = Object.fromEntries(entries);

            setUnlockState({
                batch1: true,
                batch2: values.quiz1Finished === "true",
                batch3: values.quiz2Finished === "true",
                batch4: values.quiz3Finished === "true",
                batch5: values.quiz4Finished === "true",
                batch6: values.quiz5Finished === "true",
                batch7: values.quiz6Finished === "true",
                batch8: values.quiz7Finished === "true",
            });
        } catch (error) {
            console.log("Failed to load cosmetic unlock state:", error);
        }
    }, []);

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
        loadUnlockState();

        return () => {
            isActive = false;
            if (soundRef.current) {
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        };
    }, [loadUnlockState]);

    const playPop = async () => {
        try {
            if (!soundRef.current) return;
            await soundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    };

    const animateSectionPress = (key) => {
        const anim = sectionScale[key];
        anim.setValue(0.92);

        Animated.spring(anim, {
            toValue: 1,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
        }).start();
    };

    const animateItemsIn = useCallback(() => {
        itemAnimations.forEach((anim) => anim.setValue(0));

        itemAnimations.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 260,
                delay: index * 55,
                easing: Easing.out(Easing.back(1.15)),
                useNativeDriver: true,
            }).start();
        });
    }, [itemAnimations]);

    useEffect(() => {
        animateItemsIn();
    }, [section, animateItemsIn]);

    const showLockedModal = async () => {
        await playPop();
        setLockedModalVisible(true);

        modalScale.setValue(0.88);
        Animated.spring(modalScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    const closeLockedModal = async () => {
        await playPop();
        setLockedModalVisible(false);
    };

    const handleSectionPress = async (nextSection) => {
        await playPop();
        animateSectionPress(nextSection);
        setSection(nextSection);
    };

    const handleLockedAwarePress = async (item) => {
        if (!unlockState[item.batch]) {
            await showLockedModal();
            return;
        }

        await playPop();
        item.onPress();
    };

    const hatItems = useMemo(
        () => [
            {
                text: "Walang Sombrero",
                pic: require("../assets/images/noHat.png"),
                batch: "batch1",
                onPress: () => setHat(null),
            },
            {
                text: "Sombrerong Koboy",
                pic: require("../assets/images/cowboy1.png"),
                batch: "batch2",
                onPress: () => setHat(require("../assets/images/cowboy1.png")),
            },
            {
                text: "Sombrerong Pamasko",
                pic: require("../assets/images/santa2.png"),
                batch: "batch3",
                onPress: () => setHat(require("../assets/images/santa2.png")),
            },
            {
                text: "Itim na Sombrero",
                pic: require("../assets/images/blackhat1.png"),
                batch: "batch4",
                onPress: () => setHat(require("../assets/images/blackhat1.png")),
            },
            {
                text: "Masayang Sombrero",
                pic: require("../assets/images/cowboy1.png"),
                batch: "batch5",
                onPress: () => setHat(require("../assets/images/cowboy1.png")),
            },
            {
                text: "Mahikang Sombrero",
                pic: require("../assets/images/santa2.png"),
                batch: "batch6",
                onPress: () => setHat(require("../assets/images/santa2.png")),
            },
            {
                text: "Haring Sombrero",
                pic: require("../assets/images/blackhat1.png"),
                batch: "batch7",
                onPress: () => setHat(require("../assets/images/blackhat1.png")),
            },
            {
                text: "Bituing Sombrero",
                pic: require("../assets/images/cowboy1.png"),
                batch: "batch8",
                onPress: () => setHat(require("../assets/images/cowboy1.png")),
            },
        ],
        [setHat]
    );

    const dressItems = useMemo(
        () => [
            {
                text: "Walang Damit",
                pic: require("../assets/images/noHat.png"),
                batch: "batch1",
                onPress: () => setDress(null),
            },
            {
                text: "Pulang Damit",
                pic: require("../assets/images/cat.png"),
                batch: "batch2",
                onPress: () => setDress(require("../assets/images/cat.png")),
            },
            {
                text: "Asul na Damit",
                pic: require("../assets/images/check.png"),
                batch: "batch3",
                onPress: () => setDress(require("../assets/images/check.png")),
            },
            {
                text: "Maaraw na Damit",
                pic: require("../assets/images/cat.png"),
                batch: "batch4",
                onPress: () => setDress(require("../assets/images/cat.png")),
            },
            {
                text: "Ulap na Damit",
                pic: require("../assets/images/check.png"),
                batch: "batch5",
                onPress: () => setDress(require("../assets/images/check.png")),
            },
            {
                text: "Bahagharing Damit",
                pic: require("../assets/images/cat.png"),
                batch: "batch6",
                onPress: () => setDress(require("../assets/images/cat.png")),
            },
            {
                text: "Maharlikang Damit",
                pic: require("../assets/images/check.png"),
                batch: "batch7",
                onPress: () => setDress(require("../assets/images/check.png")),
            },
            {
                text: "Bituing Damit",
                pic: require("../assets/images/cat.png"),
                batch: "batch8",
                onPress: () => setDress(require("../assets/images/cat.png")),
            },
        ],
        [setDress]
    );

    const necklaceItems = useMemo(
        () => [
            {
                text: "Walang Kuwintas",
                pic: require("../assets/images/noHat.png"),
                batch: "batch1",
                onPress: () => setNecklace(null),
            },
            {
                text: "Kuwintas na Aklat",
                pic: require("../assets/images/check.png"),
                batch: "batch2",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Kuwintas na Bola",
                pic: require("../assets/images/check.png"),
                batch: "batch3",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Kuwintas na Puso",
                pic: require("../assets/images/check.png"),
                batch: "batch4",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Kuwintas na Buwan",
                pic: require("../assets/images/check.png"),
                batch: "batch5",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Kuwintas na Hiyas",
                pic: require("../assets/images/check.png"),
                batch: "batch6",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Maharlikang Kuwintas",
                pic: require("../assets/images/check.png"),
                batch: "batch7",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
            {
                text: "Kuwintas na Bituin",
                pic: require("../assets/images/check.png"),
                batch: "batch8",
                onPress: () => setNecklace(require("../assets/images/check.png")),
            },
        ],
        [setNecklace]
    );

    const currentItems =
        section === "hat"
            ? hatItems
            : section === "dress"
                ? dressItems
                : necklaceItems;

    return (
        <View style={styles.rightPanel}>
            <Bubble style={styles.bubbleOne} color="#63d0ff" />
            <Bubble style={styles.bubbleTwo} color="#ffd56f" />
            <Bubble style={styles.bubbleThree} color="#90f0c9" />

            <Text style={styles.title}>MGA ACCESSORY</Text>
            <Text style={styles.subtitle}>Piliin ang gusto mong isuot!</Text>

            <View style={styles.sectionRow}>
                <Animated.View style={{ transform: [{ scale: sectionScale.hat }] }}>
                    <TouchableOpacity
                        style={[
                            styles.sectionButton,
                            styles.sectionHat,
                            section === "hat" && styles.activeButton,
                        ]}
                        onPress={() => handleSectionPress("hat")}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={require("../assets/images/cap.png")}
                            style={styles.sectionIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: sectionScale.dress }] }}>
                    <TouchableOpacity
                        style={[
                            styles.sectionButton,
                            styles.sectionDress,
                            section === "dress" && styles.activeButton,
                        ]}
                        onPress={() => handleSectionPress("dress")}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={require("../assets/images/shirt.png")}
                            style={styles.sectionIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: sectionScale.necklace }] }}>
                    <TouchableOpacity
                        style={[
                            styles.sectionButton,
                            styles.sectionAccessories,
                            section === "necklace" && styles.activeButton,
                        ]}
                        onPress={() => handleSectionPress("necklace")}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={require("../assets/images/necklace.png")}
                            style={styles.sectionIconBig}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.grid}>
                    {currentItems.map((item, index) => {
                        const isLocked = !unlockState[item.batch];
                        const translateY = itemAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [22, 0],
                        });
                        const scale = itemAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                        });

                        return (
                            <Animated.View
                                key={`${section}-${item.text}-${index}`}
                                style={[
                                    styles.itemCardWrap,
                                    {
                                        opacity: itemAnimations[index],
                                        transform: [{ translateY }, { scale }],
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.itemCard,
                                        isLocked && styles.itemCardLocked,
                                    ]}
                                    onPress={() => handleLockedAwarePress(item)}
                                    activeOpacity={0.85}
                                >
                                    <View style={styles.itemTopRow}>
                                        <View style={styles.batchPill}>
                                            <Text style={styles.batchPillText}>
                                                {item.batch.replace("batch", "Batch ")}
                                            </Text>
                                        </View>

                                        {isLocked && (
                                            <View style={styles.lockBadge}>
                                                <Ionicons name="lock-closed" size={16} color="#5f4c4c" />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.imageCircle}>
                                        <Image source={item.pic} style={styles.itemImage} resizeMode="contain" />
                                    </View>

                                    <Text
                                        style={[
                                            styles.itemText,
                                            isLocked && styles.itemTextLocked,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <Modal visible={lockedModalVisible} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            { transform: [{ scale: modalScale }] },
                        ]}
                    >
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="lock-closed" size={34} color="#6b3d00" />
                        </View>

                        <Text style={styles.modalTitle}>Naka-lock pa</Text>
                        <Text style={styles.modalText}>Tapusin ang quiz para magamit.</Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={closeLockedModal}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

function Bubble({ style, color }) {
    return <View style={[styles.bubble, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
    rightPanel: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 330,
        backgroundColor: "#0c3e78",
        borderWidth: 6,
        borderColor: "#000000",
        paddingTop: 34,
        paddingHorizontal: 18,
        overflow: "hidden",
    },

    bubble: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.18,
    },

    bubbleOne: {
        width: 120,
        height: 120,
        top: 20,
        right: -20,
    },

    bubbleTwo: {
        width: 90,
        height: 90,
        top: 150,
        left: -20,
    },

    bubbleThree: {
        width: 140,
        height: 140,
        bottom: 80,
        right: -35,
    },

    title: {
        textAlign: "center",
        fontFamily: "HeyComic",
        color: "#fff3b0",
        fontSize: 28,
        marginBottom: 2,
    },

    subtitle: {
        textAlign: "center",
        fontFamily: "HeyComic",
        color: "#d5ecff",
        fontSize: 14,
        marginBottom: 16,
    },

    sectionRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 14,
    },

    sectionButton: {
        alignItems: "center",
        justifyContent: "center",
        width: 78,
        height: 78,
        borderRadius: 28,
        borderColor: "#000000",
        borderWidth: 4,
    },

    sectionHat: {
        backgroundColor: "#ff7b7b",
    },

    sectionDress: {
        backgroundColor: "#ffbe55",
    },

    sectionAccessories: {
        backgroundColor: "#6de0a8",
    },

    activeButton: {
        borderColor: "#ffffff",
        transform: [{ scale: 1.06 }],
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    sectionIcon: {
        width: 42,
        height: 42,
    },

    sectionIconBig: {
        width: 48,
        height: 48,
    },

    scrollContent: {
        paddingBottom: 28,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
    },

    itemCardWrap: {
        width: "48.2%",
    },

    itemCard: {
        minHeight: 172,
        backgroundColor: "#fff0b8",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#7a4b00",
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: "center",
    },

    itemCardLocked: {
        backgroundColor: "#d8d3cf",
        borderColor: "#8f8782",
    },

    itemTopRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    batchPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#6d4a00",
        backgroundColor: "#ffe19c",
    },

    batchPillText: {
        fontFamily: "HeyComic",
        fontSize: 10,
        color: "#2d1b00",
    },

    lockBadge: {
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: "#f4efea",
        borderWidth: 2,
        borderColor: "#8f8782",
        alignItems: "center",
        justifyContent: "center",
    },

    imageCircle: {
        width: 88,
        height: 88,
        borderRadius: 999,
        backgroundColor: "#ffffff",
        borderWidth: 3,
        borderColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    itemImage: {
        width: 68,
        height: 68,
    },

    itemText: {
        color: "#2a1700",
        fontFamily: "HeyComic",
        fontSize: 15,
        textAlign: "center",
    },

    itemTextLocked: {
        color: "#5f5954",
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    modalCard: {
        width: "92%",
        backgroundColor: "#fff8d9",
        borderRadius: 30,
        borderWidth: 4,
        borderColor: "#7a4b00",
        padding: 24,
        alignItems: "center",
    },

    modalIconCircle: {
        width: 78,
        height: 78,
        borderRadius: 999,
        backgroundColor: "#ffd97e",
        borderWidth: 4,
        borderColor: "#7a4b00",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },

    modalTitle: {
        color: "#2d1900",
        fontSize: 28,
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 8,
    },

    modalText: {
        color: "#5f3b00",
        fontSize: 18,
        fontFamily: "HeyComic",
        textAlign: "center",
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