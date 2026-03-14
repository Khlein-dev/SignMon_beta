import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Modal,
} from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

const LETTERS = ["G", "R", "Y", "D", "H"];
const API_URL = "http://192.168.1.2:8000/detect-sign";

const DETECTION_INTERVAL = 650;
const ROUND_TIME = 60;
const READY_COUNTDOWN = 5;
const WIN_SCORE = 8; 

export default function QuizScreen() {
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
    const [result, setResult] = useState(null); // "correct" | "wrong" | "error" | null
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

    const handleExit = useCallback(() => {
        clearAllTimers();
        router.replace("/");
    }, [clearAllTimers]);

    const resetRoundData = useCallback((current = null) => {
        setDetectedLetter(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        setTargetLetter(getRandomLetter(current));
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

    const finishGame = useCallback(
        (won) => {
            clearAllTimers();
            setGameStarted(false);
            setDidWin(won);
            setShowResultModal(true);
        },
        [clearAllTimers]
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

    const backToIntro = useCallback(() => {
        resetWholeGame();
        setShowIntroModal(true);
    }, [resetWholeGame]);

    const handleNext = useCallback(() => {
        if (!gameStarted) return;
        if (nextRoundTimeoutRef.current) {
            clearTimeout(nextRoundTimeoutRef.current);
            nextRoundTimeoutRef.current = null;
        }
        resetRoundData(targetLetter);
    }, [gameStarted, resetRoundData, targetLetter]);

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
                return;
            }

            const predicted = data?.letter ?? null;
            setDetectedLetter(predicted);

            if (!predicted) {
                setResult("error");
                setErrorMessage("No sign detected.");
                return;
            }

            if (predicted === targetLetter) {
                setResult("correct");
                setAnsweredCorrectly(true);

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
                    setTargetLetter(getRandomLetter(targetLetter));
                    nextRoundTimeoutRef.current = null;
                }, 700);
            } else {
                setResult("wrong");
            }
        } catch (error) {
            console.error("Detection error:", error);
            setResult("error");
            setErrorMessage("Could not connect to detector server.");
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
    ]);

    const handleDetectRef = useRef(handleDetect);

    useEffect(() => {
        handleDetectRef.current = handleDetect;
    }, [handleDetect]);

    useEffect(() => {
        return () => {
            clearAllTimers();
        };
    }, [clearAllTimers]);

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
                    <Text style={styles.title}>Quiz</Text>

                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleExit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.permissionCard}>
                    <Text style={styles.permissionTitle}>Camera Needed</Text>
                    <Text style={styles.permissionText}>
                        Allow camera access so the app can detect your hand sign.
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
                <Text style={styles.title}>Quiz</Text>

                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleExit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.topRow}>
                <View style={styles.targetCard}>
                    <Text style={styles.targetLabel}>Show this sign</Text>
                    <Text style={styles.targetLetter}>{targetLetter}</Text>
                </View>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={styles.scoreValue}>{score}</Text>
                </View>
            </View>

            <View style={styles.timerCard}>
                <Ionicons name="time-outline" size={20} color="#000" />
                <Text style={styles.timerText}>{timeLeft}s</Text>
                <Text style={styles.goalText}>Goal: {WIN_SCORE}</Text>
            </View>

            <View style={styles.cameraCard}>
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

            <View style={styles.feedbackCard}>
                {!gameStarted ? (
                    <Text style={styles.feedbackText}>Press OK to start the challenge.</Text>
                ) : isChecking ? (
                    <Text style={styles.feedbackText}>Detecting...</Text>
                ) : result === "correct" ? (
                    <Text style={styles.correctText}>
                        Correct! Detected: {detectedLetter}
                    </Text>
                ) : result === "wrong" ? (
                    <Text style={styles.wrongText}>
                        Wrong — Detected: {detectedLetter}
                    </Text>
                ) : result === "error" ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : (
                    <Text style={styles.feedbackText}>
                        Show the sign in front of the camera.
                    </Text>
                )}
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.nextButton, !gameStarted && styles.buttonDisabled]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                    disabled={!gameStarted || isChecking}
                >
                    <Ionicons name="arrow-forward" size={22} color="white" />
                    <Text style={styles.buttonText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showIntroModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Get Ready</Text>
                        <Text style={styles.modalText}>
                            Ready your hands and stay in a clear environment for better
                            detection.
                        </Text>
                        <Text style={styles.modalSubText}>
                            You have {ROUND_TIME} seconds to reach {WIN_SCORE} points.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={startCountdown}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCountdownModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.countdownCard}>
                        <Text style={styles.countdownLabel}>Starting in</Text>
                        <Text style={styles.countdownNumber}>{countdown}</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={showResultModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            {didWin ? "Congratulations!" : "Try Again"}
                        </Text>

                        <Text style={styles.modalText}>
                            {didWin
                                ? `You reached ${score} points before time ran out.`
                                : `You scored ${score} point${score === 1 ? "" : "s"} in ${ROUND_TIME} seconds.`}
                        </Text>

                        <Text style={styles.modalSubText}>
                            {didWin
                                ? "Great job! Press continue to play again."
                                : `Goal not reached. You need ${WIN_SCORE} points.`}
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={backToIntro}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: "#fff3cd",
        paddingHorizontal: 25,
        paddingTop: 20,
    },

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff3cd",
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

    topRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },

    targetCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 3,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },

    targetLabel: {
        fontSize: 16,
        color: "#333",
        fontFamily: "HeyComic",
    },

    targetLetter: {
        fontSize: 42,
        color: "#3b2a98",
        fontFamily: "HeyComic",
        marginTop: 4,
    },

    scoreCard: {
        width: 110,
        backgroundColor: "#ffb703",
        borderRadius: 20,
        borderWidth: 3,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },

    scoreLabel: {
        fontSize: 16,
        color: "#000",
        fontFamily: "HeyComic",
    },

    scoreValue: {
        fontSize: 28,
        color: "#000",
        fontFamily: "HeyComic",
    },

    timerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 12,
        marginBottom: 16,
    },

    timerText: {
        fontSize: 22,
        color: "#000",
        fontFamily: "HeyComic",
    },

    goalText: {
        marginLeft: 8,
        fontSize: 18,
        color: "#3b2a98",
        fontFamily: "HeyComic",
    },

    cameraCard: {
        flex: 1,
        backgroundColor: "#000",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#000",
        overflow: "hidden",
        marginBottom: 16,
    },

    camera: {
        flex: 1,
    },

    feedbackCard: {
        minHeight: 72,
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 3,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },

    feedbackText: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    correctText: {
        fontSize: 20,
        color: "#138a36",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    wrongText: {
        fontSize: 20,
        color: "#d72638",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    errorText: {
        fontSize: 18,
        color: "#b00020",
        textAlign: "center",
        fontFamily: "HeyComic",
    },

    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 18,
    },

    nextButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#17a374",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 16,
        gap: 8,
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    buttonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    permissionCard: {
        marginTop: 40,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#000",
        borderRadius: 24,
        padding: 20,
    },

    permissionTitle: {
        fontSize: 26,
        color: "#3b2a98",
        textAlign: "center",
        fontFamily: "HeyComic",
        marginBottom: 10,
    },

    permissionText: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
        fontFamily: "HeyComic",
        marginBottom: 16,
    },

    primaryButton: {
        backgroundColor: "#17a374",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 14,
        alignItems: "center",
    },

    primaryButtonText: {
        color: "white",
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
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 3,
        borderColor: "#000",
        padding: 22,
        alignItems: "center",
    },

    modalTitle: {
        fontSize: 28,
        color: "#3b2a98",
        fontFamily: "HeyComic",
        marginBottom: 10,
        textAlign: "center",
    },

    modalText: {
        fontSize: 18,
        color: "#333",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    modalSubText: {
        fontSize: 16,
        color: "#555",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 18,
    },

    modalButton: {
        minWidth: 140,
        backgroundColor: "#17a374",
        borderRadius: 18,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: "center",
    },

    modalButtonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    countdownCard: {
        width: 220,
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 3,
        borderColor: "#000",
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: "center",
    },

    countdownLabel: {
        fontSize: 24,
        color: "#3b2a98",
        fontFamily: "HeyComic",
        marginBottom: 12,
    },

    countdownNumber: {
        fontSize: 72,
        color: "#000",
        fontFamily: "HeyComic",
        lineHeight: 84,
    },
});