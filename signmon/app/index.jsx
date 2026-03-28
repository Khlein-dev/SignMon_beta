import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            router.replace("/Story");
          }, 500);

          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={["#4c1d95", "#2e1065"]}
      style={styles.container}
    >
   
      <View style={styles.bubble1} />
      <View style={styles.bubble2} />
      <View style={styles.bubble3} />

  
      <Image
        source={require("../assets/images/logo.png")} 
        style={styles.logo}
      />

  
      <Text style={styles.title}>SIGNMON</Text>
      <Text style={styles.subtitle}>Preparing your experience...</Text>

  
      <View style={styles.barContainer}>
        <View style={styles.barBg}>
          <LinearGradient
            colors={["#facc15", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <Text style={styles.percent}>{progress}%</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

 
  bubble1: {
    position: "absolute",
    top: 120,
    left: 40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  bubble2: {
    position: "absolute",
    bottom: 120,
    right: 40,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  bubble3: {
    position: "absolute",
    top: 250,
    right: 80,
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 10,
  },

  title: {
    fontSize: 32,
    color: "#fff",
    fontFamily: "HeyComic",
  },

  subtitle: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 20,
  },

  
  barContainer: {
    width: "60%",
  },

  barBg: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
  },

  percent: {
    marginTop: 10,
    color: "#fff",
    fontSize: 14,
  },
});