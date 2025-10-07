import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";


const InitialLayout = () => {
  const { user, isLoaded, isUserLoggedIn, storeLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  console.log(user, segments, "my segments")
  useEffect(() => {
    if (!isLoaded || !storeLoaded) return;
    if(isUserLoggedIn){
       router.replace("(tabs)/HomeScreen");
       return
    }
    const inTabsGroup = segments[0] === "(tabs)";
    if (user && user.emailVerified && !inTabsGroup) {
      router.replace("(tabs)/HomeScreen");
    } else if (!user || !user.emailVerified) {
      router.replace("(auth)/LoginScreen");
    }
  }, [user, isLoaded, storeLoaded]);

  return <Slot />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
};

export default RootLayout;