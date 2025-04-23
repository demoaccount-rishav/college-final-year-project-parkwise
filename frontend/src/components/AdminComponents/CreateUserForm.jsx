import React, { useState } from 'react';
import {
  Flex,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    userPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Dark mode colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const shadow = useColorModeValue('sm', 'dark-lg');
  const alertBg = useColorModeValue('red.50', 'red.900');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for userName to prevent numbers
    if (name === 'userName') {
      // Only allow letters and spaces
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: lettersOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.userName)) {
      newErrors.userName = 'Name should contain only alphabets';
    }

    if (!formData.userPhone) {
      newErrors.userPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.userPhone)) {
      newErrors.userPhone = 'Phone must be 10 digits';
    }

    if (!formData.userPassword) {
      newErrors.userPassword = 'Password is required';
    } else if (formData.userPassword.length < 5) {
      newErrors.userPassword = 'Password must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('api/user/createuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      toast({
        title: 'User created successfully',
        description: `User ${data.data.userName} with Cycle ID ${data.data.cycleId} has been created`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form on success
      setFormData({
        userName: '',
        userPhone: '',
        userPassword: ''
      });

    } catch (error) {
      toast({
        title: 'Error creating user',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
          Create New Cycle/User
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.userName}>
              <FormLabel color={textColor}>Full Name</FormLabel>
              <Input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter user's full name (letters only)"
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
              {errors.userName && (
                <Alert 
                  mt={1} 
                  status="error" 
                  fontSize="sm" 
                  p={2} 
                  borderRadius="md"
                  bg={alertBg}
                >
                  <AlertIcon boxSize="16px" />
                  {errors.userName}
                </Alert>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.userPhone}>
              <FormLabel color={textColor}>Phone Number</FormLabel>
              <Input
                name="userPhone"
                type="tel"
                value={formData.userPhone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
              {errors.userPhone && (
                <Alert 
                  mt={1} 
                  status="error" 
                  fontSize="sm" 
                  p={2} 
                  borderRadius="md"
                  bg={alertBg}
                >
                  <AlertIcon boxSize="16px" />
                  {errors.userPhone}
                </Alert>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.userPassword}>
              <FormLabel color={textColor}>Password</FormLabel>
              <Input
                name="userPassword"
                type="password"
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="Enter password (min 5 characters)"
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
              {errors.userPassword && (
                <Alert 
                  mt={1} 
                  status="error" 
                  fontSize="sm" 
                  p={2} 
                  borderRadius="md"
                  bg={alertBg}
                >
                  <AlertIcon boxSize="16px" />
                  {errors.userPassword}
                </Alert>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create User
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default CreateUserForm;