import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const OfflineStatusIndicator: React.FC = () => {
  const { isOnline, syncStatus, triggerSync } = useOfflineManager();

  if (isOnline && syncStatus.pendingItems === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!isOnline && (
          <View style={styles.offlineSection}>
            <Ionicons name="wifi" size={16} color={theme.colors.warning[500]} />
            <Text style={styles.statusText}>Offline Mode</Text>
          </View>
        )}
        
        {syncStatus.pendingItems > 0 && (
          <View style={styles.syncSection}>
            <Ionicons name="sync" size={16} color={theme.colors.info[500]} />
            <Text style={styles.statusText}>
              {syncStatus.isSyncing 
                ? `Syncing... ${Math.round(syncStatus.progress)}%` 
                : `${syncStatus.pendingItems} items pending sync`}
            </Text>
          </View>
        )}
        
        {!isOnline && syncStatus.pendingItems > 0 && (
          <TouchableOpacity style={styles.syncButton} onPress={triggerSync}>
            <Ionicons name="play" size={14} color={theme.colors.neutral[0]} />
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    elevation: 2,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  offlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  syncSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    marginLeft: theme.spacing.xs,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  syncButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[0],
    fontWeight: '600' as '600',
    marginLeft: theme.spacing.xs,
  },
});

export default OfflineStatusIndicator;