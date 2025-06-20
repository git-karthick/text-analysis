import React from ‘react’;
import {
ChakraProvider,
Box,
Flex,
Text,
Button,
Menu,
MenuButton,
MenuList,
MenuItem,
IconButton,
useColorMode,
useColorModeValue,
HStack,
VStack,
Badge,
Avatar,
Container,
extendTheme,
Input,
InputGroup,
InputLeftElement,
Tooltip
} from ‘@chakra-ui/react’;
import {
MoonIcon,
SunIcon,
ChevronDownIcon,
BellIcon,
SearchIcon,
SettingsIcon
} from ‘@chakra-ui/icons’;

// Custom theme with deep red palette
const theme = extendTheme({
colors: {
brand: {
50: ‘#fdf2f2’,
100: ‘#fce7e7’,
200: ‘#f9d5d5’,
300: ‘#f4b5b5’,
400: ‘#ec8989’,
500: ‘#dc2626’,
600: ‘#b91c1c’,
700: ‘#991b1b’,
800: ‘#7f1d1d’,
900: ‘#701a1a’,
},
gray: {
50: ‘#f9fafb’,
100: ‘#f3f4f6’,
200: ‘#e5e7eb’,
300: ‘#d1d5db’,
400: ‘#9ca3af’,
500: ‘#6b7280’,
600: ‘#4b5563’,
700: ‘#374151’,
800: ‘#1f2937’,
900: ‘#111827’,
}
},
config: {
initialColorMode: ‘light’,
useSystemColorMode: false,
},
styles: {
global: (props) => ({
body: {
bg: props.colorMode === ‘dark’ ? ‘gray.900’ : ‘gray.50’,
},
}),
},
});

// Logo Component
const Logo = ({ size = ‘md’ }) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const logoSize = size === ‘lg’ ? 12 : size === ‘sm’ ? 8 : 10;
const fontSize = size === ‘lg’ ? ‘xl’ : size === ‘sm’ ? ‘md’ : ‘lg’;

return (
<Flex alignItems="center">
<Box
w={logoSize}
h={logoSize}
bg="brand.500"
borderRadius="lg"
display="flex"
alignItems="center"
justifyContent="center"
mr={3}
>
<Text color="white" fontWeight="bold" fontSize={fontSize}>
E
</Text>
</Box>
<Text fontSize="xl" fontWeight="bold" color={textColor}>
Enterprise
</Text>
</Flex>
);
};

// Navigation Menu Component
const NavigationMenu = ({ items, activeItem, onItemClick }) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<HStack spacing={1}>
{items.map((item, index) => (
<Button
key={index}
variant=“ghost”
size=“sm”
color={activeItem === item.id ? ‘brand.500’ : textColor}
bg={activeItem === item.id ? useColorModeValue(‘brand.50’, ‘brand.900’) : ‘transparent’}
_hover={{ bg: hoverBg, color: ‘brand.500’ }}
_active={{ bg: ‘brand.50’ }}
fontWeight={activeItem === item.id ? ‘semibold’ : ‘medium’}
onClick={() => onItemClick && onItemClick(item)}
>
{item.label}
</Button>
))}
</HStack>
);
};

// Search Bar Component
const SearchBar = ({ placeholder = “Search…”, onSearch, width = “300px” }) => {
const bgColor = useColorModeValue(‘white’, ‘gray.700’);
const borderColor = useColorModeValue(‘gray.200’, ‘gray.600’);

return (
<InputGroup size="sm" width={width}>
<InputLeftElement pointerEvents="none">
<SearchIcon color="gray.400" />
</InputLeftElement>
<Input
placeholder={placeholder}
bg={bgColor}
border=“1px solid”
borderColor={borderColor}
_hover={{ borderColor: ‘brand.300’ }}
_focus={{ borderColor: ‘brand.500’, boxShadow: ‘0 0 0 1px #dc2626’ }}
onChange={(e) => onSearch && onSearch(e.target.value)}
/>
</InputGroup>
);
};

// Notification Bell Component
const NotificationBell = ({ count = 0, onClick }) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Box position="relative">
<Tooltip label="Notifications" placement="bottom">
<IconButton
icon={<BellIcon />}
variant=“ghost”
size=“sm”
color={textColor}
_hover={{ bg: hoverBg }}
onClick={onClick}
aria-label=“Notifications”
/>
</Tooltip>
{count > 0 && (
<Badge
position="absolute"
top="-1"
right="-1"
colorScheme="red"
borderRadius="full"
boxSize="18px"
fontSize="10px"
display="flex"
alignItems="center"
justifyContent="center"
>
{count > 99 ? ‘99+’ : count}
</Badge>
)}
</Box>
);
};

