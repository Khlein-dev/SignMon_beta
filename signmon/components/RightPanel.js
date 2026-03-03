import React from "react";
import { Animated, View, Text, TouchableOpacity, Image, ScrollView, ImageBackground } from "react-native";
import { cosmeticsSection } from "../styles/Cosmetics";

const RightPanel = ({
    visible,
    slideAnim,
    setSelectedHat,
    handleHatPress
}) => {
    if (!visible) return null;

    return (
        <Animated.View
            style={{
                position: "absolute",
                right: 50,
                top: 0,
                bottom: 0,
                width: 300,
                transform: [{ translateX: slideAnim }],
            }}
        >
            <View style={{ flex: 1 }}>
                <ImageBackground
                    source={require("@/assets/images/woodBG4.png")}
                    style={cosmeticsSection.container}
                >
                    <ScrollView>
                        <TouchableOpacity
                            style={cosmeticsSection.itemCard}
                            onPress={() => setSelectedHat(null)}
                        >
                            <Text style={cosmeticsSection.itemText}>No Hat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cosmeticsSection.itemCard}
                            onPress={() => setSelectedHat("cowboy")}
                        >
                            <Text style={cosmeticsSection.itemText}>Cowboy Hat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cosmeticsSection.itemCard}
                            onPress={() => setSelectedHat("santa")}
                        >
                            <Text style={cosmeticsSection.itemText}>Santa Hat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={cosmeticsSection.itemCard}
                            onPress={() => handleHatPress("blackhat", true)}
                        >
                            <Text style={cosmeticsSection.itemText}>Black Hat</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </ImageBackground>
            </View>
        </Animated.View>
    );
};

export default RightPanel;