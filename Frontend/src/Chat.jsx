import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

function Chat() {
  const { newChat, previousChats } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if (!previousChats || previousChats.length === 0) return;

    const lastMessage = previousChats[previousChats.length - 1];

    // Only run typing effect for assistant messages
    if (lastMessage.role !== "assistant") return;

    const words = lastMessage.content.split(" ");
    let idx = 0;

    setLatestReply("");

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, idx + 1).join(" "));
      idx++;

      if (idx >= words.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);

  }, [previousChats]);

  return (
    <>
      {newChat && <h1>Start a New Chat!</h1>}

      <div className="chats">
        {/* Show all messages except the last one */}
        {previousChats?.slice(0, -1).map((chat, index) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={index}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}

        {/* Typing effect for latest assistant message */}
        {previousChats.length > 0 &&
          previousChats[previousChats.length - 1].role === "assistant" &&
          latestReply !== null && (
            <div className="gptDiv">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {latestReply}
              </ReactMarkdown>
            </div>
          )}
      </div>
    </>
  );
}

export default Chat;


