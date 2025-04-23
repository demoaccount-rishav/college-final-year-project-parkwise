import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Input, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th,
  useToast,
  Container,
  VStack,
  HStack,
  Spinner,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  InputGroup,
  InputLeftElement,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import UserData from './UserData';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const toast = useToast();

    // Color mode values matching CardsPage exactly
    const bgColor = useColorModeValue('white', 'gray.800');
    const tableBg = useColorModeValue('white', 'gray.700');
    const tableHeaderBg = useColorModeValue('gray.100', 'gray.600');
    const headingColor = useColorModeValue('gray.700', 'gray.200');
    const inputBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const boxShadow = useColorModeValue('sm', 'dark-lg');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const tableStripedColor = useColorModeValue('gray.50', 'gray.700');

    const getAllUser = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('api/user/getalluser');
            const data = await res.json();
            setUsers(data.data || []);
            const total = data.data?.length || 0;
            const active = data.data?.filter(user => user.status === 'active').length || 0;
            
            setTotalUsers(total);
            setActiveUsers(active);
        } catch (e) {
            console.error(e);
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteUser = async (userPhone) => {
        if (isDeleting) return;
        
        try {
            setIsDeleting(true);
            const res = await fetch(`api/user/deleteuser/${userPhone}`, {
                method: 'DELETE',
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setUsers(users.filter(user => user.userPhone !== userPhone));
                setTotalUsers(prev => prev - 1);
                if (users.find(user => user.userPhone === userPhone)?.status === 'active') {
                    setActiveUsers(prev => prev - 1);
                }
                toast({
                    title: 'Success',
                    description: data.message||'User and associated cycle deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to delete user',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right'
                });
            }
        } catch (e) {
            console.error(e);
            toast({
                title: 'Error',
                description: 'An error occurred while deleting the user',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            });
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        getAllUser();
    }, []);

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading as="h1" size="xl" color={headingColor}>User Management</Heading>
                    
                    <HStack spacing={6}>
                        <Stat textAlign="center" minW="150px">
                            <StatLabel color={headingColor}>Total Cycles</StatLabel>
                            <StatNumber>{totalUsers}</StatNumber>
                        </Stat>
                    </HStack>
                </HStack>
                
                <Box 
                    bg={bgColor}
                    p={6} 
                    borderRadius="lg" 
                    boxShadow={boxShadow}
                    borderWidth="1px"
                    borderColor={borderColor}
                >
                    <InputGroup maxW="md" mb={6}>
                        <InputLeftElement pointerEvents="none">
                            <Icon as={SearchIcon} color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="md"
                            focusBorderColor="blue.500"
                            borderRadius="md"
                            bg={inputBg}
                        />
                    </InputGroup>

                    {isLoading ? (
                        <Flex justify="center" align="center" minH="200px">
                            <Spinner size="xl" />
                        </Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table 
                                variant="striped" 
                                colorScheme="gray"
                                bg={tableBg}
                            >
                                <Thead bg={tableHeaderBg}>
                                    <Tr>
                                        <Th>Cycle ID</Th>
                                        <Th>Name</Th>
                                        <Th>Phone Number</Th>
                                        <Th textAlign="right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <UserData 
                                        users={users} 
                                        search={search} 
                                        onDelete={handleDeleteUser}
                                        isDeleting={isDeleting}
                                        darkModeProps={{
                                            stripedColor: tableStripedColor,
                                            hoverBg: hoverBg
                                        }}
                                    />
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </VStack>
        </Container>
    );
}