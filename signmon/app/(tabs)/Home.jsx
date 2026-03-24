import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomPanel from "../../components/BottomPanel";
import LeftPanel from "../../components/LeftPanel";
import RightPanel from "../../components/RightPanel";
import Pet from "../../components/Pet";
import Stats from "../../components/StatsBar";
import Reward from "../../components/Reward";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Home() {
    const [openPanel, setOpenPanel] = useState(null);
    const [user, setUser] = useState(null);
    const [hat, setHat] = useState(null);
    const [dress, setDress] = useState(null);
    const [necklace, setNecklace] = useState(null);

    const [musicVolume, setMusicVolume] = useState(0.12);
    const [sfxVolume, setSfxVolume] = useState(0.45);

    const musicVolumeRef = useRef(0.12);
    const sfxVolumeRef = useRef(0.45);

    const settingsScale = useRef(new Animated.Value(1)).current;
    const wardrobeScale = useRef(new Animated.Value(1)).current;
    const learnScale = useRef(new Animated.Value(1)).current;
    const gearRotate = useRef(new Animated.Value(0)).current;

    const bgSoundRef = useRef(null);
    const popSoundRef = useRef(null);
    const isStartingBgRef = useRef(false);

    useEffect(() => {
        const loadSavedVolumes = async () => {
            try {
                const savedMusic = await AsyncStorage.getItem("musicVolume");
                const savedSfx = await AsyncStorage.getItem("sfxVolume");

                if (savedMusic !== null) {
                    const value = Number(savedMusic);
                    setMusicVolume(value);
                    musicVolumeRef.current = value;
                }

                if (savedSfx !== null) {
                    const value = Number(savedSfx);
                    setSfxVolume(value);
                    sfxVolumeRef.current = value;
                }
            } catch (error) {
                console.log("Error loading saved volume settings:", error);
            }
        };

        loadSavedVolumes();

        return () => {
            if (bgSoundRef.current) {
                bgSoundRef.current.unloadAsync();
                bgSoundRef.current = null;
            }

            if (popSoundRef.current) {
                popSoundRef.current.unloadAsync();
                popSoundRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        musicVolumeRef.current = musicVolume;
        AsyncStorage.setItem("musicVolume", String(musicVolume));

        const updateMusicVolume = async () => {
            try {
                if (bgSoundRef.current) {
                    await bgSoundRef.current.setVolumeAsync(musicVolume);
                }
            } catch (error) {
                console.log("Error updating music volume:", error);
            }
        };

        updateMusicVolume();
    }, [musicVolume]);

    useEffect(() => {
        sfxVolumeRef.current = sfxVolume;
        AsyncStorage.setItem("sfxVolume", String(sfxVolume));

        const updateSfxVolume = async () => {
            try {
                if (popSoundRef.current) {
                    await popSoundRef.current.setVolumeAsync(sfxVolume);
                }
            } catch (error) {
                console.log("Error updating sfx volume:", error);
            }
        };

        updateSfxVolume();
    }, [sfxVolume]);

    // 🔥 LOAD USER DATA
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.log("Error loading user:", error);
            }
        };

        loadUser();
    }, []);

    const closePanels = () => {
        setOpenPanel(null);
    };

    const animatePop = (anim, toValue = 0.92) => {
        Animated.sequence([
            Animated.timing(anim, {
                toValue,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(anim, {
                toValue: 1,
                friction: 4,
                tension: 140,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const spinGear = () => {
        gearRotate.setValue(0);

        Animated.timing(gearRotate, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
        }).start();
    };

    const stopBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current) {
                const sound = bgSoundRef.current;
                bgSoundRef.current = null;
                await sound.stopAsync();
                await sound.unloadAsync();
            }
        } catch (error) {
            console.log("Error stopping background music:", error);
        }
    }, []);

    const playBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current || isStartingBgRef.current) {
                return;
            }

            isStartingBgRef.current = true;

            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                require("../../assets/images/audio/mainTheme.mp3"),
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: musicVolumeRef.current,
                }
            );

            if (bgSoundRef.current) {
                await sound.unloadAsync();
            } else {
                bgSoundRef.current = sound;
            }
        } catch (error) {
            console.log("Error loading background music:", error);
        } finally {
            isStartingBgRef.current = false;
        }
    }, []);

    const playPopSound = useCallback(async () => {
        try {
            if (!popSoundRef.current) {
                const { sound } = await Audio.Sound.createAsync(
                    require("../../assets/images/audio/pop.mp3"),
                    {
                        shouldPlay: false,
                        volume: sfxVolumeRef.current,
                    }
                );

                popSoundRef.current = sound;
            }

            await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            await popSoundRef.current.replayAsync();
        } catch (error) {
            console.log("Error playing pop sound:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            playBackgroundMusic();
            return () => {
                stopBackgroundMusic();
            };
        }, [playBackgroundMusic, stopBackgroundMusic])
    );

    const openLeftPanel = async () => {
        await playPopSound();
        animatePop(settingsScale);
        spinGear();
        setOpenPanel("left");
    };

    const openRightPanel = async () => {
        await playPopSound();
        animatePop(wardrobeScale);
        setOpenPanel("right");
    };

    const openBottomPanel = async () => {
        await playPopSound();
        animatePop(learnScale, 0.95);
        setOpenPanel("bottom");
    };

    const clearProgress = async () => {
        try {
            await AsyncStorage.multiRemove([
                "quiz1Finished",
                "quiz2Finished",
                "quiz3Finished",
                "quiz4Finished",
                "quiz5Finished",
                "quiz6Finished",
                "quiz7Finished",
                "quiz8Finished",
                "lesson1Passed",
                "lesson2Passed",
                "lesson3Passed",
                "lesson4Passed",
                "lesson5Passed",
                "lesson6Passed",
                "lesson7Passed",
                "lesson8Passed",
            ]);

            console.log("Progress cleared!");
        } catch (e) {
            console.log("Error clearing progress:", e);
        }
    };

    const handleResetPress = async () => {
        await playPopSound();
        await clearProgress();
    };

    const handleBottomNavigate = async (route) => {
        await playPopSound();
        setOpenPanel(null);
        console.log("Navigate to:", route);
    };

    const gearRotateInterpolate = gearRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <ImageBackground
            source={require("../../assets/images/draftBG.png")}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.softBubbleOne} />
            <View style={styles.softBubbleTwo} />
            <View style={styles.softBubbleThree} />

            <Stats user={user} />

            <View style={styles.usernameCard}>
    <Text style={styles.username}>
        {user ? user.name : ""}
    </Text>
