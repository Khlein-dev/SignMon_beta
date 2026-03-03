import React from "react";
import { View } from "react-native";
import { styles } from "../styles/Home";

const StatsBar = () => {
    return (
        <View style={styles.statsContainer}>
            <View style={styles.statRow}>
                <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: "40%" }]} />
                </View>
            </View>
        </View>
    );
};

export default StatsBar;