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

Based on the Chakra UI v3 documentation, here's the corrected implementation for your deep red color (`#8A0808`) with proper TypeScript typing and initial color mode configuration:

### Corrected Theme Configuration 
```typescript
// src/theme/index.ts
import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

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
    }
  })
);
```

### Provider Setup with Color Mode 
```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { system } from './theme';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  </StrictMode>
);
```

### Component Usage 
```tsx
// src/App.tsx
import { Button, Box, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

export default function App() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Box p={8}>
      <Text mb={4}>Current mode: {theme}</Text>
      <Button 
        variant="primary"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        Toggle Mode (Current: {theme})
      </Button>
      
      {/* Using the color directly */}
      <Box mt={4} p={4} bg="deepRed.500">
        <Text color="white">Deep Red Box</Text>
      </Box>
    </Box>
  );
}
```

### Required Dependencies
```bash
npm install @chakra-ui/react@latest @emotion/react next-themes
```

### Key Corrections :
1. **Configuration Structure**:
   - Wrapped theme config with `defineConfig()`
   - Removed deprecated `colorMode` object (handled by `next-themes`)
   - Simplified color token values (no `{ value: ... }` needed)

2. **Color Mode Handling**:
   - Uses `ThemeProvider` from `next-themes` instead of built-in solution
   - `defaultTheme="dark"` sets initial color mode
   - `attribute="class"` applies color modes via CSS classes

3. **Component Usage**:
   - `colorPalette` changed to `variant="primary"`
   - Uses `useTheme()` from `next-themes` instead of `useColorMode()`

4. **Type Safety**:
   - Added proper imports for configuration utilities
   - All references match v3's expected types

### Project Structure:
```
src/
├── theme/
│   └── index.ts     # Theme configuration
├── App.tsx          # Main component
├── main.tsx         # Entry point
└── vite-env.d.ts    # TypeScript declarations
```

### Additional Recommendations :
1. Generate theme typings after customization:
```bash
npx @chakra-ui/cli typegen ./src/theme/index.ts
```

2. For complex components, use recipes instead of style configs:
```typescript
// Example recipe for card component
export const cardRecipe = defineRecipe({
  base: {
    borderRadius: "xl",
    boxShadow: "md",
    p: 6
  },
  variants: {
    elevated: {
      bg: "white",
      _dark: { bg: "gray.700" }
    },
    outline: {
      border: "1px solid",
      borderColor: "gray.200",
      _dark: { borderColor: "gray.600" }
    }
  }
});
```

This implementation follows Chakra UI v3's new architecture with proper TypeScript support and color mode handling via `next-themes` .



