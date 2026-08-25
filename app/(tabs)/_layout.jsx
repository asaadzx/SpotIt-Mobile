import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { ActivityIndicator, View, Text } from "react-native";

export default function TabsLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.accent,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color: _color }) => <TabIcon name="magnifying-glass" />,
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: "My Claims",
          tabBarIcon: ({ color: _color }) => <TabIcon name="document-text" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color: _color }) => <TabIcon name="person-circle" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color: _color }) {
  const iconMap = {
    "magnifying-glass": "🔍",
    "document-text": "📋",
    "person-circle": "👤",
  };
  return (
    <View style={{ fontSize: 20 }}>
      <Text style={{ fontSize: 20 }}>{iconMap[name] || "📱"}</Text>
    </View>
  );
}
