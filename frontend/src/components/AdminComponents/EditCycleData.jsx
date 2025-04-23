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
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import CycleData from './CycleData';

export default function EditCycleData() {
  const [zone, setZone] = useState([]);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingExit, setIsUpdatingExit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    total: 0,
    online: 0,
    offline: 0
  });
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const boxShadow = useColorModeValue('sm', 'dark-lg');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getAllCycle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('api/cycle/findallcycle');
      
      if (res.status === 401) {
        throw new Error('Admin login required');
      }
      
      if (!res.ok) {
        throw new Error(`Failed to fetch data`);
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch cycles');
      }

      setZone(data.data || []);
      
      // Calculate counts
      const total = data.data?.length || 0;
      const online = data.data?.filter(cycle => cycle.zoneId !== "offline").length || 0;
      const offline = total - online;

      setCounts({
        total,
        online,
        offline
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: err.message.includes('login') ? 'Admin login required' : err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    if (!window.confirm(`Are you sure you want to delete cycle ${cycleId}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`api/cycle/deletecycle/${cycleId}`, {
        method: 'DELETE',
      });
      
      if (response.status === 401) {
        throw new Error('Admin login required');
      }
      
      if (!response.ok) {
        throw new Error('Failed to delete cycle');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete cycle');
      }

      toast({
        title: 'Success',
        description: `Cycle ${cycleId} deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await getAllCycle();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message.includes('login') ? 'Admin login required' : err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateExit = async (cycleId) => {
    if (!window.confirm(`Update exit time for ${cycleId}? This will mark the cycle as offline.`)) {
      return;
    }

    setIsUpdatingExit(true);
    try {
      const response = await fetch(`api/cycle/${cycleId}/update-exit`, {
        method: 'PUT',
      });
      
      if (response.status === 401) {
        throw new Error('Admin login required');
      }
      
      if (!response.ok) {
        throw new Error('Failed to update exit time');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to update exit time');
      }

      toast({
        title: 'Success',
        description: `Exit time updated for ${cycleId}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await getAllCycle();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message.includes('login') ? 'Admin login required' : err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingExit(false);
    }
  };

  useEffect(() => {
    getAllCycle();
  }, []);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error.includes('login') ? 'Admin login required' : error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">Registered Cycles</Heading>
          <Stat textAlign="right" minW="200px">
            <StatLabel>Total Cycles</StatLabel>
            <StatNumber>{counts.total}</StatNumber>
          </Stat>
        </HStack>

        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow={boxShadow} borderWidth="1px" borderColor={borderColor}>
          <InputGroup maxW="md" mb={6}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by CycleID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="md"
              focusBorderColor="blue.500"
              borderRadius="md"
              bg={inputBg}
            />
          </InputGroup>

          <Box overflowX="auto">
            <Table variant="striped" colorScheme="gray">
              <Thead bg={tableBg}>
                <Tr>
                  <Th>Cycle ID</Th>
                  <Th>Zone Status</Th>
                  <Th>Last Entry</Th>
                  <Th>Last Exit</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                <CycleData
                  zone={zone}
                  search={search}
                  onDelete={handleDeleteCycle}
                  onUpdateExit={handleUpdateExit}
                  isDeleting={isDeleting}
                  isUpdatingExit={isUpdatingExit}
                  hoverBg={hoverBg}
                />
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}