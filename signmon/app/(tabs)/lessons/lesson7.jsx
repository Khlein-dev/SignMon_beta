import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";

export default function Lesson7() {
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro

    const lessonVideos = useMemo(
        () => [
            {
                member: "Tatay",
                source: require("../../../assets/images/videos/Pamilya/TATAY.mp4"),
            },
            {
                member: "Nanay",
                source: require("../../../assets/images/videos/Pamilya/NANAY.mp4"),
            },
            {
                member: "Kuya",
                source: require("../../../assets/images/videos/Pamilya/KUYA.mp4"),
            },
            {
                member: "Ate",
                source: require("../../../assets/images/videos/Pamilya/ATE.mp4"),
            },
            {
                member: "Bunso",
                source: require("../../../assets/images/videos/Pamilya/BABY.mp4"),
            },
            {
                member: "Pamilya",
                source: require("../../../assets/images/videos/Pamilya/PAMILYA.mp4"),
            },
        ],
        []
    );

    const player = useVideoPlayer(null, (playerInstance) => {
        playerInstance.loop = false;
        playerInstance.muted = true;
    });

    const soundRef = useRef(null);

    useEffect(() => {
        let isActive = true;

        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require("../../../assets/images/audio/pop.mp3")
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
        if (currentIndex >= 0 && currentIndex < lessonVideos.length) {
            player.replace(lessonVideos[currentIndex].source);
            player.muted = true;
            player.play();
        }
    }, [currentIndex, lessonVideos, player]);

    const playPop = async () => {
        try {
            if (!soundRef.current) return;
            await soundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    };

    const isIntro = currentIndex === -1;
    const isLastVideo = currentIndex === lessonVideos.length - 1;

    const handleReplay = async () => {
        await playPop();

        if (!isIntro) {
            player.currentTime = 0;
            player.muted = true;
            player.play();
        }
    };

    const handleNext = async () => {
        await playPop();

        if (isIntro) {
            setCurrentIndex(0);
            return;
        }

        if (!isLastVideo) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = async () => {
        await playPop();

        if (currentIndex === 0) {
            setCurrentIndex(-1);
            return;
        }

        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleExit = async () => {
        await playPop();
        router.replace("/Home");
    };

    const handleQuiz = async () => {
        await playPop();
        router.push("/lessons/quiz/quiz7");
    };

    const getTitle = () => {
        if (isIntro) return "Lesson 7 - Pamilya";
        return `Lesson 7 - ${lessonVideos[currentIndex].member}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{getTitle()}</Text>

                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleExit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {isIntro ? (
                <View style={styles.introCard}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Lesson 7</Text>
                    </View>

                    <Text style={styles.introHeading}>FSL Pamilya</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng mga miyembro ng
                        pamilya sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Bawat video ay nagpapakita ng isang salita. Pindutin ang Susunod
                        para sa kasunod na salita o Ulitin para mapanood muli ang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Handa ka na ba? Magsimula tayo kay Tatay.
                    </Text>

                    <TouchableOpacity
                        style={styles.nextButtonSingle}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Simulan ang Aralin</Text>
                        <Ionicons name="arrow-forward" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.progressCard}>
                        <Text style={styles.progressLabel}>Pamilya</Text>

                        <Text
                            style={styles.progressText}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                        >
                            {lessonVideos[currentIndex].member}
                        </Text>

                        <Text style={styles.progressSub}>
                            {currentIndex + 1} / {lessonVideos.length}
                        </Text>
                    </View>

                    <View style={styles.videoCard}>
                        <VideoView
                            key={lessonVideos[currentIndex].member}
                            style={styles.video}
                            player={player}
                            contentFit="contain"
                            allowsFullscreen={false}
                            allowsPictureInPicture={false}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.previousButton}
                            onPress={handlePrevious}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={22} color="white" />
                            <Text style={styles.buttonText}>Nakaraan</Text>
                        </TouchableOpacity>

                        {!isLastVideo ? (
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={handleNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Susunod</Text>
                                <Ionicons name="arrow-forward" size={22} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.quizButton}
                                onPress={handleQuiz}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="help-circle" size={22} color="white" />
                                <Text style={styles.buttonText}>Mag-Quiz</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.replayButtonFull}
                        onPress={handleReplay}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="refresh" size={22} color="white" />
                        <Text style={styles.buttonText}>Ulitin</Text>
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFEFC2",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 20,
    },

    title: {
        flex: 1,
        fontSize: 28,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        paddingRight: 12,
    },

    exitButton: {
        width: 50,
        height: 50,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B6B",
        borderWidth: 4,
        borderColor: "#3A1A1A",
    },

    introCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000000",
        padding: 22,
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    badge: {
        alignSelf: "center",
        backgroundColor: "#FFBE55",
        borderRadius: 999,
        borderWidth: 3,
        borderColor: "#5A3900",
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginBottom: 14,
    },

    badgeText: {
        color: "#4A2D00",
        fontSize: 16,
        fontFamily: "HeyComic",
    },

    introHeading: {
        fontSize: 30,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        marginBottom: 14,
        textAlign: "center",
    },

    introText: {
        fontSize: 18,
        color: "#3E2F1C",
        marginBottom: 12,
        lineHeight: 26,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    progressCard: {
        width: 220,
        minHeight: 132,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFBE55",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#5A3900",
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
    },

    progressLabel: {
        color: "#5C3A00",
        fontSize: 14,
        fontFamily: "HeyComic",
        marginBottom: 2,
    },

    progressText: {
        color: "#2F1B00",
        fontSize: 30,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 36,
    },

    progressSub: {
        color: "#5C3A00",
        fontSize: 14,
        fontFamily: "HeyComic",
        marginTop: 4,
    },

    videoCard: {
        alignSelf: "center",
        width: "100%",
        height: "48%",
        backgroundColor: "#103A73",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000000",
        overflow: "hidden",
        marginBottom: 20,
    },

    video: {
        flex: 1,
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },

    previousButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F28B54",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#6B2F12",
        paddingVertical: 16,
        gap: 8,
    },

    replayButtonFull: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2D2A8C",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#161355",
        paddingVertical: 16,
        gap: 8,
    },

    nextButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#22B07D",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 16,
        gap: 8,
    },

    quizButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8B5CF6",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#4C1D95",
        paddingVertical: 16,
        gap: 8,
    },

    nextButtonSingle: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#22B07D",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 16,
        gap: 8,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});