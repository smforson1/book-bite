import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming, FadeIn } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../ui/AppText';

import { useCartStore } from '../../store/useCartStore';

const { width } = Dimensions.get('window');

const TabItem = ({ route, index, state, descriptors, navigation, colors, sizes, shadows, isManager, tabWidth, cartCount }: any) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = () => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    let iconName = 'home';
    if (route.name === 'Places') iconName = 'map-search';
    if (route.name === 'Activity') iconName = 'history';
    if (route.name === 'Cart') iconName = 'cart';
    if (route.name === 'BiteBot') iconName = 'robot';

    if (route.name === 'Dashboard') iconName = 'view-dashboard';
    if (route.name === 'Manage') {
        iconName = isManager ? 'storefront' : 'briefcase';
    }
    if (route.name === 'Orders') iconName = 'clipboard-list';
    if (route.name === 'Wallet') iconName = 'wallet';
    if (route.name === 'More') iconName = 'dots-horizontal';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            style={[styles.tabItem, { width: tabWidth }]}
        >
            <View>
                <View style={[styles.iconContainer, { opacity: isFocused ? 1 : 0.6 }]}>
                    <IconButton
                        icon={iconName}
                        iconColor={isFocused ? colors.primary : colors.textLight}
                        size={24}
                        style={{ margin: 0 }}
                    />
                </View>
                {route.name === 'Cart' && cartCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                        <AppText variant="caption" style={{ fontSize: 10, color: colors.white, fontWeight: 'bold' }}>
                            {cartCount}
                        </AppText>
                    </View>
                )}
            </View>
            {isFocused && (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            )}
        </Pressable>
    );
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors, sizes, shadows, isManager } = useTheme();
    const tabWidth = (width - 40) / state.routes.length;
    const cartCount = useCartStore(state => state.getItemCount());

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: sizes.radius.xl, ...shadows.medium }]}>
            <View style={styles.content}>
                {state.routes.map((route, index) => (
                    <TabItem
                        key={route.key}
                        route={route}
                        index={index}
                        state={state}
                        descriptors={descriptors}
                        navigation={navigation}
                        colors={colors}
                        sizes={sizes}
                        shadows={shadows}
                        isManager={isManager}
                        tabWidth={tabWidth}
                        cartCount={cartCount}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 65,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    }
});
