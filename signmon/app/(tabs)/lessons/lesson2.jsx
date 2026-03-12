import React from "react";
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
    const player = useVideoPlayer(
        require("../../../assets/images/videos/A-N/A.mp4"),
        (player) => {
            player.loop = false;
        }
    );

    const handleReplay = () => {
        player.currentTime = 0;
        player.play();
    };

    const handleNext = () => {
        router.push("/lessons/lesson2");
    };

    const handleExit = () => {
        router.replace("/");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Lesson 1</Text>

                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleExit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.videoCard}>
                <VideoView
                    style={styles.video}
                    player={player}
                    nativeControls
                    allowsFullscreen
                    allowsPictureInPicture
                    contentFit="contain"
                />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.replayButton}
                    onPress={handleReplay}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={22} color="white" />
                    <Text style={styles.buttonText}>Replay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={22} color="white" />
                </TouchableOpacity>
            </View>
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

    videoCard: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "#000",
        overflow: "hidden",
        marginBottom: 24,
    },

    video: {
        flex: 1,
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },

    replayButton: {
        flex: 1,
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

    buttonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});