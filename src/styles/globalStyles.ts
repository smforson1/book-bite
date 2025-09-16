import { StyleSheet } from 'react-native';
import { lightTheme as theme } from './theme';

// We'll create a function to get styles based on the current theme
export const createGlobalStyles = (theme: any) => StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  containerSecondary: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  // Typography styles
  h1: {
    fontSize: theme.typography.fontSize['4xl'],
    lineHeight: theme.typography.lineHeight['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  
  h2: {
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: theme.typography.lineHeight['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  
  h3: {
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: theme.typography.lineHeight['2xl'],
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  h4: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  h5: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  
  bodyLarge: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
  },
  
  body: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
  },
  
  bodySmall: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.secondary,
  },
  
  caption: {
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.xs,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.tertiary,
  },
  
  // Spacing utilities
  mt1: { marginTop: theme.spacing[1] },
  mt2: { marginTop: theme.spacing[2] },
  mt3: { marginTop: theme.spacing[3] },
  mt4: { marginTop: theme.spacing[4] },
  mt5: { marginTop: theme.spacing[5] },
  mt6: { marginTop: theme.spacing[6] },
  mt8: { marginTop: theme.spacing[8] },
  
  mb1: { marginBottom: theme.spacing[1] },
  mb2: { marginBottom: theme.spacing[2] },
  mb3: { marginBottom: theme.spacing[3] },
  mb4: { marginBottom: theme.spacing[4] },
  mb5: { marginBottom: theme.spacing[5] },
  mb6: { marginBottom: theme.spacing[6] },
  mb8: { marginBottom: theme.spacing[8] },
  
  ml1: { marginLeft: theme.spacing[1] },
  ml2: { marginLeft: theme.spacing[2] },
  ml3: { marginLeft: theme.spacing[3] },
  ml4: { marginLeft: theme.spacing[4] },
  
  mr1: { marginRight: theme.spacing[1] },
  mr2: { marginRight: theme.spacing[2] },
  mr3: { marginRight: theme.spacing[3] },
  mr4: { marginRight: theme.spacing[4] },
  
  mx1: { marginHorizontal: theme.spacing[1] },
  mx2: { marginHorizontal: theme.spacing[2] },
  mx3: { marginHorizontal: theme.spacing[3] },
  mx4: { marginHorizontal: theme.spacing[4] },
  mx6: { marginHorizontal: theme.spacing[6] },
  
  my1: { marginVertical: theme.spacing[1] },
  my2: { marginVertical: theme.spacing[2] },
  my3: { marginVertical: theme.spacing[3] },
  my4: { marginVertical: theme.spacing[4] },
  my6: { marginVertical: theme.spacing[6] },
  
  pt1: { paddingTop: theme.spacing[1] },
  pt2: { paddingTop: theme.spacing[2] },
  pt3: { paddingTop: theme.spacing[3] },
  pt4: { paddingTop: theme.spacing[4] },
  pt6: { paddingTop: theme.spacing[6] },
  
  pb1: { paddingBottom: theme.spacing[1] },
  pb2: { paddingBottom: theme.spacing[2] },
  pb3: { paddingBottom: theme.spacing[3] },
  pb4: { paddingBottom: theme.spacing[4] },
  pb6: { paddingBottom: theme.spacing[6] },
  
  pl1: { paddingLeft: theme.spacing[1] },
  pl2: { paddingLeft: theme.spacing[2] },
  pl3: { paddingLeft: theme.spacing[3] },
  pl4: { paddingLeft: theme.spacing[4] },
  
  pr1: { paddingRight: theme.spacing[1] },
  pr2: { paddingRight: theme.spacing[2] },
  pr3: { paddingRight: theme.spacing[3] },
  pr4: { paddingRight: theme.spacing[4] },
  
  px1: { paddingHorizontal: theme.spacing[1] },
  px2: { paddingHorizontal: theme.spacing[2] },
  px3: { paddingHorizontal: theme.spacing[3] },
  px4: { paddingHorizontal: theme.spacing[4] },
  px6: { paddingHorizontal: theme.spacing[6] },
  
  py1: { paddingVertical: theme.spacing[1] },
  py2: { paddingVertical: theme.spacing[2] },
  py3: { paddingVertical: theme.spacing[3] },
  py4: { paddingVertical: theme.spacing[4] },
  py6: { paddingVertical: theme.spacing[6] },
  
  // Border styles
  borderLight: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  borderMedium: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  
  // Shadow styles
  shadowSm: theme.shadows.sm,
  shadowMd: theme.shadows.md,
  shadowLg: theme.shadows.lg,
  shadowXl: theme.shadows.xl,
});

// Utility functions for dynamic styles
export const getSpacing = (size: keyof typeof theme.spacing) => theme.spacing[size];
export const getColor = (color: string) => color;
export const getBorderRadius = (size: keyof typeof theme.borderRadius) => theme.borderRadius[size];

// Create default global styles
export const globalStyles = createGlobalStyles(theme);