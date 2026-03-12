import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

const LETTERS = ["A", "B", "C","D","E"];
const API_URL = "http://192.168.1.2:8000/detect-sign";
const DETECTION_INTERVAL = 1500;

export default function QuizScreen() {
    const cameraRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();

    const initialLetter = useMemo(() => getRandomLetter(), []);
    const [targetLetter, setTargetLetter] = useState(initialLetter);
    const [detectedLetter, setDetectedLetter] = useState(null);
    const [result, setResult] = useState(null); // "correct" | "wrong" | "error" | null
    const [errorMessage, setErrorMessage] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

    const handleExit = () => {
        router.replace("/");
    };

    const handleNext = () => {
        setDetectedLetter(null);
        setResult(null);
        setErrorMessage("");
        setAnsweredCorrectly(false);
        setTargetLetter(getRandomLetter(targetLetter));
    };

    const handleDetect = async () => {
        if (!cameraRef.current || isChecking || answeredCorrectly) return;

        try {
            setIsChecking(true);
            setErrorMessage("");

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                skipProcessing: true,
                base64: false,
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

                if (!answeredCorrectly) {
                    setScore((prev) => prev + 1);
                    setAnsweredCorrectly(true);

                    setTimeout(() => {
                        setDetectedLetter(null);
                        setResult(null);
                        setErrorMessage("");
                        setAnsweredCorrectly(false);
                        setTargetLetter(getRandomLetter(targetLetter));
                    }, 1200);
                }
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
    };

    useEffect(() => {
        if (!permission?.granted) return;

        const interval = setInterval(() => {
            handleDetect();
        }, DETECTION_INTERVAL);

        return () => clearInterval(interval);
    }, [permission?.granted, targetLetter, isChecking, answeredCorrectly]);

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
                        <Text style={styles.primaryButtonText}>
                            Allow Camera
                        </Text>
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

            <View style={styles.cameraCard}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="front"
                    mirror
                    active
                />
            </View>

            <View style={styles.feedbackCard}>
                {isChecking ? (
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
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                    disabled={isChecking}
                >
                    <Ionicons name="arrow-forward" size={22} color="white" />
                    <Text style={styles.buttonText}>Skip</Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
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
        marginBottom: 16,
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
});