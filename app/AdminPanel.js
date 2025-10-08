import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './services/firebase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/theme';
import { exportBookingsAsCSV } from '../utils/exportToCSV';
import MealTable from '../components/MealTable';

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const groupByCompany = (bookingsArray) => {
    const grouped = {};
    bookingsArray.forEach(booking => {
      const company = booking.companyCode || 'Unknown';
      if (!grouped[company]) grouped[company] = [];
      grouped[company].push(booking);
    });
    return grouped;
  };


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
        
        const groupedBookings = groupByCompany(bookingsData);
        const sectionedBookings = Object.keys(groupedBookings).map((companyCode) => ({
          title: companyCode,
          data: groupedBookings[companyCode],
        }));
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

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }

  const renderHeader = () => (
    <View style={[styles.tableRow, styles.headerRow]}>
      <Text style={[styles.tableHeader, styles.snoCol]}>S.no</Text>
      <Text style={[styles.tableHeader, styles.nameCol]}>Name</Text>
      <Text style={[styles.tableHeader, styles.empCodeCol]}>Emp. Code</Text>
      <Text style={[styles.tableHeader, styles.dateCol]}>Date</Text>
      <Text style={[styles.tableHeader, styles.timeCol]}>Time</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Today's Bookings</Text>
        <Text style={styles.count}>Total: {bookings?.reduce((sum, item) => sum + item?.data?.length, 0)}</Text>
      </View>

      {/* Scrollable Main Area */}
      <ScrollView style={styles.listContainer}>
        {bookings?.length > 0 ? (
          <>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => exportBookingsAsCSV(bookings)}
            >
              <Text style={styles.exportButtonText}>Export as CSV</Text>
            </TouchableOpacity>

            {/* Table for each Company */}
            {bookings.map((section) => (
              <View key={section.title} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Company Code: {section.title}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tableContainer}>
                    {/* Header */}
                    {renderHeader()}

                    {/* Data Rows */}
                    {section.data.map((item, index) => (
                      <View
                        style={[
                          styles.tableRow,
                          index % 2 === 0 ? styles.evenRow : styles.oddRow,
                        ]}
                        key={item.id}
                      >
                        <Text style={[styles.tableCell, styles.snoCol]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.nameCol]}>
                          {item.firstName} {item.lastName}
                        </Text>
                        <Text style={[styles.tableCell, styles.empCodeCol]}>
                          {item.employeeCode}
                        </Text>
                        <Text style={[styles.tableCell, styles.dateCol]}>
                          {item.mealDate}
                        </Text>
                        <Text style={[styles.tableCell, styles.timeCol]}>
                          {item.mealTime}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}

            {/* Summary Table */}
            <MealTable mealBooking={bookings} />
          </>
        ) : (
          <Text style={styles.noBookingsText}>No meals booked for today.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },

  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  count: { fontSize: 18, color: '#f0f0f0', marginTop: 5 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 1, padding: 18 },

  exportButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  exportButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  sectionContainer: {
    // backgroundColor: '#fff',
    borderRadius: 12,
    // padding: 14,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    marginBottom: 14,
    marginLeft: 6,
  },

  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14, // increased from 12 → 14
    paddingHorizontal: 14, // increased from 10 → 14
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    minHeight: 50, // ensures better row height
  },

  headerRow: {
    backgroundColor: '#f1f3f5',
    borderBottomWidth: 2,
    borderColor: '#d0d0d0',
  },

  tableHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  tableCell: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 6, // inner spacing for better text separation
  },

  snoCol: { flex: 0.8 },
  nameCol: { flex: 2.2, textAlign: 'left' },
  empCodeCol: { flex: 1.6 },
  dateCol: { flex: 1.5 },
  timeCol: { flex: 1.5 },

  evenRow: { backgroundColor: '#fafafa' },
  oddRow: { backgroundColor: '#fff' },

  noBookingsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
    color: '#888',
  },
});

export default AdminPanel;
