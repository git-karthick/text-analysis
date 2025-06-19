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