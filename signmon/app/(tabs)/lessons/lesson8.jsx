import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEventListener } from "expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Lesson8() {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [videoError, setVideoError] = useState("");
    const [isSlowMode, setIsSlowMode] = useState(false);
    const [isSwitchingVideo, setIsSwitchingVideo] = useState(false);

    const lessonVideos = useMemo(
        () => [
            {
                day: "Linggo",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FLinggo.mp4?alt=media&token=74f97341-9fae-4736-acfe-7bf3af39542f",
                },
            },
            {
                day: "Lunes",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FLunes.mp4?alt=media&token=a6cac54f-ebdc-4e56-ab68-0de88fccbdeb",
                },
            },
            {
                day: "Martes",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FMartes.mp4?alt=media&token=b5a12d7d-a57f-4e42-85ab-de7e66a61327",
                },
            },
            {
                day: "Miyerkules",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FMiyerkules.mp4?alt=media&token=65cc7b44-f6b8-4a11-9679-0d51cb57bba3",
                },
            },
            {
                day: "Huwebes",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FHuwebes.mp4?alt=media&token=c5b37ccf-df3d-42de-8bcd-2e0e458ee844",
                },
            },
            {
                day: "Biyernes",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FBiyernes.mp4?alt=media&token=3bb3400a-fae0-4f92-8bc7-5d293e220448",
                },
            },
            {
                day: "Sabado",
                source: {
                    uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/DAYS%2FSabado.mp4?alt=media&token=18fc0396-e911-4994-9ef5-321a78c45d68",
                },
            },
        ],
        []
    );

    const player = useVideoPlayer(null, (playerInstance) => {
        playerInstance.loop = false;
        playerInstance.muted = true;
        playerInstance.playbackRate = 1.0;
        playerInstance.preservesPitch = true;
    });

    const popSoundRef = useRef(null);
    const bgSoundRef = useRef(null);
    const isStartingBgRef = useRef(false);
    const loadRequestRef = useRef(0);

    const musicVolumeRef = useRef(0.12);
    const sfxVolumeRef = useRef(0.45);

    const LESSON_THEME_CAP = 0.2;

    const isIntro = currentIndex === -1;
    const isLastVideo = currentIndex === lessonVideos.length - 1;

    useEventListener(player, "statusChange", ({ status, error }) => {
        if (status === "readyToPlay") {
            setIsVideoReady(true);
            setVideoError("");
            setIsSwitchingVideo(false);

            try {
                player.play();
            } catch (playError) {
                console.log("Autoplay error:", playError);
            }
            return;
        }

        if (status === "loading") {
            setIsVideoReady(false);
            return;
        }

        if (status === "error") {
            setIsVideoReady(false);
            setIsSwitchingVideo(false);
            setVideoError(error?.message || "Hindi ma-load ang video. Pindutin ang ulitin button.");
        }
    });

    useEffect(() => {
        return () => {
            void (async () => {
                try {
                    if (popSoundRef.current) {
                        await popSoundRef.current.unloadAsync();
                        popSoundRef.current = null;
                    }

                    if (bgSoundRef.current) {
                        await bgSoundRef.current.unloadAsync();
                        bgSoundRef.current = null;
                    }
                } catch (error) {
                    console.log("Audio cleanup error:", error);
                }
            })();
        };
    }, []);

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

            void startAudio();

            return () => {
                active = false;
                void stopBackgroundMusic();
            };
        }, [
            ensurePopLoaded,
            loadSavedAudioSettings,
            playBackgroundMusic,
            stopBackgroundMusic,
        ])
    );

    const loadCurrentVideo = useCallback(
        async (index) => {
            if (index < 0 || index >= lessonVideos.length) return;

            const requestId = ++loadRequestRef.current;
            const currentVideo = lessonVideos[index];

            if (!currentVideo?.source?.uri) {
                setVideoError("Walang video source para sa lesson na ito.");
                setIsVideoReady(false);
                setIsSwitchingVideo(false);
                return;
            }

            try {
                setIsSwitchingVideo(true);
                setIsVideoReady(false);
                setVideoError("");

                player.pause();
                player.currentTime = 0;
                player.muted = true;
                player.playbackRate = isSlowMode ? 0.5 : 1.0;

                await player.replaceAsync(currentVideo.source);

                if (requestId !== loadRequestRef.current) return;
            } catch (error) {
                if (requestId !== loadRequestRef.current) return;

                console.log("Video load error:", error);
                setIsSwitchingVideo(false);
                setIsVideoReady(false);
                setVideoError("Hindi ma-load ang video. Pindutin ang ulitin button.");
            }
        },
        [isSlowMode, lessonVideos, player]
    );

    useEffect(() => {
        if (isIntro) return;
        void loadCurrentVideo(currentIndex);
    }, [currentIndex, isIntro, loadCurrentVideo]);

    useEffect(() => {
        if (isIntro) return;

        try {
            player.playbackRate = isSlowMode ? 0.5 : 1.0;
        } catch (error) {
            console.log("Playback rate update error:", error);
        }
    }, [isIntro, isSlowMode, player]);

    const handleReplay = async () => {
        await playPop();

        if (isIntro) return;

        try {
            if (videoError) {
                await loadCurrentVideo(currentIndex);
                return;
            }

            if (player.duration && player.currentTime >= player.duration) {
                player.replay();
                return;
            }

            player.currentTime = 0;
            player.play();
        } catch (error) {
            console.log("Replay error:", error);
            setVideoError("Hindi ma-play ang video. Pindutin ulit ang ulitin button.");
        }
    };

    const handleSlowToggle = async () => {
        await playPop();
        setIsSlowMode((prev) => !prev);
    };

    const handleNext = async () => {
        await playPop();

        if (isSwitchingVideo) return;

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

        if (isSwitchingVideo) return;

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
        router.push("/lessons/quiz/quiz8");
    };

    const getTitle = () => {
        if (isIntro) return "Lesson 8 - Mga Araw ng Linggo";
        return `Lesson 8 - ${lessonVideos[currentIndex].day}`;
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
                        <Text style={styles.badgeText}>Lesson 8</Text>
                    </View>

                    <Text style={styles.introHeading}>FSL Mga Araw ng Linggo</Text>

                    <Text style={styles.introText}>
                        Sa araling ito, matututuhan mo ang mga senyas ng mga araw ng linggo sa FSL.
                    </Text>

                    <Text style={styles.introText}>
                        Bawat video ay nagpapakita ng isang araw. Pindutin ang Susunod para sa kasunod na
                        araw o Ulitin para mapanood muli ang senyas.
                    </Text>

                    <Text style={styles.introText}>
                        Handa ka na ba? Magsimula tayo sa Linggo.
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
                        <Text style={styles.progressLabel}>Araw</Text>

                        <Text
                            style={styles.progressText}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                        >
                            {lessonVideos[currentIndex].day}
                        </Text>

                        <Text style={styles.progressSub}>
                            {currentIndex + 1} / {lessonVideos.length}
                        </Text>
                    </View>

                    <View style={styles.videoCard}>
                        {(isSwitchingVideo || (!isVideoReady && !videoError)) && (
                            <View style={styles.loaderOverlay}>
                                <ActivityIndicator size="large" color="#ffffff" />
                                <Text style={styles.loaderText}>Nilo-load ang video...</Text>
                            </View>
                        )}

                        <VideoView
                            key={lessonVideos[currentIndex].day}
                            style={styles.video}
                            player={player}
                            contentFit="contain"
                            allowsFullscreen={false}
                            allowsPictureInPicture={false}
                            nativeControls={false}
                        />

                        {videoError ? (
                            <View style={styles.errorOverlay}>
                                <Ionicons name="alert-circle" size={42} color="#ffffff" />
                                <Text style={styles.loaderText}>{videoError}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.turtleButton,
                                isSlowMode && styles.turtleButtonActive,
                            ]}
                            onPress={handleSlowToggle}
                            activeOpacity={0.85}
                        >
                            <MaterialCommunityIcons name="snail" size={24} color="white" />
                            <Text style={styles.turtleButtonText}>
                                {isSlowMode ? "Mabagal" : "Bagalan"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[
                                styles.previousButton,
                                isSwitchingVideo && styles.disabledButton,
                            ]}
                            onPress={handlePrevious}
                            activeOpacity={0.8}
                            disabled={isSwitchingVideo}
                        >
                            <Ionicons name="arrow-back" size={22} color="white" />
                            <Text style={styles.buttonText}>Nakaraan</Text>
                        </TouchableOpacity>

                        {!isLastVideo ? (
                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    isSwitchingVideo && styles.disabledButton,
                                ]}
                                onPress={handleNext}
                                activeOpacity={0.8}
                                disabled={isSwitchingVideo}
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
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },

    video: {
        width: "100%",
        height: "100%",
    },

    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "rgba(16, 58, 115, 0.45)",
    },

    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 3,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
    },

    loaderText: {
        marginTop: 12,
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    turtleButton: {
        position: "absolute",
        bottom: 14,
        right: 14,
        zIndex: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4B7BEC",
        borderRadius: 16,
        borderWidth: 3,
        borderColor: "#17356E",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
    },

    turtleButtonActive: {
        backgroundColor: "#22B07D",
        borderColor: "#0C5B40",
    },

    turtleButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "HeyComic",
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

    disabledButton: {
        opacity: 0.6,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});