import React, { useState , useContext , useEffect } from "react";
import { Box, Button, Flex, Text, Link, useDisclosure } from "@chakra-ui/react";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import CoinMenu from "./CoinMenu";
import chatContext from "../../context/chatContext";
const Navbar = (props) => {
  // Hook to manage the state of the disclosure for profile menu
  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useContext(chatContext);
  const [userData , setUserData] = useState({});

  // State to manage the color mode icon
  const colormode = localStorage.getItem("chakra-ui-color-mode");
  const [icon, seticon] = useState(
    colormode === "dark" ? <FaSun /> : <FaMoon />
  );

  // Function to toggle color mode
  const handleToggle = () => {
    if (colormode === "dark") {
      seticon(<FaMoon />);
      props.toggleColorMode();
    } else {
      seticon(<FaSun />);
      props.toggleColorMode();
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
    getchUserDats()
  }, []);
  

  return (
    <>
      {/* Navbar for small screens */}
      {!window.location.pathname.includes("dashboard") && (
        <Box
          position={"absolute"}
          top={5}
          left={5}
          display={{ md: "none", base: "flex" }}
        >
          {/* Color mode toggle button */}
          <Button
            p={3}
            borderRadius={"full"}
            borderWidth={1}
            fontSize={"small"}
            backgroundColor={"transparent"}
            onClick={handleToggle}
            mx={1}
          >
            {icon}
          </Button>
          {/* Github link */}
          {/* <Link
            p={3}
            borderRadius={"full"}
            borderWidth={1}
            fontSize={"small"}
            backgroundColor={"transparent"}
            href="https://github.com/pankil-soni"
            mx={1}
          >
            <FaGithub />
          </Link> */}
        </Box>
      )}

      {/* Navbar for larger screens */}
      <Box
        p={3}
        w={{ base: "94vw", md: "99vw" }}
        m={2}
        borderRadius="10px"
        borderWidth="2px"
        display={{ base: "none", md: "block" }}
      >
        <Flex justify={"space-between"}>
          {/* Logo */}
          <Text fontSize="2xl">Ludo-king</Text>

          <Box
            display={{ base: "none", md: "flex" }}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Color mode toggle button */}
            <Button
              onClick={handleToggle}
              mr={2}
              borderRadius={"full"}
              borderWidth={1}
              fontSize={"small"}
              backgroundColor={"transparent"}
              p={3}
            >

              {icon}
            </Button>
{
  localStorage.getItem("token") && ( <Button
    onClick={handleToggle}
    mr={2}
    borderRadius={"full"}
    borderWidth={1}
    fontSize={"small"}
    backgroundColor={"transparent"}
    p={3}
  >
<img     style={{height:'30px' , width:'30px'}}                    src='https://static.vecteezy.com/system/resources/previews/009/383/442/non_2x/bonus-icon-clipart-design-illustration-free-png.png'
/> <span style={{marginLeft:"5px"}}>{userData?.coin ? userData?.coin :0} </span>

  </Button>)
}
           
            {/* Github link */}
            {/* <Button
              borderRadius={"full"}
              borderWidth={1}
              fontSize={"small"}
              backgroundColor={"transparent"}
              p={3}
              mr={2}
              onClick={() => {
                window.open("https://github.com/pankil-soni");
              }}
            >
              <FaGithub />
            </Button> */}
            {/* Profile menu */}
            {localStorage.getItem("token") && (
              <div >
               <ProfileMenu
                context={props.context}
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
              />
              </div>
             
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Navbar;
