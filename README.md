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
