// components/ui/Header/UserProfileMenu.tsx
import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button, HStack, VStack, Avatar, Text, useColorModeValue } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { User, MenuItem as MenuItemType } from "../../../types";

interface UserProfileMenuProps {
    user: User;
    menuItems: MenuItemType[];
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, menuItems }) => {
    const textColor = useColorModeValue("gray.800", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <Menu>
            <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<ChevronDownIcon />} _hover={{ bg: hoverBg }} _active={{ bg: hoverBg }}>
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
                    <MenuItem key={index} onClick={item.onClick} color={item.color || textColor}>
                        {item.label}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
};

// components/ui/Header/Header.tsx
import React from "react";
import { Box, Flex, Container, HStack, IconButton, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { HeaderProps } from "../../../types";
import { Logo } from "./Logo";
import { NavigationMenu } from "./NavigationMenu";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { UserProfileMenu } from "./UserProfileMenu";

export const Header: React.FC<HeaderProps> = ({ navigationItems, activeNavItem, onNavItemClick, user, userMenuItems, notificationCount = 0, onNotificationClick, onSearch, showSearch = true, showSettings = true }) => {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <Box bg={bgColor} borderBottom="1px" borderColor={borderColor} position="sticky" top={0} zIndex={1000} boxShadow="sm">
            <Container maxW="8xl" px={6}>
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    {/* Logo */}
                    <Logo />

                    {/* Navigation */}
                    <NavigationMenu items={navigationItems} activeItem={activeNavItem} onItemClick={onNavItemClick} />

                    {/* Right side actions */}
                    <HStack spacing={4}>
                        {/* Search */}
                        {showSearch && <SearchBar placeholder="Search enterprise..." onSearch={onSearch} width="280px" />}

                        {/* Notifications */}
                        <NotificationBell count={notificationCount} onClick={onNotificationClick} />

                        {/* Settings */}
                        {showSettings && (
                            <Tooltip label="Settings" placement="bottom">
                                <IconButton icon={<SettingsIcon />} variant="ghost" size="sm" color={textColor} _hover={{ bg: hoverBg }} aria-label="Settings" />
                            </Tooltip>
                        )}

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Profile */}
                        <UserProfileMenu user={user} menuItems={userMenuItems} />
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

