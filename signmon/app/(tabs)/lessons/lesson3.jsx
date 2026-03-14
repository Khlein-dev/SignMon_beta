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

export default function Lesson3() {
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro

    const lessonVideos = useMemo(
        () => [
            {
                numero: "1",
                source: require("../../../assets/images/videos/Numero/Isa.mp4"),
            },
            {
                numero: "2",
                source: require("../../../assets/images/videos/Numero/Dalawa.mp4"),
            },
            {
                numero: "3",
                source: require("../../../assets/images/videos/Numero/Tatlo.mp4"),
            },
            {
                numero: "4",
                source: require("../../../assets/images/videos/Numero/Apat.mp4"),
            },
            {
                numero: "5",
                source: require("../../../assets/images/videos/Numero/Lima.mp4"),
            },
            {
                numero: "6",
                source: require("../../../assets/images/videos/Numero/Anim.mp4"),
            },
            {
                numero: "7",
                source: require("../../../assets/images/videos/Numero/Pito.mp4"),
            },
            {
                numero: "8",
                source: require("../../../assets/images/videos/Numero/Walo.mp4"),
            },
            {
                numero: "9",
                source: require("../../../assets/images/videos/Numero/Siyam.mp4"),
            },
            {
                numero: "10",
                source: require("../../../assets/images/videos/Numero/Sampo.mp4"),
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
        if (isIntro) return "Lesson 3 - Numero";
        return `Lesson 3 - Numero ${lessonVideos[currentIndex].numero}`;
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
                    <Text style={styles.introHeading}>Numero</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas para sa
                        mga numero mula 1 hanggang 10.
                    </Text>

                    <Text style={styles.introText}>
                        Sa bawat hakbang, may isang video na magpapakita ng isang
                        numero. Pindutin ang Next upang magpatuloy sa susunod na
                        numero, o Replay kung nais mong panoorin muli ang
                        kasalukuyang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Magsisimula tayo sa numero 1.
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
                            {lessonVideos[currentIndex].numero}
                        </Text>
                        <Text style={styles.progressSub}>
                            ({currentIndex + 1}/{lessonVideos.length})
                        </Text>
                    </View>

                    <View style={styles.videoCard}>
                        <VideoView
                            key={lessonVideos[currentIndex].numero}
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