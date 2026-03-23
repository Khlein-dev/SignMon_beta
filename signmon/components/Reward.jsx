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

const REWARD_MAP = {
    hat: [
        {
            key: "noHat",
            name: "Walang Sombrero",
            image: require("../assets/images/topHat.png"),
        },
        {
            key: "topHat",
            name: "Itim na Sombrero",
            image: require("../assets/images/topHat.png"),
        },
        {
            key: "santaHat",
            name: "Sombrerong Pamasko",
            image: require("../assets/images/santaHat.png"),
        },
        {
            key: "superHat",
            name: "Mahiwagang Sombrero",
            image: require("../assets/images/superHat.png"),
        },
        {
            key: "beanieHat",
            name: "Beanie Sombrero",
            image: require("../assets/images/beanieHat.png"),
        },
        {
            key: "gokuHat",
            name: "Goku na Sombrero",
            image: require("../assets/images/gokuHat.png"),
        },
        {
            key: "cowboyHat",
            name: "Kowboy Sombrero",
            image: require("../assets/images/cowboyHat.png"),
        },
        {
            key: "crownHat",
            name: "Maharlikang Sombrero",
            image: require("../assets/images/crownHat.png"),
        },
    ],

    dress: [
        {
            key: "noDress",
            name: "Walang Damit",
            image: require("../assets/images/noHat.png"),
        },
        {
            key: "suitDress",
            name: "Pormal na Damit",
            image: require("../assets/images/suitDress.png"),
        },
        {
            key: "jingleDress",
            name: "Damit na Pamasko",
            image: require("../assets/images/jingleDress.png"),
        },
        {
            key: "superDress",
            name: "Mahiwagang Damit",
            image: require("../assets/images/superDress.png"),
        },
        {
            key: "beanieDress",
            name: "Beanie Damit",
            image: require("../assets/images/beanieDress.png"),
        },
        {
            key: "gokuDress",
            name: "Goku na Damit",
            image: require("../assets/images/gokuDress.png"),
        },
        {
            key: "cowboyDress",
            name: "Kowboy Damit",
            image: require("../assets/images/cowboyDress.png"),
        },
        {
            key: "crownDress",
            name: "Maharlikang Damit",
            image: require("../assets/images/crownDress.png"),
        },
    ],

    necklace: [
        {
            key: "noAcc",
            name: "Walang Gamit",
            image: require("../assets/images/noHat.png"),
        },
        {
            key: "suitAcc",
            name: "Bulaklak",
            image: require("../assets/images/suitAcc.png"),
        },
        {
            key: "jingleAcc",
            name: "Berry Leaf",
            image: require("../assets/images/jingleAcc.png"),
        },
        {
            key: "superAcc",
            name: "Sorbetes",
            image: require("../assets/images/superAcc.png"),
        },
        {
            key: "beanieAcc",
            name: "Boom Box",
            image: require("../assets/images/beanieAcc.png"),
        },
        {
            key: "gokuAcc",
            name: "Doraemon",
            image: require("../assets/images/gokuAcc.png"),
        },
        {
            key: "cowboyAcc",
            name: "Kabayo",
            image: require("../assets/images/cowboyAcc.png"),
        },
        {
            key: "crownAcc",
            name: "Setro",
            image: require("../assets/images/crownAcc.png"),
        },
    ],
};

function getRewardItem(type, index = 1) {
    const list = REWARD_MAP[type];

    if (!list || !Array.isArray(list) || list.length === 0) {
        return {
            name: "Gantimpala",
            image: require("../assets/images/topHat.png"),
        };
    }

    const safeIndex = Math.max(0, Math.min(index, list.length - 1));
    return list[safeIndex];
}

function findRewardByKey(key) {
    if (!key) return null;

    const allRewards = Object.values(REWARD_MAP).flat();
    return allRewards.find((reward) => reward.key === key) || null;
}

