import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
  VStack,
  HStack,
  Center,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';

const QRCodeGenerator = () => {
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  const [inputType, setInputType] = useState('cycleId');
  const [cycleId, setCycleId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [qrData, setQrData] = useState(null);
  const toast = useToast();
  const qrCodeRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputType === 'cycleId' && cycleId.trim()) {
      if (!cycleId.includes('@')) {
        toast({
          title: 'Invalid Format',
          description: 'Cycle ID must contain @ symbol (e.g., 64735@02)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setQrData({ cycleId: cycleId.trim() });
    } else if (inputType === 'zoneId' && zoneId.trim()) {
      setQrData({ zoneId: zoneId.trim() });
    } else {
      toast({
        title: 'Input Required',
        description: `Please enter a valid ${inputType}`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) return;

    try {
      const dataUrl = await htmlToImage.toJpeg(qrCodeRef.current, {
        quality: 1,
        backgroundColor: colorMode === 'light' ? '#ffffff' : '#1a202c',
      });

      const link = document.createElement('a');
      link.download = `${inputType}_${qrData[inputType]}.jpg`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Download Successful',
        description: 'QR code downloaded as JPG',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Could not download QR code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <Center minH="100vh" bg={bgColor}>
      <Box
        maxW="md"
        width="100%"
        p={6}
        boxShadow="xl"
        borderRadius="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        color={textColor}
      >
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          QR Code Generator
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl mb={6}>
            <FormLabel>Select ID Type</FormLabel>
            <RadioGroup value={inputType} onChange={setInputType}>
              <Stack direction="row" spacing={4}>
                <Radio value="cycleId">Cycle ID</Radio>
                <Radio value="zoneId">Zone ID</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          {inputType === 'cycleId' ? (
            <FormControl mb={6}>
              <FormLabel>Cycle ID</FormLabel>
              <Input
                type="text"
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                placeholder="e.g., 64735@02"
                _placeholder={{ color: placeholderColor }}
                pattern=".*@.*"
                title="Must include @ symbol (e.g., 64735@02)"
              />
              <Text fontSize="sm" mt={1} color={placeholderColor}>
                Format: numbers@numbers (e.g., 64735@02)
              </Text>
            </FormControl>
          ) : (
            <FormControl mb={6}>
              <FormLabel>Zone ID</FormLabel>
              <Input
                type="text"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                placeholder="e.g., A"
                maxLength={5}
                _placeholder={{ color: placeholderColor }}
              />
            </FormControl>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            size="lg"
            mt={4}
          >
            Generate QR Code
          </Button>
        </form>

        {qrData && (
          <VStack mt={8} spacing={4} align="center">
            <Heading as="h3" size="md">
              Generated QR Code
            </Heading>

            <Box
              ref={qrCodeRef}
              p={4}
              bg={bgColor}
              borderRadius="md"
              boxShadow="md"
              textAlign="center"
            >
              <QRCodeSVG
                value={JSON.stringify(qrData)}
                size={256}
                level="H"
                includeMargin={true}
              />
              <Text
                mt={2}
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="xl"
                color="blue.400"
              >
                {inputType === 'cycleId' ? qrData.cycleId : qrData.zoneId}
              </Text>
            </Box>

            <Button
              colorScheme="teal"
              onClick={downloadQRCode}
              size="md"
              width="full"
            >
              Download as JPG
            </Button>
          </VStack>
        )}
      </Box>
    </Center>
  );
};

export default QRCodeGenerator;