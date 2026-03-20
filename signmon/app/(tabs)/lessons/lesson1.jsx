import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        ],
        []
    );

    const player = useVideoPlayer(null, (playerInstance) => {
        playerInstance.loop = false;
        playerInstance.muted = true;
    });

    const popSoundRef = useRef(null);
    const bgSoundRef = useRef(null);
    const isStartingBgRef = useRef(false);

    const musicVolumeRef = useRef(0.12);
    const sfxVolumeRef = useRef(0.45);

    // Keeps lesson theme quiet even when music slider is maxed
    const LESSON_THEME_CAP = 0.2;

    useEffect(() => {
        return () => {
            if (popSoundRef.current) {
                popSoundRef.current.unloadAsync();
                popSoundRef.current = null;
            }

            if (bgSoundRef.current) {
                bgSoundRef.current.unloadAsync();
                bgSoundRef.current = null;
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

    const loadSavedAudioSettings = useCallback(async () => {
        try {
            const [savedMusicVolume, savedSfxVolume] = await AsyncStorage.multiGet([
                "musicVolume",
                "sfxVolume",
            ]);

            const musicValue =
                savedMusicVolume?.[1] !== null ? Number(savedMusicVolume[1]) : 0.12;
            const sfxValue =
                savedSfxVolume?.[1] !== null ? Number(savedSfxVolume[1]) : 0.45;

            musicVolumeRef.current = Number.isFinite(musicValue) ? musicValue : 0.12;
            sfxVolumeRef.current = Number.isFinite(sfxValue) ? sfxValue : 0.45;

            if (popSoundRef.current) {
                await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (bgSoundRef.current) {
                await bgSoundRef.current.setVolumeAsync(
                    musicVolumeRef.current * LESSON_THEME_CAP
                );
            }
        } catch (error) {
            console.log("Failed to load audio settings:", error);
            musicVolumeRef.current = 0.12;
            sfxVolumeRef.current = 0.45;
        }
    }, []);

    const ensurePopLoaded = useCallback(async () => {
        try {
            if (popSoundRef.current) {
                await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                require("../../../assets/images/audio/pop.mp3"),
                {
                    shouldPlay: false,
                    volume: sfxVolumeRef.current,
                }
            );

            popSoundRef.current = sound;
        } catch (error) {
            console.log("Failed to load pop sound:", error);
        }
    }, []);

    const playPop = useCallback(async () => {
        try {
            await loadSavedAudioSettings();
            await ensurePopLoaded();

            if (!popSoundRef.current) return;

            await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            await popSoundRef.current.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    }, [ensurePopLoaded, loadSavedAudioSettings]);

    const stopBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current) {
                const sound = bgSoundRef.current;
                bgSoundRef.current = null;
                await sound.stopAsync();
                await sound.unloadAsync();
            }
        } catch (error) {
            console.log("Failed to stop lesson theme:", error);
        }
    }, []);

    const playBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current || isStartingBgRef.current) return;

            isStartingBgRef.current = true;

            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            const effectiveLessonVolume = musicVolumeRef.current * LESSON_THEME_CAP;

            const { sound } = await Audio.Sound.createAsync(
                require("../../../assets/images/audio/lessonTheme.mp3"),
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: effectiveLessonVolume,
                }
            );

            if (bgSoundRef.current) {
                await sound.unloadAsync();
            } else {
                bgSoundRef.current = sound;
            }
        } catch (error) {
            console.log("Failed to play lesson theme:", error);
        } finally {
            isStartingBgRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const startAudio = async () => {
                await loadSavedAudioSettings();
                await ensurePopLoaded();

                if (active) {
                    await playBackgroundMusic();
                }
            };

            startAudio();

            return () => {
                active = false;
                stopBackgroundMusic();
            };
        }, [
            ensurePopLoaded,
            loadSavedAudioSettings,
            playBackgroundMusic,
            stopBackgroundMusic,
        ])
    );

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
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Lesson 1</Text>
                    </View>

                    <Text style={styles.introHeading}>FSL Alpabeto (A–G)</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng alpabeto mula A
                        hanggang G sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Bawat video ay nagpapakita ng isang titik. Pindutin ang Susunod
                        para sa kasunod na letra o Ulitin para mapanood muli ang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Handa ka na ba? Magsimula tayo sa titik A.
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
                        <Text style={styles.progressLabel}>Titik</Text>
                        <Text style={styles.progressText}>
                            {lessonVideos[currentIndex].letter}
                        </Text>
                        <Text style={styles.progressSub}>
                            {currentIndex + 1} / {lessonVideos.length}
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
        fontSize: 30,
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
        width: 132,
        height: 132,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFBE55",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#5A3900",
        paddingHorizontal: 16,
        paddingVertical: 10,
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
        fontSize: 64,
        fontFamily: "HeyComic",
        lineHeight: 70,
    },

    progressSub: {
        color: "#5C3A00",
        fontSize: 14,
        fontFamily: "HeyComic",
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