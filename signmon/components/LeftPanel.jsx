import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Animated,
    Easing,
} from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Audio } from "expo-av";

export default function LeftPanel({ visible, onClose }) {
    const [volume, setVolume] = useState(50);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const panelScale = useRef(new Animated.Value(0.86)).current;
    const panelOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.86)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;

    const soundRef = useRef(null);

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

    useEffect(() => {
        if (visible) {
            panelScale.setValue(0.86);
            panelOpacity.setValue(0);

            Animated.parallel([
                Animated.spring(panelScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 130,
                    useNativeDriver: true,
                }),
                Animated.timing(panelOpacity, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, panelOpacity, panelScale]);

    useEffect(() => {
        if (showAboutModal || showExitModal) {
            modalScale.setValue(0.86);
            modalOpacity.setValue(0);

            Animated.parallel([
                Animated.spring(modalScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 130,
                    useNativeDriver: true,
                }),
                Animated.timing(modalOpacity, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showAboutModal, showExitModal, modalOpacity, modalScale]);

    const playPop = async () => {
        try {
            if (!soundRef.current) return;
            await soundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    };

    const goToPage = async (path) => {
        await playPop();
        onClose?.();
        router.push(path);
    };

    const handleOpenAbout = async () => {
        await playPop();
        setShowAboutModal(true);
    };

    const handleCloseAbout = async () => {
        await playPop();
        setShowAboutModal(false);
    };

    const handleOpenExit = async () => {
        await playPop();
        setShowExitModal(true);
    };

    const handleCloseExit = async () => {
        await playPop();
        setShowExitModal(false);
    };

    const handleExit = async () => {
        await playPop();
        setShowExitModal(false);
        onClose?.();
        router.push("/");
    };

    const handleClosePanel = async () => {
        await playPop();
        onClose?.();
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleClosePanel}
            >
                <Pressable style={styles.overlay} onPress={handleClosePanel}>
                    <Animated.View
                        style={[
                            styles.overlayGlow,
                            { opacity: panelOpacity },
                        ]}
                    />

                    <Pressable onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.modalBox,
                                {
                                    opacity: panelOpacity,
                                    transform: [{ scale: panelScale }],
                                },
                            ]}
                        >
                            <View style={styles.bubbleOne} />
                            <View style={styles.bubbleTwo} />
                            <View style={styles.bubbleThree} />

                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>SETTINGS</Text>
                                    <Text style={styles.subtitle}>
                                        Ayusin ang iyong app
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClosePanel}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons
                                        name="close"
                                        size={34}
                                        color="#2d0b0b"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.menuButton, styles.audioButton]}
                                onPress={() => goToPage("/edit-audio")}
                                activeOpacity={0.85}
                            >
                                <View style={styles.iconBubble}>
                                    <MaterialIcons
                                        name="audiotrack"
                                        size={22}
                                        color="#17324f"
                                    />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuText}>
                                        Ayusin ang Tunog
                                    </Text>
                                    <Text style={styles.menuSubText}>
                                        Pumili at baguhin ang mga sound effect
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuButton, styles.aboutButton]}
                                onPress={handleOpenAbout}
                                activeOpacity={0.85}
                            >
                                <View style={styles.iconBubble}>
                                    <Ionicons
                                        name="information-circle"
                                        size={22}
                                        color="#17324f"
                                    />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuText}>
                                        Tungkol sa App
                                    </Text>
                                    <Text style={styles.menuSubText}>
                                        Alamin kung paano gamitin ang SignMon
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.volumeBox}>
                                <View style={styles.volumeHeader}>
                                    <View style={styles.iconBubble}>
                                        <Ionicons
                                            name="volume-high"
                                            size={22}
                                            color="#17324f"
                                        />
                                    </View>
                                    <View style={styles.menuTextWrap}>
                                        <Text style={styles.menuText}>
                                            Lakas ng Tunog
                                        </Text>
                                        <Text style={styles.menuSubText}>
                                            Isaayos ang volume ng app
                                        </Text>
                                    </View>
                                </View>

                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    value={volume}
                                    onValueChange={setVolume}
                                    minimumTrackTintColor="#5ec6ff"
                                    maximumTrackTintColor="#cfe8ff"
                                    thumbTintColor="#ff7f7f"
                                />

                                <View style={styles.volumeBadge}>
                                    <Text style={styles.volumeText}>
                                        {Math.round(volume)}%
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.exitButton}
                                onPress={handleOpenExit}
                                activeOpacity={0.85}
                            >
                                <View style={styles.iconBubbleDark}>
                                    <Ionicons
                                        name="exit-outline"
                                        size={22}
                                        color="#ffffff"
                                    />
                                </View>
                                <Text style={styles.exitText}>Lumabas</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={showAboutModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseAbout}
            >
                <Pressable style={styles.subOverlay} onPress={handleCloseAbout}>
                    <Pressable onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.subModal,
                                {
                                    opacity: modalOpacity,
                                    transform: [{ scale: modalScale }],
                                },
                            ]}
                        >
                            <View style={styles.subIconCircle}>
                                <FontAwesome5
                                    name="hands-helping"
                                    size={28}
                                    color="#24405e"
                                />
                            </View>

                            <Text style={styles.subTitle}>Tungkol sa SignMon</Text>

                            <Text style={styles.aboutText}>
                                Ang SignMon ay isang pambatang app na tumutulong
                                sa pag-aaral ng Filipino Sign Language o FSL sa
                                masaya at madaling paraan.
                            </Text>

                            <Text style={styles.aboutText}>
                                Maaari kang matuto ng alpabeto, numero, kulay,
                                pamilya, at mga araw gamit ang mga aralin,
                                video, quiz, at masasayang gantimpala.
                            </Text>

                            <Text style={styles.aboutText}>
                                Habang natatapos mo ang mga quiz, tumataas ang
                                iyong level at nabubuksan ang iba pang lesson at
                                accessories.
                            </Text>

                            <TouchableOpacity
                                style={styles.okButton}
                                onPress={handleCloseAbout}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.okButtonText}>Ayos</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={showExitModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseExit}
            >
                <Pressable style={styles.subOverlay} onPress={handleCloseExit}>
                    <Pressable onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.subModal,
                                {
                                    opacity: modalOpacity,
                                    transform: [{ scale: modalScale }],
                                },
                            ]}
                        >
                            <View style={styles.subIconCircleWarning}>
                                <Ionicons
                                    name="exit-outline"
                                    size={30}
                                    color="#5b0f0f"
                                />
                            </View>

                            <Text style={styles.subTitle}>Sigurado ka ba?</Text>
                            <Text style={styles.confirmText}>
                                Gusto mo na bang lumabas sa app?
                            </Text>

                            <View style={styles.confirmRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCloseExit}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Hindi
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={handleExit}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        Oo
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.28)",
    },

    overlayGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(125, 211, 252, 0.08)",
    },

    modalBox: {
        width: 340,
        borderRadius: 32,
        backgroundColor: "#0d3d78",
        borderWidth: 5,
        borderColor: "#000000",
        padding: 20,
        overflow: "hidden",
    },

    bubbleOne: {
        position: "absolute",
        top: -16,
        left: -12,
        width: 90,
        height: 90,
        borderRadius: 999,
        backgroundColor: "rgba(94, 198, 255, 0.18)",
    },

    bubbleTwo: {
        position: "absolute",
        bottom: -20,
        right: -8,
        width: 110,
        height: 110,
        borderRadius: 999,
        backgroundColor: "rgba(255, 148, 181, 0.14)",
    },

    bubbleThree: {
        position: "absolute",
        top: 140,
        right: 30,
        width: 44,
        height: 44,
        borderRadius: 999,
        backgroundColor: "rgba(132, 255, 191, 0.14)",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 18,
    },

    title: {
        fontSize: 31,
        color: "#fff4c2",
        fontFamily: "HeyComic",
    },

    subtitle: {
        color: "#d7ecff",
        fontSize: 14,
        fontFamily: "HeyComic",
        marginTop: 2,
    },

    closeButton: {
        width: 58,
        height: 58,
        borderRadius: 20,
        backgroundColor: "#ff8e8e",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#000000",
    },

    menuButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        borderWidth: 4,
        borderColor: "#000000",
    },

    audioButton: {
        backgroundColor: "#ffb86c",
    },

    aboutButton: {
        backgroundColor: "#7ed7ff",
    },

    iconBubble: {
        width: 42,
        height: 42,
        borderRadius: 999,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#000000",
        marginRight: 12,
    },

    iconBubbleDark: {
        width: 42,
        height: 42,
        borderRadius: 999,
        backgroundColor: "#8b1717",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#000000",
        marginRight: 10,
    },

    menuTextWrap: {
        flex: 1,
    },

    menuText: {
        color: "#1e1208",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    menuSubText: {
        color: "#3b2d22",
        fontSize: 11,
        fontFamily: "HeyComic",
        marginTop: 2,
    },

    volumeBox: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 18,
        borderWidth: 4,
        borderColor: "#000000",
    },

    volumeHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    slider: {
        width: "100%",
        height: 40,
    },

    volumeBadge: {
        alignSelf: "center",
        backgroundColor: "#ff8e8e",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 3,
        borderColor: "#000000",
        marginTop: 4,
    },

    volumeText: {
        color: "#2c1212",
        fontSize: 15,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    exitButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff6b6b",
        borderRadius: 22,
        paddingVertical: 14,
        borderWidth: 4,
        borderColor: "#000000",
        marginTop: 4,
    },

    exitText: {
        color: "#2d0b0b",
        fontSize: 19,
        fontFamily: "HeyComic",
    },

    subOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "rgba(0,0,0,0.38)",
    },

    subModal: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#fff6d9",
        borderRadius: 30,
        borderWidth: 5,
        borderColor: "#000000",
        padding: 22,
        alignItems: "center",
    },

    subIconCircle: {
        width: 76,
        height: 76,
        borderRadius: 999,
        backgroundColor: "#a9e3ff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#000000",
        marginBottom: 12,
    },

    subIconCircleWarning: {
        width: 76,
        height: 76,
        borderRadius: 999,
        backgroundColor: "#ffb1b1",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#000000",
        marginBottom: 12,
    },

    subTitle: {
        fontSize: 28,
        color: "#2b1a00",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    aboutText: {
        fontSize: 16,
        color: "#3b2d22",
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 10,
    },

    confirmText: {
        fontSize: 18,
        color: "#3b2d22",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 18,
    },

    okButton: {
        minWidth: 140,
        backgroundColor: "#22b07d",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 6,
    },

    okButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    confirmRow: {
        width: "100%",
        flexDirection: "row",
        gap: 12,
    },

    cancelButton: {
        flex: 1,
        backgroundColor: "#7ed7ff",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 14,
        alignItems: "center",
    },

    cancelButtonText: {
        color: "#16324f",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    confirmButton: {
        flex: 1,
        backgroundColor: "#ff6b6b",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 14,
        alignItems: "center",
    },

    confirmButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});