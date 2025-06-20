// components/ui/Header/NotificationBell.tsx
import React from "react";
import { Box, IconButton, Badge, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

interface NotificationBellProps {
    count?: number;
    onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count = 0, onClick }) => {
    const textColor = useColorModeValue("gray.800", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <Box position="relative">
            <Tooltip label="Notifications" placement="bottom">
                <IconButton icon={<BellIcon />} variant="ghost" size="sm" color={textColor} _hover={{ bg: hoverBg }} onClick={onClick} aria-label="Notifications" />
            </Tooltip>
            {count > 0 && (
                <Badge position="absolute" top="-1" right="-1" colorScheme="red" borderRadius="full" boxSize="18px" fontSize="10px" display="flex" alignItems="center" justifyContent="center">
                    {count > 99 ? "99+" : count}
                </Badge>
            )}
        </Box>
    );
};
