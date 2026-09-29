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

  // Body / UI: Jost (--font-ui) for clean geometric English and UI body texts
  body: Platform.select({
    ios: 'Jost',
    android: 'Jost-Regular',
    default: 'Jost, sans-serif',
  }),
  bodyLight: Platform.select({
    ios: 'Jost-Light',
    android: 'Jost-Light',
    default: 'Jost, sans-serif',
  }),
  bodyMedium: Platform.select({
    ios: 'Jost-Medium',
    android: 'Jost-Medium',
    default: 'Jost, sans-serif',
  }),
  bodyBold: Platform.select({
    ios: 'Jost-Bold',
    android: 'Jost-Bold',
    default: 'Jost, sans-serif',
  }),
};

