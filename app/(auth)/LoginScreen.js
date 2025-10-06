
import { useRouter } from 'expo-router';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { auth } from '../services/firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user.email, "email" ,user.emailVerified)
      if (user.emailVerified) {
        // The root layout will handle the redirect to home automatically
      } else {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address to log in. Check your inbox for the verification link.',
          [
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await sendEmailVerification(user);
                  Alert.alert('Email Sent', 'A new verification email has been sent to your address.');
                } catch (resendError) {
                  setError(resendError.message);
                }
              },
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
        // It's good practice to sign the user out if their email is not verified
        await auth.signOut(); 
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/applogo.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color={Colors.light.tint} />
      </View>
      <TouchableOpacity onPress={() => router.push('/(auth)/RegistrationScreen')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
  },
  input: {
    width: '90%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '90%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
   
    padding:5,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  link: {
    marginTop: 15,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default LoginScreen;