// Theme Toggle Component
const ThemeToggle = () => {
const { colorMode, toggleColorMode } = useColorMode();
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} placement=“bottom”>
<IconButton
icon={colorMode === ‘light’ ? <MoonIcon /> : <SunIcon />}
onClick={toggleColorMode}
variant=“ghost”
size=“sm”
color={textColor}
_hover={{ bg: hoverBg }}
aria-label=“Toggle theme”
/>
</Tooltip>
);
};

// User Profile Menu Component
const UserProfileMenu = ({ user, menuItems }) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Menu>
<MenuButton
as={Button}
variant=“ghost”
size=“sm”
rightIcon={<ChevronDownIcon />}
_hover={{ bg: hoverBg }}
_active={{ bg: hoverBg }}
>
<HStack spacing={2}>
<Avatar size="sm" name={user.name} src={user.avatar} bg="brand.500" />
<VStack spacing={0} alignItems="flex-start">
<Text fontSize="sm" fontWeight="medium" color={textColor}>
{user.name}
</Text>
<Text fontSize="xs" color="gray.500">
{user.role}
</Text>
</VStack>
</HStack>
</MenuButton>
<MenuList>
{menuItems.map((item, index) => (
<MenuItem
key={index}
onClick={() => item.onClick && item.onClick()}
color={item.color || textColor}
>
{item.label}
</MenuItem>
))}
</MenuList>
</Menu>
);
};

// Main Header Component
const Header = ({
navigationItems = [],
activeNavItem,
onNavItemClick,
user,
userMenuItems = [],
notificationCount = 0,
onNotificationClick,
onSearch,
showSearch = true,
showSettings = true
}) => {
const bgColor = useColorModeValue(‘white’, ‘gray.800’);
const borderColor = useColorModeValue(‘gray.200’, ‘gray.700’);
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

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
<Flex h={16} alignItems="center" justifyContent="space-between">
{/* Logo */}
<Logo />

```
      {/* Navigation */}
      <NavigationMenu 
        items={navigationItems}
        activeItem={activeNavItem}
        onItemClick={onNavItemClick}
      />

      {/* Right side actions */}
      <HStack spacing={4}>
        {/* Search */}
        {showSearch && (
          <SearchBar 
            placeholder="Search enterprise..."
            onSearch={onSearch}
            width="280px"
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
  </Container>
</Box>
```

);
};

// Layout Component
const Layout = ({ children, headerProps }) => {
return (
<Box minH="100vh">
<Header {…headerProps} />
<Container maxW="8xl" px={6}>
{children}
</Container>
</Box>
);
};

// Dashboard Content Component
const DashboardContent = () => {
const bgColor = useColorModeValue(‘white’, ‘gray.800’);
const textColor = useColorModeValue(‘gray.800’, ‘white’);

return (
<VStack spacing={8} align="stretch" py={8}>
<Box bg={bgColor} p={8} borderRadius=“xl” boxShadow=“sm” border=“1px” borderColor={useColorModeValue(‘gray.100’, ‘gray.700’)}>
<Text fontSize="3xl" fontWeight="bold" color={textColor} mb={4}>
Enterprise Dashboard
</Text>
<Text color={useColorModeValue(‘gray.600’, ‘gray.300’)} fontSize=“lg” mb={6}>
Manage your enterprise operations with our comprehensive dashboard featuring deep red theme and full dark mode support.
</Text>
<HStack spacing={4}>
<Button colorScheme="brand" size="lg">
View Analytics
</Button>
<Button variant="outline" colorScheme="brand" size="lg">
Manage Projects
</Button>
</HStack>
</Box>

```
  <Flex gap={6}>
    {[
      { title: 'Revenue Analytics', desc: 'Track financial performance and revenue streams' },
      { title: 'Team Performance', desc: 'Monitor team productivity and collaboration metrics' },
      { title: 'Project Pipeline', desc: 'Oversee project progress and resource allocation' },
      { title: 'System Health', desc: 'Monitor infrastructure and system performance' }
    ].map((card, index) => (
      <Box 
        key={index}
        bg={bgColor} 
        p={6} 
        borderRadius="xl" 
        boxShadow="sm" 
        flex={1}
        border="1px"
        borderColor={useColorModeValue('gray.100', 'gray.700')}
        _hover={{ 
          transform: 'translateY(-2px)',
          boxShadow: 'md',
          borderColor: 'brand.200'
        }}
        transition="all 0.2s"
      >
        <Text fontSize="lg" fontWeight="bold" color={textColor} mb={3}>
          {card.title}
        </Text>
        <Text color={useColorModeValue('gray.600', 'gray.300')}>
          {card.desc}
        </Text>
      </Box>
    ))}
  </Flex>
</VStack>
```

);
};

