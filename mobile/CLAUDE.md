# Claude.md - React Native + TypeScript Best Practices

## Overview

This project is built with **React Native** and **TypeScript**.

When generating, modifying, or refactoring code, always prioritize:

- Readability over cleverness.
- Type safety over convenience.
- Maintainability over premature optimization.
- Composition over inheritance.
- Reusable components over duplicated code.

---

# General Principles

- Always use TypeScript strict mode.
- Never use `any` unless explicitly requested.
- Prefer `unknown` over `any`.
- Prefer interfaces for public object contracts.
- Prefer explicit types instead of implicit complex inference.
- Keep functions small and focused on a single responsibility.
- Avoid deeply nested logic.
- Prefer early returns.
- Remove dead code.
- Avoid unnecessary comments.
- Code should be self-documenting.

---

# Project Structure

Always follow the existing folder structure.

Example:

```
src/
    assets/
    components/
        common/
        forms/
        layout/
    features/
        authentication/
        home/
        profile/
    hooks/
    navigation/
    screens/
    services/
    store/
    theme/
    types/
    utils/
```

Each feature should be isolated whenever possible.

Avoid creating giant shared folders.

---

# Components

Prefer functional components.

Example:

```tsx
function LoginButton() {
    return (...)
}
```

or

```tsx
const LoginButton = () => {
    return (...)
}
```

Avoid class components.

---

# Component Rules

Components should:

- Have a single responsibility.
- Be reusable.
- Receive data via props.
- Avoid unnecessary internal state.
- Avoid business logic.

Business logic belongs in:

- Hooks
- Services
- Store
- Controllers

---

# Props

Always create explicit prop interfaces.

Example:

```tsx
interface ButtonProps {
    title: string;
    onPress(): void;
}
```

Avoid inline prop types.

---

# Hooks

Use hooks correctly.

Rules:

- Never call hooks conditionally.
- Keep custom hooks focused.
- Prefix custom hooks with `use`.

Example:

```
useAuth()
useTheme()
useUser()
```

Custom hooks should encapsulate:

- API calls
- Complex state
- Side effects
- Business logic

---

# State Management

Prefer:

- React state for local UI state.
- Context only for truly global state.
- Redux, Zustand, or another existing solution only where appropriate.

Do not introduce a new state library without necessity.

Avoid prop drilling.

---

# Side Effects

Use `useEffect` only when necessary.

Avoid effects that merely derive state.

Prefer computing derived values directly.

Always clean up:

- subscriptions
- timers
- listeners

---

# Styling

Follow the existing design system.

Prefer:

- StyleSheet.create()
- Theme tokens
- Shared spacing
- Shared typography
- Shared colors

Avoid inline styles unless trivial.

Never duplicate design tokens.

---

# Performance

Avoid unnecessary re-renders.

Use:

- React.memo
- useMemo
- useCallback

only when there is measurable benefit.

Do not optimize prematurely.

Use FlatList instead of ScrollView for large lists.

Provide:

- keyExtractor
- getItemLayout (when applicable)

---

# Navigation

Follow the existing navigation structure.

Keep navigation logic minimal.

Avoid hardcoded route names throughout the project.

Prefer centralized route constants.

---

# API Layer

Never call fetch directly inside components.

Use service classes or API modules.

Example:

```
services/
    auth.service.ts
    user.service.ts
```

Components should not know implementation details.

---

# Error Handling

Always handle errors.

Show meaningful user feedback.

Never silently ignore exceptions.

Use typed error models whenever possible.

---

# Async Code

Prefer:

```ts
async/await
```

instead of chained promises.

Always handle failures.

Example:

```ts
try {
    ...
} catch (error) {
    ...
}
```

---

# TypeScript

Always use strict typing.

Prefer:

```ts
type UserId = string;
```

for aliases.

Prefer interfaces for object models.

Never disable TypeScript rules without justification.

Avoid:

```ts
as any
```

Prefer proper narrowing.

---

# Imports

Group imports:

1. React
2. React Native
3. Third-party libraries
4. Internal modules
5. Styles

Keep imports sorted.

Remove unused imports.

---

# Naming

Use clear names.

Good:

- UserProfile
- LoginScreen
- fetchUser
- updateProfile

Avoid:

- data
- temp
- obj
- value
- helper

---

# Files

One major component per file.

Prefer:

```
LoginScreen.tsx
```

instead of:

```
login.tsx
```

Use PascalCase for components.

Use camelCase for:

- hooks
- services
- utilities

---

# Constants

Avoid magic numbers.

Extract constants.

Example:

```ts
const MAX_LOGIN_ATTEMPTS = 5;
```

---

# Forms

Keep forms controlled.

Use existing form libraries if already adopted (e.g., React Hook Form).

Validate all user input.

Display validation messages clearly.

---

# Accessibility

Always consider accessibility.

Include:

- accessibilityLabel
- accessibilityRole
- accessibilityHint (when appropriate)

Support screen readers whenever possible.

---

# Testing

When creating tests:

- Test behavior, not implementation.
- Prefer React Native Testing Library.
- Mock external services.
- Keep tests deterministic.

---

# Security

Never:

- Store secrets in source code.
- Log sensitive information.
- Hardcode API keys.
- Trust client-side validation alone.

Use secure storage for tokens when required.

---

# Code Generation Rules

When generating code:

- Produce production-ready code.
- Follow the existing project architecture.
- Do not invent new architectural patterns.
- Reuse existing utilities whenever possible.
- Avoid duplicate logic.
- Keep files concise.
- Generate strongly typed code.
- Prefer composition.
- Explain only when requested.

If there is uncertainty about the project's architecture, ask before introducing new patterns.

---

# UI Guidelines

When creating screens:

- Follow the existing design language.
- Support both Android and iOS.
- Respect safe areas.
- Ensure responsive layouts.
- Avoid fixed dimensions whenever possible.
- Use Flexbox appropriately.
- Keep spacing consistent with the design system.

---

# Final Rule

Always write code as if it will be maintained by a large team for many years.

Prioritize:

1. Simplicity
2. Readability
3. Type Safety
4. Consistency
5. Scalability
6. Performance
7. Maintainability