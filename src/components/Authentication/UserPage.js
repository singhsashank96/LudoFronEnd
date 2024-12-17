import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Button,
  Spinner,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Input,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import chatContext from "../../context/chatContext";
import { MultiSelect } from 'primereact/multiselect';


function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [gamesvisible, setGameVisbile] = useState(false);

  const [coinValue, setCoinValue] = useState(10); // Default coin increment value
  const [selectedUsers, setSelectedUsers] = useState([]); // Selected users for game
  const [gameName, setGameName] = useState("");
  const [winningAmount, setWinningAmount] = useState("");
  const [perUserAmount, setPerUserAmount] = useState("");
  const navigate = useNavigate();
  const context = useContext(chatContext);
  const toast = useToast();

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${context.ipadd}/user/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData = await response.json();
      setUsers(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add coins to a user
  const handleAddCoins = async () => {
    if (!selectedUser || !coinValue) {
      toast({
        title: "Error",
        description: "Please select a user and specify a valid coin value",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${context.ipadd}/user/addCoins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ userId: selectedUser._id, coins: coinValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update coins");
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, coin: updatedUser.coins } : user
        )
      );

      toast({
        title: "Success",
        description: "Coins added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      window.location.reload();
      setSelectedUser(null);
      setCoinValue(null); // Reset the coin input
    } catch (error) {
      console.error("Error updating coins:", error);
      toast({
        title: "Error",
        description: "Failed to update coins",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Create game functionality
  const handleCreateGame = async () => {
    if (!gameName || !winningAmount || !perUserAmount || selectedUsers.length < 1) {
      toast({
        title: "Error",
        description: "Please fill all fields and select at least one user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Calculate the amount per user
    const totalAmount = parseFloat(winningAmount);
    const perUserAmount = totalAmount / selectedUsers.length;
    const winningAmountPerUser = totalAmount * 0.9; // 90% of the total amount

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${context.ipadd}/game/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          gameName,
          users: selectedUsers.map((user) => user._id),
          winningAmount: winningAmountPerUser,
          perUserAmount,
          adminId: selectedUser._id, // Assuming adminId is the selected user
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const newGame = await response.json();
      toast({
        title: "Success",
        description: "Game created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setGameVisbile(false); // Hide the game form
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Error",
        description: "Failed to create game.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenModel = (user) => {
    setSelectedUser(user);
  };

  const showGamePage = () => {
    setGameVisbile(true);
  };

  // Handle change for multiple selection of users
  const handleChange = (selectedOptions) => {
    const selectedUsersArray = users.filter(user =>
      selectedOptions.map(option => option.value).includes(user._id)
    );
    setSelectedUsers(selectedUsersArray);
  };

  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    console.log('Selected option:', selectedValue);
  };

  return (
    <div>
      {loading ? (
        <Spinner size="xl" color="teal" />
      ) : selectedUser && !gamesvisible ? (
        <FormControl mt={4}>
          <div>
            <h2>User Name: {selectedUser.name}</h2>
            <h3>Available Coins: {selectedUser.coin}</h3>
            <FormLabel>Add Coins</FormLabel>
            <NumberInput
              max={1000}
              min={1}
              value={coinValue}
              onChange={(valueString) => setCoinValue(Number(valueString))}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button colorScheme="teal" mt={4} onClick={handleAddCoins}>
              Add Coins
            </Button>
            <Button
              colorScheme="red"
              mt={4}
              ml={4}
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </Button>
          </div>
        </FormControl>
      ) : (
        <Table variant="striped" colorScheme="brand">
          <TableCaption>Game and Coin Stats for Users</TableCaption>
          <Thead>
            <Tr>
              <Th>User Name</Th>
              <Th>Mobile Number</Th>
              <Th isNumeric>Total Games</Th>
              <Th isNumeric>Total Coins</Th>
              <Th>Add Coins</Th>
              <Th>Add Games</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user?.name}</Td>
                <Td>{user?.phoneNum}</Td>
                <Td isNumeric>{user?.games || 0}</Td>
                <Td isNumeric>{user?.coin || 0}</Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    onClick={() => handleOpenModel(user)}
                  >
                    Add Coins
                  </Button>
                </Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    onClick={showGamePage}
                  >
                    Add Games
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {gamesvisible && !selectedUser && (
        <div>
          <h1>Add New Game</h1>
          <FormControl mt={4}>
            <FormLabel>Game Name</FormLabel>
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Winning Amount</FormLabel>
            <Input
              type="number"
              value={winningAmount}
              onChange={(e) => setWinningAmount(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Amount Per User</FormLabel>
            <Input
              type="number"
              value={perUserAmount}
              onChange={(e) => setPerUserAmount(e.target.value)}
            />
          </FormControl>
      

          <FormControl mt={4}>
  <FormLabel>Selected Users</FormLabel>
  <Select
    isMulti 
    placeholder="Select users"
    onChange={handleSelectChange} 
    value={selectedOption} 
  >
    {users.map((user) => (
      <option key={user._id} value={user._id}>
        {user.name} <Button style={{color:'green'}}>Add </Button>
      </option>
    ))}
  </Select>
  <MultiSelect
          value={selectedUsers} // The array of selected users
          onChange={handleSelectChange} // Handle selection change
          options={users} // Array of user objects
          optionLabel="name" // The user name property to display in the dropdown
          placeholder="Select users" // Placeholder text for the dropdown
          maxSelectedLabels={3} // Maximum labels shown in the input field
          className="w-full md:w-20rem"
        />
</FormControl>


          <Button colorScheme="teal" mt={4} onClick={handleCreateGame}>
            Create Game
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserPage;
