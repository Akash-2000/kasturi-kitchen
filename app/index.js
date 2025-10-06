
import { Redirect } from 'expo-router';

const Index = () => {
  // Immediately redirect to the login screen when the app starts.
  // The root layout will handle redirecting to HomeScreen if the user is already logged in.
  return <Redirect href="/(auth)/LoginScreen" />;
};

export default Index;
