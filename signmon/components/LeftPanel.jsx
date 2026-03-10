import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function LeftPanel({ visible, onClose }) {
    const [volume, setVolume] = useState(50);

    const goToPage = (path) => {
        onClose?.();
        router.push(path);
    };

    const handleExit = () => {
        onClose?.();
        router.push("/");
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalBox} onPress={() => {}}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>SETTINGS</Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={50} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Edit Audio */}
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => goToPage("/edit-audio")}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="audiotrack" size={22} color="white" />
                        <Text style={styles.menuText}>Edit Audio</Text>
                    </TouchableOpacity>

                    {/* About */}
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => goToPage("/about")}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="information-circle"
                            size={22}
                            color="white"
                        />
                        <Text style={styles.menuText}>About</Text>
                    </TouchableOpacity>

                    {/* Volume */}
                    <View style={styles.volumeBox}>
                        <View style={styles.volumeHeader}>
                            <Ionicons
                                name="volume-high"
                                size={22}
                                color="white"
                            />
                            <Text style={styles.menuText}>Volume</Text>
                        </View>

                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            value={volume}
                            onValueChange={setVolume}
                            minimumTrackTintColor="#ffffff"
                            maximumTrackTintColor="#f5b5b5"
                            thumbTintColor="#ffffff"
                        />

                        <Text style={styles.volumeText}>{Math.round(volume)}%</Text>
                    </View>

                    {/* Exit */}
                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleExit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="exit-outline" size={30} color="black" />
                        <Text style={styles.exitText}>Exit</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalBox: {
        width: 320,
        borderRadius: 30,
        backgroundColor: "#073167",
        borderWidth: 5,
        borderColor: "#000000",
        padding: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    title: {
        fontSize: 30,
        color: "black",
        fontFamily: "HeyComic",
    },

    closeButton: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: "#7f0e12",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 5,
        borderColor: "#000000",
    },

    menuButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#041a36",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 3,
    },

    menuText: {
        color: "white",
        fontSize: 18,
        fontFamily: "HeyComic",
    },

    volumeBox: {
        backgroundColor: "#041a36",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 18,
        borderWidth: 3,
        
    },

    volumeHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },

    slider: {
        width: "100%",
        height: 40,
    },

    volumeText: {
        color: "white",
        fontSize: 16,
        fontFamily: "HeyComic",
        textAlign: "center",
        marginTop: 4,
    },

    exitButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#7f0e12",
        borderRadius: 18,
        paddingVertical: 16,
        borderWidth: 3,
        borderColor: "#000000",
        marginTop: 6,
    },

    exitText: {
        color: "black",
        fontSize: 18,
        fontFamily: "HeyComic",
    },
});