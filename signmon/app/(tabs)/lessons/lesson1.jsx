import React, { useEffect, useMemo, useState } from "react";
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

export default function Lesson1() {
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro

    const lessonVideos = useMemo(
        () => [
            {
                letter: "A",
                source: require("../../../assets/images/videos/A-N/A.mp4"),
            },
            {
                letter: "B",
                source: require("../../../assets/images/videos/A-N/B.mp4"),
            },
            {
                letter: "C",
                source: require("../../../assets/images/videos/A-N/C.mp4"),
            },
            {
                letter: "D",
                source: require("../../../assets/images/videos/A-N/D.mp4"),
            },
            {
                letter: "E",
                source: require("../../../assets/images/videos/A-N/E.mp4"),
            },
            {
                letter: "F",
                source: require("../../../assets/images/videos/A-N/F.mp4"),
            },
            {
                letter: "G",
                source: require("../../../assets/images/videos/A-N/G.mp4"),
            },
            {
                letter: "H",
                source: require("../../../assets/images/videos/A-N/H.mp4"),
            },
            {
                letter: "I",
                source: require("../../../assets/images/videos/A-N/I.mp4"),
            },
            {
                letter: "J",
                source: require("../../../assets/images/videos/A-N/J.mp4"),
            },
            {
                letter: "K",
                source: require("../../../assets/images/videos/A-N/K.mp4"),
            },
            {
                letter: "L",
                source: require("../../../assets/images/videos/A-N/L.mp4"),
            },
            {
                letter: "M",
                source: require("../../../assets/images/videos/A-N/M.mp4"),
            },
            {
                letter: "N",
                source: require("../../../assets/images/videos/A-N/N.mp4"),
            },
        ],
        []
    );

    const player = useVideoPlayer(null, (player) => {
        player.loop = false;
    });

    useEffect(() => {
        if (currentIndex >= 0 && currentIndex < lessonVideos.length) {
            player.replace(lessonVideos[currentIndex].source);
            player.play();
        }
    }, [currentIndex, lessonVideos, player]);

    const isIntro = currentIndex === -1;
    const isLastVideo = currentIndex === lessonVideos.length - 1;

    const handleReplay = () => {
        if (!isIntro) {
            player.currentTime = 0;
            player.play();
        }
    };

    const handleNext = () => {
        if (isIntro) {
            setCurrentIndex(0);
            return;
        }

        if (!isLastVideo) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex === 0) {
            setCurrentIndex(-1);
            return;
        }

        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleExit = () => {
        router.replace("/Home");
    };

    const handleQuiz = () => {
        router.push("/lessons/quiz/quiz1");
    };

    const getTitle = () => {
        if (isIntro) return "Lesson 1 - Alpabeto";
        return `Lesson 1 - Titik ${lessonVideos[currentIndex].letter}`;
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
                    <Text style={styles.introHeading}>FSL Part 1 (A–N)</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng alpabeto
                        mula A hanggang N sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Sa bawat hakbang, may isang video na magpapakita ng isang
                        titik. Pindutin ang Susunod upang magpatuloy sa kasunod na
                        titik, o Ulitin kung nais mong panoorin muli ang
                        kasalukuyang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Magsisimula tayo sa titik A.
                    </Text>

                    <TouchableOpacity
                        style={styles.nextButtonSingle}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Simulan ang Aralin</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={22}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.progressCard}>
                        <Text style={styles.progressText}>
                            {lessonVideos[currentIndex].letter}
                        </Text>
                        <Text style={styles.progressSub}>
                            ({currentIndex + 1}/{lessonVideos.length})
                        </Text>
                    </View>

                    <View style={styles.videoCard}>
                        <VideoView
                            key={lessonVideos[currentIndex].letter}
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
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="white"
                            />
                            <Text style={styles.buttonText}>Nakaraan</Text>
                        </TouchableOpacity>

                        {!isLastVideo ? (
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={handleNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Susunod</Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={22}
                                    color="white"
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.quizButton}
                                onPress={handleQuiz}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="help-circle"
                                    size={22}
                                    color="white"
                                />
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
        backgroundColor: "#fff3cd",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20,
    },

    title: {
        fontSize: 30,
        color: "#3b2a98",
        fontFamily: "HeyComic",
    },

    exitButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d72638",
        borderWidth: 3,
        borderColor: "#000",
    },

    introCard: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000",
        padding: 20,
        marginTop: 20,
    },

    introHeading: {
        fontSize: 28,
        color: "#3b2a98",
        fontFamily: "HeyComic",
        marginBottom: 14,
        textAlign: "center",
    },

    introText: {
        fontSize: 18,
        color: "#222",
        marginBottom: 12,
        lineHeight: 26,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    progressCard: {
        width: 120,
        height: 120,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffb703",
        borderRadius: 16,
        borderWidth: 3,
        borderColor: "#000",
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginBottom: 14,
    },

    progressText: {
        color: "#000",
        fontSize: 70,
        fontFamily: "HeyComic",
    },

    progressSub: {
        color: "#000",
        fontSize: 14,
        fontFamily: "HeyComic",
    },

    videoCard: {
        alignSelf: "center",
        width: "100%",
        height: "50%",
        aspectRatio: 9 / 16,
        backgroundColor: "#000",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000",
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
        backgroundColor: "#e76f51",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    replayButtonFull: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#3b2a98",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    nextButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#17a374",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    quizButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#6a4c93",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    nextButtonSingle: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#17a374",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    buttonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});