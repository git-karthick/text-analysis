I understand the requirement clearly. You want a two-row header layout:

1. **Top Row**:
   - Left: Company logo (SVG format) with "RGB" branding
   - Right: Search bar, Notification bell, Settings icon, Theme toggle, and User profile

2. **Bottom Row**:
   - Left: App name ("EnterpriseApp")
   - Center: Navigation menu
   - (No need for anything on the right)

Here's the updated implementation:

```tsx
// components/ui/Header/Header.tsx
import React from 'react';
import {
  Box,
  Flex,
  Container,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { HeaderProps } from '../../../types';
import { Logo } from './Logo';
import { NavigationMenu } from './NavigationMenu';
import { SearchBar } from './SearchBar';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileMenu } from './UserProfileMenu';

export const Header: React.FC<HeaderProps> = ({
  navigationItems,
  activeNavItem,
  onNavItemClick,
  user,
  userMenuItems,
  notificationCount = 0,
  onNotificationClick,
  onSearch,
  showSearch = true,
  showSettings = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="8xl" px={6}>
        <VStack spacing={0} align="stretch">
          {/* Top Row: Company Logo and Actions */}
          <Flex 
            h={12} 
            alignItems="center" 
            justifyContent="space-between"
          >
            {/* Company Logo - SVG format with RGB branding */}
            <Box>
              {/* Replace this with your actual SVG logo */}
              <Box w="120px" h="40px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                <Text fontWeight="bold" color="gray.800">RGB Logo (SVG)</Text>
              </Box>
            </Box>
            
            {/* Right side actions */}
            <HStack spacing={4}>
              {/* Search */}
              {showSearch && (
                <SearchBar 
                  placeholder="Search enterprise..."
                  onSearch={onSearch}
                  width="200px"
                />
              )}

              {/* Notifications */}
              <NotificationBell 
                count={notificationCount}
                onClick={onNotificationClick}
              />

              {/* Settings */}
              {showSettings && (
                <Tooltip label="Settings" placement="bottom">
                  <IconButton
                    icon={<SettingsIcon />}
                    variant="ghost"
                    size="sm"
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                    aria-label="Settings"
                  />
                </Tooltip>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <UserProfileMenu 
                user={user}
                menuItems={userMenuItems}
              />
            </HStack>
          </Flex>

          {/* Bottom Row: App Name and Navigation */}
          <Flex 
            h={12} 
            alignItems="center" 
            justifyContent="space-between"
            borderTop="1px"
            borderColor={borderColor}
          >
            {/* App Name */}
            <Box>
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color={textColor}
                ml={2}
              >
                EnterpriseApp
              </Text>
            </Box>
            
            {/* Navigation */}
            <NavigationMenu 
              items={navigationItems}
              activeItem={activeNavItem}
              onItemClick={onNavItemClick}
            />
            
            {/* Empty spacer to balance layout */}
            <Box w="100px" /> 
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};
```

For the SVG logo, you should replace the placeholder with your actual SVG component. Here's how to do it:

1. Create an SVG logo component (if you don't have one already):

```tsx
// components/ui/Header/RGBLogo.tsx
import React from 'react';

export const RGBLogo: React.FC = () => {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Replace this with your actual SVG paths */}
      <rect width="120" height="40" rx="8" fill="#F0F0F0"/>
      <text x="20" y="25" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="#333">RGB</text>
      {/* Add your actual logo design here */}
    </svg>
  );
};
```

2. Import and use it in the Header:

```tsx
// At the top of Header.tsx
import { RGBLogo } from './RGBLogo';

// In the Header component, replace the placeholder:
<Box>
  <RGBLogo />
</Box>
```

Key features of this implementation:
- Clear two-row structure with visual separation
- Top row contains company logo on left and action items on right
- Bottom row contains app name on left and navigation in center
- Added a border between the two rows for visual distinction
- Maintained all functionality from your original header
- Responsive spacing and alignment
- Kept all your existing props and functionality

The layout now matches your requirement:
1. Top row:
   - Left: Company logo (SVG format)
   - Right: Search, Notifications, Settings, Theme toggle, User profile

2. Bottom row:
   - Left: App name ("EnterpriseApp")
   - Center: Navigation menu
   - Right: Empty space for balance

You can customize the SVG logo component with your actual logo design while maintaining this header structure.