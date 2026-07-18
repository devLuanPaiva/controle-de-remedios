import { useEffect } from "react";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { AuthProvider } from "@/data/contexts/AuthContext";
import { CompanyProvider } from "@/data/contexts/CompanyContext";
import { useFonts } from "expo-font";

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import {
  BebasNeue_400Regular,
} from "@expo-google-fonts/bebas-neue";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    BebasNeue_400Regular,
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CompanyProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, animation: "none" }}
          />
          <Stack.Screen
            name="(authentication)"
            options={{ headerShown: false, animation: "none" }}
          />
          <Stack.Screen
            name="(protected)"
            options={{ headerShown: false, animation: "none" }}
          />
        </Stack>
      </CompanyProvider>
    </AuthProvider>
  );
}
