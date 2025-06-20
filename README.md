// components/ui/Header/ThemeToggle.tsx
import React from "react";
import { IconButton, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export const ThemeToggle: React.FC = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const textColor = useColorModeValue("gray.800", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <Tooltip label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`} placement="bottom">
            <IconButton icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode} variant="ghost" size="sm" color={textColor} _hover={{ bg: hoverBg }} aria-label="Toggle theme" />
        </Tooltip>
    );
};
