import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions, FlatList, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Card } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
// No external chart library

interface ViewReportsProps {
  onBack: () => void;
  session?: any; // Supabase session
}

// Define the type for expenses
interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  payment_method: string;
  date: string;
  created_at: string;
  month: number;
  year: number;
}

export default function ViewReports({ onBack, session }: ViewReportsProps) {
  // Set initial date to current month/year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date().getMonth() + 1 + ''); // Current month as string
  const [year, setYear] = useState(new Date().getFullYear() + ''); // Current year as string
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<{date: string; amount: number}[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<{category: string; amount: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  
  // Handle date selection
  const handleConfirmDate = (date: Date) => {
    setDatePickerVisible(false);
    setSelectedDate(date);
    
    // Extract month and year from date
    const newMonth = (date.getMonth() + 1).toString();
    const newYear = date.getFullYear().toString();
    
    // Only fetch new data if month or year changed
    if (newMonth !== month || newYear !== year) {
      setMonth(newMonth);
      setYear(newYear);
    }
  };
  
  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Process data for the graph when expenses change or when category is selected
  useEffect(() => {
    if (expenses.length > 0) {
      // Filter expenses by selected category if needed
      const filteredExpenses = selectedCategory === 'all' 
        ? expenses 
        : expenses.filter(exp => exp.category === selectedCategory);

      // Create a map to group expenses by date
      const expensesByDate = new Map<string, number>();
      let total = 0;
      
      // Group expenses by date and sum amounts
      filteredExpenses.forEach(expense => {
        const dateStr = expense.date;
        const amount = expense.amount || 0;
        total += amount;
        
        if (expensesByDate.has(dateStr)) {
          expensesByDate.set(dateStr, expensesByDate.get(dateStr)! + amount);
        } else {
          expensesByDate.set(dateStr, amount);
        }
      });
      
      // Convert the map to an array of points for our custom chart
      const customChartData = Array.from(expensesByDate.entries()).map(([dateStr, amount]) => {
        // Format date for display
        const date = new Date(dateStr);
        const formattedDate = `${date.getMonth()+1}/${date.getDate()}`;
        return { date: formattedDate, amount: amount };
      });
      
      // Sort points by date
      customChartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Generate category totals for our dropdown
      const categoryMap = new Map<string, number>();
      expenses.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        const amount = expense.amount || 0;
        
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category)! + amount);
        } else {
          categoryMap.set(category, amount);
        }
      });
      
      const categoryTotalsData = Array.from(categoryMap.entries()).map(([category, amount]) => {
        return { category, amount };
      }).sort((a, b) => b.amount - a.amount); // Sort by amount descending
      
      setChartData(customChartData);
      setCategoryTotals(categoryTotalsData);
      setTotalAmount(total);
    } else {
      setChartData([]);
      setCategoryTotals([]);
      setTotalAmount(0);
    }
  }, [expenses, selectedCategory]);
  
  // Fetch expenses when component mounts
  useEffect(() => {
    if (session?.user && month && year) {
      fetchReports();
    }
  }, [month, year, session]);
  
  // First useEffect handles processing expenses and setting totalAmount (lines 40-81)
  
  // Second useEffect runs after totalAmount is updated
  // This ensures alertBudget only runs after totalAmount is fully set
  useEffect(() => {
    // Only call alertBudget when totalAmount has been properly calculated
    if (session?.user && month && year && expenses.length > 0 && totalAmount > 0) {
      // Small timeout to ensure totalAmount is fully processed and stable
      // This prevents race conditions with the totalAmount calculation
      const timer = setTimeout(() => {
        alertBudget();
      }, 100);
      
      // Clean up the timeout if the component unmounts or the effect runs again
      return () => clearTimeout(timer);
    }
  }, [totalAmount, session, month, year, expenses, selectedCategory]); // Include all variables used in the condition and the alertBudget function
  
  const fetchReports = async () => {
    if (session && session.user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('month', parseInt(month))
          .eq('year', parseInt(year));
        
        if (error) {
          console.error('Error fetching expenses:', error);
          return;
        }
        
        setExpenses(data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No active session or user');
    }
  };

  const alertBudget = async () => {
    // fetch budget from supabase
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .eq('category', selectedCategory);

    if (error) {
      console.error('Error fetching budget:', error);
      return;
    }
    if (data && data.length > 0) {
      // console.log(data);
      const budgetAmount = data[0].monthly_amount;
      if (budgetAmount < totalAmount) {
        Alert.alert(`Budget: ${selectedCategory}`, `Your budget for ${month} / ${year} is ${budgetAmount} and you've exceeded it by ${totalAmount - budgetAmount}`);
      }
    } 
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#F67062', '#FC5296']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>View Reports</Text>
        <Text style={styles.subText}>Financial insights</Text>
      </LinearGradient>
      
      <View style={styles.cardContainer}>
        <Card containerStyle={styles.card}>
          <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.reportLabel}>Expenses for {month}/{year}</Text>
          
          {expenses.length > 0 ? (
            <View style={styles.graphContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartInner}>
                  {chartData.map((item, index) => {
                    // Calculate the height percentage based on max amount
                    const maxAmount = Math.max(...chartData.map(d => d.amount));
                    const heightPercentage = (item.amount / maxAmount) * 100;
                    
                    return (
                      <View key={index} style={styles.barContainer}>
                        <Text style={styles.barValue}>${item.amount}</Text>
                        <View 
                          style={[styles.bar, { height: Math.max(heightPercentage, 10) }]}
                        />
                        <Text style={styles.barDate}>{item.date}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : loading ? (
            <Text style={styles.noDataText}>Loading...</Text>
          ) : (
            <Text style={styles.noDataText}>No expense data available</Text>
          )}
          
          <View style={styles.datePickerContainer}>
            <Text style={styles.fieldLabel}>Select Month and Year</Text>
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => {
                setDatePickerVisible(true);
                setShowCategoryPicker(false);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.dateText}>
                {formatMonthYear(selectedDate)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisible(false)}
            date={selectedDate}
            maximumDate={new Date()}
          />
          
          <View style={styles.categoryContainer}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity 
              style={styles.selector} 
              onPress={() => {
                setShowCategoryPicker(true);
              }}
            >
              <Text style={styles.selectorText}>
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdown}>
                  <TouchableOpacity
                    key="all"
                    style={[styles.dropdownItem, selectedCategory === 'all' && styles.selectedItem]}
                    onPress={() => {
                      setSelectedCategory('all');
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, selectedCategory === 'all' && styles.selectedText]}>
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {categoryTotals.map((cat) => (
                    <TouchableOpacity
                      key={cat.category}
                      style={[styles.dropdownItem, selectedCategory === cat.category && styles.selectedItem]}
                      onPress={() => {
                        setSelectedCategory(cat.category);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, selectedCategory === cat.category && styles.selectedText]}>
                        {cat.category} (${cat.amount.toFixed(2)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Category selector above replaces this */}
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width: screenWidth } = Dimensions.get('window');

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
    marginTop: -120,
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
    top: '40%',
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
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#F67062',
  },
  reportLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.7,
  },
  graphContainer: {
    height: 220,
    width: '100%',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    height: '100%',
    justifyContent: 'flex-end',
    width: 40,
  },
  bar: {
    width: 20,
    backgroundColor: '#F67062',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    height: 100,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 5,
  },
  barDate: {
    fontSize: 10,
    marginTop: 5,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    opacity: 0.6,
    fontSize: 16,
  },
  monthYearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  categoryContainer: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#444',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorText: {
    fontSize: 14,
    color: '#444',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#444',
  },
  selectedItem: {
    backgroundColor: '#f0f0f0',
  },
  selectedText: {
    color: '#F67062',
    fontWeight: 'bold',
  },
  categorySummary: {
    marginTop: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 14,
    color: '#444',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
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
  datePickerContainer: {
    marginTop: 0,
    marginVertical: 10
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