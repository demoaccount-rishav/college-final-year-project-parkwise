import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Badge,
  Spinner,
  useToast,
  Stack,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaQrcode, FaMapMarkerAlt, FaWallet, FaBicycle, FaMoneyBillWave } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import NavbarUser from '../../components/Navigation/NavbarUser';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function UserPage() {
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardText = useColorModeValue('gray.600', 'gray.200');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  // User and card data state
  const [userData, setUserData] = useState({
    userName: '',
    balance: 0,
    cycles: [],
    lastUpdated: new Date(),
    isLoading: true,
    isRefreshing: false
  });

  // QR Scanner state
  const [cycleIds, setCycleIds] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [scannedZoneId, setScannedZoneId] = useState('');
  const [isScannerLoading, setIsScannerLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [apiError, setApiError] = useState('');
  const scannerRef = useRef(null);

  // Fetch user and card data
  const fetchUserData = async () => {
    try {
      setUserData(prev => ({ ...prev, isLoading: true }));

      // Fetch user details
      const [userResponse, cardResponse] = await Promise.all([
        axios.get('api/user/cookie-based-view-user', { withCredentials: true }),
        axios.get('api/card/cookie-based-view-card-details', { withCredentials: true })
      ]);

      if (userResponse.data.success && cardResponse.data.success) {
        setUserData({
          userName: userResponse.data.data.user.userName,
          balance: cardResponse.data.data.currentBalance,
          cycles: userResponse.data.data.userCycles,
          lastUpdated: new Date(),
          isLoading: false,
          isRefreshing: false
        });
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch user data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setUserData(prev => ({ ...prev, isLoading: false, isRefreshing: false }));
    }
  };

  const fetchCycleIds = useCallback(async () => {
    try {
      setIsScannerLoading(true);
      const response = await fetch('api/cycle/cookie-based-view-user-cycle-details', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const offlineCycles = data.data.filter(cycle => cycle.zoneId === "offline");
        setCycleIds(offlineCycles.map(cycle => cycle.cycleId));
      } else {
        throw new Error(data.message || 'Failed to fetch cycle details');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setApiError(error.message);
    } finally {
      setIsScannerLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserData();
    fetchCycleIds();
  }, [fetchCycleIds]);

  // Refresh all data function
  const refreshAllData = () => {
    setUserData(prev => ({ ...prev, isRefreshing: true }));
    stopScanner(); // Stop scanning if active
    fetchUserData();
    fetchCycleIds();
    setSelectedCycleId('');
    setScannedZoneId('');
  };

  // QR Scanner functions
  const startScanner = () => {
    setIsScanning(true);
    setScannedZoneId('');
    setApiError('');
    
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );

    scanner.render(
      (decodedText) => handleScanSuccess(decodedText, scanner),
      (errorMessage) => {
        console.warn(`QR Code scan error: ${errorMessage}`);
        toast({
          title: 'Scan Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    );

    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to stop scanner", error);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText, scanner) => {
    stopScanner();
    
    let zoneId;
    try {
      const parsed = JSON.parse(decodedText);
      zoneId = parsed.zoneId || decodedText;
    } catch (e) {
      zoneId = decodedText;
    }

    setScannedZoneId(zoneId);
    toast({
      title: 'QR Code Scanned',
      description: `Zone ID: ${zoneId}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleScannerSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!selectedCycleId || !scannedZoneId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a cycle and scan a zone',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsScannerLoading(true);
      const response = await fetch('api/cycle/cookie-based-update-entry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cycleId: selectedCycleId,
          zoneId: scannedZoneId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update entry');
      }

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setSelectedCycleId('');
        setScannedZoneId('');
        await fetchCycleIds();
        refreshAllData(); // Refresh all data after successful update
      } else {
        throw new Error(data.message || 'Failed to update entry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setApiError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsScannerLoading(false);
    }
  };

  // Handle pay and exit for a cycle
  const handlePayAndExit = async (cycleId) => {
    try {
      const response = await axios.put(
        'api/cycle/cookie-based-pay-exit-single-user-cycle',
        { cycleId },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        refreshAllData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process payment and exit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <NavbarUser />
      <Box minH="100vh">
        <Container maxW="container.xl" py={8}>
          <Heading as="h1" size="xl" mb={8} color={accentColor}>
            <HStack>
              <Icon as={FaBicycle} />
              <Text>
                {userData.isLoading ? 'Loading...' : `Hello ${userData.userName}`}
              </Text>
            </HStack>
          </Heading>

          <Grid
            templateColumns={{ base: '1fr', md: '2fr 1fr' }}
            gap={8}
            mb={8}
          >
            {/* Main Content */}
            <VStack spacing={8} align="stretch">
              {/* Balance Card */}
              <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">
                      <HStack>
                        <Icon as={FaWallet} color={accentColor} />
                        <Text>Your Balance</Text>
                      </HStack>
                    </Heading>
                    <Button
                      size="sm"
                      leftIcon={<MdRefresh />}
                      isLoading={userData.isRefreshing || isScannerLoading}
                      onClick={refreshAllData}
                    >
                      Refresh
                    </Button>
                  </HStack>
                </CardHeader>
                <Divider />
                <CardBody>
                  {userData.isLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="xl" />
                    </Flex>
                  ) : (
                    <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" spacing={4}>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm" color={cardText}>
                          Current balance
                        </Text>
                        <Heading size="lg" color={successColor}>
                          ₹{userData.balance.toFixed(2)}
                        </Heading>
                      </VStack>
                      <HStack spacing={2}>
                        <Button colorScheme="red" isDisabled>
                          Add Balance
                        </Button>
                        <Button colorScheme="blue" as={RouterLink} to="/view-card-details">
                          View Details
                        </Button>
                      </HStack>
                    </Stack>
                  )}
                </CardBody>
                <CardFooter>
                  <Text fontSize="xs" color={cardText}>
                    Last updated: {userData.lastUpdated.toLocaleTimeString()}
                  </Text>
                </CardFooter>
              </Card>

              {/* Location Card */}
              <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color={accentColor} />
                      <Text>Your Bicycle Locations</Text>
                    </HStack>
                  </Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  {userData.isLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="xl" />
                    </Flex>
                  ) : userData.cycles.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      No bicycles registered
                    </Alert>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {userData.cycles.map((cycle, index) => (
                        <Box
                          key={cycle._id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="lg"
                          bg={useColorModeValue('blue.50', 'blue.900')}
                        >
                          <HStack justify="space-between">
                            <VStack align="flex-start" spacing={1}>
                              <Text fontSize="lg" fontWeight="bold">
                                Bicycle {index + 1}: {cycle.cycleId}
                              </Text>
                              <Text fontSize="md">
                                Zone: {cycle.zoneId}
                              </Text>
                              {cycle.zoneId === "offline" && (
                                <Badge colorScheme="gray" fontSize="xs">
                                  Already exited
                                </Badge>
                              )}
                            </VStack>
                            <Button
                              colorScheme="green"
                              leftIcon={<FaMoneyBillWave />}
                              onClick={() => handlePayAndExit(cycle.cycleId)}
                              size="sm"
                              isDisabled={cycle.zoneId === "offline"}
                            >
                              Pay & Exit
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                      <Button
                        leftIcon={<FaMapMarkerAlt />}
                        colorScheme="blue"
                        variant="outline"
                        as={RouterLink}
                        to="/viewUserCycleDetails"
                      >
                        View Details
                      </Button>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>

            {/* QR Scanner Section */}
            <Card bg={cardBg} boxShadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">
                  <HStack>
                    <Icon as={FaQrcode} color={accentColor} />
                    <Text>Cycle Zone Scanner</Text>
                  </HStack>
                </Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                {apiError && (
                  <Alert status="error" mb={4} borderRadius="md">
                    <AlertIcon />
                    {apiError}
                  </Alert>
                )}

                <form onSubmit={handleScannerSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Select Offline Cycle</FormLabel>
                      <Select
                        placeholder="Select cycle"
                        value={selectedCycleId}
                        onChange={(e) => setSelectedCycleId(e.target.value)}
                        isDisabled={isScannerLoading}
                      >
                        {cycleIds.map((cycleId) => (
                          <option key={cycleId} value={cycleId}>
                            {cycleId}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Scan Zone QR Code</FormLabel>
                      {!isScanning ? (
                        <Button
                          colorScheme="blue"
                          onClick={startScanner}
                          isDisabled={isScannerLoading}
                          width="full"
                          leftIcon={<FaQrcode />}
                        >
                          Start Scanner
                        </Button>
                      ) : (
                        <Button
                          colorScheme="red"
                          onClick={stopScanner}
                          isDisabled={isScannerLoading}
                          width="full"
                          leftIcon={<FaQrcode />}
                        >
                          Stop Scanner
                        </Button>
                      )}
                      
                      <Box id="qr-reader" mt={2} display={isScanning ? 'block' : 'none'} />
                      
                      {scannedZoneId && (
                        <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                          <Text fontWeight="bold">Scanned Zone ID:</Text>
                          <Text>{scannedZoneId}</Text>
                        </Box>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="green"
                      isLoading={isScannerLoading}
                      loadingText="Submitting"
                      isDisabled={!selectedCycleId || !scannedZoneId}
                      width="full"
                      mt={4}
                    >
                      Update Cycle Zone
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </Grid>
        </Container>
      </Box>
    </>
  );
}