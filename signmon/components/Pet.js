import React from "react";
import { Animated, Image } from "react-native";
import { styles } from "../styles/Home";

const Pet = ({ jumpAnim, selectedHat }) => {
    return (
        <Animated.View style={{ transform: [{ translateY: jumpAnim }] }}>
            <Image
                source={require("@/assets/images/pet.png")}
                style={styles.petImage}
                resizeMode="contain"
            />

            {selectedHat === "cowboy" && (
                <Image
                    source={require("@/assets/images/cowboy1.png")}
                    style={{ position: "absolute", width: 230, height: 230, top: -60, left: 120 }}
                    resizeMode="contain"
                />
            )}
        </Animated.View>
    );
};

export default Pet;