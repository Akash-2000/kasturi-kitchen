
import { Tabs } from "expo-router";

export default () => {
  return (
    <Tabs>
      <Tabs.Screen name="HomeScreen" options={{ title: "Home" , headerShown:false}} />
      <Tabs.Screen name="ProductsScreen" options={{ title: "Products" }} />
    </Tabs>
  );
};
