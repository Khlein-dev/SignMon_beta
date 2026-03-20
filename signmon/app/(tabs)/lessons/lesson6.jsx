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

export default function Lesson6() {
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro

    const lessonVideos = useMemo(
        () => [
            {
                color: "Pula",
                source: require("../../../assets/images/videos/Kulay/Pula(Red).mp4"),
            },
            {
                color: "Bughaw",
                source: require("../../../assets/images/videos/Kulay/Asul(Blue).mp4"),
            },
            {
                color: "Dilaw",
                source: require("../../../assets/images/videos/Kulay/Dilaw(Yellow).mp4"),
            },
            {
                color: "Berde",
                source: require("../../../assets/images/videos/Kulay/Berde(Green).mp4"),
            },
            {
                color: "Kahel",
                source: require("../../../assets/images/videos/Kulay/Kahel(Orange).mp4"),
            },
            {
                color: "Lila",
                source: require("../../../assets/images/videos/Kulay/Lila(Violet).mp4"),
            },
            {
                color: "Rosas",
                source: require("../../../assets/images/videos/Kulay/Rosas(Pink).mp4"),
            },
            {
                color: "Kayumanggi",
                source: require("../../../assets/images/videos/Kulay/Kayumanggi(Brown).mp4"),
            },
            {
                color: "Itim",
                source: require("../../../assets/images/videos/Kulay/Itim(Black).mp4"),
            },
            {
                color: "Abo",
                source: require("../../../assets/images/videos/Kulay/Abo(Gray).mp4"),
            },
            {
                color: "Puti",
                source: require("../../../assets/images/videos/Kulay/Puti(White).mp4"),
            },
            {
                color: "Ginto",
                source: require("../../../assets/images/videos/Kulay/Ginto(Gold).mp4"),
            },
            {
                color: "Pilak",
                source: require("../../../assets/images/videos/Kulay/Pilak(Silver).mp4"),
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
        router.push("/lessons/quiz/quiz6");
    };

    const getTitle = () => {
        if (isIntro) return "Lesson 6 - Mga Kulay";
        return `Lesson 6 - ${lessonVideos[currentIndex].color}`;
    };

    const getProgressCardColor = () => {
        if (isIntro) return "#FFBE55";

        const colorMap = {
            Pula: "#EF4444",
            Bughaw: "#3B82F6",
            Dilaw: "#FACC15",
            Berde: "#22C55E",
            Kahel: "#F97316",
            Lila: "#A855F7",
            Rosas: "#EC4899",
            Kayumanggi: "#8B5E3C",
            Itim: "#111111",
            Abo: "#9CA3AF",
            Puti: "#FFFFFF",
            Ginto: "#D4AF37",
            Pilak: "#C0C0C0",
        };

        return colorMap[lessonVideos[currentIndex].color] || "#FFBE55";
    };

    const getProgressTextColor = () => {
        if (isIntro) return "#2F1B00";

        const lightBackgrounds = ["Dilaw", "Puti", "Abo", "Ginto", "Pilak"];
        return lightBackgrounds.includes(lessonVideos[currentIndex].color)
            ? "#2F1B00"
            : "#FFFFFF";
    };

    const getProgressBorderColor = () => {
        if (isIntro) return "#5A3900";

        const borderMap = {
            Pula: "#7F1D1D",
            Bughaw: "#1D4ED8",
            Dilaw: "#A16207",
            Berde: "#166534",
            Kahel: "#9A3412",
            Lila: "#6B21A8",
            Rosas: "#9D174D",
            Kayumanggi: "#5C4033",
            Itim: "#000000",
            Abo: "#6B7280",
            Puti: "#9CA3AF",
            Ginto: "#8B6B16",
            Pilak: "#6B7280",
        };

        return borderMap[lessonVideos[currentIndex].color] || "#5A3900";
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
                        <Text style={styles.badgeText}>Lesson 6</Text>
                    </View>

                    <Text style={styles.introHeading}>FSL Mga Kulay</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng iba’t ibang kulay
                        sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Bawat video ay nagpapakita ng isang kulay. Pindutin ang Susunod para
                        sa kasunod na kulay o Ulitin para mapanood muli ang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Handa ka na ba? Magsimula tayo sa kulay na Pula.
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
                    <View
                        style={[
                            styles.progressCard,
                            {
                                backgroundColor: getProgressCardColor(),
                                borderColor: getProgressBorderColor(),
                            },
                        ]}
                    >
                        <Text
                            style={[styles.progressLabel, { color: getProgressTextColor() }]}
                        >
                            Kulay
                        </Text>

                        <Text
                            style={[styles.progressText, { color: getProgressTextColor() }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                        >
                            {lessonVideos[currentIndex].color}
                        </Text>

                        <Text
                            style={[styles.progressSub, { color: getProgressTextColor() }]}
                        >
                            {currentIndex + 1} / {lessonVideos.length}
                        </Text>
                    </View>

                    <View style={styles.videoCard}>
                        <VideoView
                            key={lessonVideos[currentIndex].color}
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
        fontSize: 26,
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
        width: 240,
        minHeight: 140,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        borderWidth: 4,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
    },

    progressLabel: {
        fontSize: 14,
        fontFamily: "HeyComic",
        marginBottom: 2,
    },

    progressText: {
        fontSize: 30,
        fontFamily: "HeyComic",
        textAlign: "center",
        lineHeight: 36,
    },

    progressSub: {
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