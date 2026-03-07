import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BottomPanel() {
    return (
        <View style={styles.rightPanel}>
            <Text style={styles.panelText}>RIGHT PANEL</Text>
        </View>
    );
}

const styles = StyleSheet.create({


    rightPanel: {
        position: "absolute",
        right: 0,
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