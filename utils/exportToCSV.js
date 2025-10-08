import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export async function exportBookingsAsCSV(sections) {
  try {
    const rows = [];
    let totalCount = 0;

    // Loop over sections
    sections.forEach(section => {
      // Section header (company code)
      rows.push(`Company Code: ${section.title}`);

      // Table header
      rows.push('Employee Code,Name,Meal Date,Meal Time');

      // Data rows
      section.data.forEach(booking => {
        const row = [
          booking.employeeCode,
          `${booking.firstName} ${booking.lastName}`,
          booking.mealDate,
          booking.mealTime,
        ];
        rows.push(row.join(','));
        totalCount++;
      });

      rows.push(''); // Empty line for spacing between sections
    });

    // Total row
    rows.push(`Total Bookings: ${totalCount}`);

    // CSV string
    const csvString = rows.join('\n');

    // Save file
    const fileName = `bookings_${Date.now()}.csv`;
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding:   'utf8',
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share Bookings CSV',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('Sharing Not Available', 'Your device does not support file sharing.');
    }
  } catch (error) {
    console.error('CSV export error:', error);
    Alert.alert('Error', 'Could not export CSV file.');
  }
}