</View>
            {/* ✅ MASCOT (UNCHANGED) */}
            <View style={styles.mascotContainer}>
                <Pet hat={hat} dress={dress} necklace={necklace} />
            </View>

            {/* REST OF YOUR CODE UNCHANGED */}

            <Animated.View
                style={[
                    styles.leftButtonWrap,
                    { transform: [{ scale: settingsScale }] },
                ]}
            >
                <TouchableOpacity
                    style={styles.leftButton}
                    onPress={openLeftPanel}
                    activeOpacity={0.88}
                >
                    <Animated.View
                        style={{ transform: [{ rotate: gearRotateInterpolate }] }}
                    >
                        <FontAwesome name="gear" size={46} color="#1b1208" />
                    </Animated.View>
                    <Text style={styles.sideButtonLabel}>Ayos</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                style={[
                    styles.rightButtonWrap,
                    { transform: [{ scale: wardrobeScale }] },
                ]}
            >
                <TouchableOpacity
                    style={styles.rightButton}
                    onPress={openRightPanel}
                    activeOpacity={0.88}
                >
                    <MaterialCommunityIcons
                        name="hanger"
                        size={48}
                        color="#2c1600"
                    />
                    <Text style={styles.sideButtonLabel}>Damit</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                style={[
                    styles.learningButtonWrap,
                    { transform: [{ scale: learnScale }] },
                ]}
            >
                <TouchableOpacity
                    onPress={openBottomPanel}
                    activeOpacity={0.9}
                    style={styles.learnButton}
                >
                    <LinearGradient
                        colors={["#2b6cb0", "#184a8c", "#0d2f5e"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />

                    <View style={styles.learnBubbleOne} />
                    <View style={styles.learnBubbleTwo} />
                    <View style={styles.learnBubbleThree} />
                    <View style={styles.learnBubbleFour} />

                    <View style={styles.learnBookBadge}>
                        <Ionicons name="book" size={32} color="#1b1208" />
                    </View>

                    <Text style={styles.learnTitle}>Mag-Aral</Text>
                    <Text style={styles.learnSubtitle}>Buksan ang mga lesson</Text>
                </TouchableOpacity>
            </Animated.View>

            <LeftPanel
                visible={openPanel === "left"}
                onClose={closePanels}
                musicVolume={musicVolume}
                sfxVolume={sfxVolume}
                onMusicVolumeChange={setMusicVolume}
                onSfxVolumeChange={setSfxVolume}
            />

            {openPanel === "right" && (
                <Pressable style={styles.backdrop} onPress={closePanels} />
            )}

            {openPanel === "right" && (
                <View style={styles.panelWrapper} pointerEvents="box-none">
                    <View style={styles.panelContent}>
                        <RightPanel
                            setHat={setHat}
                            setDress={setDress}
                            setNecklace={setNecklace}
                            onPlaySfx={playPopSound}

                        />
                    </View>
                </View>
            )}

            <TouchableOpacity
                onPress={handleResetPress}
                style={styles.resetButton}
                activeOpacity={0.85}
            >
                <Text style={styles.resetButtonText}>RESET PROGRESS</Text>
            </TouchableOpacity>

            <BottomPanel
                visible={openPanel === "bottom"}
                onClose={closePanels}
                onNavigate={handleBottomNavigate}
                onPlaySfx={playPopSound}
            />

            <Reward />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    softBubbleOne: {
        position: "absolute",
        top: 130,
        left: 18,
        width: 80,
        height: 80,
        borderRadius: 999,
        backgroundColor: "rgba(125, 211, 252, 0.25)",
    },

    softBubbleTwo: {
        position: "absolute",
        top: 230,
        right: 22,
        width: 58,
        height: 58,
        borderRadius: 999,
        backgroundColor: "rgba(167, 139, 250, 0.22)",
    },

    softBubbleThree: {
        position: "absolute",
        bottom: 170,
        left: 50,
        width: 68,
        height: 68,
        borderRadius: 999,
        backgroundColor: "rgba(110, 231, 183, 0.2)",
    },

    leftButtonWrap: {
        position: "absolute",
        left: 20,
        top: "29%",
        zIndex: 2,
    },

    rightButtonWrap: {
        position: "absolute",
        right: 20,
        top: "29%",
        zIndex: 2,
    },

    leftButton: {
        width: 98,
        height: 108,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 34,
        borderWidth: 6,
        borderColor: "#000000",
        backgroundColor: "#08707a",
        paddingTop: 12,
    },

    rightButton: {
        width: 98,
        height: 108,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 34,
        borderWidth: 6,
        borderColor: "#000000",
        backgroundColor: "#e67b2e",
        paddingTop: 12,
    },

    sideButtonLabel: {
        marginTop: 4,
        color: "#1d1207",
        fontFamily: "HeyComic",
        fontSize: 16,
    },

    learningButtonWrap: {
        position: "absolute",
        bottom: 56,
        zIndex: 2,
    },

    learnButton: {
        width: 380,
        minHeight: 200,
        backgroundColor: "#0c3e78",
        borderRadius: 34,
        borderWidth: 6,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        paddingVertical: 16,
        overflow: "hidden",
    },

    learnBubbleOne: {
        position: "absolute",
        top: -10,
        left: -10,
        width: 100,
        height: 100,
        borderRadius: 999,
        backgroundColor: "rgba(36, 179, 179, 0.42)",
    },

    learnBubbleTwo: {
        position: "absolute",
        bottom: -12,
        right: -12,
        width: 100,
        height: 100,
        borderRadius: 999,
        backgroundColor: "rgba(90, 216, 255, 0.36)",
    },

    learnBubbleThree: {
        position: "absolute",
        top: 22,
        right: 34,
        width: 38,
        height: 38,
        borderRadius: 999,
        backgroundColor: "rgba(111, 240, 188, 0.34)",
    },

    learnBubbleFour: {
        position: "absolute",
        bottom: 18,
        left: 42,
        width: 34,
        height: 34,
        borderRadius: 999,
        backgroundColor: "rgba(255, 166, 102, 0.34)",
    },

    learnBookBadge: {
        width: 100,
        height: 74,
        borderRadius: 18,
        backgroundColor: "#fff4c2",
        borderWidth: 4,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },

    learnTitle: {
        color: "#fff4c2",
        fontFamily: "HeyComic",
        fontSize: 35,
        lineHeight: 45,
    },

    learnSubtitle: {
        marginTop: 2,
        color: "#dbeafe",
        fontFamily: "HeyComic",
        fontSize: 13,
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5,
    },

    panelWrapper: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        elevation: 10,
    },

    panelContent: {
        flex: 1,
    },

    resetButton: {
        position: "absolute",
        top: 24,
        alignSelf: "center",
        backgroundColor: "#ef4444",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: "#000000",
        zIndex: 20,
    },

    resetButtonText: {
        color: "white",
        fontFamily: "HeyComic",
        fontSize: 13,
    },

usernameCard: {
    position: "absolute",
    top: 240, 
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,

    backgroundColor: "rgba(0, 0, 0, 0.35)", 
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",

    zIndex: 10,
},

username: {
    fontSize: 40,
    fontFamily: "HeyComic",
    color: "#fff4c2",
},
});