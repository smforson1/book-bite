import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const OfflineCapabilitiesIndicator: React.FC = () => {
  const { isOnline, syncStatus, isOfflineModeEnabled, enableOfflineMode, disableOfflineMode } = useOfflineManager();

  // Don't show anything if online and no pending items
  if (isOnline && syncStatus.pendingItems === 0 && !isOfflineModeEnabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Offline mode status */}
        {!isOnline && (
          <View style={styles.offlineSection}>
            <Ionicons name="wifi" size={16} color={theme.colors.warning[500]} />
            <Text style={styles.statusText}>Offline Mode</Text>
          </View>
        )}
        
        {/* Sync status */}
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
        
        {/* Offline mode enabled status */}
        {isOfflineModeEnabled && (
          <View style={styles.offlineModeSection}>
            <Ionicons name="cloud-offline" size={16} color={theme.colors.success[500]} />
            <Text style={styles.statusText}>Offline Mode Enabled</Text>
          </View>
        )}
        
        {/* Actions */}
        <View style={styles.actionsSection}>
          {!isOnline && !isOfflineModeEnabled && (
            <TouchableOpacity style={styles.actionButton} onPress={enableOfflineMode}>
              <Ionicons name="cloud-download" size={14} color={theme.colors.neutral[0]} />
              <Text style={styles.actionButtonText}>Enable Offline</Text>
            </TouchableOpacity>
          )}
          
          {isOfflineModeEnabled && (
            <TouchableOpacity style={styles.actionButton} onPress={disableOfflineMode}>
              <Ionicons name="cloud" size={14} color={theme.colors.neutral[0]} />
              <Text style={styles.actionButtonText}>Disable Offline</Text>
            </TouchableOpacity>
          )}
        </View>
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
    flexWrap: 'wrap',
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
  offlineModeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    marginLeft: theme.spacing.xs,
  },
  actionsSection: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[0],
    fontWeight: '600' as '600',
    marginLeft: theme.spacing.xs,
  },
});

export default OfflineCapabilitiesIndicator;