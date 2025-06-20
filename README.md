// Example usage component
import React, { useState } from "react";
import { ChakraProvider, Container, VStack, Text, extendTheme } from "@chakra-ui/react";
import { Layout } from "./components/common/Layout/Layout";
import { NavigationItem, User, MenuItem } from "./types";

const theme = extendTheme({
    colors: {
        brand: {
            50: "#fdf2f2",
            100: "#fce7e7",
            200: "#f9d5d5",
            300: "#f4b5b5",
            400: "#ec8989",
            500: "#dc2626",
            600: "#b91c1c",
            700: "#991b1b",
            800: "#7f1d1d",
            900: "#701a1a",
        },
    },
    config: {
        initialColorMode: "light",
        useSystemColorMode: false,
    },
});

const App: React.FC = () => {
    const [activeNavItem, setActiveNavItem] = useState < string > "dashboard";

    const navigationItems: NavigationItem[] = [
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        { id: "analytics", label: "Analytics", href: "/analytics" },
        { id: "projects", label: "Projects", href: "/projects" },
        { id: "team", label: "Team Management", href: "/team" },
        { id: "reports", label: "Reports", href: "/reports" },
        { id: "settings", label: "Settings", href: "/settings" },
        { id: "integrations", label: "Integrations", href: "/integrations" },
        { id: "support", label: "Support", href: "/support" },
        { id: "billing", label: "Billing", href: "/billing" },
    ];

    const user: User = {
        id: "1",
        name: "John Doe",
        email: "john.doe@enterprise.com",
        role: "Administrator",
    };

    const userMenuItems: MenuItem[] = [
        { label: "View Profile", onClick: () => console.log("Profile") },
        { label: "Account Settings", onClick: () => console.log("Settings") },
        { label: "Preferences", onClick: () => console.log("Preferences") },
        { label: "Sign Out", onClick: () => console.log("Sign out"), color: "red.500" },
    ];

    const handleNavClick = (item: NavigationItem) => {
        setActiveNavItem(item.id);
        console.log("Navigate to:", item.href);
    };

    const headerProps = {
        navigationItems,
        activeNavItem,
        onNavItemClick: handleNavClick,
        user,
        userMenuItems,
        notificationCount: 5,
        onNotificationClick: () => console.log("Notifications clicked"),
        onSearch: (query: string) => console.log("Search:", query),
    };

    return (
        <ChakraProvider theme={theme}>
            <Layout headerProps={headerProps}>
                <Container maxW="8xl" px={6} py={8}>
                    <VStack spacing={6} align="stretch">
                        <Text fontSize="2xl" fontWeight="bold">
                            Welcome to Enterprise Dashboard
                        </Text>
                        <Text>This is your main content area. The layout includes a sticky header with navigation and a footer with company information.</Text>
                    </VStack>
                </Container>
            </Layout>
        </ChakraProvider>
    );
};

export default App;
