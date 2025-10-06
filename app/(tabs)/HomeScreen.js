
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../services/firebase';

// --- Development Flag ---
// Set to `true` to disable the time restriction for testing.
// Set to `false` for production.
const IS_DEVELOPMENT_MODE = true;

// --- Time Restriction Logic ---
const isBookingTimeActive = () => {
  if (IS_DEVELOPMENT_MODE) {
    return true; // Always allow booking in development mode
  }
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Is the time between 12:00 AM and 7:30 AM?
  const isAfterMidnight = hours >= 0;
  const isBeforeSevenThirty = hours < 7 || (hours === 7 && minutes <= 30);

  return isAfterMidnight && isBeforeSevenThirty;
};

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isBookingEnabled, setIsBookingEnabled] = useState(isBookingTimeActive());
  const router = useRouter();

  useEffect(() => {
    // Optional: Re-check time periodically, though a single check on load is often enough.
    const interval = setInterval(() => {
      setIsBookingEnabled(isBookingTimeActive());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'employees'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setUserData(doc.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Could not fetch user data.");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleBookMeal = async () => {
    if (!isBookingEnabled) {
      Alert.alert("Booking Closed", "Meal booking is only available between 12:00 AM and 7:30 AM.");
      return;
    }
    
    if (!userData) {
      Alert.alert("Error", "User data not loaded yet.");
      return;
    }

    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];

    const bookingsRef = collection(db, "mealBookings");
    const q = query(bookingsRef, where("employeeCode", "==", userData.employeeCode), where("mealDate", "==", todayDateString));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert("Already Booked", "You have already booked a meal for today.");
      } else {
        const newBooking = {
          companyCode: userData.companyCode,
          employeeCode: userData.employeeCode,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mealDate: todayDateString,
          mealTime: today.toTimeString().split(' ')[0],
        };
        await addDoc(bookingsRef, newBooking);
        Alert.alert("Success", "Your meal has been booked successfully.");
      }
    } catch (error) {
      console.error("Error booking meal:", error);
      Alert.alert("Error", "There was an error booking your meal.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
      <View style={styles.content}>
        {userData ? (
          <View style={styles.userDetails}>
            <Text style={styles.greeting}>Hello, {userData.firstName}!</Text>
            <Text>Last Name: {userData.lastName}</Text>
            <Text>Employee Code: {userData.employeeCode}</Text>
          </View>
        ) : (
          <Text>Loading user data...</Text>
        )}
        <TouchableOpacity 
          style={[styles.bookMealButton, !isBookingEnabled && styles.disabledButton]}
          onPress={handleBookMeal}
          disabled={!isBookingEnabled}
        >
          <Text style={styles.bookMealButtonText}>Book Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/AdminLoginScreen')}>
          <Text style={styles.adminLink}>Access Admin Panel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userDetails: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bookMealButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: 'grey',
  },
  bookMealButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  adminLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;