const DEFAULT_ITEMS = [
    getRewardItem("hat", 1),
    getRewardItem("dress", 1),
    getRewardItem("necklace", 1),
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
    const popSoundRef = useRef(null);
    const beamLoopRef = useRef(null);
    const sfxVolumeRef = useRef(0.45);

    useEffect(() => {
        let mounted = true;

        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                });

                const savedSfxVolume = await AsyncStorage.getItem("sfxVolume");
                const parsedSfxVolume =
                    savedSfxVolume !== null ? Number(savedSfxVolume) : 0.45;

                sfxVolumeRef.current = Number.isFinite(parsedSfxVolume)
                    ? parsedSfxVolume
                    : 0.45;

                const [{ sound: cheerSound }, { sound: popSound }] =
                    await Promise.all([
                        Audio.Sound.createAsync(
                            require("../assets/images/audio/cheer.mp3"),
                            {
                                shouldPlay: false,
                                volume: sfxVolumeRef.current,
                            }
                        ),
                        Audio.Sound.createAsync(
                            require("../assets/images/audio/pop.mp3"),
                            {
                                shouldPlay: false,
                                volume: sfxVolumeRef.current,
                            }
                        ),
                    ]);

                if (!mounted) {
                    await cheerSound.unloadAsync();
                    await popSound.unloadAsync();
                    return;
                }

                cheerSoundRef.current = cheerSound;
                popSoundRef.current = popSound;
                setIsSoundReady(true);
            } catch (error) {
                console.log("Failed to load reward sounds:", error);
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

            if (popSoundRef.current) {
                popSoundRef.current.unloadAsync();
                popSoundRef.current = null;
            }
        };
    }, []);

    const refreshSfxVolume = useCallback(async () => {
        try {
            const savedSfxVolume = await AsyncStorage.getItem("sfxVolume");
            const parsedSfxVolume =
                savedSfxVolume !== null ? Number(savedSfxVolume) : 0.45;

            sfxVolumeRef.current = Number.isFinite(parsedSfxVolume)
                ? parsedSfxVolume
                : 0.45;

            if (cheerSoundRef.current) {
                await cheerSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (popSoundRef.current) {
                await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }
        } catch (error) {
            console.log("Failed to refresh sfx volume:", error);
        }
    }, []);

    const playCheer = useCallback(async () => {
        try {
            if (!cheerSoundRef.current) return;

            await refreshSfxVolume();
            await cheerSoundRef.current.setPositionAsync(0);
            await cheerSoundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play cheer sound:", error);
        }
    }, [refreshSfxVolume]);

    const playPop = useCallback(async () => {
        try {
            if (!popSoundRef.current) return;

            await refreshSfxVolume();
            await popSoundRef.current.setPositionAsync(0);
            await popSoundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    }, [refreshSfxVolume]);

    const normalizeItems = useCallback((items = []) => {
        const mapped = items.map((item) => {
            if (typeof item === "string") {
                const byKey = findRewardByKey(item);
                return byKey || getRewardItem(item, 1);
            }

            if (item?.key) {
                const byKey = findRewardByKey(item.key);

                if (byKey) {
                    return {
                        ...byKey,
                        name: item.name || byKey.name,
                    };
                }
            }

            if (item?.type && REWARD_MAP[item.type]) {
                return getRewardItem(item.type, item.index ?? item.variant ?? 1);
            }

            if (item?.image) {
                return {
                    name: item?.name || "Gantimpala",
                    image: item.image,
                };
            }

            return {
                name: item?.name || "Gantimpala",
                image: getRewardItem("hat", 0).image,
            };
        });

        while (mapped.length < 3) {
            mapped.push(DEFAULT_ITEMS[mapped.length]);
        }

        return mapped.slice(0, 3);
    }, []);

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
    }, [animateIn, isSoundReady, normalizeItems, playCheer]);

    useEffect(() => {
        checkPendingReward();
    }, [checkPendingReward]);

    useEffect(() => {
        if (visible && isSoundReady) {
            playCheer();
        }
    }, [visible, isSoundReady, playCheer]);

    const handleClose = async () => {
        await playPop();

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
                    <View style={styles.bubbleOne} />
                    <View style={styles.bubbleTwo} />
                    <View style={styles.bubbleThree} />
                    <View style={styles.bubbleFour} />

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

    bubbleOne: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: "rgba(255, 214, 102, 0.18)",
        top: -30,
        right: -15,
    },

    bubbleTwo: {
        position: "absolute",
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: "rgba(147, 197, 253, 0.22)",
        top: 110,
        left: -10,
    },

    bubbleThree: {
        position: "absolute",
        width: 48,
        height: 48,
        borderRadius: 999,
        backgroundColor: "rgba(196, 181, 253, 0.2)",
        bottom: 90,
        right: 18,
    },

    bubbleFour: {
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: 999,
        backgroundColor: "rgba(251, 207, 232, 0.22)",
        top: 40,
        left: 32,
    },

    beamWrapper: {
        width: 180,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
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
        width: 92,
        height: 92,
        borderRadius: 999,
        backgroundColor: "#ffe48a",
        borderWidth: 5,
        borderColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },

    title: {
        fontSize: 30,
        fontFamily: "HeyComic",
        color: "#111827",
        textAlign: "center",
        marginTop: 4,
    },

    subtitle: {
        fontSize: 18,
        fontFamily: "HeyComic",
        color: "#1f2937",
        textAlign: "center",
        marginTop: 4,
    },

    unlockText: {
        fontSize: 14,
        fontFamily: "HeyComic",
        color: "#4b5563",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 14,
        lineHeight: 20,
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
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: "center",
    },

    rewardImageWrap: {
        width: 68,
        height: 68,
        borderRadius: 999,
        backgroundColor: "#e0f2fe",
        borderWidth: 3,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },

    rewardImage: {
        width: 90,
        height: 90,
    },

    rewardName: {
        fontSize: 12,
        fontFamily: "HeyComic",
        color: "#2f1b00",
        textAlign: "center",
    },

    okButton: {
        minWidth: 150,
        backgroundColor: "#22b07d",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0c5b40",
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    okButtonText: {
        fontSize: 18,
        fontFamily: "HeyComic",
        color: "#ffffff",
    },
});