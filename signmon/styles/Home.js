import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    petImage: { width: 360, height: 360, marginBottom: 10 },
    SignImage: { width: 460, height: 360, marginBottom: 110, left: -5 },
    hatIcon: { width: 60, height: 60, top: -2 },
    settingIcon: { width: 45, height: 45, top: -2 },
    cosmeticImage: { width: 230, height: 230, marginBottom: -60, left: -1, top: -20 },

    statsContainer: {
        position: "absolute",
        width: 400,
        height: 100,
        top: 65,
        left: 10,
        padding: 15,
        justifyContent: "center",
    },

    statRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },

    barBackground: {
        flex: 1,
        height: 40,
        backgroundColor: "#290635ff",
        borderRadius: 10,
        borderWidth: 5,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        backgroundColor: "#b14e86ff",
        borderRadius: 5,
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});