import "./App.css";
import { useColorMode } from "@chakra-ui/react";
import Navbar from "./components/Navbar/Navbar";
import ChatState from "./context/chatState";
import { useContext } from "react";
import chatContext from "./context/chatContext";
import { PrimeReactProvider } from 'primereact/api';

function App(props) {
  const { colorMode, toggleColorMode } = useColorMode();
  const context = useContext(chatContext);

  // localStorage.removeItem("token")

  return (
    <PrimeReactProvider value={{ unstyled: true }}>
 <ChatState>
      <div className="App">
        <Navbar toggleColorMode={toggleColorMode} context={context} />
      </div>
    </ChatState></PrimeReactProvider>

   
  );
}

export default App;
