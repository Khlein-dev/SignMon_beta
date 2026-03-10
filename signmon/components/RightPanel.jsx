import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";


export default function RightPanel({ setHat, setDress, setNecklace }) {
    const [section, setSection] = useState("hat");

    return (
        <View style={styles.rightPanel}>
            <Text style={styles.Text}>ACCESSORIES</Text>

            {/* SECTION BUTTONS */}
            <View style={styles.sectionRow}>
                <TouchableOpacity
                    style={[
                        styles.sectionHat,
                        section === "hat" && styles.activeButton,
                    ]}
                    onPress={() => setSection("hat")}
                    activeOpacity={0.8}
                >
                    <Image
                        source={require("../assets/images/cap.png")}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.sectionDress,
                        section === "dress" && styles.activeButton,
                    ]}
                    onPress={() => setSection("dress")}
                    activeOpacity={0.8}
                >
                    <Image
                        source={require("../assets/images/shirt.png")}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.sectionAccessories,
                        section === "necklace" && styles.activeButton,
                    ]}
                    onPress={() => setSection("necklace")}
                    activeOpacity={0.8}
                >
                    <Image
                        source={require("../assets/images/necklace.png")}
                        style={{ width: 50, height: 50 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HATS */}
                {section === "hat" && (
                    <>
                        <PanelItem
                            text="None"
                            pic={require("../assets/images/noHat.png")}
                            onPress={() => setHat(null)}
                        />

                        <PanelItem
                            text="Cowboy Hat"
                            pic={require("../assets/images/cowboy1.png")}
                            onPress={() =>
                                setHat(require("../assets/images/cowboy1.png"))
                            }
                        />

                        <PanelItem
                            text="Santa Hat"
                            pic={require("../assets/images/santa2.png")}
                            onPress={() =>
                                setHat(require("../assets/images/santa2.png"))
                            }
                        />

                        <PanelItem
                            text="Black Hat"
                            pic={require("../assets/images/blackhat1.png")}
                            onPress={() =>
                                setHat(require("../assets/images/blackhat1.png"))
                            }
                        />
                    </>
                )}

                {/* DRESS */}
                {section === "dress" && (
                    <>
                        <PanelItem
                            text="None"
                            pic={require("../assets/images/noHat.png")}
                            onPress={() => setDress(null)}
                        />

                        <PanelItem
                            text="Red Dress"
                            pic={require("../assets/images/cat.png")}
                            onPress={() =>
                                setDress(require("../assets/images/cat.png"))
                            }
                        />

                        <PanelItem
                            text="Blue Dress"
                            pic={require("../assets/images/check.png")}
                            onPress={() =>
                                setDress(require("../assets/images/check.png"))
                            }
                        />
                    </>
                )}

                {/* NECKLACE */}
                {section === "necklace" && (
                    <>
                        <PanelItem
                            text="None"
                            pic={require("../assets/images/noHat.png")}
                            onPress={() => setNecklace(null)}
                        />

                        <PanelItem
                            text="Book"
                            pic={require("../assets/images/check.png")}
                            onPress={() =>
                                setNecklace(
                                    require("../assets/images/check.png")
                                )
                            }
                        />

                        <PanelItem
                            text="Ball"
                            pic={require("../assets/images/check.png")}
                            onPress={() =>
                                setNecklace(
                                    require("../assets/images/check.png")
                                )
                            }
                        />
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function PanelItem({ text, pic, onPress }) {
    return (
        <TouchableOpacity
            style={styles.itemRow}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.imagePlaceholder}>
                <Image
                    source={pic}
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.itemText}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    Text: {
        textAlign: "center",
        fontFamily: "HeyComic",
        top: 40,
        color: "black",
        fontSize: 25,
        marginBottom: 20,
    },

    rightPanel: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 320,
        backgroundColor: "#073167",
        borderWidth: 6,
        borderColor: "#000000",
        padding: 25,
    },

    sectionRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 15,
        marginTop: 30,
    },

    sectionHat: {
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 70,
        backgroundColor: "#750909",
        borderRadius: 30,
        borderColor: "#000000",
        borderWidth: 4,
        padding: 25,
    },

    sectionDress: {
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 70,
        backgroundColor: "#dc7e13",
        borderRadius: 30,
        borderColor: "#000000",
        borderWidth: 4,
        padding: 25,
    },

    sectionAccessories: {
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 70,
        backgroundColor: "#17a374",
        borderRadius: 30,
        borderColor: "#000000",
        borderWidth: 4,
        padding: 25,
    },

    activeButton: {
        borderColor: "#ffffff",
        borderWidth: 4,
        transform: [{ scale: 1.1 }],
    },

    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#041a36",
        padding: 10,
        borderRadius: 35,
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
        fontFamily: "HeyComic",
        fontSize: 16,
    },
});