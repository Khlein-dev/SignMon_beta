import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Pressable,
} from "react-native";

import BottomPanel from "../../components/BottomPanel";
import LeftPanel from "../../components/LeftPanel";
import RightPanel from "../../components/RightPanel";
import Pet from "../../components/Pet";
import Stats from "../../components/StatsBar";

// ICONS
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Home() {
    const [openPanel, setOpenPanel] = useState(null); // "left" | "right" | "bottom" | null

    const [hat, setHat] = useState(null);
    const [dress, setDress] = useState(null);
    const [necklace, setNecklace] = useState(null);

    const closePanels = () => {
        setOpenPanel(null);
    };

    const openLeftPanel = () => {
        setOpenPanel("left");
    };

    const openRightPanel = () => {
        setOpenPanel("right");
    };

    const openBottomPanel = () => {
        setOpenPanel("bottom");
    };

    // BOOK JUMP ANIMATION
    const jumpAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(jumpAnim, {
                    toValue: -25,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(jumpAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 4000);

        return () => clearInterval(interval);
    }, [jumpAnim]);

    const handleBottomNavigate = (route) => {
        setOpenPanel(null);

        // Placeholder navigation
        console.log("Navigate to:", route);

        // later replace with:
        // navigation.navigate(route);
    };

    return (
        <ImageBackground
            source={require("../../assets/images/background.jpg")}
            style={styles.container}
        >
            <Stats />

            {/* PET */}
            <Pet hat={hat} dress={dress} necklace={necklace} />

            {/* LEFT BUTTON */}
            <TouchableOpacity
                style={styles.leftButton}
                onPress={openLeftPanel}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    <FontAwesome name="gear" size={50} color="black" />
                </Text>
            </TouchableOpacity>

            {/* RIGHT BUTTON */}
            <TouchableOpacity
                style={styles.rightButton}
                onPress={openRightPanel}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    <MaterialCommunityIcons name="hanger" size={50} color="black" />
                </Text>
            </TouchableOpacity>

            {/* BOTTOM BUTTON */}
            <Animated.View
                style={[
                    styles.learningButton,
                    { transform: [{ translateY: jumpAnim }] },
                ]}
            >
                <TouchableOpacity onPress={openBottomPanel} activeOpacity={0.8}>
                    <ImageBackground
                        source={require("../../assets/images/asl.png")}
                        style={styles.aslImage}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* LEFT PANEL MODAL */}
            <LeftPanel visible={openPanel === "left"} onClose={closePanels} />

            {/* BACKDROP - only for right */}
            {openPanel === "right" && (
                <Pressable style={styles.backdrop} onPress={closePanels} />
            )}

            {/* RIGHT PANEL */}
            {openPanel === "right" && (
                <View style={styles.panelWrapper} pointerEvents="box-none">
                    <View style={styles.panelContent}>
                        <RightPanel
                            setHat={setHat}
                            setDress={setDress}
                            setNecklace={setNecklace}
                        />
                    </View>
                </View>
            )}

            {/* BOTTOM PANEL */}
            <BottomPanel
                visible={openPanel === "bottom"}
                onClose={closePanels}
                onNavigate={handleBottomNavigate}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "white",
    },

    leftButton: {
        position: "absolute",
        width: 90,
        height: 90,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 35,
        borderWidth: 6,
        borderColor: "#000000",
        left: 20,
        top: "22%",
        backgroundColor: "#3b2a98",
        padding: 10,
        zIndex: 1,
    },

    rightButton: {
        position: "absolute",
        width: 90,
        height: 90,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 35,
        borderWidth: 6,
        borderColor: "#000000",
        right: 20,
        top: "22%",
        backgroundColor: "#f59208",
        padding: 10,
        zIndex: 1,
    },

    learningButton: {
        position: "absolute",
        width: 400,
        height: 200,
        alignItems: "center",
        justifyContent: "center",
        bottom: 60,
        zIndex: 1,
    },

    aslImage: {
        width: 420,
        height: 220,
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5,
    },

    panelWrapper: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        elevation: 10,
    },

    panelContent: {
        flex: 1,
    },

    panelText: {
        color: "white",
        fontWeight: "bold",
    },
});