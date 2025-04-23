import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  Avatar
} from '@chakra-ui/react';
import { FaPhone, FaMoneyBillWave, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import NavbarUser from '../../components/Navigation/NavbarUser';

const ViewCardDetails = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Memoized functions
  const formatDate = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  const getBalanceColor = useCallback((balance) => {
    if (balance <= 100) return 'red';
    if (balance <= 500) return 'orange';
    return 'green';
  }, []);

  const showErrorToast = useCallback((message = 'Internal server error') => {
    toast({
      title: 'User login required',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const fetchData = useCallback(async (url, setData) => {
    try {
      const response = await axios.get(url, { withCredentials: true });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
        showErrorToast(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('There is nothing to show here');
    }
  }, [showErrorToast]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchData('api/user/cookie-based-view-user', setUserData),
          fetchData('api/card/cookie-based-view-card-details', setCardData)
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchData]);

  // Loading state
  if (loading) {
    return (
      <>
        <NavbarUser />
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <NavbarUser />
        <Container maxW="container.xl" py={8}>
          <Alert status="error" variant="subtle" borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  // No card data state
  if (!cardData) {
    return (
      <>
        <NavbarUser />
        <Container maxW="container.xl" py={8}>
          <Alert status="info" variant="subtle" borderRadius="lg">
            <AlertIcon />
            No card data available
          </Alert>
        </Container>
      </>
    );
  }

  // Reusable Transaction Table Component
  const TransactionTable = ({ transactions, type }) => {
    const colorScheme = type === 'credit' ? 'green' : 'red';
    const iconColor = type === 'credit' ? 'green.500' : 'red.500';
    const sign = type === 'credit' ? '+' : '-';
    const emptyMessage = `No ${type} transactions found`;

    return (
      <Box>
        <Heading size="sm" mb={4} color={iconColor} display="flex" alignItems="center">
          <Box as={FaMoneyBillWave} mr={2} />
          {type === 'credit' ? 'Credit' : 'Debit'} Transactions
        </Heading>
        {transactions.length > 0 ? (
          <Box 
            overflowX="auto"
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            maxH="400px" // Fixed height
            overflowY="auto" // Scrollable vertically
          >
            <Table variant="striped" colorScheme={colorScheme} size="sm">
              <Thead position="sticky" top={0} bg={`${colorScheme}.50`} zIndex="docked">
                <Tr>
                  <Th>Amount</Th>
                  <Th>Date/Time</Th>
                  <Th>Transaction ID</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction._id} _hover={{ bg: `${colorScheme}.50` }}>
                    <Td>
                      <Badge colorScheme={colorScheme} variant="solid" px={3} py={1}>
                        {sign}₹{transaction.amount.toFixed(2)}
                      </Badge>
                    </Td>
                    <Td whiteSpace="nowrap">{formatDate(transaction.timestamp)}</Td>
                    <Td>
                      <Text 
                        fontFamily="monospace" 
                        fontSize="sm"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        maxW="200px"
                      >
                        {transaction._id}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Alert status="info" variant="subtle" borderRadius="lg">
            <AlertIcon />
            {emptyMessage}
          </Alert>
        )}
      </Box>
    );
  };

  // Reusable Stat Card Component
  const StatCard = ({ icon, label, value, isDate = false }) => (
    <Stat p={4} bg={sectionBg} borderRadius="lg">
      <StatLabel display="flex" alignItems="center">
        <Box as={icon} mr={2} /> {label}
      </StatLabel>
      {isDate ? (
        <Text fontSize="lg">{formatDate(value)}</Text>
      ) : (
        <StatNumber fontSize="2xl">{value}</StatNumber>
      )}
    </Stat>
  );

  return (
    <>
      <NavbarUser />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl" fontWeight="bold" color="blue.600">
              Card Details
            </Heading>
            {userData && (
              <Tag size="lg" colorScheme="blue" borderRadius="full">
                <Avatar size="xs" name={userData.phoneNumber} ml={-1} mr={2} />
                <TagLabel>{userData.user.userName}</TagLabel>
              </Tag>
            )}
          </Flex>

          {/* Summary Card */}
          <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" display="flex" alignItems="center">
                <Box as={FaMoneyBillWave} mr={2} color="green.500" />
                Account Summary
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <Stat p={4} bg={sectionBg} borderRadius="lg">
                    <StatLabel display="flex" alignItems="center">
                      <Box as={FaMoneyBillWave} mr={2} /> Current Balance
                    </StatLabel>
                    <StatNumber fontSize="2xl">
                      <Badge
                        colorScheme={getBalanceColor(cardData.currentBalance)}
                        fontSize="md"
                        px={4}
                        py={2}
                        borderRadius="full"
                      >
                        ₹{cardData.currentBalance.toFixed(2)}
                      </Badge>
                    </StatNumber>
                  </Stat>
                </GridItem>
                <GridItem>
                  <StatCard icon={FaPhone} label="Phone Number" value={cardData.phoneNumber} />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={FaCalendarAlt}
                    label="Account Created"
                    value={cardData.createdAt}
                    isDate
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={FaHistory}
                    label="Last Updated"
                    value={cardData.updatedAt}
                    isDate
                  />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Transactions Section */}
          <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" display="flex" alignItems="center">
                <Box as={FaHistory} mr={2} color="blue.500" />
                Transaction History
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={8} align="stretch">
                <TransactionTable transactions={cardData.credit} type="credit" />
                <Divider borderColor={borderColor} />
                <TransactionTable transactions={cardData.debit} type="debit" />
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </>
  );
};

export default React.memo(ViewCardDetails);