import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { ScaleLoader } from "react-spinners";

function Chat({ isLoading, isPaused, setIsTyping }) {
  const { newChat, previousChats, currThreadId } = useContext(MyContext);

  const [typingReply, setTypingReply] = useState("");
  const prevLengthRef = useRef(0);       // tracks length after thread load
  const justLoadedThreadRef = useRef(true); // true right after switching thread
  const bottomRef = useRef(null);

  // When thread changes → treat all messages as existing (static)
  useEffect(() => {
    prevLengthRef.current = previousChats.length;
    justLoadedThreadRef.current = true;
    setTypingReply("");
  }, [currThreadId]);

  useEffect(() => {
    if (!previousChats.length) return;

    const last = previousChats[previousChats.length - 1];

    // If last is not assistant, just update length and exit
    if (last.role !== "assistant") {
      prevLengthRef.current = previousChats.length;
      return;
    }

    // Only skip typing when opening an old thread
    // Skip typing only when opening an existing thread with messages
    if (justLoadedThreadRef.current && previousChats.length > 2) {
      justLoadedThreadRef.current = false;
      prevLengthRef.current = previousChats.length;
      setTypingReply(last.content);
      return;
    }

    justLoadedThreadRef.current = false;




    const isNewAssistantReply = previousChats.length > prevLengthRef.current;


    // Not a new reply → static
    if (!isNewAssistantReply) {
      setTypingReply(last.content);
      prevLengthRef.current = previousChats.length;
      return;
    }


    // Typing effect for newly appended assistant message
    const words = last.content.split(" ");
    let i = 0;
    setTypingReply("");

    const interval = setInterval(() => {
      if (isPaused) {
        clearInterval(interval);
        setIsTyping && setIsTyping(false);
        return;
      }

      setTypingReply(words.slice(0, i + 1).join(" "));
      i++;

      if (i >= words.length) {
        clearInterval(interval);
        prevLengthRef.current = previousChats.length; // update here
        setIsTyping && setIsTyping(false);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [previousChats, isPaused]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [typingReply, previousChats]);

  return (
    <>
      {newChat && (
        <div className="newChatScreen">
          <h1>Start a New Chat!</h1>
        </div>
      )}

      <div className="chats">
        {previousChats.map((chat, index) => {
          const isLastAssistant =
            index === previousChats.length - 1 && chat.role === "assistant";

          return (
            <div
              className={chat.role === "user" ? "userDiv" : "gptDiv"}
              key={index}
            >
              {chat.role === "user" ? (
                <p className="userMessage">{chat.content}</p>
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {isLastAssistant ? typingReply || chat.content : chat.content}
                </ReactMarkdown>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="gptDiv">
            <ScaleLoader color="#fff" height={10} />
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>
    </>
  );
}

export default Chat;
