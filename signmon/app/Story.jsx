import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    View,
    Animated,
    StyleSheet,
    Dimensions,
    Easing,
    Pressable,
    Text,
} from "react-native";
import { router } from "expo-router";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

const { width, height } = Dimensions.get("window");

const STORY_HEIGHT = height * 0.84;

export default function Story() {
    const [visible, setVisible] = useState({
        firstPanel: true,
        portal: false,
        monkeyFalling: false,
        secondPanel: false,
        monkeyLand: false,
        thirdPanel: false,
        bubbleText1: false,
        bubbleText2: false,
        fourthPanel: false,
        fifthPanel: false,
        finalPanel: false,
    });

    const firstPanelFloat = useRef(new Animated.Value(0)).current;

    const portalScaleX = useRef(new Animated.Value(0.15)).current;
    const portalScaleY = useRef(new Animated.Value(1.7)).current;
    const portalOpacity = useRef(new Animated.Value(0)).current;
    const portalPulse = useRef(new Animated.Value(1)).current;
    const portalRotate = useRef(new Animated.Value(0)).current;

    const monkeyFallOpacity = useRef(new Animated.Value(0)).current;
    const monkeyFallTranslateY = useRef(new Animated.Value(-120)).current;
    const monkeyFallRotate = useRef(new Animated.Value(-10)).current;
    const monkeyFallScale = useRef(new Animated.Value(0.92)).current;

    const secondPanelPop = useRef(new Animated.Value(0.96)).current;
    const secondPanelOpacity = useRef(new Animated.Value(0)).current;

    const monkeyLandOpacity = useRef(new Animated.Value(0)).current;
    const monkeyLandShakeX = useRef(new Animated.Value(0)).current;
    const monkeyLandSquashX = useRef(new Animated.Value(1.08)).current;
    const monkeyLandSquashY = useRef(new Animated.Value(0.9)).current;

    const thirdPanelOpacity = useRef(new Animated.Value(0)).current;
    const thirdPanelScale = useRef(new Animated.Value(1.04)).current;

    const bubble1Opacity = useRef(new Animated.Value(0)).current;
    const bubble1ShakeX = useRef(new Animated.Value(0)).current;
    const bubble1Scale = useRef(new Animated.Value(0.7)).current;

    const bubble2Opacity = useRef(new Animated.Value(0)).current;
    const bubble2ShakeX = useRef(new Animated.Value(0)).current;
    const bubble2Scale = useRef(new Animated.Value(0.7)).current;

    const fourthPanelOpacity = useRef(new Animated.Value(0)).current;
    const fourthPanelSlideY = useRef(new Animated.Value(40)).current;

    const fifthPanelOpacity = useRef(new Animated.Value(0)).current;
    const fifthPanelScale = useRef(new Animated.Value(0.94)).current;

    const finalPanelOpacity = useRef(new Animated.Value(0)).current;
    const finalPanelScale = useRef(new Animated.Value(0.9)).current;
    const finalPanelShakeX = useRef(new Animated.Value(0)).current;
    const finalPanelShakeY = useRef(new Animated.Value(0)).current;

    // Audio players
    const portalOpeningPlayer = useAudioPlayer(
        require("../assets/images/audio/portalOpening.mp3")
    );
    const fallingPlayer = useAudioPlayer(
        require("../assets/images/audio/falling.mp3")
    );
    const monkeyLandPlayer = useAudioPlayer(
        require("../assets/images/audio/monkeyLand.mp3")
    );
    const monkeySpeakPlayer = useAudioPlayer(
        require("../assets/images/audio/monkeySpeak.mp3")
    );
    const bubblePlayer = useAudioPlayer(
        require("../assets/images/audio/bubble.mp3")
    );
    const monkeyThinkPlayer = useAudioPlayer(
        require("../assets/images/audio/monkeyThink.mp3")
    );
    const ideaPlayer = useAudioPlayer(
        require("../assets/images/audio/idea.mp3")
    );
    const choirPlayer = useAudioPlayer(
        require("../assets/images/audio/choir.mp3")
    );
    const popPlayer = useAudioPlayer(
        require("../assets/images/audio/pop.mp3")
    );

    const replaySound = useCallback((player) => {
        try {
            player.seekTo(0);
            player.play();
        } catch (error) {
            console.warn("Audio playback failed:", error);
        }
    }, []);

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
        }).catch((error) => {
            console.warn("Failed to set audio mode:", error);
        });
    }, []);

    useEffect(() => {
        const timers = [];
        let portalPulseLoop;
        let firstPanelFloatLoop;

        const showAt = (delay, key, animation, soundPlayer) => {
            const timer = setTimeout(() => {
                setVisible((prev) => ({ ...prev, [key]: true }));
                if (soundPlayer) replaySound(soundPlayer);
                if (animation) animation();
            }, delay);

            timers.push(timer);
        };

        const hideAt = (delay, key, animation) => {
            const timer = setTimeout(() => {
                if (animation) {
                    animation(() => {
                        setVisible((prev) => ({ ...prev, [key]: false }));
                    });
                } else {
                    setVisible((prev) => ({ ...prev, [key]: false }));
                }
            }, delay);

            timers.push(timer);
        };

        const startFirstPanelFloat = () => {
            firstPanelFloat.setValue(0);

            firstPanelFloatLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(firstPanelFloat, {
                        toValue: -8,
                        duration: 1800,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(firstPanelFloat, {
                        toValue: 0,
                        duration: 1800,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );

            firstPanelFloatLoop.start();
        };

        const animatePortal = () => {
            portalScaleX.setValue(0.15);
            portalScaleY.setValue(1.7);
            portalOpacity.setValue(0);
            portalPulse.setValue(1);
            portalRotate.setValue(-8);

            Animated.parallel([
                Animated.timing(portalOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.spring(portalScaleX, {
                    toValue: 1,
                    friction: 5,
                    tension: 90,
                    useNativeDriver: true,
                }),
                Animated.spring(portalScaleY, {
                    toValue: 1,
                    friction: 5,
                    tension: 90,
                    useNativeDriver: true,
                }),
                Animated.timing(portalRotate, {
                    toValue: 0,
                    duration: 380,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            portalPulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(portalPulse, {
                        toValue: 1.04,
                        duration: 550,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(portalPulse, {
                        toValue: 0.98,
                        duration: 550,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            portalPulseLoop.start();
        };

        const animatePortalExit = (onDone) => {
            if (portalPulseLoop) {
                portalPulseLoop.stop();
            }

            Animated.parallel([
                Animated.timing(portalOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(portalScaleX, {
                    toValue: 0.8,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(portalScaleY, {
                    toValue: 0.8,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onDone) onDone();
            });
        };

        const animateMonkeyFalling = () => {
            monkeyFallOpacity.setValue(0);
            monkeyFallTranslateY.setValue(-120);
            monkeyFallRotate.setValue(-10);
            monkeyFallScale.setValue(0.92);

            Animated.parallel([
                Animated.timing(monkeyFallOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(monkeyFallTranslateY, {
                    toValue: -8,
                    duration: 900,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(monkeyFallRotate, {
                    toValue: 6,
                    duration: 900,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(monkeyFallScale, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const animateSecondPanel = () => {
            secondPanelOpacity.setValue(0);
            secondPanelPop.setValue(0.96);

            Animated.parallel([
                Animated.timing(secondPanelOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(secondPanelPop, {
                    toValue: 1,
                    friction: 6,
                    tension: 90,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const animateMonkeyLand = () => {
            monkeyLandOpacity.setValue(0);
            monkeyLandShakeX.setValue(0);
            monkeyLandSquashX.setValue(1.08);
            monkeyLandSquashY.setValue(0.9);

            Animated.sequence([
                Animated.timing(monkeyLandOpacity, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(monkeyLandShakeX, {
                            toValue: -14,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: 14,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: -10,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: 10,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: -6,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: 6,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                        Animated.timing(monkeyLandShakeX, {
                            toValue: 0,
                            duration: 30,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(monkeyLandSquashX, {
                            toValue: 1.16,
                            duration: 90,
                            useNativeDriver: true,
                        }),
                        Animated.spring(monkeyLandSquashX, {
                            toValue: 1,
                            friction: 5,
                            tension: 120,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(monkeyLandSquashY, {
                            toValue: 0.82,
                            duration: 90,
                            useNativeDriver: true,
                        }),
                        Animated.spring(monkeyLandSquashY, {
                            toValue: 1,
                            friction: 5,
                            tension: 120,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start();
        };

        const animateThirdPanel = () => {
            thirdPanelOpacity.setValue(0);
            thirdPanelScale.setValue(1.04);

            Animated.parallel([
                Animated.timing(thirdPanelOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(thirdPanelScale, {
                    toValue: 1,
                    duration: 280,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const animateBubble = (opacityValue, shakeValue, scaleValue) => {
            opacityValue.setValue(0);
            shakeValue.setValue(0);
            scaleValue.setValue(0.7);

            Animated.sequence([
                Animated.parallel([
                    Animated.spring(scaleValue, {
                        toValue: 1.06,
                        friction: 4,
                        tension: 120,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityValue, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(shakeValue, {
                            toValue: -10,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: 10,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: -7,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: 7,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: 0,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(scaleValue, {
                            toValue: 1,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 1.02,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 1,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start();
        };

        const animateFourthPanel = () => {
            fourthPanelOpacity.setValue(0);
            fourthPanelSlideY.setValue(40);

            Animated.parallel([
                Animated.timing(fourthPanelOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(fourthPanelSlideY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const animateFifthPanel = () => {
            fifthPanelOpacity.setValue(0);
            fifthPanelScale.setValue(0.94);

            Animated.parallel([
                Animated.timing(fifthPanelOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(fifthPanelScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 95,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        const animateFinalPanel = () => {
            finalPanelOpacity.setValue(0);
            finalPanelScale.setValue(0.9);
            finalPanelShakeX.setValue(0);
            finalPanelShakeY.setValue(0);

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(finalPanelOpacity, {
                        toValue: 1,
                        duration: 160,
                        useNativeDriver: true,
                    }),
                    Animated.spring(finalPanelScale, {
                        toValue: 1.02,
                        friction: 5,
                        tension: 120,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(finalPanelShakeX, {
                            toValue: -18,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: 18,
                            duration: 45,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: -14,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: 14,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: -8,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: 8,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeX, {
                            toValue: 0,
                            duration: 30,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(finalPanelShakeY, {
                            toValue: -8,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeY, {
                            toValue: 6,
                            duration: 40,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeY, {
                            toValue: -4,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalPanelShakeY, {
                            toValue: 0,
                            duration: 35,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(finalPanelScale, {
                            toValue: 1.05,
                            duration: 90,
                            useNativeDriver: true,
                        }),
                        Animated.spring(finalPanelScale, {
                            toValue: 1,
                            friction: 4,
                            tension: 130,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start();
        };

        startFirstPanelFloat();

        showAt(2500, "portal", animatePortal, portalOpeningPlayer);
        showAt(3600, "monkeyFalling", animateMonkeyFalling, fallingPlayer);
        hideAt(4600, "portal", animatePortalExit);

        showAt(5600, "secondPanel", animateSecondPanel);
        showAt(6000, "monkeyLand", animateMonkeyLand, monkeyLandPlayer);

        showAt(7300, "thirdPanel", animateThirdPanel);

        showAt(
            8000,
            "bubbleText1",
            () => animateBubble(bubble1Opacity, bubble1ShakeX, bubble1Scale),
            monkeySpeakPlayer
        );
        hideAt(10000, "bubbleText1");

        showAt(
            10050,
            "bubbleText2",
            () => animateBubble(bubble2Opacity, bubble2ShakeX, bubble2Scale),
            bubblePlayer
        );
        hideAt(12050, "bubbleText2");

        showAt(12350, "fourthPanel", animateFourthPanel, monkeyThinkPlayer);
        showAt(13800, "fifthPanel", animateFifthPanel, ideaPlayer);
        showAt(15400, "finalPanel", animateFinalPanel, choirPlayer);

        return () => {
            timers.forEach(clearTimeout);
            if (portalPulseLoop) portalPulseLoop.stop();
            if (firstPanelFloatLoop) firstPanelFloatLoop.stop();
        };
    }, [
        firstPanelFloat,
        portalScaleX,
        portalScaleY,
        portalOpacity,
        portalPulse,
        portalRotate,
        monkeyFallOpacity,
        monkeyFallTranslateY,
        monkeyFallRotate,
        monkeyFallScale,
        secondPanelPop,
        secondPanelOpacity,
        monkeyLandOpacity,
        monkeyLandShakeX,
        monkeyLandSquashX,
        monkeyLandSquashY,
        thirdPanelOpacity,
        thirdPanelScale,
        bubble1Opacity,
        bubble1ShakeX,
        bubble1Scale,
        bubble2Opacity,
        bubble2ShakeX,
        bubble2Scale,
        fourthPanelOpacity,
        fourthPanelSlideY,
        fifthPanelOpacity,
        fifthPanelScale,
        finalPanelOpacity,
        finalPanelScale,
        finalPanelShakeX,
        finalPanelShakeY,
        portalOpeningPlayer,
        fallingPlayer,
        monkeyLandPlayer,
        monkeySpeakPlayer,
        bubblePlayer,
        monkeyThinkPlayer,
        ideaPlayer,
        choirPlayer,
        replaySound,
    ]);

    const portalRotation = portalRotate.interpolate({
        inputRange: [-10, 10],
        outputRange: ["-10deg", "10deg"],
    });

    const monkeyFallRotation = monkeyFallRotate.interpolate({
        inputRange: [-15, 15],
        outputRange: ["-15deg", "15deg"],
    });

    const handleSkip = () => {
        replaySound(popPlayer);
        router.push("/UserForm");
    };

    return (
        <View style={styles.screen}>
            <View style={styles.overlayGlow} />

            <View style={styles.storyStage}>
                <View style={styles.bubbleOne} />
                <View style={styles.bubbleTwo} />
                <View style={styles.bubbleThree} />

                {visible.firstPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/1stpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 1,
                                transform: [{ translateY: firstPanelFloat }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.portal && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/portal.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 2,
                                opacity: portalOpacity,
                                transform: [
                                    { scaleX: portalScaleX },
                                    { scaleY: portalScaleY },
                                    { scale: portalPulse },
                                    { rotate: portalRotation },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.monkeyFalling && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/monkeyFalling.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 3,
                                opacity: monkeyFallOpacity,
                                transform: [
                                    { translateY: monkeyFallTranslateY },
                                    { rotate: monkeyFallRotation },
                                    { scale: monkeyFallScale },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.secondPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/2ndpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 4,
                                opacity: secondPanelOpacity,
                                transform: [{ scale: secondPanelPop }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.monkeyLand && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/monkeyLand.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 5,
                                opacity: monkeyLandOpacity,
                                transform: [
                                    { translateX: monkeyLandShakeX },
                                    { scaleX: monkeyLandSquashX },
                                    { scaleY: monkeyLandSquashY },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.thirdPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/3rdpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 6,
                                opacity: thirdPanelOpacity,
                                transform: [{ scale: thirdPanelScale }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.bubbleText1 && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/bubbleText1.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 7,
                                opacity: bubble1Opacity,
                                transform: [
                                    { translateX: bubble1ShakeX },
                                    { scale: bubble1Scale },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.bubbleText2 && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/bubbleText2.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 8,
                                opacity: bubble2Opacity,
                                transform: [
                                    { translateX: bubble2ShakeX },
                                    { scale: bubble2Scale },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.fourthPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/4thpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 9,
                                opacity: fourthPanelOpacity,
                                transform: [{ translateY: fourthPanelSlideY }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.fifthPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/5thpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 10,
                                opacity: fifthPanelOpacity,
                                transform: [{ scale: fifthPanelScale }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {visible.finalPanel && (
                    <Animated.Image
                        source={require("../assets/images/storyboard/finalpanel.png")}
                        style={[
                            styles.image,
                            {
                                zIndex: 11,
                                opacity: finalPanelOpacity,
                                transform: [
                                    { translateX: finalPanelShakeX },
                                    { translateY: finalPanelShakeY },
                                    { scale: finalPanelScale },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}
            </View>

            <View style={styles.skipWrap}>
                <Pressable
                    onPress={handleSkip}
                    style={({ pressed }) => [
                        styles.gridButton,
                        pressed && styles.gridButtonPressed,
                    ]}
                >
                    <View
                        style={[
                            styles.cardBubble,
                            styles.cardBubbleSmall,
                            styles.cardBubbleBlue,
                        ]}
                    />
                    <View
                        style={[
                            styles.cardBubble,
                            styles.cardBubbleMedium,
                            styles.cardBubblePink,
                        ]}
                    />
                    <View
                        style={[
                            styles.cardBubble,
                            styles.cardBubbleLarge,
                            styles.cardBubbleYellow,
                        ]}
                    />
                    <View
                        style={[
                            styles.cardBubble,
                            styles.cardBubbleTiny,
                            styles.cardBubblePurple,
                        ]}
                    />
                    <View
                        style={[
                            styles.cardBubble,
                            styles.extraBubbleLeft,
                            styles.cardBubbleMint,
                        ]}
                    />
                    <View
                        style={[
                            styles.cardBubble,
                            styles.extraBubbleBottom,
                            styles.cardBubbleLime,
                        ]}
                    />

                    <Text style={styles.skipLabel}>Skip</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#0d3d78",
    },

    overlayGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(125, 211, 252, 0.08)",
    },

    storyStage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    image: {
        position: "absolute",
        width,
        height: STORY_HEIGHT,
    },

    skipWrap: {
        paddingHorizontal: 20,
        paddingTop: 3,
        paddingBottom: 18,
    },

    gridButton: {
        minHeight: 90,
        backgroundColor: "#ffbe55",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 28,
        borderColor: "#5a3900",
        borderWidth: 4,
        paddingVertical: 18,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        overflow: "hidden",
    },

    gridButtonLocked: {
        backgroundColor: "#d9d4cf",
        borderColor: "#8a817c",
    },

    gridButtonNew: {
        backgroundColor: "#8CF0B5",
        borderColor: "#0C5B40",
        shadowOpacity: 0.22,
    },

    gridButtonPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.94,
    },

    skipLabel: {
        fontSize: 24,
        fontWeight: "900",
        color: "#3b2200",
        letterSpacing: 0.5,
        zIndex: 2,
    },

    cardBubble: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.33,
    },

    cardBubbleSmall: {
        width: 38,
        height: 38,
        top: 12,
        right: 12,
    },

    cardBubbleMedium: {
        width: 56,
        height: 56,
        bottom: -8,
        right: 14,
    },

    cardBubbleLarge: {
        width: 78,
        height: 78,
        top: 38,
        left: -16,
    },

    cardBubbleTiny: {
        width: 22,
        height: 22,
        top: 44,
        right: 38,
    },

    extraBubbleLeft: {
        width: 30,
        height: 30,
        bottom: 16,
        left: 26,
    },

    extraBubbleBottom: {
        width: 22,
        height: 22,
        bottom: 14,
        right: 80,
    },

    cardBubbleBlue: {
        backgroundColor: "#93C5FD",
    },

    cardBubblePink: {
        backgroundColor: "#F9A8D4",
    },

    cardBubbleYellow: {
        backgroundColor: "#FDE68A",
    },

    cardBubblePurple: {
        backgroundColor: "#C4B5FD",
    },

    cardBubbleMint: {
        backgroundColor: "#A7F3D0",
    },

    cardBubbleLime: {
        backgroundColor: "#D9F99D",
    },

    cardBubbleGray: {
        backgroundColor: "#E7E5E4",
    },

    bubbleOne: {
        position: "absolute",
        top: -16,
        left: -12,
        width: 90,
        height: 90,
        borderRadius: 999,
        backgroundColor: "rgba(94, 198, 255, 0.18)",
    },

    bubbleTwo: {
        position: "absolute",
        bottom: -20,
        right: -8,
        width: 110,
        height: 110,
        borderRadius: 999,
        backgroundColor: "rgba(255, 148, 181, 0.14)",
    },

    bubbleThree: {
        position: "absolute",
        top: 140,
        right: 30,
        width: 44,
        height: 44,
        borderRadius: 999,
        backgroundColor: "rgba(132, 255, 191, 0.14)",
    },
});