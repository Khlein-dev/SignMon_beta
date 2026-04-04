import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Animated,
    Easing,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const EXP_REWARD = 100;
const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const API_URL = "http://192.168.100.5:8000/detect-sign/quiz5";

const DETECTION_INTERVAL = 250;
const ROUND_TIME = 90;
const READY_COUNTDOWN = 5;
const WIN_SCORE = 10;

const LESSON5_PASSED_KEY = "lesson5Passed";
const QUIZ5_FINISHED_KEY = "quiz5Finished";
const REVIEW_ROUTE = "/lessons/lesson5";
const HOME_ROUTE = "/Home";

const QUIZ_THEME_CAP = 0.16;

export default function Quiz5Screen() {
    const cameraRef = useRef(null);
    const detectIntervalRef = useRef(null);
    const roundTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const nextRoundTimeoutRef = useRef(null);

    const bgSoundRef = useRef(null);
    const popSoundRef = useRef(null);
    const tickSoundRef = useRef(null);
    const whistleSoundRef = useRef(null);
    const correctSoundRef = useRef(null);
    const isStartingBgRef = useRef(false);

    const musicVolumeRef = useRef(0.12);
    const sfxVolumeRef = useRef(0.45);

    const targetScale = useRef(new Animated.Value(1)).current;
    const targetRotate = useRef(new Animated.Value(0)).current;
    const feedbackScale = useRef(new Animated.Value(1)).current;
    const modalPop = useRef(new Animated.Value(0.9)).current;

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);

    const initialNumber = useMemo(() => getRandomNumber(), []);
    const [targetNumber, setTargetNumber] = useState(initialNumber);
    const [detectedNumber, setDetectedNumber] = useState(null);
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [countdown, setCountdown] = useState(READY_COUNTDOWN);

    const [showIntroModal, setShowIntroModal] = useState(true);
    const [showCountdownModal, setShowCountdownModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    const [gameStarted, setGameStarted] = useState(false);
    const [didWin, setDidWin] = useState(false);

    const clearAllTimers = useCallback(() => {
        if (detectIntervalRef.current) {
            clearInterval(detectIntervalRef.current);
            detectIntervalRef.current = null;
        }
        if (roundTimerRef.current) {
            clearInterval(roundTimerRef.current);
            roundTimerRef.current = null;
        }
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        if (nextRoundTimeoutRef.current) {
            clearTimeout(nextRoundTimeoutRef.current);
            nextRoundTimeoutRef.current = null;
        }
    }, []);

    const stopSoundIfPlaying = useCallback(async (soundRef) => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
            }
        } catch (error) {
            console.log("Failed to stop sound:", error);
        }
    }, []);

    const unloadSoundRef = useCallback(async (soundRef) => {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        } catch (error) {
            console.log("Failed to unload sound:", error);
        }
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

            if (bgSoundRef.current) {
                await bgSoundRef.current.setVolumeAsync(
                    musicVolumeRef.current * QUIZ_THEME_CAP
                );
            }

            if (popSoundRef.current) {
                await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (tickSoundRef.current) {
                await tickSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (whistleSoundRef.current) {
                await whistleSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (correctSoundRef.current) {
                await correctSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }
        } catch (error) {
            console.log("Failed to load audio settings:", error);
            musicVolumeRef.current = 0.12;
            sfxVolumeRef.current = 0.45;
        }
    }, []);

    const ensureSoundLoaded = useCallback(async (soundRef, source, volume) => {
        try {
            if (soundRef.current) {
                await soundRef.current.setVolumeAsync(volume);
                return soundRef.current;
            }

            const { sound } = await Audio.Sound.createAsync(source, {
                shouldPlay: false,
                volume,
            });

            soundRef.current = sound;
            return sound;
        } catch (error) {
            console.log("Failed to load sound:", error);
            return null;
        }
    }, []);

    const ensureSfxLoaded = useCallback(async () => {
        await ensureSoundLoaded(
            popSoundRef,
            require("../../../../assets/images/audio/pop.mp3"),
            sfxVolumeRef.current
        );
        await ensureSoundLoaded(
            tickSoundRef,
            require("../../../../assets/images/audio/tick.mp3"),
            sfxVolumeRef.current
        );
        await ensureSoundLoaded(
            whistleSoundRef,
            require("../../../../assets/images/audio/whistle.mp3"),
            sfxVolumeRef.current
        );
        await ensureSoundLoaded(
            correctSoundRef,
            require("../../../../assets/images/audio/correct.mp3"),
            sfxVolumeRef.current
        );
    }, [ensureSoundLoaded]);

    const playPop = useCallback(async () => {
        try {
            await loadSavedAudioSettings();
            const sound = await ensureSoundLoaded(
                popSoundRef,
                require("../../../../assets/images/audio/pop.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;
            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    }, [ensureSoundLoaded, loadSavedAudioSettings]);

    const playTick = useCallback(async () => {
        try {
            const sound = await ensureSoundLoaded(
                tickSoundRef,
                require("../../../../assets/images/audio/tick.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;
            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play tick sound:", error);
        }
    }, [ensureSoundLoaded]);

    const playWhistle = useCallback(async () => {
        try {
            const sound = await ensureSoundLoaded(
                whistleSoundRef,
                require("../../../../assets/images/audio/whistle.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;
            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play whistle sound:", error);
        }
    }, [ensureSoundLoaded]);

    const playCorrect = useCallback(async () => {
        try {
            const sound = await ensureSoundLoaded(
                correctSoundRef,
                require("../../../../assets/images/audio/correct.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;
            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play correct sound:", error);
        }
    }, [ensureSoundLoaded]);

    const stopBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current) {
                const sound = bgSoundRef.current;
                bgSoundRef.current = null;
                await sound.stopAsync();
                await sound.unloadAsync();
            }
        } catch (error) {
            console.log("Failed to stop quiz theme:", error);
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

            const { sound } = await Audio.Sound.createAsync(
                require("../../../../assets/images/audio/quizTheme.mp3"),
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: musicVolumeRef.current * QUIZ_THEME_CAP,
                }
            );

            if (bgSoundRef.current) {
                await sound.unloadAsync();
            } else {
                bgSoundRef.current = sound;
            }
        } catch (error) {
            console.log("Failed to play quiz theme:", error);
        } finally {
            isStartingBgRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const startScreenAudio = async () => {
                await loadSavedAudioSettings();
                await ensureSfxLoaded();

                if (active) {
                    await playBackgroundMusic();
                }
            };

            startScreenAudio();

            return () => {
                active = false;
                clearAllTimers();
                stopBackgroundMusic();
                stopSoundIfPlaying(tickSoundRef);
                stopSoundIfPlaying(whistleSoundRef);
                stopSoundIfPlaying(correctSoundRef);
            };
        }, [
            clearAllTimers,
            ensureSfxLoaded,
            loadSavedAudioSettings,
            playBackgroundMusic,
            stopBackgroundMusic,
            stopSoundIfPlaying,
        ])
    );

    const animateTarget = useCallback(() => {
        targetScale.setValue(1);
        targetRotate.setValue(0);

        Animated.parallel([
            Animated.sequence([
                Animated.timing(targetScale, {
                    toValue: 1.12,
                    duration: 180,
                    easing: Easing.out(Easing.back(1.8)),
                    useNativeDriver: true,
                }),
                Animated.timing(targetScale, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(targetRotate, {
                    toValue: 1,
                    duration: 120,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(targetRotate, {
                    toValue: -1,
                    duration: 120,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(targetRotate, {
                    toValue: 0,
                    duration: 120,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [targetScale, targetRotate]);

    const animateFeedback = useCallback(() => {
        feedbackScale.setValue(0.94);
        Animated.spring(feedbackScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
        }).start();
    }, [feedbackScale]);

    const animateModal = useCallback(() => {
        modalPop.setValue(0.88);
        Animated.spring(modalPop, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
        }).start();
    }, [modalPop]);

    const handleExit = useCallback(async () => {
        await playPop();
        clearAllTimers();
        router.replace(HOME_ROUTE);
    }, [clearAllTimers, playPop]);

    const resetRoundData = useCallback((current = null) => {
        setDetectedNumber(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        setTargetNumber(getRandomNumber(current));
    }, []);

    const resetWholeGame = useCallback(() => {
        clearAllTimers();
        setScore(0);
        setTimeLeft(ROUND_TIME);
        setCountdown(READY_COUNTDOWN);
        setDetectedNumber(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        setDidWin(false);
        setShowResultModal(false);
        setShowCountdownModal(false);
        setGameStarted(false);
        setTargetNumber(getRandomNumber());
    }, [clearAllTimers]);

    const markLessonPassed = useCallback(async () => {
        try {
            await AsyncStorage.multiSet([
                [LESSON5_PASSED_KEY, "true"],
                [QUIZ5_FINISHED_KEY, "true"],
            ]);
            return true;
        } catch (error) {
            console.log("Failed to save lesson pass state:", error);
            return false;
        }
    }, []);

    const rewardUser = async () => {
    try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) {
            console.log("❌ No userId found!");
            return;
        }

        console.log("✅ Sending userId:", userId);

        const res = await fetch("http://10.28.29.160:5000/complete-lesson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: Number(userId),
                lessonId: "quiz5",
            }),
        });

        const data = await res.json();

        console.log("✅ SERVER RESPONSE:", data);

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("xp", data.user.xp.toString());
        await AsyncStorage.setItem("level", data.user.level.toString());

    } catch (err) {
        console.log("❌ rewardUser error:", err);
    }
};

     const finishGame = useCallback(
    async (won) => {
        clearAllTimers();
        setGameStarted(false);
        setDidWin(won);

        if (won) {
            await markQuizAsFinished();

           
            await rewardUser();

            await AsyncStorage.setItem(
                "pendingQuizReward",
                JSON.stringify({
                        show: true,
                        title: "May bagong gantimpala!",
                        rewardSet: "gokuCosmetics",
                        items: [
                            {
                                key: "gokuHat",
                                name: "Goku na Sombrero",
                            },
                            {
                                key: "gokuDress",
                                name: "Goku na Damit",
                            },
                            {
                                key: "gokuAcc",
                                name: "Doraemon",
                            },
                        ],
                    })
                );
            }

            setShowResultModal(true);
            animateModal();
        },
        [clearAllTimers, markLessonPassed, animateModal]
    );

    const markQuizAsFinished = async () => {
    try {
        await AsyncStorage.setItem("quiz5Finished", "true");
    } catch (error) {
        console.log("Error saving quiz finish:", error);
    }
};

    const startLiveRound = useCallback(() => {
        setGameStarted(true);
        setShowCountdownModal(false);
        setTimeLeft(ROUND_TIME);
        setScore(0);
        resetRoundData();

        roundTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    finishGame(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        detectIntervalRef.current = setInterval(() => {
            handleDetectRef.current?.();
        }, DETECTION_INTERVAL);
    }, [finishGame, resetRoundData]);

    const startCountdown = useCallback(async () => {
        await playPop();

        clearAllTimers();
        setShowIntroModal(false);
        setShowResultModal(false);
        setShowCountdownModal(true);
        setCountdown(READY_COUNTDOWN);
        setGameStarted(false);
        setScore(0);
        setTimeLeft(ROUND_TIME);
        resetRoundData();
        animateModal();

        await playTick();

        countdownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;

                    playWhistle();
                    startLiveRound();
                    return 0;
                }
                playTick();
                return prev - 1;
            });
        }, 1000);
    }, [
        clearAllTimers,
        resetRoundData,
        startLiveRound,
        animateModal,
        playPop,
        playTick,
        playWhistle,
    ]);

    const handleReview = useCallback(async () => {
        await playPop();
        clearAllTimers();
        router.push(REVIEW_ROUTE);
    }, [clearAllTimers, playPop]);

    const handleGoHome = useCallback(async () => {
        await playPop();
        clearAllTimers();
        router.replace(HOME_ROUTE);
    }, [clearAllTimers, playPop]);

    const handlePlayAgain = useCallback(async () => {
        await playPop();
        resetWholeGame();
        setShowIntroModal(true);
        animateModal();
    }, [resetWholeGame, animateModal, playPop]);

    const handleDetect = useCallback(async () => {
        if (!gameStarted) return;
        if (!cameraReady) return;
        if (!cameraRef.current) return;
        if (isChecking) return;
        if (answeredCorrectly) return;

        try {
            setIsChecking(true);
            setErrorMessage("");

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.4,
                skipProcessing: true,
                base64: false,
                shutterSound: false,
            });

            const formData = new FormData();
            formData.append("file", {
                uri: photo.uri,
                name: "sign.jpg",
                type: "image/jpeg",
            });

            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data?.error) {
                setResult("error");
                setErrorMessage(data.error);
                setDetectedNumber(null);
                animateFeedback();
                return;
            }

            const predicted = data?.number != null ? String(data.number) : null;
            setDetectedNumber(predicted);

            if (!predicted) {
                setResult("error");
                setErrorMessage("Walang na-detect na numero.");
                animateFeedback();
                return;
            }

            if (predicted === targetNumber) {
                setResult("correct");
                setAnsweredCorrectly(true);
                animateFeedback();
                playCorrect();

                setScore((prev) => {
                    const nextScore = prev + 1;

                    if (nextScore >= WIN_SCORE) {
                        setTimeout(() => finishGame(true), 250);
                    }

                    return nextScore;
                });

                if (nextRoundTimeoutRef.current) {
                    clearTimeout(nextRoundTimeoutRef.current);
                }

                nextRoundTimeoutRef.current = setTimeout(() => {
                    setDetectedNumber(null);
                    setResult(null);
                    setErrorMessage("");
                    setAnsweredCorrectly(false);
                    const next = getRandomNumber(targetNumber);
                    setTargetNumber(next);
                    animateTarget();
                    nextRoundTimeoutRef.current = null;
                }, 800);
            } else {
                setResult("wrong");
                animateFeedback();
            }
        } catch (error) {
            console.error("Detection error:", error);
            setResult("error");
            setErrorMessage("Hindi maka-connect sa detector server.");
            animateFeedback();
        } finally {
            setIsChecking(false);
        }
    }, [
        gameStarted,
        cameraReady,
        isChecking,
        answeredCorrectly,
        targetNumber,
        finishGame,
        animateFeedback,
        animateTarget,
        playCorrect,
    ]);

    const handleDetectRef = useRef(handleDetect);

    useEffect(() => {
        handleDetectRef.current = handleDetect;
    }, [handleDetect]);

    useEffect(() => {
        animateTarget();
    }, [targetNumber, animateTarget]);

    useEffect(() => {
        return () => {
            clearAllTimers();
            unloadSoundRef(popSoundRef);
            unloadSoundRef(tickSoundRef);
            unloadSoundRef(whistleSoundRef);
            unloadSoundRef(correctSoundRef);
            unloadSoundRef(bgSoundRef);
        };
    }, [clearAllTimers, unloadSoundRef]);

    const progressWidth = `${Math.min((score / WIN_SCORE) * 100, 100)}%`;

    const rotateInterpolate = targetRotate.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ["-8deg", "0deg", "8deg"],
    });

    if (!permission) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Quiz 5</Text>

                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleExit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.permissionCard}>
                    <Text style={styles.permissionTitle}>Kailangan ang Camera</Text>
                    <Text style={styles.permissionText}>
                        Payagan ang camera para makita ng app ang iyong hand sign number.
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={async () => {
                            await playPop();
                            requestPermission();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Allow Camera</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Quiz 5</Text>

                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleExit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.topRow}>
                <Animated.View
                    style={[
                        styles.targetCard,
                        {
                            transform: [{ scale: targetScale }, { rotate: rotateInterpolate }],
                        },
                    ]}
                >
                    <Text style={styles.targetLabel}>Ipakita ang numerong ito</Text>
                    <Text style={styles.targetNumber}>{targetNumber}</Text>
                </Animated.View>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={styles.scoreValue}>{score}</Text>
                </View>
            </View>

            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progress</Text>
                    <Text style={styles.goalText}>
                        {score} / {WIN_SCORE}
                    </Text>
                </View>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
            </View>

            <View style={styles.timerCard}>
                <View style={styles.timerLeft}>
                    <Ionicons name="time-outline" size={22} color="#2F1B00" />
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                </View>
                <Text style={styles.timerGoal}>Goal: {WIN_SCORE}</Text>
            </View>

            <View style={styles.cameraCard}>
                <View style={styles.cameraFrame}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="front"
                        mirror
                        active
                        flash="off"
                        animateShutter={false}
                        onCameraReady={() => setCameraReady(true)}
                    />
                </View>

                <View style={styles.cameraHintBadge}>
                    <Text style={styles.cameraHintText}>Ilagay ang kamay sa gitna</Text>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.feedbackCard,
                    {
                        transform: [{ scale: feedbackScale }],
                    },
                ]}
            >
                {!gameStarted ? (
                    <>
                        <Text style={styles.feedbackText}>
                            Pindutin ang OK para simulan ang number challenge.
                        </Text>
                    </>
                ) : isChecking ? (
                    <>
                        <Text style={styles.feedbackText}>Tinitingnan ang numero mo...</Text>
                    </>
                ) : result === "correct" ? (
                    <>
                        <Text style={styles.correctText}>
                            Tama! Detected: {detectedNumber}
                        </Text>
                    </>
                ) : result === "wrong" ? (
                    <>
                        <Text style={styles.wrongText}>
                            Mali. Detected: {detectedNumber}
                        </Text>
                    </>
                ) : result === "error" ? (
                    <>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.feedbackText}>
                            Ipakita ang tamang number sign sa camera.
                        </Text>
                    </>
                )}
            </Animated.View>

            <Modal visible={showIntroModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [{ scale: modalPop }],
                            },
                        ]}
                    >
                        <Text style={styles.modalTitle}>Handa ka na ba?</Text>
                        <Text style={styles.modalText}>
                            Ipakita ang tamang FSL sign para sa mga numero.
                        </Text>
                        <Text style={styles.modalSubText}>
                            Mayroon kang {ROUND_TIME} segundo para makaabot sa {WIN_SCORE} na
                            tamang sagot.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalPrimaryButton}
                            onPress={startCountdown}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalPrimaryButtonText}>OK, Simulan!</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            <Modal visible={showCountdownModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.countdownCard,
                            {
                                transform: [{ scale: modalPop }],
                            },
                        ]}
                    >
                        <Text style={styles.countdownLabel}>Magsisimula sa</Text>
                        <Text style={styles.countdownNumber}>{countdown}</Text>
                    </Animated.View>
                </View>
            </Modal>

            <Modal visible={showResultModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [{ scale: modalPop }],
                            },
                        ]}
                    >
                        {didWin ? (
                            <>
                                <Text style={styles.modalTitle}>Congratulations!</Text>
                                <Text style={styles.modalText}>
                                    Naabot mo ang {score} tamang sagot. Tapos mo na ang Quiz 5!
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Passed na ang Lesson 5. Mahusay!
                                </Text>

                                <TouchableOpacity
                                    style={styles.modalPrimaryButton}
                                    onPress={handleGoHome}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalPrimaryButtonText}>Back to Home</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Try Again</Text>
                                <Text style={styles.modalText}>
                                    Naka-score ka ng {score} / {WIN_SCORE}.
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Balikan ang lesson para mag-practice pa, o subukan muli.
                                </Text>

                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.reviewButton}
                                        onPress={handleReview}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.reviewButtonText}>Review</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.homeButton}
                                        onPress={handleGoHome}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.homeButtonText}>Exit</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.playAgainButton}
                                    onPress={handlePlayAgain}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.playAgainButtonText}>Play Again</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function getRandomNumber(currentNumber = null) {
    if (NUMBERS.length === 1) return NUMBERS[0];

    let nextNumber = currentNumber;

    while (nextNumber === currentNumber) {
        const index = Math.floor(Math.random() * NUMBERS.length);
        nextNumber = NUMBERS[index];
    }

    return nextNumber;
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFEFC2",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFEFC2",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 18,
    },

    title: {
        fontSize: 34,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    exitButton: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B6B",
        borderWidth: 4,
        borderColor: "#3A1A1A",
    },

    topRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },

    targetCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
    },

    targetLabel: {
        fontSize: 15,
        color: "#5C3A00",
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    targetNumber: {
        fontSize: 50,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        marginTop: 4,
        lineHeight: 58,
    },

    scoreCard: {
        width: 118,
        backgroundColor: "#FFBE55",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#5A3900",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },

    scoreLabel: {
        fontSize: 16,
        color: "#4A2D00",
        fontFamily: "HeyComic",
    },

    scoreValue: {
        fontSize: 30,
        color: "#2F1B00",
        fontFamily: "HeyComic",
        lineHeight: 36,
    },

    progressCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
    },

    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    progressTitle: {
        fontSize: 16,
        color: "#4A2D00",
        fontFamily: "HeyComic",
    },

    goalText: {
        fontSize: 16,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    progressTrack: {
        height: 16,
        backgroundColor: "#FDE7B0",
        borderRadius: 999,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#D7B46A",
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#22B07D",
        borderRadius: 999,
    },

    timerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
    },

    timerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    timerText: {
        fontSize: 24,
        color: "#2F1B00",
        fontFamily: "HeyComic",
    },

    timerGoal: {
        fontSize: 18,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    cameraCard: {
        flex: 1,
        backgroundColor: "#6EC5FF",
        borderRadius: 30,
        borderWidth: 4,
        borderColor: "#000000",
        padding: 10,
        marginBottom: 14,
    },

    cameraFrame: {
        flex: 1,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 4,
        borderColor: "#103A73",
        backgroundColor: "#000000",
    },

    camera: {
        flex: 1,
    },

    cameraHintBadge: {
        marginTop: 10,
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 3,
        borderColor: "#000000",
        paddingHorizontal: 16,
        paddingVertical: 6,
    },

    cameraHintText: {
        fontSize: 14,
        color: "#3E2F1C",
        fontFamily: "HeyComic",
    },

    feedbackCard: {
        minHeight: 90,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 18,
    },

    feedbackText: {
        fontSize: 19,
        color: "#3E2F1C",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    correctText: {
        fontSize: 21,
        color: "#138A36",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    wrongText: {
        fontSize: 21,
        color: "#D72638",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    errorText: {
        fontSize: 18,
        color: "#B00020",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    permissionCard: {
        marginTop: 40,
        backgroundColor: "#FFFFFF",
        borderWidth: 4,
        borderColor: "#000000",
        borderRadius: 28,
        padding: 22,
        alignItems: "center",
    },

    permissionTitle: {
        fontSize: 28,
        color: "#2D2A8C",
        textAlign: "center",
        fontFamily: "HeyComic",
        marginBottom: 10,
    },

    permissionText: {
        fontSize: 18,
        color: "#333333",
        textAlign: "center",
        fontFamily: "HeyComic",
        marginBottom: 16,
    },

    primaryButton: {
        backgroundColor: "#22B07D",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 14,
        paddingHorizontal: 26,
        alignItems: "center",
    },

    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000000",
        padding: 24,
        alignItems: "center",
    },

    modalTitle: {
        fontSize: 30,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        marginBottom: 10,
        textAlign: "center",
    },

    modalText: {
        fontSize: 19,
        color: "#3E2F1C",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    modalSubText: {
        fontSize: 16,
        color: "#5C3A00",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 18,
    },

    modalPrimaryButton: {
        minWidth: 180,
        backgroundColor: "#22B07D",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: "center",
    },

    modalPrimaryButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    modalButtonRow: {
        width: "100%",
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },

    reviewButton: {
        flex: 1,
        backgroundColor: "#FFBE55",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#5A3900",
        paddingVertical: 14,
        alignItems: "center",
    },

    reviewButtonText: {
        color: "#2F1B00",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    homeButton: {
        flex: 1,
        backgroundColor: "#FF6B6B",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#3A1A1A",
        paddingVertical: 14,
        alignItems: "center",
    },

    homeButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    playAgainButton: {
        minWidth: 180,
        backgroundColor: "#8B5CF6",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#4C1D95",
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: "center",
    },

    playAgainButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    countdownCard: {
        width: 230,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 26,
        paddingHorizontal: 20,
        alignItems: "center",
    },

    countdownLabel: {
        fontSize: 24,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        marginBottom: 12,
    },

    countdownNumber: {
        fontSize: 74,
        color: "#2F1B00",
        fontFamily: "HeyComic",
        lineHeight: 84,
    },
});