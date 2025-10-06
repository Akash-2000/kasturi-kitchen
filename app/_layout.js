import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

const InitialLayout = () => {
  const { user, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  console.log(user, segments, "my segments")
  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === "(tabs)";
    if (user && user.emailVerified && !inTabsGroup) {
      router.replace("(tabs)/HomeScreen");
    } else if (!user || !user.emailVerified) {
      router.replace("(auth)/LoginScreen");
    }
  }, [user, isLoaded]);

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