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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

const ZoneForm = () => {
  const [formData, setFormData] = useState({
    zoneId: '',
    zoneLimit: '',
    zoneCurrentValue: 0
  });
  const [errors, setErrors] = useState({
    zoneLimit: '',
    zoneCurrentValue: ''
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
  const infoTextColor = useColorModeValue('gray.500', 'gray.400');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'zoneId') {
      setError(null);
    }
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
    // Clear error when user changes value
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.zoneId) {
      isValid = false;
      setError('Zone ID is required');
    }

    if (!formData.zoneLimit) {
      isValid = false;
      newErrors.zoneLimit = 'Zone limit is required';
    } else if (formData.zoneLimit > 20) {
      isValid = false;
      newErrors.zoneLimit = 'Zone limit cannot exceed 20';
    } else if (formData.zoneCurrentValue >= formData.zoneLimit) {
      isValid = false;
      newErrors.zoneCurrentValue = 'Current value must be less than zone limit';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('api/zone/createzone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create zone');
      }

      toast({
        title: 'Zone created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form on success
      setFormData({
        zoneId: '',
        zoneLimit: '',
        zoneCurrentValue: 0
      });

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error creating zone',
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
          Create New Zone
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {error && (
              <Alert status="error" borderRadius="md" variant="solid">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl isRequired isInvalid={!!error && !formData.zoneId}>
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

            <FormControl isRequired isInvalid={!!errors.zoneLimit}>
              <FormLabel color={textColor}>Zone Limit (max: 20)</FormLabel>
              <NumberInput
                min={1}
                max={20}
                value={formData.zoneLimit}
                onChange={(value) => handleNumberChange('zoneLimit', value)}
              >
                <NumberInputField 
                  placeholder="Enter zone limit (1-20)"
                  bg={bgColor}
                  color={textColor}
                  _placeholder={{ color: placeholderColor }}
                  borderColor={borderColor}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper color={textColor} />
                  <NumberDecrementStepper color={textColor} />
                </NumberInputStepper>
              </NumberInput>
              {errors.zoneLimit && (
                <FormErrorMessage>{errors.zoneLimit}</FormErrorMessage>
              )}
              <Text fontSize="sm" color={infoTextColor} mt={1}>
                Maximum zone limit: 20
              </Text>
            </FormControl>

            <FormControl isInvalid={!!errors.zoneCurrentValue}>
              <FormLabel color={textColor}>Current Value (default: 0)</FormLabel>
              <NumberInput
                min={0}
                max={formData.zoneLimit ? formData.zoneLimit - 1 : 19}
                value={formData.zoneCurrentValue}
                onChange={(value) => handleNumberChange('zoneCurrentValue', value)}
              >
                <NumberInputField 
                  placeholder="Enter current value"
                  bg={bgColor}
                  color={textColor}
                  _placeholder={{ color: placeholderColor }}
                  borderColor={borderColor}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper color={textColor} />
                  <NumberDecrementStepper color={textColor} />
                </NumberInputStepper>
              </NumberInput>
              {errors.zoneCurrentValue && (
                <FormErrorMessage>{errors.zoneCurrentValue}</FormErrorMessage>
              )}
              {formData.zoneLimit ? (
                <Text fontSize="sm" color={infoTextColor} mt={1}>
                  Maximum allowed: {formData.zoneLimit - 1}
                </Text>
              ) : (
                <Text fontSize="sm" color={infoTextColor} mt={1}>
                  Maximum allowed: 19 (when zone limit is 20)
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Creating..."
              mt={4}
            >
              Create Zone
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default ZoneForm;