// Main App Component
const App = () => {
const [activeNavItem, setActiveNavItem] = React.useState(‘dashboard’);
const [searchQuery, setSearchQuery] = React.useState(’’);

const navigationItems = [
{ id: ‘dashboard’, label: ‘Dashboard’ },
{ id: ‘analytics’, label: ‘Analytics’ },
{ id: ‘projects’, label: ‘Projects’ },
{ id: ‘team’, label: ‘Team Management’ },
{ id: ‘reports’, label: ‘Reports’ },
{ id: ‘settings’, label: ‘Settings’ },
{ id: ‘integrations’, label: ‘Integrations’ },
{ id: ‘support’, label: ‘Support’ },
{ id: ‘billing’, label: ‘Billing’ }
];

const user = {
name: ‘John Doe’,
role: ‘Administrator’,
avatar: null
};

const userMenuItems = [
{ label: ‘View Profile’, onClick: () => console.log(‘Profile clicked’) },
{ label: ‘Account Settings’, onClick: () => console.log(‘Settings clicked’) },
{ label: ‘Preferences’, onClick: () => console.log(‘Preferences clicked’) },
{ label: ‘Sign Out’, onClick: () => console.log(‘Sign out clicked’), color: ‘red.500’ }
];

const headerProps = {
navigationItems,
activeNavItem,
onNavItemClick: (item) => setActiveNavItem(item.id),
user,
userMenuItems,
notificationCount: 7,
onNotificationClick: () => console.log(‘Notifications clicked’),
onSearch: setSearchQuery,
showSearch: true,
showSettings: true
};

return (
<ChakraProvider theme={theme}>
<Layout headerProps={headerProps}>
<DashboardContent />
</Layout>
</ChakraProvider>
);
};

export default App;
........=...

// types/index.ts
export interface User {
id: string;
name: string;
email: string;
role: string;
avatar?: string;
}

export interface NavigationItem {
id: string;
label: string;
href: string;
icon?: React.ComponentType;
isActive?: boolean;
}

export interface MenuItem {
label: string;
onClick?: () => void;
color?: string;
icon?: React.ComponentType;
}

export interface HeaderProps {
navigationItems: NavigationItem[];
activeNavItem?: string;
onNavItemClick?: (item: NavigationItem) => void;
user: User;
userMenuItems: MenuItem[];
notificationCount?: number;
onNotificationClick?: () => void;
onSearch?: (query: string) => void;
showSearch?: boolean;
showSettings?: boolean;
}

export interface FooterProps {
companyName?: string;
year?: number;
links?: {
title: string;
items: { label: string; href: string }[];
}[];
}

export interface LayoutProps {
children: React.ReactNode;
headerProps: HeaderProps;
footerProps?: FooterProps;
}

// components/ui/Header/Logo.tsx
import React from ‘react’;
import { Box, Flex, Text, useColorModeValue } from ‘@chakra-ui/react’;

interface LogoProps {
size?: ‘sm’ | ‘md’ | ‘lg’;
companyName?: string;
}

