import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BottomPanel() {
    return (
        <View style={styles.bottomPanel}>
            <Text style={styles.panelText}>BOTTOM PANEL</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomPanel: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 200,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
    },

    panelText: {
        color: "white",
        fontWeight: "bold",
    },



});