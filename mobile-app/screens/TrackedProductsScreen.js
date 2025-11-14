import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://localhost:5000';

const TrackedProductsScreen = () => {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTrackedProducts();
  }, []);

  const fetchTrackedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/tracked-products`);
      setTrackedProducts(response.data);
    } catch (error) {
      console.error('Error fetching tracked products:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PriceHistory', { product: item })}>
      <View style={styles.item}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Target Price: ${item.target_price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracked Products</Text>
      <Button
        title="Add New Product"
        onPress={() => navigation.navigate('AddProduct')}
      />
      <FlatList
        data={trackedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrackedProductsScreen;
