import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    TouchableWithoutFeedback
} from "react-native";

import BottomPanel from "../../components/BottomPanel";
import LeftPanel from "../../components/LeftPanel";
import RightPanel from "../../components/RightPanel";
import Pet from "../../components/Pet";

export default function Home() {
    const [bottomOpen, setBottomOpen] = useState(false);
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    const closePanels = () => {
        setBottomOpen(false);
        setLeftOpen(false);
        setRightOpen(false);
    };

    return (
        <TouchableWithoutFeedback onPress={closePanels}>
            <ImageBackground
                source={require("../../assets/images/background.jpg")}
                style={styles.container}
            >

                {/* PET */}
                <Pet />

                {/* LEFT BUTTON */}
                <TouchableOpacity
                    style={styles.leftButton}
                    onPress={() => setLeftOpen(!leftOpen)}
                >
                    <Text style={styles.buttonText}>Left</Text>
                </TouchableOpacity>

                {/* RIGHT BUTTON */}
                <TouchableOpacity
                    style={styles.rightButton}
                    onPress={() => setRightOpen(!rightOpen)}
                >
                    <Text style={styles.buttonText}>Right</Text>
                </TouchableOpacity>

                {/* BOTTOM BUTTON */}
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => setBottomOpen(!bottomOpen)}
                >
                    <Text style={styles.buttonText}>Bottom</Text>
                </TouchableOpacity>

                {/* PANELS */}
                {leftOpen && <LeftPanel />}
                {rightOpen && <RightPanel />}
                {bottomOpen && <BottomPanel />}

            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}

/* ---------------- STYLES ---------------- */

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
        left: 20,
        top: "50%",
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 10,
    },

    rightButton: {
        position: "absolute",
        right: 20,
        top: "50%",
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 10,
    },

    bottomButton: {
        position: "absolute",
        bottom: 40,
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 10,
    },

    panelText: {
        color: "white",
        fontWeight: "bold",
    },
});