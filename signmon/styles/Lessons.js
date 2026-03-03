import { StyleSheet } from "react-native";

export const learningSection = StyleSheet.create({
    container: {
        flexGrow: 1,
        flexDirection: "row",
        width: 560,
        height: 370,
        padding: 50,
        borderRadius: 15,
        gap: 7,
    },

    moduleCard: {
        backgroundColor: "#f65a17ff",
        borderRadius: 10,
        padding: 5,
        width: "25%",
        height: "55%",
        justifyContent: "center",
        borderWidth: 3,
        alignItems: "center",
    },
});