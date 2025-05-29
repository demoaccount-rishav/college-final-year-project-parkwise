import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Container,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon, DeleteIcon } from '@chakra-ui/icons';

const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('gray.100', 'gray.700');
  const tableStriped = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const boxShadow = useColorModeValue('sm', 'dark-lg');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchCards = async () => {
    try {
      const response = await fetch('api/card/getallcard');
      const data = await response.json();

      if (!response.ok) {
        throw new Error();
        // throw new Error(data.message || 'Failed to fetch cards');
      }

      setCards(data.data);
      setFilteredCards(data.data);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Admin login required',
        // description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter(card => 
        card.phoneNumber.includes(searchTerm)
      );
      setFilteredCards(filtered);
    }
  }, [searchTerm, cards]);

  const handleDeleteCard = async (phoneNumber) => {
    if (!window.confirm(`Are you sure you want to delete card for ${phoneNumber}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`api/card/delete/${phoneNumber}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete card');
      }

      toast({
        title: 'Success',
        description: `Card for ${phoneNumber} deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the card list
      await fetchCards();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getBalanceColor = (balance) => {
    if (balance <= 100) return 'red';
    if (balance <= 500) return 'orange';
    return 'green';
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">Card Management</Heading>
          <Stat textAlign="right" minW="200px">
            <StatLabel>Total Cards</StatLabel>
            <StatNumber>{cards.length}</StatNumber>
          </Stat>
        </HStack>

        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow={boxShadow} borderWidth="1px" borderColor={borderColor}>
          <InputGroup maxW="md" mb={6}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              focusBorderColor="blue.500"
              borderRadius="md"
              bg={inputBg}
            />
          </InputGroup>

          {filteredCards.length === 0 ? (
            <Alert status="info" colorScheme="red">
              <AlertIcon />
              {searchTerm ? 'No cards match your search' : 'No cards found'}
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="striped" colorScheme="gray">
                <Thead bg={tableBg}>
                  <Tr>
                    <Th>Phone Number</Th>
                    <Th>Current Balance (₹)</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCards.map((card) => (
                    <Tr key={card._id} _hover={{ bg: hoverBg }}>
                      <Td>{card.phoneNumber}</Td>
                      <Td>
                        <Badge 
                          colorScheme={getBalanceColor(card.currentBalance)}
                          fontSize="md"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          ₹{card.currentBalance}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={card.currentBalance > 20 ? 'green' : 'red'}
                          variant="subtle"
                        >
                          {card.currentBalance > 20 ? 'Active' : 'Zero Balance'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          leftIcon={<DeleteIcon />}
                          onClick={() => handleDeleteCard(card.phoneNumber)}
                          isLoading={isDeleting}
                          loadingText="Deleting"
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default CardsPage;