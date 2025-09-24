import { useState, useEffect } from 'react';
import { offlineManager, SyncStatus } from '../services/offlineManager';

export const useOfflineManager = () => {
  const [isOnline, setIsOnline] = useState<boolean>(offlineManager.getNetworkStatus());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineManager.getSyncStatus());
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Set initial values
    setIsOnline(offlineManager.getNetworkStatus());
    setSyncStatus(offlineManager.getSyncStatus());

    // Listen for network status changes
    const networkListener = (online: boolean) => {
      setIsOnline(online);
    };

    // Listen for sync status updates
    const syncStatusListener = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    // Listen for offline mode changes
    const offlineModeEnabledListener = () => {
      setIsOfflineModeEnabled(true);
    };

    const offlineModeDisabledListener = () => {
      setIsOfflineModeEnabled(false);
    };

    // Add event listeners
    offlineManager.on('networkStatusChange', networkListener);
    offlineManager.on('syncStatusUpdate', syncStatusListener);
    offlineManager.on('offlineModeEnabled', offlineModeEnabledListener);
    offlineManager.on('offlineModeDisabled', offlineModeDisabledListener);

    // Cleanup listeners
    return () => {
      offlineManager.off('networkStatusChange', networkListener);
      offlineManager.off('syncStatusUpdate', syncStatusListener);
      offlineManager.off('offlineModeEnabled', offlineModeEnabledListener);
      offlineManager.off('offlineModeDisabled', offlineModeDisabledListener);
    };
  }, []);

  const enableOfflineMode = async () => {
    await offlineManager.enableOfflineMode();
  };

  const disableOfflineMode = async () => {
    await offlineManager.disableOfflineMode();
  };

  const triggerSync = async () => {
    await offlineManager.triggerSync();
  };

  const createSnapshot = async () => {
    return await offlineManager.createDataSnapshot();
  };

  const restoreFromSnapshot = async () => {
    return await offlineManager.restoreFromSnapshot();
  };

  return {
    isOnline,
    syncStatus,
    isOfflineModeEnabled,
    enableOfflineMode,
    disableOfflineMode,
    triggerSync,
    createSnapshot,
    restoreFromSnapshot,
  };
};