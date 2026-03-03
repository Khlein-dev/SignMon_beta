import React from "react";
import { Animated, View, Text, TouchableOpacity } from "react-native";

const LeftPanel = ({ visible, slideAnim, onExitPress }) => {
    if (!visible) return null;

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 300,
                transform: [{ translateX: slideAnim }],
                backgroundColor: "#042f5d",
                padding: 20,
            }}
        >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
                Menu Settings
            </Text>

            {[
                "Pet Information",
                "Preferences",
                "Notifications",
                "Learning Progress",
                "Help Center",
                "Feedback",
            ].map((item) => (
                <TouchableOpacity
                    key={item}
                    style={{
                        backgroundColor: "#215287",
                        padding: 14,
                        borderRadius: 10,
                        marginVertical: 6,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                        {item}
                    </Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                onPress={onExitPress}
                style={{
                    marginTop: 20,
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 3,
                    borderColor: "#820805",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                    Exit
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default LeftPanel;