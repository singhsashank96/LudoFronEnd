import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  AddIcon,
  ArrowBackIcon,
  ChevronRightIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"; // Use this if you're using react-router
import chatContext from "../../context/chatContext";

const NewChats = (props) => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [userData , setUserData] = useState({});

  const context = useContext(chatContext);
  const navigate = useNavigate(); // Use navigate for redirection

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
      console.log("jsonData", jsonData);
  
      // Set allData to the full user list
      setAllData(jsonData);
  
      // For regular users, show only admins in data
      setData(jsonData.filter((user) => user.role === "admin"));
      setUsers(jsonData.filter((user) => user.role === "admin"));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  const getchUserDats= async()=>{
    try{
      const user_id = localStorage.getItem("user_id");

      const response = await fetch(`${context.ipadd}/user/user/${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData = await response.json();
        console.log("jsonData" ,jsonData);
        setUserData(jsonData);
      // Filter users to only include admins
    }catch(error){

    }
  }







  useEffect(() => {
    fetchData();
    getchUserDats()
  }, [context.mychatList]);

  const handleUserSearch = (e) => {
    const query = e.target.value.toLowerCase();
    if (query) {
      const filteredUsers = data.filter((user) =>
        user.name.toLowerCase().includes(query)
      );
      setUsers(filteredUsers);
    } else {
      setUsers(data);
    }
  };

  const handleNewChat = async (e, receiverId) => {
    e.preventDefault();

    // Ensure the receiver is an admin
    const receiver = data.find((user) => user._id === receiverId);
    if (!receiver || receiver.role !== "admin") {
      alert("You can only chat with admins.");
      return;
    }

    const chatData = { members: [context.user._id, receiverId] };

    try {
      const response = await fetch(`${context.ipadd}/conversation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const chat = await response.json();
      props.setactiveTab(0);
      context.setactiveChat(chat._id);
      context.setreceiver(chat.members[0]);
      context.setmychatList([chat, ...context.mychatList]);
      context.socket.emit("join-chat", {
        room: chat._id,
        user: context.user._id,
      });

      // Remove receiver from the list
      const updatedUsers = users.filter((user) => user._id !== receiverId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  console.log("data" , data);
  console.log("allData" , allData);
  console.log("userData" , userData);



  return (
    <>
    
  
      <Box>
        <Flex justify={"space-between"}>
          <Button onClick={() => props.setactiveTab(0)}>
            <ArrowBackIcon />
          </Button>

          <Box display={"flex"}>
            <InputGroup w={"fit-content"} mx={2}>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Enter Name"
                onChange={handleUserSearch}
                id="search-input"
              />
            </InputGroup>
          </Box>
        </Flex>
      </Box>

      <Divider my={2} />

      <Box
        h={{ base: "63vh", md: "72vh" }}
        overflowY={"scroll"}
        sx={{
          "::-webkit-scrollbar": {
            width: "4px",
          },
          "::-webkit-scrollbar-track": {
            width: "6px",
          },
          "::-webkit-scrollbar-thumb": {
            background: { base: "gray.300", md: "gray.500" },
            borderRadius: "24px",
          },
        }}
      >
        {/* <Button my={2} mx={2} colorScheme="purple">
          Create New Group <AddIcon ml={2} fontSize={"12px"} />
        </Button> */}
        {users.filter((item=>item.role=="admin")).map(
          (user) =>
            user._id !== context.user._id && (
              <Flex key={user._id} p={2}>
                <Button
                  h={"4em"}
                  w={"100%"}
                  justifyContent={"space-between"}
                  onClick={(e) => handleNewChat(e, user._id)}
                >
                  <Flex>
                    <Box>
                      {/* <img
                        src={user.profilePic}
                        alt="profile"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                        }}
                      /> */}
                    </Box>
                    <Box mx={3} textAlign={"start"}>
                      <Text fontSize={"lg"} fontWeight={"bold"}>
                        {user.name}
                      </Text>
                      <Text fontSize={"sm"} color={"gray.500"}>
                        {user.phoneNum}
                      </Text>
                    </Box>
                  </Flex>

                  <ChevronRightIcon />
                </Button>
              </Flex>
            )
        )}
      </Box>


      
    
  
    </>
  );
};

export default NewChats;
