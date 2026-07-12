export const Colors = {
    primary: "#035941",
    primaryDark: "#01402E",
    primaryLight: "#3C7363",

    background: "#F2EDE4",
    surface: "#FFFFFF",
    border: "#D9D4CC",
    white: "#FFFFFF",

    text: "#1F2937",
    textSecondary: "#6B7280",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#0EA5E9",
    dark: "#1A1A1A"
};

export const Gradients = {
    primary: [Colors.primary, Colors.primaryDark] as const,
};