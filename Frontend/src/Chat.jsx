import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";

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
                            chat.role === "user" ? <p className="userMessage">{chat.content}</p> : <p className="gptMessage">{chat.content}</p>
                        }
                    </div>
                    )
                }
            </div>
        </>
    )
}

export default Chat;