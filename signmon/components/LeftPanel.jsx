import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LeftPanel() {
    return (
        <View style={styles.leftPanel}>
            <Text style={styles.panelText}>LEFT PANEL</Text>
        </View>
    );
}

const styles = StyleSheet.create({


    leftPanel: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 200,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
    },

    panelText: {
        color: "white",
        fontWeight: "bold",
    },
});