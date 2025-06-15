Here's a comprehensive guide for using Chakra UI v3 with Vite and TypeScript, incorporating the latest documentation and migration insights:

### Chakra UI v3 with Vite + TypeScript Setup

#### 1. Create Project & Install Dependencies
```bash
npm create vite@latest chakra-v3-app -- --template react-ts
cd chakra-v3-app
npm install @chakra-ui/react@latest @emotion/react
```

Key changes from v2:
- Removed `@emotion/styled` and `framer-motion` dependencies 
- New component architecture with namespaced imports 

#### 2. Custom Theme Configuration (TypeScript)
Create `src/theme/index.ts`:
```typescript
import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f2ff" },
          500: { value: "#3b82f6" },
          900: { value: "#001a33" }
        }
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body: { value: "'Inter', sans-serif" }
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" }
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
          solid: {
            bg: "brand.solid",
            color: "brand.contrast"
          }
        }
      }
    }
  }
})
```

Key differences from v2:
- Uses `createSystem` instead of `extendTheme` 
- Component styles now use "recipes" instead of `styleConfig` 
- Color system requires both `tokens` and `semanticTokens` 

#### 3. Provider Setup
Update `src/main.tsx`:
```tsx
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

Key changes:
- `theme` prop renamed to `value` 
- Color mode handling moved to external libraries 

#### 4. Component Usage Example
```tsx
import { Button, Box, Text } from '@chakra-ui/react'

export default function App() {
  return (
    <Box p={8}>
      <Text fontSize="xl">Chakra v3 + Vite</Text>
      <Button colorPalette="brand" variant="solid">
        New Button Syntax
      </Button>
    </Box>
  )
}
```

Important changes:
- `colorScheme` → `colorPalette` 
- Boolean props simplified (`isDisabled` → `disabled`) 
- Component structure changes (e.g., `<Table.Root>`) 

#### 5. Additional Configuration

**For Vite:**
Add to `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

**For TypeScript:**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Key Migration Notes 

1. **Component Changes**:
   - New namespaced component structure (e.g., `<Tabs.Root>`)
   - Form components replaced with `<Field>` variants
   - Icons moved to external libraries like `react-icons`

2. **Styling Changes**:
   - CSS color-mix instead of JS `transparentize`
   - Gradient props simplified
   - Style config replaced with recipes

3. **Deprecations**:
   - `useColorMode` removed (use `next-themes`)
   - Toast system replaced with snippet-based approach
   - Animation no longer uses `framer-motion`

4. **Performance**:
   - 4x reconciliation improvement
   - 1.6x re-render improvement
   - Tree-shakable component recipes 

For complete migration details, refer to the official [Chakra UI v3 Migration Guide](https://www.chakra-ui.com/docs/get-started/migration)  and be aware that some components may require significant refactoring due to structural changes .