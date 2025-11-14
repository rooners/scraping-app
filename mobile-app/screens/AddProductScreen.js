import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const AddProductScreen = () => {
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const handleAddProduct = async () => {
    try {
      await axios.post(`${API_URL}/add-tracked-product`, {
        name: 'Product Name', // Placeholder
        url,
        target_price: targetPrice,
      });
      alert('Product added successfully');
      setUrl('');
      setTargetPrice('');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a new product to track</Text>
      <TextInput
        style={styles.input}
        placeholder="Product URL"
        value={url}
        onChangeText={setUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Price"
        value={targetPrice}
        onChangeText={setTargetPrice}
        keyboardType="numeric"
      />
      <Button title="Add Product" onPress={handleAddProduct} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default AddProductScreen;
