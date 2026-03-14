import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";

function ChatWindow(){

    const { prompt, setPrompt, currThreadId, setPreviousChats, setNewChat } = useContext(MyContext);

    const [isLoading, setIsLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const getReply = async () => {

    if (!prompt.trim()) return;

    setNewChat(false);   // hide "Start a New Chat"

    setIsPaused(false);
    setIsTyping(false);
    setIsLoading(true);

    const userMessage = prompt;

    try {

        const response = await fetch("http://localhost:8080/chat/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMessage,
                threadId: currThreadId
            })
        });

        const rep = await response.json();

        setPreviousChats(prevChats => [
            ...prevChats,
            { role: "user", content: userMessage },
            { role: "assistant", content: rep.reply }
        ]);

        setPrompt("");

    } catch (error) {
        console.error("Error fetching reply:", error);
    }

    setIsLoading(false);
    setIsTyping(true);
};

    const pauseResponse = () => {
        setIsPaused(true);
        setIsTyping(false);
        setIsLoading(false);
    };

    return (
        <div className="chatWindow">

            <div className="navbar">
                <span>ChatGPT &nbsp; <i className="fa-solid fa-chevron-down"></i></span>

                <div className="userIconDiv">
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>
                </div>
            </div>

            <Chat
                isLoading={isLoading}
                isPaused={isPaused}
                setIsTyping={setIsTyping}
            />

            <div className="chatInput">

                <div className="inputBox">

                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? getReply() : ""}
                    />

                    <div
                        id="submit"
                        onClick={(isLoading || isTyping) ? pauseResponse : getReply}
                    >
                        {(isLoading || isTyping) ? (
                            <i className="fa-solid fa-pause"></i>
                        ) : (
                            <i className="fa-solid fa-paper-plane"></i>
                        )}
                    </div>

                </div>

                <p className="info">
                    ChatGPT can make mistakes. Check important info.
                </p>

            </div>

        </div>
    );
}

export default ChatWindow;