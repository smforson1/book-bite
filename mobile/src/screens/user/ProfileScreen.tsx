import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';

export default function ProfileScreen({ navigation }: any) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { colors, spacing, sizes, shadows, isManager } = useTheme();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const MenuItem = ({ icon, title, onPress, danger = false }: any) => (
        <AppCard onPress={onPress} style={styles.menuItem}>
            <View style={styles.menuRow}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }, danger && { backgroundColor: '#FFEBEE' }]}>
                    <IconButton
                        icon={icon}
                        size={20}
                        iconColor={danger ? colors.error : colors.primary}
                        style={{ margin: 0 }}
                    />
                </View>
                <AppText variant="body" style={styles.menuText} color={danger ? colors.error : colors.text}>
                    {title}
                </AppText>
                <IconButton icon="chevron-right" size={20} iconColor={colors.textLight} />
            </View>
        </AppCard>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="Profile" showBack />

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={100}
                            label={user?.name?.[0] || 'U'}
                            style={{ backgroundColor: colors.primary }}
                            color={colors.white}
                        />
                        <View style={[styles.editBadge, { backgroundColor: colors.secondary, borderColor: colors.background }]}>
                            <IconButton icon="pencil" size={14} iconColor={colors.white} style={{ margin: 0 }} />
                        </View>
                    </View>

                    <AppText variant="h2" style={styles.name}>{user?.name}</AppText>
                    <AppText variant="body" color={colors.textLight}>{user?.email}</AppText>

                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
                        <AppText variant="caption" color={colors.primary} bold>
                            {user?.role} ACCOUNT
                        </AppText>
                    </View>
                </View>

                {!isManager && (
                    <View style={styles.section}>
                        <AppText variant="h3" style={styles.sectionTitle}>Dashboard</AppText>
                        <MenuItem
                            icon="calendar-check"
                            title="My Bookings"
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Activity', params: { tab: 'Bookings' } })}
                        />
                        <MenuItem
                            icon="receipt"
                            title="My Orders"
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Activity', params: { tab: 'Orders' } })}
                        />
                    </View>
                )}

                <View style={styles.section}>
                    <AppText variant="h3" style={styles.sectionTitle}>Account</AppText>
                    <MenuItem
                        icon="cog"
                        title="Settings"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="help-circle"
                        title="Help & Support"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="logout"
                        title="Logout"
                        onPress={handleLogout}
                        danger
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 50 },
    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    name: { marginBottom: 4 },
    roleBadge: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 24,
    },
    section: { marginBottom: 24 },
    sectionTitle: { marginBottom: 8, marginLeft: 8 },
    menuItem: { marginBottom: 8, paddingVertical: 8 },
    menuRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuText: { flex: 1, fontWeight: '500' },
});
