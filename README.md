Here's how to implement the color `#8A0808` (a deep red) in Chakra UI v3 with TypeScript, including the initial color mode configuration:

### 1. Custom Theme with Color `#8A0808`

```typescript
// src/theme/index.ts
import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        deepRed: {
          50: { value: "#fde8e8" },
          100: { value: "#f9c5c5" },
          200: { value: "#f5a3a3" },
          300: { value: "#f18080" },
          400: { value: "#ed5d5d" },
          500: { value: "#8A0808" }, // Your requested color
          600: { value: "#6e0606" },
          700: { value: "#520505" },
          800: { value: "#360303" },
          900: { value: "#1a0101" }
        }
      }
    },
    semanticTokens: {
      colors: {
        primary: {
          default: { value: "{colors.deepRed.500}" },
          _dark: { value: "{colors.deepRed.300}" }
        }
      }
    },
    recipes: {
      button: {
        variants: {
          primary: {
            bg: "primary",
            color: "white",
            _hover: { bg: "{colors.deepRed.600}" }
          }
        }
      }
    }
  },
  colorMode: {
    initial: "dark", // 'light' | 'dark' | 'system'
    useSystemColorMode: false
  }
})
```

### 2. Provider Setup with Color Mode

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>
)
```

### 3. Component Usage Example

```tsx
// src/App.tsx
import { Button, Box, Text, useColorMode } from '@chakra-ui/react'

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box p={8}>
      <Text mb={4}>Current mode: {colorMode}</Text>
      <Button 
        colorPalette="deepRed" 
        variant="primary"
        onClick={toggleColorMode}
      >
        Toggle Mode (Current: {colorMode})
      </Button>
    </Box>
  )
}
```

### Key Features:

1. **Color Configuration**:
   - Full color palette generated from your base `#8A0808`
   - Semantic token for primary color that adapts to dark/light mode
   - Button variant using the color

2. **Color Mode Options**:
   - `initial: "dark"` - Default starting mode
   - `useSystemColorMode: false` - Disable system preference
   - Change to `"light"` or `"system"` as needed

3. **Type Safety**:
   - All color references are type-checked
   - Color mode values are strictly typed

### Additional Notes:

- For system color mode preference, set:
  ```typescript
  colorMode: {
    initial: "system",
    useSystemColorMode: true
  }
  ```

- To access the color directly in components:
  ```tsx
  <Box bg="deepRed.500">...</Box>
  ```

- The color palette follows Chakra's convention with 50-900 shades
- Dark mode automatically uses lighter variants (300 instead of 500)


Based on Chakra UI v3's documentation, I'll provide a corrected implementation for your deep red color (`#8A0808`) with proper TypeScript typing. The error occurs because the configuration structure has changed in v3 .

## Corrected Implementation for Chakra UI v3

### 1. Theme Configuration (Properly Typed)

```typescript
// src/theme/index.ts
import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(
  defaultConfig,
  defineConfig({
    theme: {
      tokens: {
        colors: {
          deepRed: {
            50: "#fde8e8",
            100: "#f9c5c5",
            200: "#f5a3a3",
            300: "#f18080",
            400: "#ed5d5d",
            500: "#8A0808", // Your requested color
            600: "#6e0606",
            700: "#520505",
            800: "#360303",
            900: "#1a0101"
          }
        }
      },
      semanticTokens: {
        colors: {
          primary: {
            default: "{colors.deepRed.500}",
            _dark: "{colors.deepRed.300}"
          }
        }
      }
    },
    recipes: {
      button: {
        base: {
          fontWeight: "bold",
          borderRadius: "md"
        },
        variants: {
          primary: {
            bg: "primary",
            color: "white",
            _hover: { bg: "{colors.deepRed.600}" }
          }
        }
      }
    }
  })
)
```

### 2. Provider Setup with Color Mode

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>
)
```

### 3. Component Usage (Updated for v3)

```tsx
// src/App.tsx
import { Button, Box, Text } from '@chakra-ui/react'
import { useTheme } from 'next-themes'

export default function App() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Box p={8}>
      <Text mb={4}>Current mode: {theme}</Text>
      <Button 
        colorPalette="deepRed" 
        variant="primary"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        Toggle Mode (Current: {theme})
      </Button>
    </Box>
  )
}
```

## Key Corrections:

1. **Proper Configuration Structure**:
   - Wrapped theme config with `defineConfig()` 
   - Simplified color token values (no `{ value: "..." }` needed) 
   - Moved recipes to top level (not nested under theme) 

2. **Color Mode Handling**:
   - Removed deprecated `useColorMode` (replaced with `next-themes`) 
   - Updated toggle logic to use `next-themes` 

3. **Type Safety**:
   - Added proper imports for configuration utilities
   - Ensured all references match v3's expected types 

## Additional Required Setup:

1. Install `next-themes` (required for color mode in v3):
```bash
npm install next-themes
```

2. Update your provider to include ThemeProvider:
```tsx
// src/providers.tsx
import { ThemeProvider } from 'next-themes'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </ThemeProvider>
  )
}
```

These changes align with Chakra UI v3's new architecture and theming system . The color palette and semantic tokens are now properly typed and integrated with the styling system.