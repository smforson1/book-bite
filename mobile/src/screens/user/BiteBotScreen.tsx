import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Animated,
    Dimensions
} from 'react-native';
import { IconButton, Avatar, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import CustomHeader from '../../components/navigation/CustomHeader';
import { SPACING, SIZES, SHADOWS } from '../../theme';

const API_URL = 'http://10.0.2.2:5000/api';
const { width } = Dimensions.get('window');

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

export default function BiteBotScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            content: "Hi! I'm BiteBot, your personal concierge. 🤖\n\nI can help you find the best places to eat, book a room, or just answer questions about our menu. What's on your mind?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const { colors } = useTheme();
    const token = useAuthStore((state) => state.token);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'bot' ? 'model' : 'user',
                content: m.content
            }));

            const response = await axios.post(`${API_URL}/ai/chat`, {
                query: userMessage.content,
                history: history
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: response.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('BiteBot Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: "Ouch! Something went wrong while I was thinking. Could you try again?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isBot = item.role === 'bot';
        return (
            <View style={[
                styles.messageWrapper,
                isBot ? styles.botWrapper : styles.userWrapper
            ]}>
                {isBot && (
                    <Avatar.Image
                        size={32}
                        source={require('../../../assets/icon.png')} // Fallback if no specific bitbot icon
                        style={{ backgroundColor: colors.primary, marginRight: 8 }}
                    />
                )}
                <View style={[
                    styles.messageBubble,
                    {
                        backgroundColor: isBot ? colors.surface : colors.primary,
                        borderBottomLeftRadius: isBot ? 0 : SIZES.radius.m,
                        borderBottomRightRadius: isBot ? SIZES.radius.m : 0,
                    },
                    !isBot && SHADOWS.light
                ]}>
                    <AppText
                        variant="body"
                        color={isBot ? colors.text : colors.white}
                    >
                        {item.content}
                    </AppText>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="BiteBot AI" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <AppText variant="caption" color={colors.textLight} style={{ marginLeft: 8 }}>
                            BiteBot is thinking...
                        </AppText>
                    </View>
                )}

                <View style={[
                    styles.inputArea,
                    {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        paddingBottom: Platform.OS === 'ios' ? 100 : 90 // Clear CustomTabBar
                    }
                ]}>
                    <TextInput
                        placeholder="Ask me anything..."
                        placeholderTextColor={colors.textLight}
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                backgroundColor: colors.background,
                                borderColor: colors.border
                            }
                        ]}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={500}
                    />
                    <IconButton
                        icon="send"
                        size={24}
                        iconColor={colors.primary}
                        onPress={handleSend}
                        disabled={!input.trim() || loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.m,
        paddingBottom: SPACING.xl,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
        maxWidth: '85%',
    },
    botWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-end',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    messageBubble: {
        padding: SPACING.m,
        borderRadius: SIZES.radius.m,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        fontSize: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: SPACING.s,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.s,
    }
});
