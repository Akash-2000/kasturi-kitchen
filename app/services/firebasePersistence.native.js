
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const persistence = getReactNativePersistence(ReactNativeAsyncStorage);

export default persistence;
