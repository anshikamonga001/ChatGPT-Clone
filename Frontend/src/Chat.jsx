import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
// import "highlight.js/styles/github-dark.css";

//for sytax highlighting in code blocks - rehype-highlight
//to display info in proper format or to display response from openai in proper format - react-markdown

function Chat(){
    const {newChat, previousChats} = useContext(MyContext);
    return (
        <>
            {newChat && <h1>Start a New Chat!</h1>}
            <div className="chats">
                {
                    previousChats?.map((chat, index) => 
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={index}>
                        {
                            chat.role === "user" ? <p className="userMessage">{chat.content}</p> : <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                        }
                    </div>
                    )
                }
            </div>
        </>
    )
}

export default Chat;