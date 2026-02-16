import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext } from "react";

function ChatWindow(){
    const { prompt, setPrompt, reply, setReply, currThreadId } = useContext(MyContext);
    const getReply = async () => {
  if (!prompt.trim()) return;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: prompt,
      threadId: currThreadId,
    }),
  };

  try {
    const response = await fetch(
      "http://localhost:8080/chat/chat",
      options
    );

    const rep = await response.json();
    console.log(rep);

    setReply(rep.reply);
    setPrompt("");
  } catch (error) {
    console.error("Error fetching reply:", error);
  }
};

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>ChatGPT &nbsp; <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            <Chat></Chat>
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