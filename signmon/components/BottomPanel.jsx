import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomPanel({ visible, onClose, onNavigate }) {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isMounted, setIsMounted] = useState(visible);

    const menuItems = useMemo(
        () => [
            { label: "Alphabet", route: "lesson 1" },
            { label: "Numero", route: "lesson 2" },
            { label: "Kulay", route: "lesson 3" },
            { label: "Pamilya", route: "lesson 4" },
            { label: "Mga Araw", route: "lesson 5" },
            { label: "Buwan", route: "lesson 6" },
            { label: "Kilos", route: "lesson 7" },
            { label: "Pagbati", route: "lesson 8" },
        ],
        []
    );

    useEffect(() => {
        if (visible) {
            setIsMounted(true);

            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else if (isMounted) {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 260,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setIsMounted(false);
                }
            });
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 260,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsMounted(false);
                onClose && onClose();
            }
        });
    };

    const handlePressItem = (route) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            console.log("Navigate to:", route);
        }
    };

    if (!isMounted) return null;

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    transform: [{ translateY }],
                },
            ]}
        >
            {/* Gradient Background */}
            <LinearGradient
                colors={["#1a437a", "#073167", "#041833"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Menu</Text>

                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item) => (
                    <Pressable
                        key={item.route}
                        style={({ pressed }) => [
                            styles.gridButton,
                            pressed && styles.gridButtonPressed,
                        ]}
                        onPress={() => handlePressItem(item.route)}
                    >
                        <Text style={styles.gridButtonSubtext}>{item.route}</Text>
                        <Text style={styles.gridButtonText}>{item.label}</Text>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#073167",
        zIndex: 999,
        elevation: 999,
        paddingTop: 56,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    header: {
        minHeight: 48,
        justifyContent: "center",
        marginBottom: 20,
    },

    title: {
        color: "black",
        fontSize: 54,
        fontFamily: "HeyComic",
    },

    closeButton: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: "#7f0e12",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 5,
        borderColor: "#000000",
    },

    closeButtonText: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 22,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
    },

    gridButton: {
        width: "48%",
        minHeight: 90,
        backgroundColor: "#dc7e13",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
        borderColor: "#000000",
        borderWidth: 4,
        padding: 25,
    },

    gridButtonPressed: {
        opacity: 0.8,
    },

    gridButtonText: {
        color: "black",
        fontSize: 25,
        fontFamily: "HeyComic",
        marginBottom: 4,
    },

    gridButtonSubtext: {
        color: "black",
        fontSize: 15,
        fontFamily: "HeyComic",
    },
});