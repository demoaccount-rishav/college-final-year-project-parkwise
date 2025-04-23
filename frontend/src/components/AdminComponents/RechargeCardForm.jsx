import React, { useState, useEffect } from 'react';
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
  InputGroup,
  InputLeftElement,
  Icon,
  List,
  ListItem,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const RechargeCardForm = () => {
  const [cards, setCards] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    amount: '',
    currentBalance: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({
    phoneNumber: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCards, setIsFetchingCards] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Dark mode colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropdownBg = useColorModeValue('white', 'gray.700');
  const dropdownHoverBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const balanceBoxBg = useColorModeValue('gray.50', 'gray.700');
  const shadow = useColorModeValue('sm', 'dark-lg');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('api/card/getallcard');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch cards');
        }

        setCards(data.data);
        const numbers = data.data.map(card => card.phoneNumber);
        setPhoneNumbers(numbers);
        setFilteredPhones(numbers);
      } catch (err) {
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsFetchingCards(false);
      }
    };

    fetchCards();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPhones(phoneNumbers);
    } else {
      const filtered = phoneNumbers.filter(phone => 
        phone.includes(searchTerm)
      );
      setFilteredPhones(filtered);
    }
  }, [searchTerm, phoneNumbers]);

  const handlePhoneSelect = (phone) => {
    const selectedCard = cards.find(card => card.phoneNumber === phone);
    setFormData(prev => ({
      ...prev,
      phoneNumber: phone,
      currentBalance: selectedCard?.currentBalance || null
    }));
    setSearchTerm(phone);
    setShowDropdown(false);
  };

  const handleAmountChange = (name, value) => {
    const numValue = value === '' ? '' : Math.min(Number(value), 1000);
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.phoneNumber) {
      isValid = false;
      newErrors.phoneNumber = 'Please select a phone number';
    }

    if (!formData.amount) {
      isValid = false;
      newErrors.amount = 'Amount is required';
    } else if (formData.amount <= 0) {
      isValid = false;
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > 1000) {
      isValid = false;
      newErrors.amount = 'Maximum recharge amount is ₹1000';
    } else if (formData.amount % 50 !== 0 && formData.amount % 100 !== 0) {
      isValid = false;
      newErrors.amount = 'Amount must be in multiples of 50 or 100';
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
      const response = await fetch(`api/card/credit/${formData.phoneNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to recharge card');
      }

      toast({
        title: 'Recharge Successful',
        description: `₹${formData.amount} credited to ${formData.phoneNumber}. New balance: ₹${data.data.currentBalance}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form on success
      setFormData({
        phoneNumber: '',
        amount: '',
        currentBalance: null
      });
      setSearchTerm('');

      // Refresh card data
      const refreshResponse = await fetch('api/card/getallcard');
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setCards(refreshData.data);
        setPhoneNumbers(refreshData.data.map(card => card.phoneNumber));
      }

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Recharge Failed',
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
          Recharge Card
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {error && (
              <Alert status="error" borderRadius="md" variant="solid">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl isRequired isInvalid={!!errors.phoneNumber}>
              <FormLabel color={textColor}>Phone Number</FormLabel>
              <Box position="relative">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={SearchIcon} color={placeholderColor} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search phone number"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    size="md"
                    focusBorderColor="blue.500"
                    bg={bgColor}
                    color={textColor}
                    _placeholder={{ color: placeholderColor }}
                  />
                </InputGroup>
                
                {showDropdown && filteredPhones.length > 0 && (
                  <Box
                    position="absolute"
                    width="full"
                    mt={1}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={dropdownBg}
                    boxShadow="md"
                    zIndex="dropdown"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <List spacing={0}>
                      {filteredPhones.map(phone => (
                        <ListItem
                          key={phone}
                          px={4}
                          py={2}
                          _hover={{ bg: dropdownHoverBg, cursor: 'pointer' }}
                          onClick={() => handlePhoneSelect(phone)}
                          color={textColor}
                        >
                          {phone}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
              {errors.phoneNumber && (
                <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
              )}
            </FormControl>

            {formData.currentBalance !== null && (
              <Box 
                width="full" 
                p={3} 
                borderRadius="md" 
                bg={balanceBoxBg}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium" color={textColor}>Current Balance:</Text>
                  <Badge 
                    colorScheme={formData.currentBalance > 0 ? 'green' : 'red'}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    ₹{formData.currentBalance}
                  </Badge>
                </Flex>
              </Box>
            )}

            <FormControl isRequired isInvalid={!!errors.amount}>
              <FormLabel color={textColor}>Recharge Amount (₹)</FormLabel>
              <NumberInput
                min={50}
                max={1000}
                step={50}
                value={formData.amount}
                onChange={(value) => handleAmountChange('amount', value)}
                precision={0}
                clampValueOnBlur={true}
              >
                <NumberInputField 
                  placeholder="Enter amount (50-1000)" 
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
              {errors.amount ? (
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              ) : (
                <Text fontSize="sm" color={placeholderColor} mt={1}>
                  Must be multiples of 50 or 100 (max ₹1000)
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Processing..."
              mt={4}
              isDisabled={isFetchingCards || !formData.phoneNumber}
            >
              Recharge Card
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default RechargeCardForm;