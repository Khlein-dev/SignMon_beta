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
        top: 70,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
    },

    levelCircle: {
        width: 100,
        height: 100,
        borderRadius: 35,
        backgroundColor: "#8847a4",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 6,
        borderColor: "#000000",
    },

    levelText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 60,
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
        height: 40,
        backgroundColor: "#49175f",
        borderRadius: 50,
        overflow: "hidden",
        borderWidth: 6,
        borderColor: "#000000"
    },

    barFill: {
        height: "100%",
        backgroundColor: "#8847a4",
        borderRadius: 50,
    },

});