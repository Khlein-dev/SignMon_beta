import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function RightPanel() {

    return (
        <View style={styles.rightPanel}>

            <PanelItem text="Cowboy Hat" pic={require("../assets/images/cowboy1.png")}/>
            <PanelItem text="Santa Hat" pic={require("../assets/images/santa2.png")}/>
            <PanelItem text="Black Hat" pic={require("../assets/images/blackhat1.png")}/>

        </View>
    );
}

function PanelItem({ text, pic }) {
    return (
        <View style={styles.itemRow}>
            <View style={styles.imagePlaceholder}>
                <Image source={pic} style={{ width: 100, height: 100 }} resizeMode="contain" />
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
        width: 320,
        backgroundColor: "#073167",
        padding: 20,
    },

    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#041a36",
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },

    imagePlaceholder: {
        width: 100,
        height: 100,
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