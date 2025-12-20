import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';

export default function ProfileScreen({ navigation }: any) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const MenuItem = ({ icon, title, onPress, danger = false }: any) => (
        <AppCard onPress={onPress} style={styles.menuItem}>
            <View style={styles.menuRow}>
                <View style={[styles.iconBox, danger && { backgroundColor: '#FFEBEE' }]}>
                    <IconButton
                        icon={icon}
                        size={20}
                        iconColor={danger ? COLORS.error : COLORS.primary}
                        style={{ margin: 0 }}
                    />
                </View>
                <AppText variant="body" style={styles.menuText} color={danger ? COLORS.error : COLORS.text}>
                    {title}
                </AppText>
                <IconButton icon="chevron-right" size={20} iconColor={COLORS.textLight} />
            </View>
        </AppCard>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Profile" />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={100}
                            label={user?.name?.[0] || 'U'}
                            style={{ backgroundColor: COLORS.primary }}
                            color={COLORS.white}
                        />
                        <View style={styles.editBadge}>
                            <IconButton icon="pencil" size={14} iconColor={COLORS.white} style={{ margin: 0 }} />
                        </View>
                    </View>

                    <AppText variant="h2" style={styles.name}>{user?.name}</AppText>
                    <AppText variant="body" color={COLORS.textLight}>{user?.email}</AppText>

                    <View style={styles.roleBadge}>
                        <AppText variant="caption" color={COLORS.primary} bold>
                            {user?.role} ACCOUNT
                        </AppText>
                    </View>
                </View>

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
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.m, paddingBottom: 50 },
    profileHeader: { alignItems: 'center', marginBottom: SPACING.xl },
    avatarContainer: { position: 'relative', marginBottom: SPACING.m },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.secondary,
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    name: { marginBottom: 4 },
    roleBadge: {
        marginTop: SPACING.m,
        backgroundColor: COLORS.primary + '15', // 10% opacity
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: SIZES.radius.xl,
    },
    section: { marginBottom: SPACING.l },
    sectionTitle: { marginBottom: SPACING.s, marginLeft: SPACING.s },
    menuItem: { marginBottom: SPACING.s, paddingVertical: SPACING.s },
    menuRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radius.m,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    menuText: { flex: 1, fontWeight: '500' },
});
