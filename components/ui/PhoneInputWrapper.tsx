import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import PhoneInputLib, { PhoneInputProps } from 'react-native-phone-number-input';
import RawPhoneInput from 'react-native-phone-number-input';


// Create a wrapper to solve JSX compatibility in TypeScript
const PhoneInput = RawPhoneInput as unknown as React.ComponentType<PhoneInputProps>;

export default PhoneInput;
