import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text variant="displayMedium" style={styles.title}>Welcome to Book Bite</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Your all-in-one platform for hotels and dining.
                </Text>
            </View>
            <View style={styles.footer}>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.button}>
                    Get Started
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
    subtitle: { textAlign: 'center', color: '#666' },
    footer: { padding: 20 },
    button: { paddingVertical: 5 },
});
