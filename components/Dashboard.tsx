import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Text, Image, ImageSourcePropType, TouchableOpacity } from 'react-native'
import { Button, Card, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import AddExpense from './screens/AddExpense'
import AddIncome from './screens/AddIncome'
import AddDebt from './screens/AddDebt'
import CreateBudget from './screens/CreateBudget'
import SetReminders from './screens/SetReminders'
import ViewReports from './screens/ViewReports'

export default function Dashboard({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [currentScreen, setCurrentScreen] = useState<string | null>(null)

  useEffect(() => {
    if (session) getProfile(), fetchReminders()
  }, [session])

  async function fetchReminders() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', session?.user.id)
      if (error) throw error

      if (data && data.length > 0) {
        const currentDate = new Date();
        const reminderDate = new Date();
        const dueDate = new Date(data[0].due_date);
        const daysBefore = data[0].days_before;

        reminderDate.setDate(dueDate.getDate() - daysBefore);
        if (reminderDate <= currentDate) {
          Alert.alert('Payment Reminder', `It\'s time to pay your debt: ${data[0].name}`);
          // then delete reminder from database
          const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', data[0].id)
          if (error) throw error
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        if (data.full_name) {
          if (data.full_name.includes(' ')) {
            setName(data.full_name.split(' ')[0])
          } else {
            setName(data.full_name)
          }
        } else {
          setName(username || 'User')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
    full_name,
  }: {
    username: string
    website: string
    avatar_url: string
    full_name: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        full_name,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { id: 1, title: 'Add expenses', icon: require('../assets/icons/expenses_icon.png'), screen: 'AddExpense' },
    { id: 2, title: 'Add income', icon: require('../assets/icons/income_source.png'), screen: 'AddIncome' },
    { id: 3, title: 'Add debts/loans', icon: require('../assets/icons/debt_icon.png'), screen: 'AddDebt' },
    { id: 4, title: 'Create budget', icon: require('../assets/icons/budget_icon.png'), screen: 'CreateBudget' },
    { id: 5, title: 'View reports', icon: require('../assets/icons/expense_icon.png'), screen: 'ViewReports' },
    { id: 6, title: 'Set reminders', icon: require('../assets/icons/reminder_icon.png'), screen: 'SetReminders' },
  ];


  // Component mapping for screens
  const screenComponents = {
    AddExpense: AddExpense,
    AddIncome: AddIncome,
    AddDebt: AddDebt,
    CreateBudget: CreateBudget,
    SetReminders: SetReminders,
    ViewReports: ViewReports,
  };

  // If a screen is selected, render the appropriate component
  if (currentScreen && screenComponents[currentScreen as keyof typeof screenComponents]) {
    const ScreenComponent = screenComponents[currentScreen as keyof typeof screenComponents];
    return <ScreenComponent onBack={() => setCurrentScreen(null)} session={session} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hi {name}!</Text>
      <Text style={styles.subText}>How can we help you today?</Text>

      <View style={styles.gridContainer}>
        {cards.map((card) => (
          <TouchableOpacity 
            key={card.id} 
            onPress={() => setSelectedCard(card.id)}
            activeOpacity={0.8}
            style={styles.cardWrapper}
          >
            <Card 
              containerStyle={[
                styles.card, 
                selectedCard === card.id && styles.selectedCard
              ]}
            >
              <View style={styles.cardIconContainer}>
                <Image 
                  source={card.icon} 
                  style={styles.cardIcon} 
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      <Button 
              title="Continue"
              color="#c54b8c"
              disabled={loading || selectedCard === null} 
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
              onPress={() => {
                if (selectedCard !== null) {
                  const selectedOption = cards.find(card => card.id === selectedCard);
                  if (selectedOption) {
                    // Navigate to the selected screen
                    setCurrentScreen(selectedOption.screen);
                  }
                }
              }}
            />
            <Text onPress={() => supabase.auth.signOut()} style={styles.signInText}>
              NEVERMIND, SIGN OUT
            </Text> 
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f4f9",
    flex: 1,
    paddingTop: 40,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 40,
    marginHorizontal: 10,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  headerText: {
    paddingTop: 40,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    height: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 20,
    margin: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#c54b8c', 
  },
  cardIconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    width: 70,
    height: 70,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.6,
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    fontWeight: 'semibold',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 10,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 60,
    borderRadius: 30,
    width: '85%',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 15,
    height: 55,
  },
  signInText: {
    color: '#333',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30
  },
})
