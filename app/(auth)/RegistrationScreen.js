
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase'; // Adjust the import path as needed
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const RegistrationScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('ALP');
  const { logout } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !employeeCode || !mobileNumber || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      Alert.alert('Success', 'Registration successful! Please check your email to verify your account.');

      // Store employee details in Firestore
      await addDoc(collection(db, 'employees'), {
        uid: user.uid,
        firstName,
        lastName,
        employeeCode,
        mobileNumber,
        email,
        companyCode,
      });

      // Logout the user and navigate to login
      await logout();
      router.replace('/(auth)/LoginScreen');

    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Employee Code"
        value={employeeCode}
        onChangeText={setEmployeeCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email ID"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Picker
        selectedValue={companyCode}
        style={styles.picker}
        onValueChange={(itemValue) => setCompanyCode(itemValue)}
      >
        <Picker.Item label="ALP" value="ALP" />
        <Picker.Item label="AMS" value="AMS" />
        <Picker.Item label="IV" value="IV" />
      </Picker>
      <Button title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => router.push('/(auth)/LoginScreen')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  link: {
      marginTop: 16,
      color: 'blue',
      textDecorationLine: 'underline',
      textAlign: 'center'
  }
});

export default RegistrationScreen;
