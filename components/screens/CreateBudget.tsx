import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface CreateBudgetProps {
  onBack: () => void;
  session?: any; // Supabase session
}

export default function CreateBudget({ onBack, session }: CreateBudgetProps) {
  const [amount, setAmount] = useState('0.00');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [budgetName, setBudgetName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isFormValid = () => {
    return (
      amount.trim() !== '' && 
      amount !== '0.00' && 
      budgetName.trim() !== ''
    );
  };
  
  const handleCreateBudget = async () => {
    if (!isFormValid()) return;
    
    try {
      setLoading(true);
      
      // Get current month and year for the budget
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-11
      const year = currentDate.getFullYear();
      
      // If we have a session, save to Supabase
      if (session) {
        const { data, error } = await supabase.from('budgets').insert({
          monthly_amount: parseFloat(amount),
          category: selectedCategory,
          name: budgetName,
          month: month,
          year: year,
          user_id: session.user.id
        });
        console.log(data, error);
      } else {
        console.log('No session available, budget data not saved');
      }

      onBack();
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const categories = [
    { id: 'general', name: 'All Categories', icon: 'ellipsis-horizontal' },
    { id: 'food', name: 'Food', icon: 'fast-food' },
    { id: 'transport', name: 'Transport', icon: 'car' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'shopping', name: 'Shopping', icon: 'cart' },
    { id: 'health', name: 'Health', icon: 'medkit' },
    { id: 'groceries', name: 'Groceries', icon: 'basket' },
    { id: 'utilities', name: 'Utilities', icon: 'flash' },
  ];
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#576574', '#C2B6B6']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.purpleSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Budget</Text>
        <Text style={styles.subText}>Plan your spending</Text>
      </LinearGradient>
      
      <View style={styles.cardContainer}>
        <Card containerStyle={styles.card}>
          <View style={styles.amountContainer}>
            <Text style={styles.dollarText}>$</Text>
            <TextInput
              style={styles.amountText}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              selectTextOnFocus
              maxLength={10}
            />
            <Text style={styles.perMonthText}>/month</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoriesScrollContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryItem, selectedCategory === category.id && styles.selectedCategory]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={22} 
                    color={selectedCategory === category.id ? 'white' : '#666'} 
                  />
                  <Text 
                    style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.categoryLabel}>Budget Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter budget name"
                value={budgetName}
                onChangeText={setBudgetName}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>

      <Button 
        title="Create Budget"
        disabled={loading || !isFormValid()}
        loading={loading}
        onPress={handleCreateBudget}
        containerStyle={styles.buttonContainer2}
        buttonStyle={styles.button}
        color="#576574"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  purpleSection: {
    flex: 2,
    justifyContent: 'center',
  },
  whiteSection: {
    flex: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    opacity: 0.8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 20,
  },
  subText: {
    color: 'white',
    paddingTop: 10,
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 20,
    maxWidth: '80%',
  },
  backButton: {
    position: 'absolute',
    top: 65,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'light',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    top: '50%',
    transform: [{ translateY: -140 }],
    zIndex: 10,
  },
  card: {
    width: '85%',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dollarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    opacity: 0.8,
    paddingLeft: 5,
    minWidth: 100,
    textAlign: 'center',
  },
  perMonthText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginLeft: 5,
  },
  categoryContainer: {
    marginTop: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: 'light',
    textAlign: 'left',
    paddingTop: 20,
    opacity: 0.7,
  },
  categoriesScrollContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#576574',
    borderColor: '#576574',
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  inputContainer: {
    marginVertical: 8,
  },
  nameInput: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#444',
  },
  buttonContainer2: {
    borderRadius: 30,
    marginBottom: 40,
    width: '85%',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 15,
    height: 55,
  },
});