export const Logo: React.FC<LogoProps> = ({
size = ‘md’,
companyName = ‘Enterprise’
}) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const logoSize = size === ‘lg’ ? 12 : size === ‘sm’ ? 8 : 10;
const fontSize = size === ‘lg’ ? ‘xl’ : size === ‘sm’ ? ‘md’ : ‘lg’;

return (
<Flex alignItems="center">
<Box
w={logoSize}
h={logoSize}
bg="brand.500"
borderRadius="lg"
display="flex"
alignItems="center"
justifyContent="center"
mr={3}
>
<Text color="white" fontWeight="bold" fontSize={fontSize}>
{companyName.charAt(0).toUpperCase()}
</Text>
</Box>
<Text fontSize="xl" fontWeight="bold" color={textColor}>
{companyName}
</Text>
</Flex>
);
};

// components/ui/Header/NavigationMenu.tsx
import React from ‘react’;
import { Button, HStack, useColorModeValue } from ‘@chakra-ui/react’;
import { NavigationItem } from ‘../../../types’;

interface NavigationMenuProps {
items: NavigationItem[];
activeItem?: string;
onItemClick?: (item: NavigationItem) => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
items,
activeItem,
onItemClick
}) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);
const activeBg = useColorModeValue(‘brand.50’, ‘brand.900’);

return (
<HStack spacing={1}>
{items.map((item) => (
<Button
key={item.id}
variant=“ghost”
size=“sm”
color={activeItem === item.id ? ‘brand.500’ : textColor}
bg={activeItem === item.id ? activeBg : ‘transparent’}
_hover={{ bg: hoverBg, color: ‘brand.500’ }}
_active={{ bg: ‘brand.50’ }}
fontWeight={activeItem === item.id ? ‘semibold’ : ‘medium’}
onClick={() => onItemClick?.(item)}
>
{item.label}
</Button>
))}
</HStack>
);
};

// components/ui/Header/SearchBar.tsx
import React, { useState, useCallback } from ‘react’;
import {
Input,
InputGroup,
InputLeftElement,
useColorModeValue
} from ‘@chakra-ui/react’;
import { SearchIcon } from ‘@chakra-ui/icons’;

interface SearchBarProps {
placeholder?: string;
onSearch?: (query: string) => void;
width?: string;
debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
placeholder = “Search…”,
onSearch,
width = “300px”,
debounceMs = 300
}) => {
const [query, setQuery] = useState(’’);
const bgColor = useColorModeValue(‘white’, ‘gray.700’);
const borderColor = useColorModeValue(‘gray.200’, ‘gray.600’);

const debouncedSearch = useCallback(
debounce((searchQuery: string) => {
onSearch?.(searchQuery);
}, debounceMs),
[onSearch, debounceMs]
);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const value = e.target.value;
setQuery(value);
debouncedSearch(value);
};

return (
<InputGroup size="sm" width={width}>
<InputLeftElement pointerEvents="none">
<SearchIcon color="gray.400" />
</InputLeftElement>
<Input
placeholder={placeholder}
value={query}
onChange={handleChange}
bg={bgColor}
border=“1px solid”
borderColor={borderColor}
_hover={{ borderColor: ‘brand.300’ }}
_focus={{
borderColor: ‘brand.500’,
boxShadow: ‘0 0 0 1px #dc2626’
}}
/>
</InputGroup>
);
};

// Debounce utility function
function debounce<T extends (…args: any[]) => any>(
func: T,
wait: number
): (…args: Parameters<T>) => void {
let timeout: ReturnType<typeof setTimeout>;
return (…args: Parameters<T>) => {
clearTimeout(timeout);
timeout = setTimeout(() => func(…args), wait);
};
}

// components/ui/Header/NotificationBell.tsx
import React from ‘react’;
import {
Box,
IconButton,
Badge,
Tooltip,
useColorModeValue
} from ‘@chakra-ui/react’;
import { BellIcon } from ‘@chakra-ui/icons’;

