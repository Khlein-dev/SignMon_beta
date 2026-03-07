import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFinished(true);
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

      {/* Loading Bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.percent}>{progress}%</Text>

      {/* Button appears when loading completes */}
      {finished && (
        <Link href="/Home" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Enter Game</Text>
          </TouchableOpacity>
        </Link>
      )}
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

  button: {
    marginTop: 40,
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});