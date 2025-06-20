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

// components/ui/Footer/Footer.tsx
import React from "react";
import { Box, Container, Flex, Text, VStack, HStack, Link, Divider, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import { FooterProps } from "../../../types";

export const Footer: React.FC<FooterProps> = ({ companyName = "Enterprise", year = new Date().getFullYear(), links = [] }) => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "white");

    const defaultLinks = [
        {
            title: "Product",
            items: [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Security", href: "#security" },
                { label: "Integrations", href: "#integrations" },
            ],
        },
        {
            title: "Company",
            items: [
                { label: "About Us", href: "#about" },
                { label: "Careers", href: "#careers" },
                { label: "Blog", href: "#blog" },
                { label: "Press", href: "#press" },
            ],
        },
        {
            title: "Support",
            items: [
                { label: "Help Center", href: "#help" },
                { label: "Documentation", href: "#docs" },
                { label: "Contact Us", href: "#contact" },
                { label: "Status", href: "#status" },
            ],
        },
        {
            title: "Legal",
            items: [
                { label: "Privacy Policy", href: "#privacy" },
                { label: "Terms of Service", href: "#terms" },
                { label: "Cookie Policy", href: "#cookies" },
                { label: "GDPR", href: "#gdpr" },
            ],
        },
    ];

    const footerLinks = links.length > 0 ? links : defaultLinks;

    return (
        <Box bg={bgColor} borderTop="1px" borderColor={borderColor} mt="auto">
            <Container maxW="8xl" px={6} py={12}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={8}>
                    {/* Company Info */}
                    <VStack align="flex-start" spacing={4}>
                        <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                            {companyName}
                        </Text>
                        <Text fontSize="sm" color={textColor} maxW="250px">
                            Building the future of enterprise software with innovative solutions and cutting-edge technology.
                        </Text>
                    </VStack>

                    {/* Footer Links */}
                    {footerLinks.map((section, index) => (
                        <VStack key={index} align="flex-start" spacing={3}>
                            <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
                                {section.title}
                            </Text>
                            {section.items.map((item, itemIndex) => (
                                <Link key={itemIndex} href={item.href} fontSize="sm" color={textColor} _hover={{ color: "brand.500", textDecoration: "underline" }}>
                                    {item.label}
                                </Link>
                            ))}
                        </VStack>
                    ))}
                </SimpleGrid>

                <Divider my={8} borderColor={borderColor} />

                <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
                    <Text fontSize="sm" color={textColor}>
                        © {year} {companyName}. All rights reserved.
                    </Text>
                    <HStack spacing={6}>
                        <Link href="#privacy" fontSize="sm" color={textColor} _hover={{ color: "brand.500" }}>
                            Privacy
                        </Link>
                        <Link href="#terms" fontSize="sm" color={textColor} _hover={{ color: "brand.500" }}>
                            Terms
                        </Link>
                        <Link href="#cookies" fontSize="sm" color={textColor} _hover={{ color: "brand.500" }}>
                            Cookies
                        </Link>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

// components/common/Layout/Layout.tsx
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { LayoutProps } from '../../../types';
import { Header } from '../../ui/Header/Header';
import { Footer } from '../../ui/Footer/Footer';

export const Layout: React.FC<LayoutProps> = ({
  children,
  headerProps,
  footerProps
}) => {
  return (
    <Flex direction="column" minH="100vh">
      <Header {...headerProps} />
      <Box flex="1">
        {children}
      </Box>
      <Footer {...footerProps} />
    </Flex>
  );
};