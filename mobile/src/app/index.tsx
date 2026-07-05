import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wave } from "@/components/shared/Wave";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Image
          source={require("../../assets/logos/logo-white.png")}
          style={styles.logo}
          contentFit="contain"
        />


        <Wave style={styles.wave} />
      </View>

      <SafeAreaView style={styles.content} edges={["bottom"]}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            Gestão inteligente de entregas de medicamentos.
          </Text>
          <Text style={styles.subtitle}>
            Organize pedidos, acompanhe entregas e mantenha o controle de todo o processo em um único lugar.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
            onPress={() => router.push("/(authentication)/signIn")}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <Text style={styles.footerHint}> Mais eficiência na distribuição de medicamentos.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing[10],
    paddingBottom: Spacing.xxl,
    overflow: "hidden",
  },

  logo: {
    width: 150,
    height: 120,
    marginBottom: Spacing.xl,
  },

  brand: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.xxl,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  tagline: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    opacity: 0.75,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: Spacing.xs,
  },

  wave: {
    position: "absolute",
    bottom: -1,
    left: 0,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  textBlock: {
    marginTop: Spacing.xl,
  },

  title: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.xxl,
    color: Colors.text,
    lineHeight: 30,
  },

  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },

  footer: {
    alignItems: "center",
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    width: "100%",
    alignItems: "center",
    ...Shadows.md,
  },

  buttonText: {
    fontFamily: Typography.fonts.bodySemiBold,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  footerHint: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
