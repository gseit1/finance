import { Platform } from 'react-native';

export const fonts = {
  // Heading / Display: Commissioner (--font-heading, weight 900 Black) with full Greek & Latin support
  heading: Platform.select({
    ios: 'Commissioner-Black',
    android: 'Commissioner-Black',
    default: 'Commissioner, sans-serif',
  }),
  headingBold: Platform.select({
    ios: 'Commissioner-Black',
    android: 'Commissioner-Black',
    default: 'Commissioner, sans-serif',
  }),
  headingSemiBold: Platform.select({
    ios: 'Commissioner-Bold',
    android: 'Commissioner-Bold',
    default: 'Commissioner, sans-serif',
  }),

  // Body / UI: Jost (--font-ui) with enhanced weight globally
  body: Platform.select({
    ios: 'Jost-Medium',
    android: 'Jost-Medium',
    default: 'Jost, sans-serif',
  }),
  bodyLight: Platform.select({
    ios: 'Jost-Regular',
    android: 'Jost-Regular',
    default: 'Jost, sans-serif',
  }),
  bodyMedium: Platform.select({
    ios: 'Jost-SemiBold',
    android: 'Jost-SemiBold',
    default: 'Jost, sans-serif',
  }),
  bodyBold: Platform.select({
    ios: 'Jost-Bold',
    android: 'Jost-Bold',
    default: 'Jost, sans-serif',
  }),
};

