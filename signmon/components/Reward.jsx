import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const DEFAULT_ITEMS = [
    {
        name: "Sombrero",
        image: require("../assets/images/cowboy1.png"),
    },
    {
        name: "Damit",
        image: require("../assets/images/cat.png"),
    },
    {
        name: "Kuwintas",
        image: require("../assets/images/check.png"),
    },
];

export default function Reward() {
    const [visible, setVisible] = useState(false);
    const [isSoundReady, setIsSoundReady] = useState(false);
    const [rewardData, setRewardData] = useState({
        title: "May bagong gantimpala!",
        items: DEFAULT_ITEMS,
    });

    const modalScale = useRef(new Animated.Value(0.82)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const beamRotate = useRef(new Animated.Value(0)).current;
    const itemsAnim = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const cheerSoundRef = useRef(null);
    const beamLoopRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });

                const { sound } = await Audio.Sound.createAsync(
                    require("../assets/images/audio/cheer.mp3")
                );

                if (!mounted) {
                    await sound.unloadAsync();
                    return;
                }

                cheerSoundRef.current = sound;
                setIsSoundReady(true);
            } catch (error) {
                console.log("Failed to load cheer sound:", error);
            }
        };

        setupAudio();

        return () => {
            mounted = false;

            if (beamLoopRef.current) {
                beamLoopRef.current.stop();
                beamLoopRef.current = null;
            }

            if (cheerSoundRef.current) {
                cheerSoundRef.current.unloadAsync();
                cheerSoundRef.current = null;
            }
        };
    }, []);

    const playCheer = useCallback(async () => {
        try {
            if (!cheerSoundRef.current) return;

            await cheerSoundRef.current.setPositionAsync(0);
            await cheerSoundRef.current.playAsync();
        } catch (error) {
            console.log("Failed to play cheer sound:", error);
        }
    }, []);

    const normalizeItems = (items = []) => {
        const mapped = items.map((item) => ({
            name: item?.name || "Gantimpala",
            image: getRewardImage(item?.image),
        }));

        while (mapped.length < 3) {
            mapped.push(DEFAULT_ITEMS[mapped.length]);
        }

        return mapped.slice(0, 3);
    };

    const animateIn = useCallback(() => {
        modalScale.setValue(0.82);
        modalOpacity.setValue(0);
        beamRotate.setValue(0);

        itemsAnim.forEach((anim) => anim.setValue(0));

        Animated.parallel([
            Animated.spring(modalScale, {
                toValue: 1,
                friction: 6,
                tension: 120,
                useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        beamLoopRef.current = Animated.loop(
            Animated.timing(beamRotate, {
                toValue: 1,
                duration: 4500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        beamLoopRef.current.start();

        itemsAnim.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 320,
                delay: 180 + index * 120,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    }, [beamRotate, itemsAnim, modalOpacity, modalScale]);

    const checkPendingReward = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem("pendingQuizReward");
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (!parsed?.show) return;

            setRewardData({
                title: parsed?.title || "May bagong gantimpala!",
                items: normalizeItems(parsed?.items || DEFAULT_ITEMS),
            });

            setVisible(true);
            animateIn();

            if (isSoundReady) {
                await playCheer();
            }

            await AsyncStorage.removeItem("pendingQuizReward");
        } catch (error) {
            console.log("Failed to load pending reward:", error);
        }
    }, [animateIn, isSoundReady, playCheer]);

    useEffect(() => {
        checkPendingReward();
    }, [checkPendingReward]);

    useEffect(() => {
        if (visible && isSoundReady) {
            playCheer();
        }
    }, [visible, isSoundReady, playCheer]);

    const handleClose = () => {
        if (beamLoopRef.current) {
            beamLoopRef.current.stop();
            beamLoopRef.current = null;
        }

        setVisible(false);
    };

    const rotateInterpolate = beamRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalCard,
                        {
                            opacity: modalOpacity,
                            transform: [{ scale: modalScale }],
                        },
                    ]}
                >
                    <View style={styles.beamWrapper}>
                        <Animated.View
                            style={[
                                styles.beamSpin,
                                {
                                    transform: [{ rotate: rotateInterpolate }],
                                },
                            ]}
                        >
                            <View style={[styles.beam, styles.beamOne]} />
                            <View style={[styles.beam, styles.beamTwo]} />
                            <View style={[styles.beam, styles.beamThree]} />
                            <View style={[styles.beam, styles.beamFour]} />
                            <View style={[styles.beam, styles.beamFive]} />
                            <View style={[styles.beam, styles.beamSix]} />
                        </Animated.View>

                        <View style={styles.centerBadge}>
                            <FontAwesome5 name="trophy" size={44} color="black" />
                        </View>
                    </View>

                    <Text style={styles.title}>Binabati Kita!</Text>
                    <Text style={styles.subtitle}>Natapos mo na ang quiz!</Text>
                    <Text style={styles.unlockText}>
                        Nabuksan mo ang mga cosmetic na ito:
                    </Text>

                    <View style={styles.rewardRow}>
                        {rewardData.items.map((item, index) => {
                            const translateY = itemsAnim[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [22, 0],
                            });

                            const scale = itemsAnim[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            });

                            return (
                                <Animated.View
                                    key={`${item.name}-${index}`}
                                    style={[
                                        styles.rewardCard,
                                        {
                                            opacity: itemsAnim[index],
                                            transform: [{ translateY }, { scale }],
                                        },
                                    ]}
                                >
                                    <View style={styles.rewardImageWrap}>
                                        <Image
                                            source={item.image}
                                            style={styles.rewardImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.rewardName}>{item.name}</Text>
                                </Animated.View>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={styles.okButton}
                        onPress={handleClose}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.okButtonText}>Ayos!</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

function getRewardImage(type) {
    switch (type) {
        case "hat":
            return require("../assets/images/cowboy1.png");
        case "dress":
            return require("../assets/images/cat.png");
        case "necklace":
            return require("../assets/images/check.png");
        default:
            return require("../assets/images/noHat.png");
    }
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    modalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#fff7d9",
        borderRadius: 30,
        borderWidth: 5,
        borderColor: "#000000",
        paddingTop: 22,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: "center",
        overflow: "hidden",
    },

    beamWrapper: {
        width: 180,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },

    beamSpin: {
        position: "absolute",
        width: 180,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },

    beam: {
        position: "absolute",
        width: 24,
        height: 950,
        borderRadius: 999,
        backgroundColor: "rgba(255, 220, 120, 0.28)",
    },

    beamOne: {
        transform: [{ rotate: "0deg" }],
    },

    beamTwo: {
        transform: [{ rotate: "30deg" }],
    },

    beamThree: {
        transform: [{ rotate: "60deg" }],
    },

    beamFour: {
        transform: [{ rotate: "90deg" }],
    },

    beamFive: {
        transform: [{ rotate: "120deg" }],
    },

    beamSix: {
        transform: [{ rotate: "150deg" }],
    },

    centerBadge: {
        width: 90,
        height: 90,
        borderRadius: 999,
        backgroundColor: "#ffb86c",
        borderWidth: 5,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontSize: 32,
        color: "#2b1a00",
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    subtitle: {
        fontSize: 20,
        color: "#4a3210",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginTop: 4,
    },

    unlockText: {
        fontSize: 16,
        color: "#6a4b1f",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 16,
    },

    rewardRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 18,
    },

    rewardCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
    },

    rewardImageWrap: {
        width: 72,
        height: 72,
        borderRadius: 999,
        backgroundColor: "#e7f5ff",
        borderWidth: 3,
        borderColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    rewardImage: {
        width: 52,
        height: 52,
    },

    rewardName: {
        fontSize: 14,
        color: "#2b1a00",
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    okButton: {
        minWidth: 150,
        backgroundColor: "#22b07d",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: "center",
    },

    okButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});