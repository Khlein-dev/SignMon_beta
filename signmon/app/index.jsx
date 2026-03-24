import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          // 👉 Navigate automatically
          setTimeout(() => {
            router.replace("/UserForm");
          }, 500);

          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loading SignMon...</Text>

      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.percent}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "white",
    marginBottom: 30,
    fontWeight: "bold",
  },
  barContainer: {
    width: "70%",
    height: 20,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#22c55e",
  },
  percent: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
  },
});