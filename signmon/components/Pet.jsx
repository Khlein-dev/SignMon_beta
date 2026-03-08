import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BottomPanel() {
    return (
        <View style={styles.pet}>
            <Text style={styles.petText}>PET </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pet: {
        width: 200,
        height: 200,
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },

    petText: {
        fontWeight: "bold",
    },



});