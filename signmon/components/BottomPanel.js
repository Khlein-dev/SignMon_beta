import React from "react";
import { Animated, View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { learningSection } from "../styles/Lessons";

const BottomPanel = ({ visible, slideAnim }) => {
    const router = useRouter();

    if (!visible) return null;

    return (
        <Animated.View
            style={{
                position: "absolute",
                bottom: 50,
                left: 0,
                right: 0,
                height: 300,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ImageBackground
                    source={require("@/assets/images/book.png")}
                    style={learningSection.container}
                >
                    <View
                        style={{
                            position: "absolute",
                            top: 60,
                            left: 30,
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => router.push("/lesson")}
                            style={learningSection.moduleCard}
                        >
                            <Text style={{ fontWeight: "bold" }}>LESSON 1</Text>
                        </TouchableOpacity>

                        {[2, 3, 4, 5, 6].map((num) => (
                            <View key={num} style={learningSection.moduleCard}>
                                <Text style={{ fontWeight: "bold" }}>
                                    LESSON {num}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ImageBackground>
            </View>
        </Animated.View>
    );
};

export default BottomPanel;