interface NotificationBellProps {
count?: number;
onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
count = 0,
onClick
}) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Box position="relative">
<Tooltip label="Notifications" placement="bottom">
<IconButton
icon={<BellIcon />}
variant=“ghost”
size=“sm”
color={textColor}
_hover={{ bg: hoverBg }}
onClick={onClick}
aria-label=“Notifications”
/>
</Tooltip>
{count > 0 && (
<Badge
position="absolute"
top="-1"
right="-1"
colorScheme="red"
borderRadius="full"
boxSize="18px"
fontSize="10px"
display="flex"
alignItems="center"
justifyContent="center"
>
{count > 99 ? ‘99+’ : count}
</Badge>
)}
</Box>
);
};

// components/ui/Header/ThemeToggle.tsx
import React from ‘react’;
import {
IconButton,
Tooltip,
useColorMode,
useColorModeValue
} from ‘@chakra-ui/react’;
import { MoonIcon, SunIcon } from ‘@chakra-ui/icons’;

export const ThemeToggle: React.FC = () => {
const { colorMode, toggleColorMode } = useColorMode();
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Tooltip
label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
placement=“bottom”
>
<IconButton
icon={colorMode === ‘light’ ? <MoonIcon /> : <SunIcon />}
onClick={toggleColorMode}
variant=“ghost”
size=“sm”
color={textColor}
_hover={{ bg: hoverBg }}
aria-label=“Toggle theme”
/>
</Tooltip>
);
};

// components/ui/Header/UserProfileMenu.tsx
import React from ‘react’;
import {
Menu,
MenuButton,
MenuList,
MenuItem,
Button,
HStack,
VStack,
Avatar,
Text,
useColorModeValue
} from ‘@chakra-ui/react’;
import { ChevronDownIcon } from ‘@chakra-ui/icons’;
import { User, MenuItem as MenuItemType } from ‘../../../types’;

interface UserProfileMenuProps {
user: User;
menuItems: MenuItemType[];
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
user,
menuItems
}) => {
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

return (
<Menu>
<MenuButton
as={Button}
variant=“ghost”
size=“sm”
rightIcon={<ChevronDownIcon />}
_hover={{ bg: hoverBg }}
_active={{ bg: hoverBg }}
>
<HStack spacing={2}>
<Avatar 
size="sm" 
name={user.name} 
src={user.avatar} 
bg="brand.500" 
/>
<VStack spacing={0} alignItems="flex-start">
<Text fontSize="sm" fontWeight="medium" color={textColor}>
{user.name}
</Text>
<Text fontSize="xs" color="gray.500">
{user.role}
</Text>
</VStack>
</HStack>
</MenuButton>
<MenuList>
{menuItems.map((item, index) => (
<MenuItem
key={index}
onClick={item.onClick}
color={item.color || textColor}
>
{item.label}
</MenuItem>
))}
</MenuList>
</Menu>
);
};

// components/ui/Header/Header.tsx
import React from ‘react’;
import {
Box,
Flex,
Container,
HStack,
IconButton,
Tooltip,
useColorModeValue
} from ‘@chakra-ui/react’;
import { SettingsIcon } from ‘@chakra-ui/icons’;
import { HeaderProps } from ‘../../../types’;
import { Logo } from ‘./Logo’;
import { NavigationMenu } from ‘./NavigationMenu’;
import { SearchBar } from ‘./SearchBar’;
import { NotificationBell } from ‘./NotificationBell’;
import { ThemeToggle } from ‘./ThemeToggle’;
import { UserProfileMenu } from ‘./UserProfileMenu’;

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
const bgColor = useColorModeValue(‘white’, ‘gray.800’);
const borderColor = useColorModeValue(‘gray.200’, ‘gray.700’);
const textColor = useColorModeValue(‘gray.800’, ‘white’);
const hoverBg = useColorModeValue(‘gray.100’, ‘gray.700’);

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
<Flex h={16} alignItems="center" justifyContent="space-between">
{/* Logo */}
<Logo />

```
      {/* Navigation */}
      <NavigationMenu 
        items={navigationItems}
        activeItem={activeNavItem}
        onItemClick={onNavItemClick}
      />

      {/* Right side actions */}
      <HStack spacing={4}>
        {/* Search */}
        {showSearch && (
          <SearchBar 
            placeholder="Search enterprise..."
            onSearch={onSearch}
            width="280px"
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
  </Container>
</Box>
```

);
};

