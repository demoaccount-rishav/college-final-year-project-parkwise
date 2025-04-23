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
  Card,
  CardHeader,
  CardBody,
  Stack,
  Text,
  useToast,
  Container,
  VStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const ZoneCyclesPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await fetch('api/zone/getallzone');
      const data = await response.json();

      if (!response.ok) {
        throw new Error();
        // throw new Error(data.message || 'Failed to fetch zones');
      }

      setZones(data.data);
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
      setLoading(false);
    }
  };

  const handleDeleteClick = (zone) => {
    setZoneToDelete(zone);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`api/zone/deletezone/${zoneToDelete.zoneId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete zone');
      }

      toast({
        title: 'Zone deleted',
        description: `Zone ${zoneToDelete.zoneId} has been deleted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the zones list
      fetchZones();
    } catch (err) {
      toast({
        title: 'Error deleting zone',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const getCapacityPercentage = (current, limit) => {
    return Math.round((current / limit) * 100);
  };

  const getCapacityColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  if (loading) {
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
          <Heading as="h1" size="xl" color="gray.700">Zone Cycle Management</Heading>

          <HStack spacing={6}>
            <Stat textAlign="center" minW="150px">
              <StatLabel>Total Zones</StatLabel>
              <StatNumber>{zones.length}</StatNumber>
            </Stat>
            <Stat textAlign="center" minW="150px">
              <StatLabel>Total Cycles</StatLabel>
              <StatNumber>
                {zones.reduce((sum, zone) => sum + zone.zoneCycles.length, 0)}
              </StatNumber>
            </Stat>
          </HStack>
        </HStack>

        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          {zones.length === 0 ? (
            <Alert status="info" colorScheme="red">
              <AlertIcon />
              No zones found
            </Alert>
          ) : (
            <Stack spacing={6}>
              {zones.map((zone) => (
                <Card
                  key={zone._id}
                  variant="outline"
                  height="250px"
                  display="flex"
                  flexDirection="column"
                >
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">
                        {zone.zoneId}
                        <Badge ml={2} colorScheme="blue">
                          {zone.zoneCycles.length} cycles
                        </Badge>
                      </Heading>
                      <Flex align="center">
                        <Text mr={2}>
                          Capacity: {zone.zoneCurrentValue}/{zone.zoneLimit}
                        </Text>
                        <Badge
                          colorScheme={getCapacityColor(
                            getCapacityPercentage(zone.zoneCurrentValue, zone.zoneLimit)
                          )}
                        >
                          {getCapacityPercentage(zone.zoneCurrentValue, zone.zoneLimit)}%
                        </Badge>
                        <IconButton
                          ml={3}
                          aria-label="Delete zone"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteClick(zone)}
                          isDisabled={zone.zoneCycles.length > 0}
                        />
                      </Flex>
                    </Flex>
                  </CardHeader>
                  <CardBody
                    p={0}
                    overflowY="auto"
                    flex="1"
                  >
                    {zone.zoneCycles.length === 0 ? (
                      <Flex
                        height="100%"
                        align="center"
                        justify="center"
                        p={4}
                      >
                        <Text color="gray.500">No cycles assigned to this zone</Text>
                      </Flex>
                    ) : (
                      <Table variant="simple" size="sm" bg={tableBg}>
                        <Thead position="sticky" top={0} bg={useColorModeValue("gray.100", "gray.600")}>
                          <Tr>
                            <Th>Cycle ID</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {zone.zoneCycles.map((cycle) => (
                            <Tr key={cycle._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                              <Td>{cycle.cycleId}</Td>
                              <Td>
                                <Badge colorScheme="green">Active</Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Zone</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {zoneToDelete && zoneToDelete.zoneCycles.length > 0 ? (
              <Text>
                Cannot delete zone {zoneToDelete.zoneId} because it contains {zoneToDelete.zoneCycles.length} cycle(s).
                Please remove all cycles before deleting this zone.
              </Text>
            ) : (
              <Text>
                Are you sure you want to delete zone {zoneToDelete?.zoneId}? This action cannot be undone.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              isDisabled={zoneToDelete?.zoneCycles?.length > 0}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ZoneCyclesPage;