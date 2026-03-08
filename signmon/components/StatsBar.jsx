import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Stats() {
    const level = 5;
    const progress = 65; // % progress to next level

    return (
        <View style={styles.container}>

            {/* LEVEL CIRCLE */}
            <View style={styles.levelCircle}>
                <Text style={styles.levelText}>{level}</Text>
            </View>

            {/* LEVEL BAR */}
            <View style={styles.levelSection}>

                <Text style={styles.label}>LEVEL</Text>

                <View style={styles.barBackground}>
                    <View
                        style={[
                            styles.barFill,
                            { width: `${progress}%` }
                        ]}
                    />
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0d1b2a", // dark blue background
        padding: 12,
        borderRadius: 12,
    },

    levelCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1b263b",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 2,
        borderColor: "#e0e1dd",
    },

    levelText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    levelSection: {
        flex: 1,
    },

    label: {
        color: "white",
        fontSize: 12,
        marginBottom: 4,
    },

    barBackground: {
        width: "100%",
        height: 10,
        backgroundColor: "#415a77",
        borderRadius: 6,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        backgroundColor: "#4cc9f0",
        borderRadius: 6,
    },

});