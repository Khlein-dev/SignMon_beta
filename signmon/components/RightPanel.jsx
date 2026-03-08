import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RightPanel() {

    return (
        <View style={styles.rightPanel}>

            <PanelItem text="Cowboy Hat" />
            <PanelItem text="Wizard Hat" />
            <PanelItem text="Top Hat" />

        </View>
    );
}

function PanelItem({ text }) {
    return (
        <View style={styles.itemRow}>
            <View style={styles.imagePlaceholder}>
                <Text>IMG</Text>
            </View>

            <Text style={styles.itemText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({

    rightPanel: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 220,
        backgroundColor: "#222",
        padding: 20,
    },

    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },

    imagePlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: "#aaa",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderRadius: 6,
    },

    itemText: {
        color: "white",
        fontSize: 16,
    },

});