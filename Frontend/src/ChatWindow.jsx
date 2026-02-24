import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext,useState ,useEffect} from "react";
import {ScaleLoader} from "react-spinners";

function ChatWindow(){
    const { prompt, setPrompt, reply, setReply, currThreadId , previousChats, setPreviousChats} = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(false);

    const getReply = async () => {
  if (!prompt.trim()) return;

  setIsLoading(true);

  const userMessage = prompt; // store before clearing

  try {
    const response = await fetch("http://localhost:8080/chat/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        threadId: currThreadId,
      }),
    });

    const rep = await response.json();

    setPreviousChats((prevChats) => [
      ...prevChats,
      { role: "user", content: userMessage },
      { role: "assistant", content: rep.reply }
    ]);

    setPrompt("");
  } catch (error) {
    console.error("Error fetching reply:", error);
  }

  setIsLoading(false);
};


  //append new chats to previousChats
//   useEffect(() => {
//   if (reply) {
//     setPreviousChats((prevChats) => [
//       ...prevChats,
//       { role: "user", content: prompt },
//       { role: "assistant", content: reply }
//     ]);
//   }
// }, [reply]);

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>ChatGPT &nbsp; <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            <Chat></Chat>
            <ScaleLoader color="#fff" loading={isLoading}></ScaleLoader>
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" ? getReply() : ''} />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info" onClick={getReply}>
                    ChatGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;