import React from 'react';
import { Text, TextProps } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

interface LocalizedTextProps extends TextProps {
  tid: string; // Translation ID
}

const LocalizedText: React.FC<LocalizedTextProps> = ({ tid, ...props }) => {
  const { t } = useLocalization();
  
  return (
    <Text {...props}>
      {t(tid)}
    </Text>
  );
};

export default LocalizedText;