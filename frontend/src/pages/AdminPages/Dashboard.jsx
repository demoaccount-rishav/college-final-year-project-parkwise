import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Text,
  useColorModeValue,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from "@chakra-ui/react";
import MenuBar1 from "../../components/Navigation/MenuBar1";

const data = {
  monthlyData: [
    { month: "January", users: 1000, revenue: 5000 },
    { month: "February", users: 1500, revenue: 7500 },
    { month: "March", users: 2000, revenue: 10000 },
    { month: "April", users: 2500, revenue: 12500 },
    { month: "May", users: 3000, revenue: 15000 },
    { month: "June", users: 3500, revenue: 17500 },
    { month: "July", users: 4000, revenue: 20000 },
    { month: "August", users: 4500, revenue: 22500 },
    { month: "September", users: 5000, revenue: 25000 },
    { month: "October", users: 5500, revenue: 27500 },
    { month: "November", users: 6000, revenue: 30000 },
    { month: "December", users: 6500, revenue: 32500 },
  ],
};

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const cardBg = useColorModeValue("white", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const totalUsers = data.monthlyData.reduce((sum, entry) => sum + entry.users, 0);
    const totalRevenue = data.monthlyData.reduce((sum, entry) => sum + entry.revenue, 0);
    setTotalUsers(totalUsers);
    setTotalRevenue(totalRevenue);
  }, []);

  return (

    <Flex minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <MenuBar1 />


      <Box flex="1" p={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            {/* Header */}
            <Box>
              <Heading as="h1" size="xl" mb={2}>Dashboard Overview</Heading>
              <Text color={useColorModeValue("gray.600", "gray.400")}>
                Monthly statistics and performance metrics
              </Text>
            </Box>

            {/* Stats Cards */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg" _hover={{ transform: "translateY(-4px)", transition: "all 0.2s" }}>
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="lg">Total Users</StatLabel>
                      <StatNumber fontSize="3xl">{totalUsers.toLocaleString()}</StatNumber>
                      <StatHelpText>
                        <Text as="span" color="green.500">↑ 12%</Text> from last month
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg" _hover={{ transform: "translateY(-4px)", transition: "all 0.2s" }}>
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="lg">Total Revenue</StatLabel>
                      <StatNumber fontSize="3xl">${totalRevenue.toLocaleString()}</StatNumber>
                      <StatHelpText>
                        <Text as="span" color="green.500">↑ 8%</Text> from last month
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>

            <Divider />

            {/* Monthly Data Table */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>Monthly Performance</Heading>
              <Box
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
              >
                <Table variant="simple" bg={tableBg}>
                  <Thead bg={useColorModeValue("gray.100", "gray.600")}>
                    <Tr>
                      <Th>Month</Th>
                      <Th isNumeric>Users</Th>
                      <Th isNumeric>Revenue</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.monthlyData.map((entry) => (
                      <Tr key={entry.month} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                        <Td fontWeight="medium">{entry.month}</Td>
                        <Td isNumeric>{entry.users.toLocaleString()}</Td>
                        <Td isNumeric>${entry.revenue.toLocaleString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Flex>

  );
};

export default Dashboard;