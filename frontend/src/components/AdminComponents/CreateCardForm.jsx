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

const CreateCardForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    initialBalance: 100
  });
  const [errors, setErrors] = useState({
    phoneNumber: '',
    initialBalance: ''
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (name, value) => {
    const numValue = value === '' ? '' : Number(value);
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
    // Clear error when user changes value
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.phoneNumber) {
      isValid = false;
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      isValid = false;
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (formData.initialBalance < 0) {
      isValid = false;
      newErrors.initialBalance = 'Balance cannot be negative';
    } else if (formData.initialBalance > 1000) {
      isValid = false;
      newErrors.initialBalance = 'Maximum initial balance is ₹1000';
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
      const response = await fetch('api/card/createcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          initialBalance: formData.initialBalance
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create card');
      }

      toast({
        title: 'Card created successfully',
        description: `Card for ${formData.phoneNumber} with balance ₹${formData.initialBalance}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form on success
      setFormData({
        phoneNumber: '',
        initialBalance: 100
      });

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error creating card',
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
          Create New Card
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
              <Input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                bg={bgColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                borderColor={borderColor}
              />
              {errors.phoneNumber && (
                <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.initialBalance}>
              <FormLabel color={textColor}>Initial Balance (₹)</FormLabel>
              <NumberInput
                min={0}
                max={1000}
                defaultValue={100}
                value={formData.initialBalance}
                onChange={(value) => handleNumberChange('initialBalance', value)}
                clampValueOnBlur={true}
              >
                <NumberInputField 
                  bg={bgColor}
                  color={textColor}
                  borderColor={borderColor}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper color={textColor} />
                  <NumberDecrementStepper color={textColor} />
                </NumberInputStepper>
              </NumberInput>
              {errors.initialBalance ? (
                <FormErrorMessage>{errors.initialBalance}</FormErrorMessage>
              ) : (
                <Text fontSize="sm" color={placeholderColor} mt={1}>
                  Maximum allowed: ₹1000
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
              Create Card
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default CreateCardForm;











// import React, { useState, useEffect } from 'react';
// import {
//   Flex,
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Alert,
//   AlertIcon,
//   useToast,
//   VStack,
//   Heading,
//   NumberInput,
//   NumberInputField,
//   NumberInputStepper,
//   NumberIncrementStepper,
//   NumberDecrementStepper,
//   FormErrorMessage,
//   Text,
//   useColorModeValue,
//   InputGroup,
//   InputLeftElement,
//   Icon,
//   List,
//   ListItem,
//   Badge
// } from '@chakra-ui/react';
// import { SearchIcon } from '@chakra-ui/icons';

// const CreateCardForm = () => {
//   const [formData, setFormData] = useState({
//     phoneNumber: '',
//     initialBalance: 100
//   });
//   const [phoneNumbers, setPhoneNumbers] = useState([]);
//   const [filteredPhones, setFilteredPhones] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [errors, setErrors] = useState({
//     phoneNumber: '',
//     initialBalance: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetchingCards, setIsFetchingCards] = useState(true);
//   const [error, setError] = useState(null);
//   const toast = useToast();

//   // Dark mode colors
//   const bgColor = useColorModeValue('white', 'gray.800');
//   const cardBg = useColorModeValue('white', 'gray.700');
//   const borderColor = useColorModeValue('gray.200', 'gray.600');
//   const textColor = useColorModeValue('gray.800', 'white');
//   const placeholderColor = useColorModeValue('gray.400', 'gray.500');
//   const shadow = useColorModeValue('sm', 'dark-lg');
//   const dropdownBg = useColorModeValue('white', 'gray.700');
//   const dropdownHoverBg = useColorModeValue('blue.50', 'blue.900');

//   useEffect(() => {
//     const fetchCards = async () => {
//       try {
//         const response = await fetch('api/card/getallcard');
//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || 'Failed to fetch cards');
//         }

//         const numbers = data.data.map(card => card.phoneNumber);
//         setPhoneNumbers(numbers);
//         setFilteredPhones(numbers);
//       } catch (err) {
//         setError(err.message);
//         toast({
//           title: 'Error',
//           description: err.message,
//           status: 'error',
//           duration: 5000,
//           isClosable: true,
//         });
//       } finally {
//         setIsFetchingCards(false);
//       }
//     };

//     fetchCards();
//   }, [toast]);

//   useEffect(() => {
//     if (searchTerm.trim() === '') {
//       setFilteredPhones(phoneNumbers);
//     } else {
//       const filtered = phoneNumbers.filter(phone => 
//         phone.includes(searchTerm)
//       );
//       setFilteredPhones(filtered);
//     }
//   }, [searchTerm, phoneNumbers]);

//   const handlePhoneSelect = (phone) => {
//     setFormData(prev => ({
//       ...prev,
//       phoneNumber: phone
//     }));
//     setSearchTerm(phone);
//     setShowDropdown(false);
//   };

//   const handleNumberChange = (name, value) => {
//     const numValue = value === '' ? '' : Math.min(Number(value), 1000);
//     setFormData(prev => ({
//       ...prev,
//       [name]: numValue
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = { ...errors };

//     if (!formData.phoneNumber) {
//       isValid = false;
//       newErrors.phoneNumber = 'Please select a phone number';
//     } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
//       isValid = false;
//       newErrors.phoneNumber = 'Phone number must be 10 digits';
//     }

//     if (formData.initialBalance < 0) {
//       isValid = false;
//       newErrors.initialBalance = 'Balance cannot be negative';
//     } else if (formData.initialBalance > 1000) {
//       isValid = false;
//       newErrors.initialBalance = 'Maximum initial balance is ₹1000';
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch('api/card/createcard', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           phoneNumber: formData.phoneNumber,
//           initialBalance: formData.initialBalance
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create card');
//       }

//       toast({
//         title: 'Card created successfully',
//         description: `Card for ${formData.phoneNumber} with balance ₹${formData.initialBalance}`,
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//       });

//       // Reset form on success
//       setFormData({
//         phoneNumber: '',
//         initialBalance: 100
//       });
//       setSearchTerm('');

//       // Refresh phone numbers list
//       const refreshResponse = await fetch('api/card/getallcard');
//       const refreshData = await refreshResponse.json();
//       if (refreshResponse.ok) {
//         setPhoneNumbers(refreshData.data.map(card => card.phoneNumber));
//       }

//     } catch (err) {
//       setError(err.message);
//       toast({
//         title: 'Error creating card',
//         description: err.message,
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Flex
//       minH="100vh"
//       align="center"
//       justify="center"
//       bg={useColorModeValue('gray.50', 'gray.900')}
//       p={4}
//     >
//       <Box 
//         maxW="md"
//         width="full"
//         p={8}
//         borderWidth="1px"
//         borderRadius="lg"
//         bg={cardBg}
//         borderColor={borderColor}
//         boxShadow={shadow}
//       >
//         <Heading as="h2" size="lg" mb={6} textAlign="center" color={textColor}>
//           Create New Card
//         </Heading>
        
//         <form onSubmit={handleSubmit}>
//           <VStack spacing={4}>
//             {error && (
//               <Alert status="error" borderRadius="md" variant="solid">
//                 <AlertIcon />
//                 {error}
//               </Alert>
//             )}

//             <FormControl isRequired isInvalid={!!errors.phoneNumber}>
//               <FormLabel color={textColor}>Phone Number</FormLabel>
//               <Box position="relative">
//                 <InputGroup>
//                   <InputLeftElement pointerEvents="none">
//                     <Icon as={SearchIcon} color={placeholderColor} />
//                   </InputLeftElement>
//                   <Input
//                     placeholder="Search phone number"
//                     value={searchTerm}
//                     onChange={(e) => {
//                       setSearchTerm(e.target.value);
//                       setShowDropdown(true);
//                     }}
//                     onFocus={() => setShowDropdown(true)}
//                     onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//                     size="md"
//                     focusBorderColor="blue.500"
//                     bg={bgColor}
//                     color={textColor}
//                     _placeholder={{ color: placeholderColor }}
//                   />
//                 </InputGroup>
                
//                 {showDropdown && filteredPhones.length > 0 && (
//                   <Box
//                     position="absolute"
//                     width="full"
//                     mt={1}
//                     border="1px"
//                     borderColor={borderColor}
//                     borderRadius="md"
//                     bg={dropdownBg}
//                     boxShadow="md"
//                     zIndex="dropdown"
//                     maxH="200px"
//                     overflowY="auto"
//                   >
//                     <List spacing={0}>
//                       {filteredPhones.map(phone => (
//                         <ListItem
//                           key={phone}
//                           px={4}
//                           py={2}
//                           _hover={{ bg: dropdownHoverBg, cursor: 'pointer' }}
//                           onClick={() => handlePhoneSelect(phone)}
//                           color={textColor}
//                         >
//                           {phone}
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}
//               </Box>
//               {errors.phoneNumber && (
//                 <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
//               )}
//             </FormControl>

//             <FormControl isInvalid={!!errors.initialBalance}>
//               <FormLabel color={textColor}>Initial Balance (₹)</FormLabel>
//               <NumberInput
//                 min={0}
//                 max={1000}
//                 defaultValue={100}
//                 value={formData.initialBalance}
//                 onChange={(value) => handleNumberChange('initialBalance', value)}
//                 clampValueOnBlur={true}
//               >
//                 <NumberInputField 
//                   bg={bgColor}
//                   color={textColor}
//                   borderColor={borderColor}
//                 />
//                 <NumberInputStepper>
//                   <NumberIncrementStepper color={textColor} />
//                   <NumberDecrementStepper color={textColor} />
//                 </NumberInputStepper>
//               </NumberInput>
//               {errors.initialBalance ? (
//                 <FormErrorMessage>{errors.initialBalance}</FormErrorMessage>
//               ) : (
//                 <Text fontSize="sm" color={placeholderColor} mt={1}>
//                   Maximum allowed: ₹1000
//                 </Text>
//               )}
//             </FormControl>

//             <Button
//               type="submit"
//               colorScheme="blue"
//               width="full"
//               isLoading={isLoading || isFetchingCards}
//               loadingText={isFetchingCards ? "Loading..." : "Creating..."}
//               mt={4}
//             >
//               Create Card
//             </Button>
//           </VStack>
//         </form>
//       </Box>
//     </Flex>
//   );
// };

// export default CreateCardForm;