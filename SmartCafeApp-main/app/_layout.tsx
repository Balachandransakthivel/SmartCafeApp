import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="item-details"
            options={{
              headerShown: true,
              title: 'Item Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="checkout"
            options={{
              headerShown: true,
              title: 'Checkout',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="order-details"
            options={{
              headerShown: true,
              title: 'Order Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="qr-order"
            options={{
              headerShown: true,
              title: 'Table Order',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="kitchen-display"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="feedback"
            options={{
              headerShown: true,
              title: 'Feedback',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="admin/menu-management"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin/analytics"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin/inventory"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin/feedback-analysis"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin/tables"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin/reports"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="loyalty-dashboard"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="leaderboard"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
