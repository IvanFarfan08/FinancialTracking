import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Card } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'
import SignUp from './SignUp'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  if (showSignUp) {
    return <SignUp onBack={() => setShowSignUp(false)} />
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6a5acd', '#c54b8c', '#b284be']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.purpleSection}>
        <Text style={styles.headerText}>Welcome!</Text>
        <Text style={styles.subText}>Let's get your finances in order</Text>
      </LinearGradient>
      
      {/* Card in the middle */}
      <View style={styles.cardContainer}>
        <Card containerStyle={styles.card}>
          <Input
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope', color: 'rgba(0, 0, 0, 0.8)' }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
          />
          <Input
            label="Password"
            leftIcon={{ type: 'font-awesome', name: 'lock', color: 'rgba(0, 0, 0, 0.8)' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>
      <Button 
            title="Sign in"
            color="#c54b8c"
            disabled={loading} 
            onPress={() => signInWithEmail()} 
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
          />
          <Text onPress={() => setShowSignUp(true)} style={styles.signUpText}>
            DON'T HAVE AN ACCOUNT YET?
          </Text>
    </View>
  )
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
    contentText: {
      color: '#333',
      fontSize: 18,
    },
    cardContainer: {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      top: '50%',
      transform: [{ translateY: -120 }], // Adjust this to position the card
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
    signUpText: {
      color: '#333',
      fontSize: 12,
      marginTop: 20,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 30
    },
    buttonContainer: {
      borderRadius: 30,
      width: '85%',
      alignSelf: 'center',
    },
    button: {
      paddingVertical: 15,
      height: 55,
    },
})