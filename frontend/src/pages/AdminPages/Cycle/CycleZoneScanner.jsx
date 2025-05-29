import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Box,
  Button,
  Input,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  IconButton,
  Collapse
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import axios from "axios";
import MenuBarCycle from '../../../components/Navigation/MenuBarCycle';

const CycleZoneScanner = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [scanData, setScanData] = useState({
    cycleId: '',
    zoneId: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [showMenu, setShowMenu] = useState(true);

  // Dark mode colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const shadow = useColorModeValue('sm', 'dark-lg');

  const showToast = (title, description, status) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top'
    });
  };

  const onScanSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);

      if (data.cycleId) {
        setScanData(prev => ({ ...prev, cycleId: data.cycleId }));
        showToast('Success', 'CycleID scanned successfully!', 'success');
        setActiveTab(1); // Move to zoneId tab after scanning CycleID
      } else if (data.zoneId) {
        setScanData(prev => ({ ...prev, zoneId: data.zoneId }));
        showToast('Success', 'zoneId scanned successfully!', 'success');
      } else {
        throw new Error('Invalid QR code format');
      }
    } catch (error) {
      console.error('Invalid QR code data:', error);
      showToast('Error', 'Failed to parse QR code data. Please try again.', 'error');
    }
  };

  const onScanFailure = (error) => {
    console.warn(`QR code scan error: ${error}`);
  };

  const handleSubmit = async () => {
    if (!scanData.cycleId || !scanData.zoneId) {
      showToast('Error', 'Please provide both CycleID and zoneId', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `/api/cycle/updatezone/${scanData.cycleId}/${scanData.zoneId}`,
        {},
        { timeout: 5000 }
      );

      showToast('Success', response.data.message, 'success');
      // Reset form after successful submission
      setScanData({ cycleId: '', zoneId: '' });
      setActiveTab(0);

    } catch (error) {
      let errorMessage = "Something went wrong.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server.";
      }
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScanData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!isManualInput) {
      const newScanner = new Html5QrcodeScanner(
        `qr-reader-${activeTab}`, // Unique ID for each tab's scanner
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      newScanner.render(onScanSuccess, onScanFailure);
      setScanner(newScanner);

      return () => {
        newScanner.clear();
      };
    } else if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  }, [isManualInput, activeTab]);

  return (
    <>
      <Box position="fixed" top={4} right={4} zIndex={999}>
        <IconButton
          aria-label={showMenu ? "Hide menu" : "Show menu"}
          icon={showMenu ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={() => setShowMenu(!showMenu)}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.2s"
        />
      </Box>
      
      <Collapse in={showMenu} animateOpacity>
        <MenuBarCycle />
      </Collapse>
      
      <Flex minH="100vh" bg={bgColor} align="center" justify="center" p={4}>
        <Card
          maxW="2xl"
          width="full"
          borderWidth="1px"
          borderRadius="lg"
          bg={cardBg}
          borderColor={borderColor}
          boxShadow={shadow}
        >
          <CardHeader>
            <Heading as="h1" size="lg" color={textColor}>
              Cycle Zone Management
            </Heading>
            <Text mt={2} color={textColor}>
              Scan or enter CycleID and zoneId to update cycle location
            </Text>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <Tabs index={activeTab} onChange={setActiveTab} isLazy>
                <TabList>
                  <Tab>1. Scan CycleID</Tab>
                  <Tab isDisabled={!scanData.cycleId}>2. Scan zoneId</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4}>
                      <Text fontSize="lg" color={textColor}>
                        Scan CycleID QR Code: (format: {"{cycleId: '...'}"})
                      </Text>

                      {!isManualInput ? (
                        <Box
                          id={`qr-reader-${0}`} // For CycleID tab
                          w="full"
                          maxW="300px"
                          mx="auto"
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid"
                          borderColor={borderColor}
                        />
                      ) : (
                        <FormControl>
                          <FormLabel>CycleID:</FormLabel>
                          <Input
                            name="cycleId"
                            value={scanData.cycleId}
                            onChange={handleInputChange}
                            placeholder="Enter CycleID (e.g. 64735@02)"
                            bg={useColorModeValue('white', 'gray.700')}
                            color={textColor}
                            _placeholder={{ color: placeholderColor }}
                            borderColor={borderColor}
                          />
                        </FormControl>
                      )}

                      <HStack spacing={2}>
                        <Switch
                          isChecked={isManualInput}
                          onChange={() => setIsManualInput(!isManualInput)}
                          colorScheme="blue"
                        />
                        <Text color={textColor}>
                          {isManualInput ? "Switch to Scanner" : "Switch to Manual Input"}
                        </Text>
                      </HStack>

                      {scanData.cycleId && (
                        <Button
                          colorScheme="blue"
                          onClick={() => setActiveTab(1)}
                          mt={4}
                        >
                          Next: Scan zoneId
                        </Button>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4}>
                      <Text fontSize="lg" color={textColor}>
                        Scan zoneId QR Code: (format: {"{zoneId: '...'}"})
                      </Text>

                      {!isManualInput ? (
                        <Box
                          id={`qr-reader-${1}`} // For zoneId tab
                          w="full"
                          maxW="300px"
                          mx="auto"
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid"
                          borderColor={borderColor}
                        />
                      ) : (
                        <FormControl>
                          <FormLabel>zoneId:</FormLabel>
                          <Input
                            name="zoneId"
                            value={scanData.zoneId}
                            onChange={handleInputChange}
                            placeholder="Enter ZoneID (e.g. A, B, C)"
                            bg={useColorModeValue('white', 'gray.700')}
                            color={textColor}
                            _placeholder={{ color: placeholderColor }}
                            borderColor={borderColor}
                          />
                        </FormControl>
                      )}

                      <HStack spacing={2}>
                        <Switch
                          isChecked={isManualInput}
                          onChange={() => setIsManualInput(!isManualInput)}
                          colorScheme="blue"
                        />
                        <Text color={textColor}>
                          {isManualInput ? "Switch to Scanner" : "Switch to Manual Input"}
                        </Text>
                      </HStack>

                      <HStack spacing={4} mt={4}>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab(0)}
                        >
                          Back
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={handleSubmit}
                          isLoading={isSubmitting}
                          loadingText="Updating..."
                          isDisabled={!scanData.zoneId || isSubmitting}
                        >
                          Submit
                        </Button>
                      </HStack>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {scanData.cycleId && scanData.zoneId && (
                <Box mt={4} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <Text fontWeight="bold" color={textColor}>Ready to submit:</Text>
                  <Text color={textColor}>CycleID: {scanData.cycleId}</Text>
                  <Text color={textColor}>zoneId: {scanData.zoneId}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default CycleZoneScanner;