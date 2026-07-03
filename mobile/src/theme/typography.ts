export const Typography = {
    heading: "BebasNeue_400Regular",
    body: "Montserrat_400Regular",
    bodyMedium: "Montserrat_500Medium",
    bodySemiBold: "Montserrat_600SemiBold",
    bodyBold: "Montserrat_700Bold",

    sizes: {
        xs: 11,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
    },
    
    weights: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
} as const;