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
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LETTERS = ["T", "U", "V", "W", "X", "Y"];
const API_URL = "http://192.168.1.2:8000/detect-sign/quiz4";

const DETECTION_INTERVAL = 50;
const ROUND_TIME = 60;
const READY_COUNTDOWN = 5;
const WIN_SCORE = 8;

const QUIZ_FINISHED_KEY = "quiz4Finished";
const LESSON_PASSED_KEY = "lesson4Passed";
const REVIEW_ROUTE = "/lessons/lesson4";
const HOME_ROUTE = "/Home";

export default function Quiz4Screen() {
    const cameraRef = useRef(null);
    const detectIntervalRef = useRef(null);
    const roundTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const nextRoundTimeoutRef = useRef(null);

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);

    const initialLetter = useMemo(() => getRandomLetter(), []);
    const [targetLetter, setTargetLetter] = useState(initialLetter);
    const [detectedLetter, setDetectedLetter] = useState(null);
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

    const targetScale = useRef(new Animated.Value(1)).current;
    const targetRotate = useRef(new Animated.Value(0)).current;
    const feedbackScale = useRef(new Animated.Value(1)).current;
    const modalPop = useRef(new Animated.Value(0.9)).current;

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
    }, [targetRotate, targetScale]);

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

    const handleExit = useCallback(() => {
        clearAllTimers();
        router.replace(HOME_ROUTE);
    }, [clearAllTimers]);

    const resetRoundData = useCallback((current = null) => {
        setDetectedLetter(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        const next = getRandomLetter(current);
        setTargetLetter(next);
    }, []);

    const resetWholeGame = useCallback(() => {
        clearAllTimers();
        setScore(0);
        setTimeLeft(ROUND_TIME);
        setCountdown(READY_COUNTDOWN);
        setDetectedLetter(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        setDidWin(false);
        setShowResultModal(false);
        setShowCountdownModal(false);
        setGameStarted(false);
        setTargetLetter(getRandomLetter());
    }, [clearAllTimers]);

    const markQuizAsFinished = useCallback(async () => {
        try {
            await AsyncStorage.multiSet([
                [QUIZ_FINISHED_KEY, "true"],
                [LESSON_PASSED_KEY, "true"],
            ]);
        } catch (error) {
            console.log("Failed to save quiz completion:", error);
        }
    }, []);

    const finishGame = useCallback(
        async (won) => {
            clearAllTimers();
            setGameStarted(false);
            setDidWin(won);

            if (won) {
                await markQuizAsFinished();
            }

            setShowResultModal(true);
            animateModal();
        },
        [clearAllTimers, markQuizAsFinished, animateModal]
    );

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

    const startCountdown = useCallback(() => {
        clearAllTimers();
        setShowIntroModal(false);
        setShowResultModal(false);
        setShowCountdownModal(true);
        setCountdown(READY_COUNTDOWN);
        setGameStarted(false);
        setScore(0);
        setTimeLeft(ROUND_TIME);
        resetRoundData();

        countdownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                    startLiveRound();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearAllTimers, resetRoundData, startLiveRound]);

    const handleReview = useCallback(() => {
        clearAllTimers();
        router.push(REVIEW_ROUTE);
    }, [clearAllTimers]);

    const handleWinGoHome = useCallback(() => {
        clearAllTimers();
        router.replace(HOME_ROUTE);
    }, [clearAllTimers]);

    const handlePlayAgain = useCallback(() => {
        resetWholeGame();
        setShowIntroModal(true);
    }, [resetWholeGame]);

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
                setDetectedLetter(null);
                animateFeedback();
                return;
            }

            const predicted = data?.letter ?? null;
            setDetectedLetter(predicted);

            if (!predicted) {
                setResult("error");
                setErrorMessage("No sign detected.");
                animateFeedback();
                return;
            }

            if (predicted === targetLetter) {
                setResult("correct");
                setAnsweredCorrectly(true);
                animateFeedback();

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
                    setDetectedLetter(null);
                    setResult(null);
                    setErrorMessage("");
                    setAnsweredCorrectly(false);
                    const next = getRandomLetter(targetLetter);
                    setTargetLetter(next);
                    animateTarget();
                    nextRoundTimeoutRef.current = null;
                }, 700);
            } else {
                setResult("wrong");
                animateFeedback();
            }
        } catch (error) {
            console.error("Detection error:", error);
            setResult("error");
            setErrorMessage("Could not connect to detector server.");
            animateFeedback();
        } finally {
            setIsChecking(false);
        }
    }, [
        gameStarted,
        cameraReady,
        isChecking,
        answeredCorrectly,
        targetLetter,
        finishGame,
        animateFeedback,
        animateTarget,
    ]);

    const handleDetectRef = useRef(handleDetect);

    useEffect(() => {
        handleDetectRef.current = handleDetect;
    }, [handleDetect]);

    useEffect(() => {
        animateTarget();
    }, [targetLetter, animateTarget]);

    useEffect(() => {
        return () => {
            clearAllTimers();
        };
    }, [clearAllTimers]);

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
                    <Text style={styles.title}>Quiz 4</Text>

                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleExit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.permissionCard}>
                    <Text style={styles.permissionEmoji}>📷</Text>
                    <Text style={styles.permissionTitle}>Kailangan ang Camera</Text>
                    <Text style={styles.permissionText}>
                        Payagan ang camera para makita ng app ang iyong hand sign.
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={requestPermission}
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
                <Text style={styles.title}>Quiz 4</Text>

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
                    <Text style={styles.targetLabel}>Show this sign</Text>
                    <Text style={styles.targetLetter}>{targetLetter}</Text>
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
                <Text style={styles.timerGoal}>Target: {WIN_SCORE}</Text>
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
                    <Text style={styles.cameraHintText}>🙌 Ilagay ang kamay sa gitna</Text>
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
                        <Text style={styles.feedbackEmoji}>🎯</Text>
                        <Text style={styles.feedbackText}>
                            Pindutin ang OK para simulan ang challenge.
                        </Text>
                    </>
                ) : isChecking ? (
                    <>
                        <Text style={styles.feedbackEmoji}>👀</Text>
                        <Text style={styles.feedbackText}>Tinitingnan ang sign mo...</Text>
                    </>
                ) : result === "correct" ? (
                    <>
                        <Text style={styles.feedbackEmoji}>🎉</Text>
                        <Text style={styles.correctText}>
                            Correct! Detected: {detectedLetter}
                        </Text>
                    </>
                ) : result === "wrong" ? (
                    <>
                        <Text style={styles.feedbackEmoji}>🤔</Text>
                        <Text style={styles.wrongText}>
                            Wrong — Detected: {detectedLetter}
                        </Text>
                    </>
                ) : result === "error" ? (
                    <>
                        <Text style={styles.feedbackEmoji}>⚠️</Text>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.feedbackEmoji}>✋</Text>
                        <Text style={styles.feedbackText}>
                            Show the sign in front of the camera.
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
                        <Text style={styles.modalEmoji}>⭐</Text>
                        <Text style={styles.modalTitle}>Handa ka na ba?</Text>
                        <Text style={styles.modalText}>
                            Ipakita ang tamang FSL sign para sa mga titik T hanggang Z.
                        </Text>
                        <Text style={styles.modalSubText}>
                            Mayroon kang {ROUND_TIME} segundo para makaabot sa {WIN_SCORE} na
                            puntos.
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
                        <Text style={styles.countdownEmoji}>⏳</Text>
                        <Text style={styles.countdownLabel}>Starting in</Text>
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
                                <Text style={styles.modalEmoji}>🏆</Text>
                                <Text style={styles.modalTitle}>Congratulations!</Text>
                                <Text style={styles.modalText}>
                                    Naabot mo ang {score} points. Tapos mo na ang Quiz 4!
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Mahusay! Maaari ka nang bumalik sa Home.
                                </Text>

                                <TouchableOpacity
                                    style={styles.modalPrimaryButton}
                                    onPress={handleWinGoHome}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalPrimaryButtonText}>Go to Home</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalEmoji}>💡</Text>
                                <Text style={styles.modalTitle}>Try Again</Text>
                                <Text style={styles.modalText}>
                                    Naka-score ka ng {score} point{score === 1 ? "" : "s"}.
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Balikan ang lesson para masanay, o lumabas muna.
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
                                        onPress={handleExit}
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

function getRandomLetter(currentLetter = null) {
    if (LETTERS.length === 1) return LETTERS[0];

    let nextLetter = currentLetter;

    while (nextLetter === currentLetter) {
        const index = Math.floor(Math.random() * LETTERS.length);
        nextLetter = LETTERS[index];
    }

    return nextLetter;
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

    targetLetter: {
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

    feedbackEmoji: {
        fontSize: 26,
        marginBottom: 4,
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

    permissionEmoji: {
        fontSize: 40,
        marginBottom: 8,
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

    modalEmoji: {
        fontSize: 42,
        marginBottom: 8,
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

    countdownEmoji: {
        fontSize: 34,
        marginBottom: 6,
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