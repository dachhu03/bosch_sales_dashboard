# Data Model & UI State Specification: Login Page Design Optimization

**Feature**: Login Page Design Optimization
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Component State Model (`Login.jsx`)

### `LoginState`

| State Property | Type | Default Value | Description |
|----------------|------|---------------|-------------|
| `username` | `string` | `""` | User login input identifier |
| `password` | `string` | `""` | User secret credential |
| `error` | `string` | `""` | Authentication failure message or client validation error |
| `submitting` | `boolean` | `false` | Asynchronous authentication pending state |
| `focusedField` | `string \| null` | `null` | Active input field ID for dynamic focus ring highlight |

---

## 2. Visual Theme Schema

### `LightBlueGlassTheme`

```json
{
  "container": {
    "background": "rgba(15, 23, 42, 0.75)",
    "backdropFilter": "blur(16px)",
    "border": "1px solid rgba(186, 230, 253, 0.25)",
    "borderRadius": "1.5rem",
    "boxShadow": "0 25px 50px -12px rgba(14, 165, 233, 0.15)"
  },
  "ambientBackground": {
    "primaryOrb": "bg-sky-500/20 blur-[120px]",
    "secondaryOrb": "bg-blue-600/15 blur-[140px]",
    "gridOverlay": "radial-gradient opacity 0.3"
  },
  "inputs": {
    "background": "rgba(15, 23, 42, 0.6)",
    "borderDefault": "1px solid rgba(51, 65, 85, 0.8)",
    "borderFocus": "1px solid #38bdf8",
    "glowFocus": "0 0 16px rgba(56, 189, 248, 0.3)"
  },
  "primaryButton": {
    "background": "linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #0284c7 100%)",
    "textColor": "#ffffff",
    "boxShadow": "0 10px 25px -5px rgba(14, 165, 233, 0.3)"
  }
}
```

---

## 3. Validation Rules

- **Username Requirement**: Non-empty string trimmed before submission.
- **Password Requirement**: Non-empty string.
- **Error Presentation**: Dismissed automatically when user resumes typing in username or password fields.
