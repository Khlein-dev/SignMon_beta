import { StyleSheet } from "react-native";

export const cosmeticsSection = StyleSheet.create({
    container: {
        flex: 1,
        width: 350,
        height: 940,
        padding: 30,
        borderRadius: 15,
        gap: 10,
        top: -20,
    },

    itemCard: {
        backgroundColor: "#311207ae",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        height: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    itemText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },

    image: {
        width: 100,
        height: 100,
    },

    lock: {
        width: 45,
        height: 45,
        top: -2,
    },
});