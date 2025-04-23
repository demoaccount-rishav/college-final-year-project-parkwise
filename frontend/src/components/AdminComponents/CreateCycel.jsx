import React, { useState } from 'react';
import {
  Flex,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  useToast,
  VStack,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

const CycleForm = () => {
  const [formData, setFormData] = useState({
    cycleId: '',
    zoneId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Dark mode colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const shadow = useColorModeValue('sm', 'dark-lg');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('api/cycle/createcycle/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create cycle');
      }

      toast({
        title: 'Cycle created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form on success
      setFormData({
        cycleId: '',
        zoneId: ''
      });

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error creating cycle',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
      p={4}
    >
      <Box
        maxW="md"
        width="full"
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        bg={cardBg}
        borderColor={borderColor}
        boxShadow={shadow}
      >
        <Heading as="h2" size="lg" mb={6} textAlign="center" color={textColor}>
          Activate Cycle
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {error && (
              <Alert status="error" borderRadius="md" variant="solid">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel color={textColor}>Cycle ID</FormLabel>
              <Input
                name="cycleId"
                value={formData.cycleId}
                onChange={handleChange}
                placeholder="Enter cycle ID"
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Zone ID</FormLabel>
              <Input
                name="zoneId"
                value={formData.zoneId}
                onChange={handleChange}
                placeholder="Enter zone ID"
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Creating..."
              mt={4}
            >
              Create Cycle
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default CycleForm;