// components/ui/Footer/Footer.tsx
import React from ‘react’;
import {
Box,
Container,
Flex,
Text,
VStack,
HStack,
Link,
Divider,
SimpleGrid,
useColorModeValue
} from ‘@chakra-ui/react’;
import { FooterProps } from ‘../../../types’;

export const Footer: React.FC<FooterProps> = ({
companyName = ‘Enterprise’,
year = new Date().getFullYear(),
links = []
}) => {
const bgColor = useColorModeValue(‘gray.50’, ‘gray.900’);
const borderColor = useColorModeValue(‘gray.200’, ‘gray.700’);
const textColor = useColorModeValue(‘gray.600’, ‘gray.300’);
const headingColor = useColorModeValue(‘gray.800’, ‘white’);

const defaultLinks = [
{
title: ‘Product’,
items: [
{ label: ‘Features’, href: ‘#features’ },
{ label: ‘Pricing’, href: ‘#pricing’ },
{ label: ‘Security’, href: ‘#security’ },
{ label: ‘Integrations’, href: ‘#integrations’ }
]
},
{
title: ‘Company’,
items: [
{ label: ‘About Us’, href: ‘#about’ },
{ label: ‘Careers’, href: ‘#careers’ },
{ label: ‘Blog’, href: ‘#blog’ },
{ label: ‘Press’, href: ‘#press’ }
]
},
{
title: ‘Support’,
items: [
{ label: ‘Help Center’, href: ‘#help’ },
{ label: ‘Documentation’, href: ‘#docs’ },
{ label: ‘Contact Us’, href: ‘#contact’ },
{ label: ‘Status’, href: ‘#status’ }
]
},
{
title: ‘Legal’,
items: [
{ label: ‘Privacy Policy’, href: ‘#privacy’ },
{ label: ‘Terms of Service’, href: ‘#terms’ },
{ label: ‘Cookie Policy’, href: ‘#cookies’ },
{ label: ‘GDPR’, href: ‘#gdpr’ }
]
}
];

const footerLinks = links.length > 0 ? links : defaultLinks;

return (
<Box
bg={bgColor}
borderTop="1px"
borderColor={borderColor}
mt="auto"
>
<Container maxW="8xl" px={6} py={12}>
<SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={8}>
{/* Company Info */}
<VStack align="flex-start" spacing={4}>
<Text fontSize="lg" fontWeight="bold" color={headingColor}>
{companyName}
</Text>
<Text fontSize="sm" color={textColor} maxW="250px">
Building the future of enterprise software with innovative
solutions and cutting-edge technology.
</Text>
</VStack>

```
      {/* Footer Links */}
      {footerLinks.map((section, index) => (
        <VStack key={index} align="flex-start" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
            {section.title}
          </Text>
          {section.items.map((item, itemIndex) => (
            <Link
              key={itemIndex}
              href={item.href}
              fontSize="sm"
              color={textColor}
              _hover={{ color: 'brand.500', textDecoration: 'underline' }}
            >
              {item.label}
            </Link>
          ))}
        </VStack>
      ))}
    </SimpleGrid>

    <Divider my={8} borderColor={borderColor} />

    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align="center"
      gap={4}
    >
      <Text fontSize="sm" color={textColor}>
        © {year} {companyName}. All rights reserved.
      </Text>
      <HStack spacing={6}>
        <Link
          href="#privacy"
          fontSize="sm"
          color={textColor}
          _hover={{ color: 'brand.500' }}
        >
          Privacy
        </Link>
        <Link
          href="#terms"
          fontSize="sm"
          color={textColor}
          _hover={{ color: 'brand.500' }}
        >
          Terms
        </Link>
        <Link
          href="#cookies"
          fontSize="sm"
          color={textColor}
          _hover={{ color: 'brand.500' }}
        >
          Cookies
        </Link>
      </HStack>
    </Flex>
  </Container>
</Box>
```

);
};

// components/common/Layout/Layout.tsx
import React from ‘react’;
import { Box, Flex } from ‘@chakra-ui/react’;
import { LayoutProps } from ‘../../../types’;
import { Header } from ‘../../ui/Header/Header’;
import { Footer } from ‘../../ui/Footer/Footer’;

export const Layout: React.FC<LayoutProps> = ({
children,
headerProps,
footerProps
}) => {
return (
<Flex direction="column" minH="100vh">
<Header {…headerProps} />
<Box flex="1">
{children}
</Box>
<Footer {…footerProps} />
</Flex>
);
};

// Example usage component
import React, { useState } from ‘react’;
import { ChakraProvider, Container, VStack, Text, extendTheme } from ‘@chakra-ui/react’;
import { Layout } from ‘./components/common/Layout/Layout’;
import { NavigationItem, User, MenuItem } from ‘./types’;

const theme = extendTheme({
colors: {
brand: {
50: ‘#fdf2f2’,
100: ‘#fce7e7’,
200: ‘#f9d5d5’,
300: ‘#f4b5b5’,
400: ‘#ec8989’,
500: ‘#dc2626’,
600: ‘#b91c1c’,
700: ‘#991b1b’,
800: ‘#7f1d1d’,
900: ‘#701a1a’,
}
},
config: {
initialColorMode: ‘light’,
useSystemColorMode: false,
}
});

const App: React.FC = () => {
const [activeNavItem, setActiveNavItem] = useState<string>(‘dashboard’);

const navigationItems: NavigationItem[] = [
{ id: ‘dashboard’, label: ‘Dashboard’, href: ‘/dashboard’ },
{ id: ‘analytics’, label: ‘Analytics’, href: ‘/analytics’ },
{ id: ‘projects’, label: ‘Projects’, href: ‘/projects’ },
{ id: ‘team’, label: ‘Team Management’, href: ‘/team’ },
{ id: ‘reports’, label: ‘Reports’, href: ‘/reports’ },
{ id: ‘settings’, label: ‘Settings’, href: ‘/settings’ },
{ id: ‘integrations’, label: ‘Integrations’, href: ‘/integrations’ },
{ id: ‘support’, label: ‘Support’, href: ‘/support’ },
{ id: ‘billing’, label: ‘Billing’, href: ‘/billing’ }
];

const user: User = {
id: ‘1’,
name: ‘John Doe’,
email: ‘john.doe@enterprise.com’,
role: ‘Administrator’
};

const userMenuItems: MenuItem[] = [
{ label: ‘View Profile’, onClick: () => console.log(‘Profile’) },
{ label: ‘Account Settings’, onClick: () => console.log(‘Settings’) },
{ label: ‘Preferences’, onClick: () => console.log(‘Preferences’) },
{ label: ‘Sign Out’, onClick: () => console.log(‘Sign out’), color: ‘red.500’ }
];

const handleNavClick = (item: NavigationItem) => {
setActiveNavItem(item.id);
console.log(‘Navigate to:’, item.href);
};

const headerProps = {
navigationItems,
activeNavItem,
onNavItemClick: handleNavClick,
user,
userMenuItems,
notificationCount: 5,
onNotificationClick: () => console.log(‘Notifications clicked’),
onSearch: (query: string) => console.log(‘Search:’, query)
};

return (
<ChakraProvider theme={theme}>
<Layout headerProps={headerProps}>
<Container maxW="8xl" px={6} py={8}>
<VStack spacing={6} align="stretch">
<Text fontSize="2xl" fontWeight="bold">
Welcome to Enterprise Dashboard
</Text>
<Text>
This is your main content area. The layout includes a sticky header
with navigation and a footer with company information.
</Text>
</VStack>
</Container>
</Layout>
</ChakraProvider>
);
};

export default App;




  
// components/ui/Header/Logo.tsx
import React from "react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    companyName?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", companyName = "Enterprise" }) => {
    const textColor = useColorModeValue("gray.800", "white");
    const logoSize = size === "lg" ? 12 : size === "sm" ? 8 : 10;
    const fontSize = size === "lg" ? "xl" : size === "sm" ? "md" : "lg";

    return (
        <Flex alignItems="center">
            <Box w={logoSize} h={logoSize} bg="brand.500" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" mr={3}>
                <Text color="white" fontWeight="bold" fontSize={fontSize}>
                    {companyName.charAt(0).toUpperCase()}
                </Text>
            </Box>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                {companyName}
            </Text>
        </Flex>
    );
};
