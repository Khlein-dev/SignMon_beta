import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

export default function UserForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState(10);
  const [gender, setGender] = useState("");

  const submitUser = async () => {
    try {
      const res = await axios.post("http://192.168.100.5:5000/users", {
        name,
        age: age.toString(),
        gender,
      });

      const user = res.data.user;

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("userId", user.userId.toString());
      await AsyncStorage.setItem("xp", user.xp.toString());
      await AsyncStorage.setItem("level", user.level.toString());

      router.replace("/(tabs)/Home");
    } catch (err) {
      console.log(err);
      alert("Error saving user");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/draftBG.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={styles.card}>

          {step === 1 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
              <Text style={styles.title}>Ano ang iyong pangalan?</Text>

              <TextInput
                style={styles.input}
                placeholder="Ilagay ang pangalan"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (!name) return alert("Enter your name!");
                  setStep(2);
                }}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
              <Text style={styles.title}>Ilang taon ka na?</Text>

              <Text style={styles.ageText}>{age} years old</Text>

              <Slider
                minimumValue={7}
                maximumValue={30}
                step={1}
                value={age}
                onValueChange={setAge}
                minimumTrackTintColor="#8A5CF6"
                maximumTrackTintColor="#ddd"
              />

              <View style={styles.navRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
    <Text style={styles.title}>Piliin ang kasarian</Text>

      <View style={styles.row}>
      
      <TouchableOpacity
        style={[
          styles.option,
          gender === "Male" && styles.selected,
        ]}
        onPress={() => setGender("Male")}
      >
        <Image
          source={require("../assets/images/Male_Blue.png")}
          style={styles.genderImage}
        />
        <Text style={styles.optionText}>Male</Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={[
          styles.option,
          gender === "Female" && styles.selected,
        ]}
        onPress={() => setGender("Female")}
      >
        <Image
          source={require("../assets/images/Female_Rose.png")}
          style={styles.genderImage}
        />
        <Text style={styles.optionText}>Female</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.navRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    if (!gender) return alert("Select gender!");
                    submitUser();
                  }}
                >
                  <Text style={styles.buttonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },

  card: {
    width: "90%",
    backgroundColor: "#FFF4C7",
    padding: 20,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: "#000",
  },

  title: {
    fontSize: 24,
    fontFamily: "HeyComic",
    color: "#3B1D00",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 20,
  },

  ageText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "HeyComic",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  option: {
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#000",
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#8A5CF6",
  },

  icon: {
    fontSize: 40,
  },

  optionText: {
    fontFamily: "HeyComic",
    marginTop: 5,
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  button: {
    backgroundColor: "#8A5CF6",
    padding: 14,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
  },

  backButton: {
    backgroundColor: "#ccc",
    padding: 14,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
  },

  buttonText: {
    fontFamily: "HeyComic",
    color: "#1b1208",
  },

  genderImage: {
  width: 80,
  height: 80,
  resizeMode: "contain",
  marginBottom: 8,
},
option: {
  backgroundColor: "#eee",
  padding: 20,
  borderRadius: 20,
  borderWidth: 4,
  borderColor: "#000",
  alignItems: "center",
  width: 130,
},

selected: {
  backgroundColor: "#8A5CF6",
},

});