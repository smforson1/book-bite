import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { realTimeService, OrderTrackingUpdate } from '../../services/realTimeService';
import { ghanaSMSService } from '../../services/ghanaSMSService';
import { googleMapsService } from '../../services/googleMapsService';
import GhanaMapComponent, { MapMarker } from '../../components/GhanaMapComponent';
import { LocationCoordinates } from '../../services/locationService';
import { Order } from '../../types';

interface OrderTrackingScreenProps {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time?: Date;
  completed: boolean;
  active: boolean;
  icon: string;
}

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { orders, getRestaurantById } = useRestaurant();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<OrderTrackingUpdate[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [driverLocation, setDriverLocation] = useState<LocationCoordinates | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [deliveryRoute, setDeliveryRoute] = useState<LocationCoordinates[]>([]);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadOrderData();
    setupRealTimeTracking();
    
    return () => {
      // Cleanup real-time subscriptions
      realTimeService.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    if (order) {
      updateTrackingSteps();
      updateMapMarkers();
    }
  }, [order, driverLocation]);

  const loadOrderData = async () => {
    try {
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        
        // Load tracking history
        const history = await realTimeService.getOrderTrackingHistory(orderId);
        setTrackingUpdates(history);
        
        // Get estimated delivery time from Ghana maps service
        if (foundOrder.deliveryAddress) {
          const restaurant = getRestaurantById(foundOrder.restaurantId);
          if (restaurant) {
            await updateDeliveryEstimate(restaurant.address, foundOrder.deliveryAddress);
          }
        }
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    }
  };

  const setupRealTimeTracking = () => {
    // Subscribe to order updates
    const unsubscribeOrder = realTimeService.subscribe('order_update', (update: OrderTrackingUpdate) => {
      if (update.orderId === orderId) {
        setTrackingUpdates(prev => [...prev, update]);
        
        // Update order status
        if (order) {
          setOrder(prev => prev ? { ...prev, status: update.status as any } : null);
        }
        
        // Update estimated arrival time
        if (update.estimatedDeliveryTime) {
          setEstimatedArrival(update.estimatedDeliveryTime.toLocaleTimeString());
        }
        
        // Animate progress
        animateProgress(update.status);
      }
    });

    // Subscribe to driver location updates
    const unsubscribeLocation = realTimeService.subscribe('driver_location', (data: any) => {
      if (data.orderId === orderId && data.location) {
        setDriverLocation(data.location);
        
        // Update delivery route if we have restaurant and delivery addresses
        updateDeliveryRoute(data.location);
      }
    });

    // Start tracking this specific order
    realTimeService.trackOrder(orderId);

    return () => {
      unsubscribeOrder();
      unsubscribeLocation();
    };
  };

  const updateTrackingSteps = () => {
    if (!order) return;

    const steps: TrackingStep[] = [
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed by the restaurant',
        completed: ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status),
        active: order.status === 'confirmed',
        icon: 'checkmark-circle',
        time: order.createdAt
      },
      {
        id: 'preparing',
        title: 'Preparing Food',
        description: 'The restaurant is preparing your delicious meal',
        completed: ['preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status),
        active: order.status === 'preparing',
        icon: 'restaurant'
      },
      {
        id: 'ready',
        title: 'Ready for Pickup',
        description: 'Your order is ready and waiting for pickup',
        completed: ['ready', 'picked_up', 'on_the_way', 'delivered'].includes(order.status),
        active: order.status === 'ready',
        icon: 'bag-check'
      },
      {
        id: 'picked_up',
        title: 'Order Picked Up',
        description: 'Your order has been picked up by the delivery person',
        completed: ['picked_up', 'on_the_way', 'delivered'].includes(order.status),
        active: order.status === 'picked_up',
        icon: 'car'
      },
      {
        id: 'on_the_way',
        title: 'On the Way',
        description: 'Your order is on its way to you',
        completed: ['on_the_way', 'delivered'].includes(order.status),
        active: order.status === 'on_the_way',
        icon: 'location'
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered. Enjoy your meal!',
        completed: order.status === 'delivered',
        active: order.status === 'delivered',
        icon: 'happy'
      }
    ];

    setTrackingSteps(steps);
  };

  const updateMapMarkers = () => {
    if (!order) return;

    const markers: MapMarker[] = [];
    const restaurant = getRestaurantById(order.restaurantId);

    // Restaurant marker
    if (restaurant) {
      markers.push({
        id: 'restaurant',
        coordinate: { latitude: 5.6037, longitude: -0.1870 }, // Placeholder - would geocode real address
        title: restaurant.name,
        description: 'Restaurant location',
        type: 'restaurant'
      });
    }

    // Delivery address marker
    if (order.deliveryAddress) {
      markers.push({
        id: 'delivery',
        coordinate: { latitude: 5.6137, longitude: -0.1770 }, // Placeholder - would geocode real address
        title: 'Delivery Address',
        description: order.deliveryAddress,
        type: 'user'
      });
    }

    // Driver location marker (if available and en route)
    if (driverLocation && ['picked_up', 'on_the_way'].includes(order.status)) {
      markers.push({
        id: 'driver',
        coordinate: driverLocation,
        title: 'Delivery Person',
        description: 'Current location of your delivery person',
        type: 'delivery'
      });
    }

    setMapMarkers(markers);
  };

  const updateDeliveryEstimate = async (restaurantAddress: string, deliveryAddress: string) => {
    try {
      const restaurantLocation = await googleMapsService.geocodeAddress(restaurantAddress);
      const deliveryLocation = await googleMapsService.geocodeAddress(deliveryAddress);

      if (restaurantLocation && deliveryLocation) {
        const estimate = await googleMapsService.calculateDeliveryEstimate(
          restaurantLocation,
          deliveryLocation
        );
        
        setEstimatedArrival(estimate.estimatedTime);
        
        // Update delivery route
        if (estimate.route) {
          // Decode polyline to coordinates (simplified)
          const routeCoords = [restaurantLocation, deliveryLocation]; // Placeholder
          setDeliveryRoute(routeCoords);
        }
      }
    } catch (error) {
      console.error('Error updating delivery estimate:', error);
    }
  };

  const updateDeliveryRoute = (currentDriverLocation: LocationCoordinates) => {
    if (!order) return;
    
    // Update route from current driver location to delivery address
    // This would use Google Maps Directions API to get real-time route
    const deliveryAddress = { latitude: 5.6137, longitude: -0.1770 }; // Placeholder
    setDeliveryRoute([currentDriverLocation, deliveryAddress]);
  };

  const animateProgress = (status: string) => {
    const progressValues = {
      confirmed: 0.16,
      preparing: 0.33,
      ready: 0.5,
      picked_up: 0.66,
      on_the_way: 0.83,
      delivered: 1.0
    };

    const targetValue = progressValues[status as keyof typeof progressValues] || 0;
    
    Animated.timing(progressAnimation, {
      toValue: targetValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderData();
    setRefreshing(false);
  };

  const handleCallRestaurant = () => {
    const restaurant = getRestaurantById(order?.restaurantId || '');
    if (restaurant?.phone) {
      Alert.alert(
        'Call Restaurant',
        `Do you want to call ${restaurant.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call', 
            onPress: () => Linking.openURL(`tel:${restaurant.phone}`) 
          }
        ]
      );
    }
  };

  const handleShareLocation = async () => {
    try {
      // This would send user's current location to the delivery person via SMS
      await ghanaSMSService.sendTemplatedSMS(
        'delivery_location_update', 
        '+233123456789', // Driver's phone
        {
          orderId: order?.id || '',
          location: 'Current location coordinates'
        }
      );
      
      Alert.alert('Success', 'Your location has been shared with the delivery person.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share location. Please try again.');
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'What issue are you experiencing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Order Taking Too Long', onPress: () => reportIssue('delayed') },
        { text: 'Wrong Items', onPress: () => reportIssue('wrong_items') },
        { text: 'Delivery Issue', onPress: () => reportIssue('delivery') },
        { text: 'Other', onPress: () => reportIssue('other') }
      ]
    );
  };

  const reportIssue = async (issueType: string) => {
    try {
      // Log the issue and notify support
      console.log('Issue reported:', issueType, 'for order:', orderId);
      Alert.alert('Issue Reported', 'Thank you for reporting the issue. Our support team will contact you shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    }
  };

  const renderTrackingStep = (step: TrackingStep, index: number) => (
    <View key={step.id} style={styles.trackingStep}>
      <View style={styles.stepIconContainer}>
        <View style={[
          styles.stepIcon,
          step.completed && styles.stepIconCompleted,
          step.active && styles.stepIconActive
        ]}>
          <Ionicons 
            name={step.icon as any} 
            size={20} 
            color={step.completed ? theme.colors.neutral[0] : theme.colors.text.tertiary} 
          />
        </View>
        {index < trackingSteps.length - 1 && (
          <View style={[
            styles.stepConnector,
            step.completed && styles.stepConnectorCompleted
          ]} />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={[
          styles.stepTitle,
          step.active && styles.stepTitleActive
        ]}>
          {step.title}
        </Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        {step.time && (
          <Text style={styles.stepTime}>
            {step.time.toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[500]} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorMessage}>
            We couldn't find the order you're looking for.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const restaurant = getRestaurantById(order.restaurantId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons name={showMap ? "list" : "map"} size={24} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) }
            ]}>
              <Text style={styles.statusText}>{order.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
          <Text style={styles.orderTotal}>Total: GHS {order.totalPrice.toFixed(2)}</Text>
          {estimatedArrival && (
            <Text style={styles.estimatedTime}>
              Estimated arrival: {estimatedArrival}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
        </View>

        {showMap ? (
          /* Map View */
          <View style={styles.mapContainer}>
            <GhanaMapComponent
              markers={mapMarkers}
              showDeliveryRoute={true}
              deliveryRoute={deliveryRoute}
              style={styles.map}
            />
          </View>
        ) : (
          /* Tracking Steps */
          <View style={styles.trackingContainer}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            {trackingSteps.map((step, index) => renderTrackingStep(step, index))}
          </View>
        )}

        {/* Recent Updates */}
        {trackingUpdates.length > 0 && (
          <View style={styles.updatesContainer}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            {trackingUpdates.slice(-5).reverse().map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <Text style={styles.updateMessage}>{update.message}</Text>
                <Text style={styles.updateTime}>
                  {update.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCallRestaurant}
          >
            <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.actionButtonText}>Call Restaurant</Text>
          </TouchableOpacity>

          {['picked_up', 'on_the_way'].includes(order.status) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShareLocation}
            >
              <Ionicons name="location-sharp" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.actionButtonText}>Share Location</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.reportButton]}
            onPress={handleReportIssue}
          >
            <Ionicons name="warning" size={20} color={theme.colors.error[500]} />
            <Text style={[styles.actionButtonText, styles.reportButtonText]}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string): string => {
  const colors = {
    confirmed: theme.colors.info[500],
    preparing: theme.colors.warning[500],
    ready: theme.colors.success[300],
    picked_up: theme.colors.primary[500],
    on_the_way: theme.colors.primary[600],
    delivered: theme.colors.success[500],
    cancelled: theme.colors.error[500],
  };
  return colors[status as keyof typeof colors] || theme.colors.neutral[400];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  headerAction: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  orderSummary: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.neutral[0],
  },
  restaurantName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  orderTotal: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  estimatedTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 3,
  },
  mapContainer: {
    height: 300,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  trackingContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepIconCompleted: {
    backgroundColor: theme.colors.primary[500],
  },
  stepIconActive: {
    backgroundColor: theme.colors.primary[500],
    borderWidth: 3,
    borderColor: theme.colors.primary[100],
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
    marginTop: theme.spacing.sm,
  },
  stepConnectorCompleted: {
    backgroundColor: theme.colors.primary[500],
  },
  stepContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepTitleActive: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold as '600',
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  stepTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  updatesContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  updateItem: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  updateMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  updateTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  actionsContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginLeft: theme.spacing.sm,
  },
  reportButton: {
    borderColor: theme.colors.error[500],
  },
  reportButtonText: {
    color: theme.colors.error[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
});

export default OrderTrackingScreen;