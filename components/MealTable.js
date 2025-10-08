import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const getMealCounts = (sections) => {
    return sections?.map(section => ({
        companyCode: section.title,
        mealCount: section.data.length,
    }));
};

export default function MealTable({ mealBooking }) {


    const mealData = getMealCounts(mealBooking)
    const total = mealData?.reduce((sum, item) => sum + item.mealCount, 0);

    // Header renderer
    const renderHeader = () => (
        <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerText]}>Company Code</Text>
            <Text style={[styles.tableCell, styles.headerText]}>Meal Count</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Horizontal Scrollable Table */}
            <View horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.title}>Total</Text>
                <View style={styles.sectionContainer}>
                    {/* Header */}
                    {renderHeader()}

                    {/* Data Rows */}
                    {mealData.map((item, index) => (
                        <View
                            style={[
                                styles.tableRow,
                                index % 2 === 1 && styles.tableRowOdd,
                                styles.rowMargin,
                            ]}
                            key={item.companyCode}
                        >
                            <Text style={styles.tableCell}>{item.companyCode}</Text>
                            <Text style={styles.tableCell}>{item.mealCount}</Text>
                        </View>
                    ))}

                    {/* Total Row */}
                    <View style={[styles.tableRow, styles.totalRow, styles.rowMargin]}>
                        <Text style={[styles.tableCell, styles.totalText]}>Total</Text>
                        <Text style={[styles.tableCell, styles.totalText]}>{total}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // padding: 15,
        width: "100%",
        // backgroundColor: "#f9fafb", // Light background for contrast
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 40
        // elevation: 3,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#e1e5eb",
        paddingVertical: 5,
        paddingHorizontal: 3,
        backgroundColor: "#fff",
    },
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
    // Zebra striping for better readability
    tableRowOdd: {
        backgroundColor: "#f7f9fc",
    },
    tableHeader: {
        backgroundColor: '#f1f3f5',
        // borderBottomWidth: 2,
        borderColor: '#d0d0d0',
    },
    headerText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#344054",
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
        color: "#344054",
        paddingVertical: 10
    },
    tableCell: {
        width: 150,
        textAlign: "center",
        fontSize: 15,
        color: "#475467",
    },
    totalRow: {
        backgroundColor: '#f1f3f5',
        borderColor: "#cbd5e1",
    },
    totalText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#1e293b",
    },
    rowMargin: {
        marginBottom: 8,
    },
});
