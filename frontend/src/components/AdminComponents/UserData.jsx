import React from 'react';
import { 
    Tr, 
    Td, 
    Button, 
    Badge,
    useToast,
    useColorModeValue 
} from '@chakra-ui/react';
import { DeleteIcon } from "@chakra-ui/icons";

export default function UserData({ users, search, onDelete, isDeleting }) {
    const toast = useToast();

    // Get the hover background color based on color mode
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.200');
    const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
    const badgeBg = useColorModeValue('blue.100', 'blue.700');

    const filteredUsers = users.filter((item) => {
        return search.toLowerCase() === '' ? item : (
            item.userPhone.toLowerCase().includes(search) || 
            item.userName.toLowerCase().includes(search)
        );
    });

    if (filteredUsers.length === 0) {
        return (
            <Tr>
                <Td colSpan={4} textAlign="center" py={10} color={textColor}>
                    No users found
                </Td>
            </Tr>
        );
    }

    return (
        <>
            {filteredUsers.map((data) => {
                const { _id, userName, userPhone, cycleId } = data;
                return (
                    <Tr 
                        key={_id} 
                        _hover={{ bg: hoverBg }}
                        transition="background-color 0.2s ease"
                    >
                        <Td>
                            <Badge 
                                colorScheme="blue" 
                                fontSize="sm"
                                bg={badgeBg}
                                px={2}
                                py={1}
                                borderRadius="full"
                            >
                                {cycleId}
                            </Badge>
                        </Td>
                        <Td fontWeight="medium" color={textColor}>
                            {userName}
                        </Td>
                        <Td color={subtleTextColor}>{userPhone}</Td>
                        <Td textAlign="right">
                            <Button
                                leftIcon={<DeleteIcon />}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm(`Delete ${userName} (${userPhone})?`)) {
                                        onDelete(userPhone);
                                    }
                                }}
                                isLoading={isDeleting}
                                loadingText="Deleting"
                                disabled={isDeleting}
                                _hover={{
                                    bg: useColorModeValue('red.50', 'red.900')
                                }}
                            >
                                Delete
                            </Button>
                        </Td>
                    </Tr>
                );
            })}
        </>
    );
}