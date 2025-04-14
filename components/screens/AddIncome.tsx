import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Card } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface AddIncomeProps {
  onBack: () => void;
  session?: any; // Supabase session
}

export default function AddIncome({ onBack, session }: AddIncomeProps) {
  const [amount, setAmount] = useState('0.00');
  const [incomeFrequency, setIncomeFrequency] = useState<'monthly' | 'onetime'>('monthly');
  const [selectedType, setSelectedType] = useState('salary');
  const [incomeName, setIncomeName] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isFormValid = () => {
    return (
      amount.trim() !== '' && 
      amount !== '0.00' && 
      incomeName.trim() !== ''
    );
  };
  
  const handleAddIncome = async () => {
    if (!isFormValid()) return;
    
    try {
      setLoading(true);
      
      // If we have a session, save to Supabase
      if (session) {
        await supabase.from('incomes').insert({
          amount: parseFloat(amount),
          frequency: incomeFrequency,
          type: selectedType,
          name: incomeName,
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          user_id: session.user.id
        });
      } else {
        console.log('No session available, income data not saved');
      }

      onBack();
    } catch (error) {
      console.error('Error adding income:', error);
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
  
  const incomeTypes = [
    { id: 'salary', name: 'Salary', icon: 'briefcase' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop' },
    { id: 'passive', name: 'Passive', icon: 'trending-up' },
    { id: 'investment', name: 'Investment', icon: 'bar-chart' },
    { id: 'refund', name: 'Refund', icon: 'refresh' },
    { id: 'gift', name: 'Gift', icon: 'gift' },
    { id: 'bonus', name: 'Bonus', icon: 'star' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' }
  ];
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#fbceb1', '#ff6961', "#ff6347"]} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.purpleSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Add Income</Text>
        <Text style={styles.subText}>Track your earnings</Text>
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
                style={[styles.methodButton, incomeFrequency === 'monthly' && styles.selectedMethod]} 
                onPress={() => setIncomeFrequency('monthly')}
              >
                <Text style={[styles.methodText, incomeFrequency === 'monthly' && styles.selectedMethodText]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodButton, incomeFrequency === 'onetime' && styles.selectedMethod]} 
                onPress={() => setIncomeFrequency('onetime')}
              >
                <Text style={[styles.methodText, incomeFrequency === 'onetime' && styles.selectedMethodText]}>One-time</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.categoryLabel}>Type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoriesScrollContainer}
            >
              {incomeTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.categoryItem, selectedType === type.id && styles.selectedCategory]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={22} 
                    color={selectedType === type.id ? 'white' : '#666'} 
                  />
                  <Text 
                    style={[styles.categoryText, selectedType === type.id && styles.selectedCategoryText]}
                  >
                    {type.name}
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
            
            <Text style={styles.categoryLabel}>Income Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter income name"
                value={incomeName}
                onChangeText={setIncomeName}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>

      <Button 
        title="Add Income"
        disabled={loading || !isFormValid()}
        loading={loading}
        onPress={handleAddIncome}
        containerStyle={styles.buttonContainer2}
        buttonStyle={styles.button}
        color="#ff6961"
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
    backgroundColor: '#ff6961',
    borderColor: '#ff6961',
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
    backgroundColor: '#ff6961',
    borderColor: '#ff6961',
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
