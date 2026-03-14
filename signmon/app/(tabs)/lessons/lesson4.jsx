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

export default function Lesson4() {
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro

    const lessonVideos = useMemo(
        () => [
            {
                letter: "Pula",
                source: require("../../../assets/images/videos/Kulay/Pula(Red).mp4"),
            },
            {
                letter: "Bughaw",
                source: require("../../../assets/images/videos/Kulay/Asul(Blue).mp4"),
            },
            {
                letter: "Dilaw",
                source: require("../../../assets/images/videos/Kulay/Dilaw(Yellow).mp4"),
            },
            {
                letter: "Berde",
                source: require("../../../assets/images/videos/Kulay/Berde(Green).mp4"),
            },
            {
                letter: "Kahel",
                source: require("../../../assets/images/videos/Kulay/Kahel(Orange).mp4"),
            },
            {
                letter: "Lila",
                source: require("../../../assets/images/videos/Kulay/Lila(Violet).mp4"),
            },
            {
                letter: "Rosas",
                source: require("../../../assets/images/videos/Kulay/Rosas(Pink).mp4"),
            },
            {
                letter: "Kayumanggi",
                source: require("../../../assets/images/videos/Kulay/Kayumanggi(Brown).mp4"),
            },
            {
                letter: "Itim",
                source: require("../../../assets/images/videos/Kulay/Itim(Black).mp4"),
            },
            {
                letter: "Abo",
                source: require("../../../assets/images/videos/Kulay/Abo(Gray).mp4"),
            },
            {
                letter: "Puti",
                source: require("../../../assets/images/videos/Kulay/Puti(White).mp4"),
            },
            {
                letter: "Ginto",
                source: require("../../../assets/images/videos/Kulay/Ginto(Gold).mp4"),
            },
            {
                letter: "Pilak",
                source: require("../../../assets/images/videos/Kulay/Pilak(Silver).mp4"),
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
        router.replace("/");
    };

    const handleQuiz = () => {
        router.push("/lessons/quiz/quiz1");
    };

    const getTitle = () => {
        if (isIntro) return "Lesson 4 - Kulay";
        return `Lesson 4 - ${lessonVideos[currentIndex].letter}`;
    };

    const getProgressCardColor = () => {
        if (isIntro) return "#ffb703";

        const colorMap = {
            Pula: "#ef4444",
            Bughaw: "#3b82f6",
            Dilaw: "#facc15",
            Berde: "#22c55e",
            Kahel: "#f97316",
            Lila: "#a855f7",
            Rosas: "#ec4899",
            Kayumanggi: "#8b5e3c",
            Itim: "#111111",
            Abo: "#9ca3af",
            Puti: "#ffffff",
            Ginto: "#d4af37",
            Pilak: "#c0c0c0",
        };

        return colorMap[lessonVideos[currentIndex].letter] || "#ffb703";
    };

    const getProgressTextColor = () => {
        if (isIntro) return "#000";

        const lightBackgrounds = ["Dilaw", "Puti", "Abo", "Ginto", "Pilak"];
        return lightBackgrounds.includes(lessonVideos[currentIndex].letter)
            ? "#000"
            : "#fff";
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
                    <Text style={styles.introHeading}>Kulay</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng iba’t
                        ibang kulay sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Sa bawat hakbang, may isang video na magpapakita ng isang
                        kulay. Pindutin ang Susunod upang magpatuloy sa kasunod
                        na kulay, o Ulitin kung nais mong panoorin muli ang
                        kasalukuyang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Magsisimula tayo sa kulay na Pula.
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
                    <View
                        style={[
                            styles.progressCard,
                            { backgroundColor: getProgressCardColor() },
                        ]}
                    >
                        <Text
                            style={[
                                styles.progressText,
                                { color: getProgressTextColor() },
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                        >
                            {lessonVideos[currentIndex].letter}
                        </Text>
                        <Text
                            style={[
                                styles.progressSub,
                                { color: getProgressTextColor() },
                            ]}
                        >
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
        width: 240,
        height: 140,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        borderWidth: 3,
        borderColor: "#000",
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 14,
    },

    progressText: {
        fontSize: 28,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    progressSub: {
        fontSize: 14,
        fontFamily: "HeyComic",
        marginTop: 4,
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