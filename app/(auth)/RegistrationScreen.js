import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../services/firebase"; // Adjust the import path as needed

const RegistrationScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("ALP");
  const[loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !employeeCode ||
      !mobileNumber ||
      !email ||
      !password
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true)
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      Alert.alert(
        "Success",
        "Registration successful! Please check your email to verify your account."
      );

      // Store employee details in Firestore
      await addDoc(collection(db, "employees"), {
        uid: user.uid,
        firstName,
        lastName,
        employeeCode,
        mobileNumber,
        email,
        companyCode,
      });

      // Logout the user and navigate to login
      setLoading(false)
      await logout();
      router.replace("/(auth)/LoginScreen");
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Registration Error", error.message);
      setLoading(false)
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Employee Code"
          value={employeeCode}
          onChangeText={setEmployeeCode}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Email ID"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={companyCode}
            style={styles.picker}
            onValueChange={(itemValue) => setCompanyCode(itemValue)}
          >
            <Picker.Item label="ALP" value="ALP" />
            <Picker.Item label="AMS" value="AMS" />
            <Picker.Item label="IV" value="IV" />
          </Picker>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={loading? "Registering...":"Register"}
            onPress={handleRegister}
            color={Colors.light.tint}
            disabled={loading}
          />
        </View>
        <TouchableOpacity onPress={() => router.push("/(auth)/LoginScreen")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
  padding: 20,
   flexGrow: 1,
  paddingBottom: 10, 
  alignItems: "center",
  backgroundColor: "#f5f5f5",
},
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    marginTop:60,
    color: "#333",
  },
  input: {
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  pickerContainer: {
    width: "90%",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  picker: {
    width: "100%",
    height: 50,
    color: "#333",
  },
  buttonContainer: {
    width: "90%",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
    // padding: 5,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  link: {
    marginTop: 15,
    color: Colors.light.tint,
    textDecorationLine: "underline",
    fontSize: 14,
  },
});

export default RegistrationScreen;
