import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Card } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface AddExpenseProps {
  onBack: () => void;
  session?: any; // Supabase session
}

export default function AddExpense({ onBack, session }: AddExpenseProps) {
  const [amount, setAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [expenseName, setExpenseName] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isFormValid = () => {
    return (
      amount.trim() !== '' && 
      amount !== '0.00' && 
      expenseName.trim() !== ''
    );
  };
  
  const handleAddExpense = async () => {
    if (!isFormValid()) return;
    
    try {
      setLoading(true);
      
      const month = date.getMonth() + 1; 
      const year = date.getFullYear();
    
      if (session) {
        const { data, error } = await supabase.from('expenses').insert({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          category: selectedCategory,
          name: expenseName,
          date: date.toISOString().split('T')[0],
          user_id: session.user.id
        }).select();
        
        console.log('Supabase response:', { data, error });
      } else {
        console.log('No session available, expense data not saved');
      }
      
      onBack();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDate = (selectedDate: Date) => {
    setDatePickerVisible(false);
    setDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const categories = [
    { id: 'food', name: 'Food', icon: 'fast-food' },
    { id: 'transport', name: 'Transport', icon: 'car' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'shopping', name: 'Shopping', icon: 'cart' },
    { id: 'health', name: 'Health', icon: 'medkit' },
    { id: 'groceries', name: 'Groceries', icon: 'basket' },
    { id: 'utilities', name: 'Utilities', icon: 'flash' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' }
  ];
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#48C3EB', '#718EDD']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.purpleSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Add Expense</Text>
        <Text style={styles.subText}>Track your spending</Text>
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
          </View>
          <View style={styles.categoryContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.methodButton, paymentMethod === 'card' && styles.selectedMethod]} 
                onPress={() => setPaymentMethod('card')}
              >
                <Text style={[styles.methodText, paymentMethod === 'card' && styles.selectedMethodText]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodButton, paymentMethod === 'cash' && styles.selectedMethod]} 
                onPress={() => setPaymentMethod('cash')}
              >
                <Text style={[styles.methodText, paymentMethod === 'cash' && styles.selectedMethodText]}>Cash</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.categoryLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setDatePickerVisible(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisible(false)}
              date={date}
            />
            
            <Text style={styles.categoryLabel}>Expense Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter expense name"
                value={expenseName}
                onChangeText={setExpenseName}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>

      <Button 
        title="Add Expense"
        disabled={loading || !isFormValid()}
        loading={loading}
        onPress={handleAddExpense}
        containerStyle={styles.buttonContainer2}
        buttonStyle={styles.button}
        color="#718EDD"
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
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  methodButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedMethod: {
    backgroundColor: '#718EDD',
    borderColor: '#718EDD',
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedMethodText: {
    color: 'white',
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
    backgroundColor: '#718EDD',
    borderColor: '#718EDD',
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
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