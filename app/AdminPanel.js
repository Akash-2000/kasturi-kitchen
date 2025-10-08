import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './services/firebase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/theme';

import { exportBookingsAsCSV } from '../utils/exportToCSV';

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const groupByCompany = (bookingsArray) => {
    const grouped = {};

    bookingsArray.forEach(booking => {
      const company = booking.companyCode || 'Unknown';
      console.log(company, "company")
      console.log(!grouped[company], "company")
      if (!grouped[company]) {
        grouped[company] = [];
      }
      grouped[company].push(booking);
    });
    return grouped
  }
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
        console.log(bookingsData, "bookingsData")
        const groupedBookings = groupByCompany(bookingsData);
        const sectionedBookings = Object.keys(groupedBookings).map((companyCode) => ({
          title: companyCode,
          data: groupedBookings[companyCode],
        }));
        console.log(sectionedBookings, "sectionedBookings")
        setBookings(sectionedBookings);
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
      `\"${b.firstName} ${b.lastName}\",${b.employeeCode},${b.companyCode},${b.mealDate},${b.mealTime}`
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
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }

  const renderHeader = () => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableHeader, styles.nameCol]}>Name</Text>
      <Text style={[styles.tableHeader, styles.empCodeCol]}>Emp. Code</Text>
      <Text style={[styles.tableHeader, styles.dateCol]}>Date</Text>
      <Text style={[styles.tableHeader, styles.timeCol]}>Time</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Bookings</Text>
        <Text style={styles.count}>Total: {bookings?.length}</Text>
      </View>

      <View style={styles.listContainer}>
        {bookings?.length > 0 ? (
          <>
            <TouchableOpacity style={styles.exportButton} onPress={()=>exportBookingsAsCSV(bookings)}>
              <Text style={styles.exportButtonText}>Export as CSV</Text>
            </TouchableOpacity>

            {bookings.map((section) => (
              <View key={section.title} style={styles.sectionContainer}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Company Code: {section.title}</Text>

                <ScrollView horizontal>
                  <View>
                    {/* Header */}
                    {renderHeader()}

                    {/* Rows */}
                    {section.data.map((item) => (
                      <View style={styles.tableRow} key={item.id}>
                        <Text style={styles.tableCell}>{item.employeeCode}</Text>
                        <Text style={styles.tableCell}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.tableCell}>{item.mealDate}</Text>
                        <Text style={styles.tableCell}>{item.mealTime}</Text>
                        {/* Match columns here too */}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}

          </>
        ) : (
          <Text style={styles.noBookingsText}>No meals booked for today.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  count: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  exportButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    padding: 5
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
    color: '#888',
  },
  horizontalList: {
    columnGap: 12, // Only works in React Native 0.71+
  }

});

export default AdminPanel;
