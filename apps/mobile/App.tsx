import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar } from 'react-native';
import { validatePagination } from '@superque/shared';

export default function App() {
  const pagination = validatePagination({ page: 1, limit: 10, sortOrder: 'asc' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <Text style={styles.title}>Superque Mobile</Text>
        <Text style={styles.subtitle}>Shared validation demo</Text>
        <Text style={styles.mono}>page: {String(pagination.page)}</Text>
        <Text style={styles.mono}>limit: {String(pagination.limit)}</Text>
        <Text style={styles.mono}>sortOrder: {pagination.sortOrder}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 13,
    marginBottom: 6,
  },
});
