import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Animated,
    Easing,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const QUESTION_COUNT = 15;
const PASS_SCORE = 12;

const LESSON6_PASSED_KEY = "lesson6Passed";
const QUIZ6_FINISHED_KEY = "quiz6Finished";

const REVIEW_ROUTE = "/lessons/lesson6";
const HOME_ROUTE = "/Home";

const QUIZ_THEME_CAP = 0.16;

const COLOR_BANK = [
    {
        answer: "Pula",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FPula(Red).mp4?alt=media&token=8ba3c2c1-74f6-4d87-a97b-f9d1aaa4e1d2",
        },
    },
    {
        answer: "Bughaw",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FAsul(Blue).mp4?alt=media&token=8cc35ed8-42ac-43bd-ac50-1232fa7db5a5",
        },
    },
    {
        answer: "Dilaw",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FDilaw(Yellow).mp4?alt=media&token=6565997c-1f9c-452b-8493-7e1d9f621a66",
        },
    },
    {
        answer: "Berde",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FBerde(Green).mp4?alt=media&token=6efb2ed6-ee8f-4039-8055-81f010905392",
        },
    },
    {
        answer: "Kahel",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FKahel(Orange).mp4?alt=media&token=5c8b33f8-06e7-41d0-9fb2-b2da5d877777",
        },
    },
    {
        answer: "Lila",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FLila(Violet).mp4?alt=media&token=9827ad07-9c24-4d8e-aca2-af74ff90042e",
        },
    },
    {
        answer: "Rosas",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FRosas(Pink).mp4?alt=media&token=1f37db5e-5d84-4835-a60d-10930ac59920",
        },
    },
    {
        answer: "Kayumanggi",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FKayumanggi(Brown).mp4?alt=media&token=dee79779-55e6-4069-917d-5d1134f781c9",
        },
    },
    {
        answer: "Itim",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FItim(Black).mp4?alt=media&token=d6e0f5aa-494e-4670-a4db-736ee06d8df8",
        },
    },
    {
        answer: "Abo",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FAbo(Gray).mp4?alt=media&token=277c700c-d5fc-4ef5-9082-aa85f69748ca",
        },
    },
    {
        answer: "Puti",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FPuti(White).mp4?alt=media&token=3ad62386-510e-4138-9a62-14ce7cfac20c",
        },
    },
    {
        answer: "Ginto",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FGinto(Gold).mp4?alt=media&token=14107db2-f986-40bd-a468-8b1eeca39e85",
        },
    },
    {
        answer: "Pilak",
        source: {
            uri: "https://firebasestorage.googleapis.com/v0/b/signmon-assets.firebasestorage.app/o/COLORS%2FPilak(Silver).mp4?alt=media&token=cdcc90bc-ecfd-46fa-b0b9-ec29d8de74cc",
        },
    },
];

const CHOICE_COLOR_MAP = {
    Pula: {
        backgroundColor: "#EF4444",
        borderColor: "#991B1B",
        textColor: "#FFFFFF",
    },
    Bughaw: {
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
        textColor: "#FFFFFF",
    },
    Dilaw: {
        backgroundColor: "#FACC15",
        borderColor: "#A16207",
        textColor: "#2F1B00",
    },
    Berde: {
        backgroundColor: "#22C55E",
        borderColor: "#166534",
        textColor: "#FFFFFF",
    },
    Kahel: {
        backgroundColor: "#F97316",
        borderColor: "#9A3412",
        textColor: "#FFFFFF",
    },
    Lila: {
        backgroundColor: "#A855F7",
        borderColor: "#6B21A8",
        textColor: "#FFFFFF",
    },
    Rosas: {
        backgroundColor: "#EC4899",
        borderColor: "#9D174D",
        textColor: "#FFFFFF",
    },
    Kayumanggi: {
        backgroundColor: "#8B5E3C",
        borderColor: "#5C4033",
        textColor: "#FFFFFF",
    },
    Itim: {
        backgroundColor: "#111111",
        borderColor: "#000000",
        textColor: "#FFFFFF",
    },
    Abo: {
        backgroundColor: "#9CA3AF",
        borderColor: "#6B7280",
        textColor: "#2F1B00",
    },
    Puti: {
        backgroundColor: "#FFFFFF",
        borderColor: "#9CA3AF",
        textColor: "#2F1B00",
    },
    Ginto: {
        backgroundColor: "#D4AF37",
        borderColor: "#8B6B16",
        textColor: "#2F1B00",
    },
    Pilak: {
        backgroundColor: "#C0C0C0",
        borderColor: "#6B7280",
        textColor: "#2F1B00",
    },
};

