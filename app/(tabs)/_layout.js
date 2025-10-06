
import { Tabs } from "expo-router";

export default () => {
  return (
    <Tabs>
      <Tabs.Screen name="HomeScreen" options={{ title: "Home" }} />
      <Tabs.Screen name="ProductsScreen" options={{ title: "Products" }} />
    </Tabs>
  );
};
