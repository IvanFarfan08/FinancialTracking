import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Card } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface SetRemindersProps {
  onBack: () => void;
  session?: any; // Supabase session
}

export default function SetReminders({ onBack, session }: SetRemindersProps) {
  const [reminderName, setReminderName] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [dueDate, setDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminderDays, setReminderDays] = useState<'1' | '5' | '7' | '14' | '30'>('1');
  
  const isFormValid = () => {
    return (
      reminderName.trim() !== '' && 
      amount.trim() !== '' && 
      amount !== '0.00'
    );
  };
  
  const handleSetReminder = async () => {
    if (!isFormValid()) return;
    
    try {
      setLoading(true);
      
      // Calculate month and year from the due date
      const month = dueDate.getMonth() + 1; // JavaScript months are 0-11
      const year = dueDate.getFullYear();
      
      // Calculate the reminder date (days before due date)
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(dueDate.getDate() - parseInt(reminderDays));
      
      
      // If we have a session, save to Supabase
      if (session) {
        const { data, error } = await supabase.from('reminders').insert({
          name: reminderName,
          amount: parseFloat(amount),
          due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          days_before: parseInt(reminderDays),
          reminder_date: reminderDate.toISOString().split('T')[0],
          is_completed: false,
          month: month,
          year: year,
          user_id: session.user.id
        });
        console.log(data, error);
      } else {
        console.log('No session available, reminder data not saved');
      }

      onBack();
    } catch (error) {
      console.error('Error setting reminder:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDate = (selectedDate: Date) => {
    setDatePickerVisible(false);
    setDueDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#FBD72B', '#F9484A']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Set Reminder</Text>
        <Text style={styles.subText}>Don't miss a payment</Text>
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

          <Text style={styles.fieldLabel}>Reminder Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter reminder name"
              value={reminderName}
              onChangeText={setReminderName}
              placeholderTextColor="#999"
            />
          </View>
          
          <Text style={styles.fieldLabel}>Remind Me</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.reminderDaysContainer}
          >
            {['1', '5', '7', '14', '30'].map((days) => (
              <TouchableOpacity 
                key={days}
                style={[styles.dayButton, reminderDays === days && styles.selectedDay]} 
                onPress={() => setReminderDays(days as any)}
              >
                <Text style={[styles.dayText, reminderDays === days && styles.selectedDayText]}>
                  {days === '1' ? '1 day' : `${days} days`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.fieldLabel}>Due Date</Text>
          <TouchableOpacity 
            style={styles.dateSelector} 
            onPress={() => setDatePickerVisible(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisible(false)}
            date={dueDate}
            minimumDate={new Date()} // Only allow future dates
          />
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>

      <Button 
        title="Set Reminder"
        disabled={loading || !isFormValid()}
        loading={loading}
        onPress={handleSetReminder}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
        color="#FF8C00"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerSection: {
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'light',
    textAlign: 'left',
    paddingTop: 16,
    paddingBottom: 8,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 8,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dollarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    opacity: 0.8,
    paddingLeft: 5,
    minWidth: 100,
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  buttonContainer: {
    borderRadius: 30,
    marginBottom: 40,
    width: '85%',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 15,
    height: 55,
  },
  reminderDaysContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 55,
  },
  selectedDay: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedDayText: {
    color: 'white',
  },
});