export default function Quiz6() {
    const [questions, setQuestions] = useState(() => generateQuestions());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [locked, setLocked] = useState(false);
    const [score, setScore] = useState(0);

    const [showIntroModal, setShowIntroModal] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);
    const [didWin, setDidWin] = useState(false);

    const bgSoundRef = useRef(null);
    const popSoundRef = useRef(null);
    const correctSoundRef = useRef(null);
    const isStartingBgRef = useRef(false);

    const musicVolumeRef = useRef(0.12);
    const sfxVolumeRef = useRef(0.45);

    const cardScale = useRef(new Animated.Value(1)).current;
    const feedbackScale = useRef(new Animated.Value(1)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const currentQuestion = questions[currentIndex];

    const player = useVideoPlayer(currentQuestion?.source ?? null, (playerInstance) => {
        playerInstance.loop = true;
        playerInstance.muted = true;
        playerInstance.play();
    });

    useEffect(() => {
        const updateVideo = async () => {
            if (!currentQuestion?.source) return;

            try {
                await player.replaceAsync(currentQuestion.source);
                player.muted = true;
                player.loop = true;
                player.play();
            } catch (error) {
                console.log("Failed to load quiz video:", error);
            }
        };

        void updateVideo();
    }, [currentQuestion, player]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (currentIndex + 1) / QUESTION_COUNT,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [currentIndex, progressAnim]);

    const stopSoundIfPlaying = useCallback(async (soundRef) => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
            }
        } catch (error) {
            console.log("Failed to stop sound:", error);
        }
    }, []);

    const unloadSoundRef = useCallback(async (soundRef) => {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        } catch (error) {
            console.log("Failed to unload sound:", error);
        }
    }, []);

    const loadSavedAudioSettings = useCallback(async () => {
        try {
            const [savedMusicVolume, savedSfxVolume] = await AsyncStorage.multiGet([
                "musicVolume",
                "sfxVolume",
            ]);

            const musicValue =
                savedMusicVolume?.[1] !== null ? Number(savedMusicVolume[1]) : 0.12;
            const sfxValue =
                savedSfxVolume?.[1] !== null ? Number(savedSfxVolume[1]) : 0.45;

            musicVolumeRef.current = Number.isFinite(musicValue) ? musicValue : 0.12;
            sfxVolumeRef.current = Number.isFinite(sfxValue) ? sfxValue : 0.45;

            if (bgSoundRef.current) {
                await bgSoundRef.current.setVolumeAsync(
                    musicVolumeRef.current * QUIZ_THEME_CAP
                );
            }

            if (popSoundRef.current) {
                await popSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }

            if (correctSoundRef.current) {
                await correctSoundRef.current.setVolumeAsync(sfxVolumeRef.current);
            }
        } catch (error) {
            console.log("Failed to load audio settings:", error);
            musicVolumeRef.current = 0.12;
            sfxVolumeRef.current = 0.45;
        }
    }, []);

    const ensureSoundLoaded = useCallback(async (soundRef, source, volume) => {
        try {
            if (soundRef.current) {
                await soundRef.current.setVolumeAsync(volume);
                return soundRef.current;
            }

            const { sound } = await Audio.Sound.createAsync(source, {
                shouldPlay: false,
                volume,
            });

            soundRef.current = sound;
            return sound;
        } catch (error) {
            console.log("Failed to load sound:", error);
            return null;
        }
    }, []);

    const ensureSfxLoaded = useCallback(async () => {
        await ensureSoundLoaded(
            popSoundRef,
            require("../../../../assets/images/audio/pop.mp3"),
            sfxVolumeRef.current
        );
        await ensureSoundLoaded(
            correctSoundRef,
            require("../../../../assets/images/audio/correct.mp3"),
            sfxVolumeRef.current
        );
    }, [ensureSoundLoaded]);

    const playPop = useCallback(async () => {
        try {
            await loadSavedAudioSettings();

            const sound = await ensureSoundLoaded(
                popSoundRef,
                require("../../../../assets/images/audio/pop.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;

            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play pop sound:", error);
        }
    }, [ensureSoundLoaded, loadSavedAudioSettings]);

    const playCorrect = useCallback(async () => {
        try {
            const sound = await ensureSoundLoaded(
                correctSoundRef,
                require("../../../../assets/images/audio/correct.mp3"),
                sfxVolumeRef.current
            );

            if (!sound) return;

            await sound.setVolumeAsync(sfxVolumeRef.current);
            await sound.replayAsync();
        } catch (error) {
            console.log("Failed to play correct sound:", error);
        }
    }, [ensureSoundLoaded]);

    const stopBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current) {
                const sound = bgSoundRef.current;
                bgSoundRef.current = null;
                await sound.stopAsync();
                await sound.unloadAsync();
            }
        } catch (error) {
            console.log("Failed to stop quiz theme:", error);
        }
    }, []);

    const playBackgroundMusic = useCallback(async () => {
        try {
            if (bgSoundRef.current || isStartingBgRef.current) return;

            isStartingBgRef.current = true;

            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                require("../../../../assets/images/audio/quizTheme.mp3"),
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: musicVolumeRef.current * QUIZ_THEME_CAP,
                }
            );

            if (bgSoundRef.current) {
                await sound.unloadAsync();
            } else {
                bgSoundRef.current = sound;
            }
        } catch (error) {
            console.log("Failed to play quiz theme:", error);
        } finally {
            isStartingBgRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const startScreenAudio = async () => {
                await loadSavedAudioSettings();
                await ensureSfxLoaded();

                if (active) {
                    await playBackgroundMusic();
                }
            };

            void startScreenAudio();

            return () => {
                active = false;
                void stopBackgroundMusic();
                void stopSoundIfPlaying(correctSoundRef);
            };
        }, [
            ensureSfxLoaded,
            loadSavedAudioSettings,
            playBackgroundMusic,
            stopBackgroundMusic,
            stopSoundIfPlaying,
        ])
    );

    const animateQuestionCard = useCallback(() => {
        cardScale.setValue(0.94);
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
        }).start();
    }, [cardScale]);

    const animateFeedback = useCallback(() => {
        feedbackScale.setValue(0.92);
        Animated.spring(feedbackScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
        }).start();
    }, [feedbackScale]);

    const animateModal = useCallback(() => {
        modalScale.setValue(0.88);
        Animated.spring(modalScale, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
        }).start();
    }, [modalScale]);

    useEffect(() => {
        animateQuestionCard();
    }, [currentIndex, animateQuestionCard]);

    useEffect(() => {
        return () => {
            void unloadSoundRef(popSoundRef);
            void unloadSoundRef(correctSoundRef);
            void unloadSoundRef(bgSoundRef);
        };
    }, [unloadSoundRef]);

    const handleExit = useCallback(async () => {
        await playPop();
        router.replace(HOME_ROUTE);
    }, [playPop]);

    const markLessonPassed = useCallback(async () => {
        try {
            await AsyncStorage.multiSet([
                [LESSON6_PASSED_KEY, "true"],
                [QUIZ6_FINISHED_KEY, "true"],
            ]);
            return true;
        } catch (error) {
            console.log("Failed to save lesson 6 pass state:", error);
            return false;
        }
    }, []);

    const finishQuiz = useCallback(
        async (won, finalScore) => {
            setDidWin(won);

            if (won) {
                await markLessonPassed();

                await AsyncStorage.setItem(
                    "pendingQuizReward",
                    JSON.stringify({
                        show: true,
                        title: "May bagong gantimpala!",
                        rewardSet: "cowboyCosmetics",
                        items: [
                            {
                                key: "cowboyHat",
                                name: "Kowboy Sombrero",
                            },
                            {
                                key: "cowboyDress",
                                name: "Kowboy Damit",
                            },
                            {
                                key: "cowboyAcc",
                                name: "Kabayo",
                            },
                        ],
                    })
                );
            }

            setScore(finalScore);
            setShowResultModal(true);
            animateModal();
        },
        [markLessonPassed, animateModal]
    );

    const handleChoice = useCallback(
        async (choice) => {
            if (locked) return;

            await playPop();

            setSelectedChoice(choice);
            setLocked(true);
            animateFeedback();

            const isCorrect = choice === currentQuestion.answer;
            const nextScore = isCorrect ? score + 1 : score;

            if (isCorrect) {
                setScore(nextScore);
                void playCorrect();
            }

            setTimeout(async () => {
                if (currentIndex >= QUESTION_COUNT - 1) {
                    await finishQuiz(nextScore >= PASS_SCORE, nextScore);
                    return;
                }

                setCurrentIndex((prev) => prev + 1);
                setSelectedChoice(null);
                setLocked(false);
            }, 1000);
        },
        [
            locked,
            currentQuestion,
            currentIndex,
            score,
            finishQuiz,
            animateFeedback,
            playPop,
            playCorrect,
        ]
    );

    const handlePlayAgain = useCallback(async () => {
        await playPop();
        setQuestions(generateQuestions());
        setCurrentIndex(0);
        setSelectedChoice(null);
        setLocked(false);
        setScore(0);
        setDidWin(false);
        setShowResultModal(false);
        setShowIntroModal(true);
        progressAnim.setValue(0);
        animateModal();
    }, [playPop, progressAnim, animateModal]);

    const handleReview = useCallback(async () => {
        await playPop();
        router.push(REVIEW_ROUTE);
    }, [playPop]);

    const handleStart = useCallback(async () => {
        await playPop();
        setShowIntroModal(false);
    }, [playPop]);

    const handleGoHome = useCallback(async () => {
        await playPop();
        router.replace(HOME_ROUTE);
    }, [playPop]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const getBaseChoiceColors = (choice) => {
        return (
            CHOICE_COLOR_MAP[choice] || {
                backgroundColor: "#6EC5FF",
                borderColor: "#103A73",
                textColor: "#FFFFFF",
            }
        );
    };

    const getChoiceStyle = (choice) => {
        const baseColors = getBaseChoiceColors(choice);
        const baseStyle = [
            styles.choiceButton,
            {
                backgroundColor: baseColors.backgroundColor,
                borderColor: baseColors.borderColor,
            },
        ];

        if (!locked) return baseStyle;

        if (choice === currentQuestion.answer) {
            return [...baseStyle, styles.choiceCorrect];
        }

        if (choice === selectedChoice) {
            return [...baseStyle, styles.choiceWrong];
        }

        return [...baseStyle, styles.choiceDim];
    };

    const getChoiceTextStyle = (choice) => {
        const baseColors = getBaseChoiceColors(choice);
        const baseStyle = [styles.choiceText, { color: baseColors.textColor }];

        if (!locked) return baseStyle;

        if (choice === currentQuestion.answer) {
            return [styles.choiceText, styles.choiceTextDark];
        }

        if (choice === selectedChoice) {
            return [styles.choiceText, { color: "#FFFFFF" }];
        }

        return [...baseStyle, styles.choiceTextDim];
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Quiz 6</Text>

                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleExit}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={22} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.topRow}>
                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={styles.scoreValue}>{score}</Text>
                </View>

                <View style={styles.questionCard}>
                    <Text style={styles.questionLabel}>Question</Text>
                    <Text style={styles.questionValue}>
                        {currentIndex + 1} / {QUESTION_COUNT}
                    </Text>
                </View>
            </View>

            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progress</Text>
                    <Text style={styles.progressTarget}>Pass: {PASS_SCORE}</Text>
                </View>

                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
            </View>

            <Animated.View
                style={[
                    styles.quizCard,
                    {
                        transform: [{ scale: cardScale }],
                    },
                ]}
            >
                <Text style={styles.quizLabel}>Anong kulay ang ipinapakita?</Text>

                <View style={styles.videoCard}>
                    <VideoView
                        key={currentQuestion.id}
                        style={styles.video}
                        player={player}
                        contentFit="contain"
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                    />
                </View>

                <Text style={styles.quizSubtext}>
                    Panoorin ang sign at piliin ang tamang sagot.
                </Text>
            </Animated.View>

            <Animated.View
                style={[
                    styles.choicesWrap,
                    {
                        transform: [{ scale: feedbackScale }],
                    },
                ]}
            >
                {currentQuestion.choices.map((choice) => (
                    <TouchableOpacity
                        key={choice}
                        style={getChoiceStyle(choice)}
                        activeOpacity={0.85}
                        onPress={() => handleChoice(choice)}
                        disabled={locked}
                    >
                        <Text style={getChoiceTextStyle(choice)} numberOfLines={2}>
                            {choice}
                        </Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>

            <Modal visible={showIntroModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [{ scale: modalScale }],
                            },
                        ]}
                    >
                        <Text style={styles.modalTitle}>Handa ka na ba?</Text>
                        <Text style={styles.modalText}>
                            Panoorin ang video at hulaan ang tamang kulay.
                        </Text>
                        <Text style={styles.modalSubText}>
                            May 15 tanong. Kailangan mo ng {PASS_SCORE} tamang sagot para pumasa.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalPrimaryButton}
                            onPress={handleStart}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalPrimaryButtonText}>OK, Simulan!</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            <Modal visible={showResultModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [{ scale: modalScale }],
                            },
                        ]}
                    >
                        {didWin ? (
                            <>
                                <Text style={styles.modalTitle}>Congratulations!</Text>
                                <Text style={styles.modalText}>
                                    Nakakuha ka ng {score} / {QUESTION_COUNT}.
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Passed na ang Lesson 6. Mahusay!
                                </Text>

                                <TouchableOpacity
                                    style={styles.modalPrimaryButton}
                                    onPress={handleGoHome}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalPrimaryButtonText}>Back to Home</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Try Again</Text>
                                <Text style={styles.modalText}>
                                    Naka-score ka ng {score} / {QUESTION_COUNT}.
                                </Text>
                                <Text style={styles.modalSubText}>
                                    Mag-review muna o subukan ulit.
                                </Text>

                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.reviewButton}
                                        onPress={handleReview}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.reviewButtonText}>Review</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.homeButton}
                                        onPress={handleGoHome}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.homeButtonText}>Exit</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.playAgainButton}
                                    onPress={handlePlayAgain}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.playAgainButtonText}>Play Again</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function generateQuestions() {
    const questions = [];

    for (let i = 0; i < QUESTION_COUNT; i += 1) {
        const item = COLOR_BANK[Math.floor(Math.random() * COLOR_BANK.length)];
        const wrongChoices = shuffleArray(
            COLOR_BANK.filter((c) => c.answer !== item.answer).map((c) => c.answer)
        ).slice(0, 3);

        const choices = shuffleArray([item.answer, ...wrongChoices]);

        questions.push({
            id: `${item.answer}-${i}`,
            answer: item.answer,
            source: item.source,
            choices,
        });
    }

    return questions;
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFEFC2",
        paddingHorizontal: 16,
        paddingTop: 14,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 12,
    },

    title: {
        fontSize: 28,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    exitButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B6B",
        borderWidth: 4,
        borderColor: "#3A1A1A",
    },

    topRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },

    scoreCard: {
        flex: 1,
        backgroundColor: "#FFBE55",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#5A3900",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },

    scoreLabel: {
        fontSize: 14,
        color: "#4A2D00",
        fontFamily: "HeyComic",
    },

    scoreValue: {
        fontSize: 24,
        color: "#2F1B00",
        fontFamily: "HeyComic",
    },

    questionCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },

    questionLabel: {
        fontSize: 14,
        color: "#5C3A00",
        fontFamily: "HeyComic",
    },

    questionValue: {
        fontSize: 22,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    progressCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },

    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    progressTitle: {
        fontSize: 14,
        color: "#4A2D00",
        fontFamily: "HeyComic",
    },

    progressTarget: {
        fontSize: 14,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
    },

    progressTrack: {
        height: 14,
        backgroundColor: "#FDE7B0",
        borderRadius: 999,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#D7B46A",
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#22B07D",
        borderRadius: 999,
    },

    quizCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 4,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    quizLabel: {
        fontSize: 18,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    videoCard: {
        width: "100%",
        height: 280,
        backgroundColor: "#103A73",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#000000",
        overflow: "hidden",
        marginBottom: 10,
    },

    video: {
        flex: 1,
    },

    quizSubtext: {
        fontSize: 14,
        color: "#5C3A00",
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    choicesWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 10,
        marginBottom: 12,
    },

    choiceButton: {
        width: "48%",
        borderRadius: 18,
        borderWidth: 4,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 62,
    },

    choiceCorrect: {
        backgroundColor: "#B9F6CA",
        borderColor: "#138A36",
    },

    choiceWrong: {
        backgroundColor: "#FFB3B3",
        borderColor: "#D72638",
    },

    choiceDim: {
        opacity: 0.5,
    },

    choiceText: {
        fontSize: 17,
        fontFamily: "HeyComic",
        textAlign: "center",
    },

    choiceTextDark: {
        color: "#185B2A",
    },

    choiceTextDim: {
        opacity: 0.95,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000000",
        padding: 22,
        alignItems: "center",
    },

    modalTitle: {
        fontSize: 26,
        color: "#2D2A8C",
        fontFamily: "HeyComic",
        marginBottom: 10,
        textAlign: "center",
    },

    modalText: {
        fontSize: 17,
        color: "#3E2F1C",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 10,
    },

    modalSubText: {
        fontSize: 15,
        color: "#5C3A00",
        fontFamily: "HeyComic",
        textAlign: "center",
        marginBottom: 18,
    },

    modalPrimaryButton: {
        minWidth: 170,
        backgroundColor: "#22B07D",
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "#0C5B40",
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },

    modalPrimaryButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontFamily: "HeyComic",
    },

    modalButtonRow: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },

    reviewButton: {
        flex: 1,
        backgroundColor: "#FFBE55",
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "#5A3900",
        paddingVertical: 12,
        alignItems: "center",
    },

    reviewButtonText: {
        color: "#2F1B00",
        fontSize: 16,
        fontFamily: "HeyComic",
    },

    homeButton: {
        flex: 1,
        backgroundColor: "#FF6B6B",
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "#3A1A1A",
        paddingVertical: 12,
        alignItems: "center",
    },

    homeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "HeyComic",
    },

    playAgainButton: {
        minWidth: 170,
        backgroundColor: "#8B5CF6",
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "#4C1D95",
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },

    playAgainButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontFamily: "HeyComic",
    },
});