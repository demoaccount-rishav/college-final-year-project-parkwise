import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Badge,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TagLeftIcon,
  useColorModeValue,
  Flex,
  Stack,
  Alert,
  AlertIcon,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Avatar
} from '@chakra-ui/react';
import { FaBicycle, FaClock, FaMapMarkerAlt, FaWallet, FaHistory, FaMoneyBillWave, FaPhone } from 'react-icons/fa';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarUser from '../../components/Navigation/NavbarUser';

const ViewUserCycleDetails = () => {
  const navigate = useNavigate();
  const [cycleData, setCycleData] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const showErrorToast = useCallback((message = 'Failed to fetch data') => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cycleResponse, cardResponse] = await Promise.all([
        axios.get('api/cycle/cookie-based-view-user-cycle-details', { withCredentials: true }),
        axios.get('api/card/cookie-based-view-card-details', { withCredentials: true })
      ]);

      if (cycleResponse.data.success && cardResponse.data.success) {
        setCycleData(cycleResponse.data.data);
        setCardData(cardResponse.data.data);
      } else {
        setError('Failed to fetch data');
        showErrorToast('Failed to fetch data');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch data');
      showErrorToast(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString();
  }, []);

  const getStatusBadge = (zoneId) => {
    if (zoneId === 'offline') {
      return (
        <Tag colorScheme="red" size="md" px={3} py={1} borderRadius="full">
          <TagLeftIcon as={FaMapMarkerAlt} />
          <TagLabel>Offline</TagLabel>
        </Tag>
      );
    }
    return (
      <Tag colorScheme="green" size="md" px={3} py={1} borderRadius="full">
        <TagLeftIcon as={FaMapMarkerAlt} />
        <TagLabel>Zone {zoneId}</TagLabel>
      </Tag>
    );
  };

  const StatCard = ({ icon, label, value }) => (
    <Stat p={4} bg={sectionBg} borderRadius="lg">
      <StatLabel display="flex" alignItems="center">
        <Box as={icon} mr={2} /> {label}
      </StatLabel>
      <StatNumber fontSize="xl">{value}</StatNumber>
    </Stat>
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <NavbarUser />
        <Alert status="error" variant="subtle" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!cycleData || !cardData) {
    return (
      <Container maxW="container.xl" py={8}>
        <NavbarUser />
        <Alert status="info" variant="subtle" borderRadius="lg">
          <AlertIcon />
          No data available
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <NavbarUser />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" fontWeight="bold" color="blue.600">
            <HStack>
              <FaBicycle />
              <Text>Your Cycle & Card Details</Text>
            </HStack>
          </Heading>

          {/* Card Details */}
          <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" display="flex" alignItems="center">
                <Box as={FaWallet} mr={2} color="blue.500" />
                Card Information
              </Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <StatCard
                    icon={FaMoneyBillWave}
                    label="Current Balance"
                    value={`₹${cardData.currentBalance.toFixed(2)}`}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={FaPhone}
                    label="Phone Number"
                    value={cardData.phoneNumber}
                  />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Cycle Details */}
          {cycleData.map((cycle, index) => (
            <Card key={index} bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" display="flex" alignItems="center">
                    <Box as={FaBicycle} mr={2} />
                    Cycle {cycle.cycleId}
                  </Heading>
                  {getStatusBadge(cycle.zoneId)}
                </Flex>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="sm" mb={4} display="flex" alignItems="center">
                      <Box as={FaHistory} mr={2} />
                      Entry/Exit History
                    </Heading>
                    {cycle.entryExitTimes.length > 0 ? (
                      <Box
                        overflowX="auto"
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={borderColor}
                        maxH="400px" // Fixed height
                        overflowY="auto" // Scrollable vertically
                      >
                        <Table variant="striped" colorScheme="blue" size="sm">
                          <Thead position="sticky" top={0} bg="blue.50" zIndex="docked">
                            <Tr>
                              <Th>Entry Time</Th>
                              <Th>Exit Time</Th>
                              <Th>Duration</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {cycle.entryExitTimes.map((time, idx) => (
                              <Tr key={idx}>
                                <Td whiteSpace="nowrap">{formatDate(time.entry)}</Td>
                                <Td whiteSpace="nowrap">{time.exit ? formatDate(time.exit) : 'Still parked'}</Td>
                                <Td whiteSpace="nowrap">
                                  {time.exit
                                    ? `${((new Date(time.exit) - new Date(time.entry)) / (1000 * 60)).toFixed(2)} minutes`
                                    : 'Not exited yet'
                                  }
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Alert status="info" variant="subtle" borderRadius="lg">
                        <AlertIcon />
                        No entry/exit records found
                      </Alert>
                    )}
                  </Box>

                  <Box>
                    <Heading size="sm" mb={4} display="flex" alignItems="center">
                      <Box as={FaClock} mr={2} />
                      Current Status
                    </Heading>
                    {cycle.zoneId === 'offline' ? (
                      <Badge colorScheme="red" px={4} py={2} borderRadius="full" fontSize="md">
                        Currently offline - not in any zone
                      </Badge>
                    ) : (
                      <Badge colorScheme="green" px={4} py={2} borderRadius="full" fontSize="md">
                        Currently parked in Zone {cycle.zoneId}
                      </Badge>
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Container>
    </Box>
  );
};

export default ViewUserCycleDetails;