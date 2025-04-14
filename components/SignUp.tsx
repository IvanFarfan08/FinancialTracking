import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Card } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'

export default function SignUp({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) Alert.alert('Error', error.message)
    if (!session) Alert.alert('Success', 'Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6a5acd', '#c54b8c', '#b284be']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.purpleSection}>
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.subText}>Track your finances with us</Text>
      </LinearGradient>
      
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
            label="Name"
            leftIcon={{ type: 'font-awesome', name: 'user', color: 'rgba(0, 0, 0, 0.8)' }}
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder="Name"
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
          <Input
            label="Confirm Password"
            leftIcon={{ type: 'font-awesome', name: 'lock', color: 'rgba(0, 0, 0, 0.8)' }}
            onChangeText={(text) => setConfirmPassword(text)}
            value={confirmPassword}
            secureTextEntry={true}
            placeholder="Confirm Password"
            autoCapitalize={'none'}
          />
        </Card>
      </View>
      
      <View style={styles.whiteSection}>
      </View>
      
      <Button 
        title="Sign up"
        color="#c54b8c"
        disabled={loading} 
        onPress={() => signUpWithEmail()} 
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
      />
      <Text onPress={onBack} style={styles.signInText}>
        ALREADY HAVE AN ACCOUNT?
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
      transform: [{ translateY: -160 }], // Adjusted for the larger card
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
    signInText: {
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
