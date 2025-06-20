// components/ui/Header/SearchBar.tsx
import React, { useState, useCallback } from "react";
import { Input, InputGroup, InputLeftElement, useColorModeValue } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    width?: string;
    debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", onSearch, width = "300px", debounceMs = 300 }) => {
    const [query, setQuery] = useState("");
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");

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
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: "brand.300" }}
                _focus={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 1px #dc2626",
                }}
            />
        </InputGroup>
    );
};
