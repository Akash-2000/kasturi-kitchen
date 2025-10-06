
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Button, Platform } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './services/firebase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        const bookingsRef = collection(db, "mealBookings");
        const q = query(bookingsRef, where("mealDate", "==", todayDateString));

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        Alert.alert("Error", "Could not fetch meal bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleExport = async () => {
    if (bookings.length === 0) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    const header = "Name,Employee Code,Company Code,Date,Time\n";
    const rows = bookings.map(b => 
      `"${b.firstName} ${b.lastName}",${b.employeeCode},${b.companyCode},${b.mealDate},${b.mealTime}`
    ).join("\n");

    const csvString = `${header}${rows}`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meal_bookings.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        const fileUri = FileSystem.documentDirectory + 'meal_bookings.csv';
        await FileSystem.writeAsStringAsync(fileUri, csvString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Meal Bookings',
        });
      } catch (error) {
        console.error("Error exporting data:", error);
        Alert.alert("Export Error", "An error occurred while exporting the data.");
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  const renderHeader = () => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableHeader, styles.nameCol]}>Name</Text>
      <Text style={[styles.tableHeader, styles.empCodeCol]}>Emp. Code</Text>
      <Text style={[styles.tableHeader, styles.dateCol]}>Date</Text>
      <Text style={[styles.tableHeader, styles.timeCol]}>Time</Text>
    </View>
  );

  const renderBooking = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.nameCol]}>{item.firstName} {item.lastName}</Text>
      <Text style={[styles.tableCell, styles.empCodeCol]}>{item.employeeCode}</Text>
      <Text style={[styles.tableCell, styles.dateCol]}>{item.mealDate}</Text>
      <Text style={[styles.tableCell, styles.timeCol]}>{item.mealTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Today's Bookings</Text>
          <Text style={styles.count}>Total: {bookings.length}</Text>
        </View>
        <Button title="Export" onPress={handleExport} />
      </View>
      
      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          ListHeaderComponent={renderHeader}
          renderItem={renderBooking}
          keyExtractor={item => item.id}
          style={styles.table}
        />
      ) : (
        <Text style={styles.noBookingsText}>No meals booked for today.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'normal',
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4, 
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableCell: {
    fontSize: 14,
    color: '#555',
  },
  nameCol: {
    flex: 2.5,
  },
  empCodeCol: {
    flex: 1.5,
  },
  dateCol: {
    flex: 2,
    textAlign: 'center',
  },
  timeCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  noBookingsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
});

export default AdminPanel;
