// components/ui/Header/NavigationMenu.tsx
import React from "react";
import {
  Button,
  HStack,
  useColorModeValue
} from "@chakra-ui/react";
import {
  NavigationItem
} from "../../../types";

interface NavigationMenuProps {
  items: NavigationItem[];
  activeItem ? : string;
  onItemClick ? : (item: NavigationItem) => void;
}

export const NavigationMenu: React.FC < NavigationMenuProps > = ({
  items,
  activeItem,
  onItemClick,
}) => {
  const textColor = useColorModeValue("gray.800", "white");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const activeBg = useColorModeValue("brand.50", "brand.900");

  return ( <
    HStack spacing = {
      1
    } > {
      items.map((item) => ( <
        Button key = {
          item.id
        }
        variant = "ghost"
        size = "sm"
        color = {
          activeItem === item.id ? "brand.500" : textColor
        }
        bg = {
          activeItem === item.id ? activeBg : "transparent"
        }
        _hover = {
          {
            bg: hoverBg,
            color: "brand.500"
          }
        }
        _active = {
          {
            bg: "brand.50"
          }
        }
        fontWeight = {
          activeItem === item.id ? "semibold" : "medium"
        }
        onClick = {
          () => onItemClick?.(item)
        } >
        {
          item.label
        } <
        /Button>
      ))
    } <
    /HStack>
  );
};
---