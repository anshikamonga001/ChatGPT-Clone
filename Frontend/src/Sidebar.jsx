import "./Sidebar.css";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {

  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPreviousChats
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/chat/thread");
      const res = await response.json();

      console.log("THREADS:", res);

      if (!Array.isArray(res)) {
        console.error("Threads response is not array:", res);
        return;
      }

      const filteredData = res.map(thread => ({
        threadId: thread.threadId,
        title: thread.title
      }));

      setAllThreads(filteredData);

    } catch (error) {
      console.log("Error fetching threads:", error);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    const newId = uuidv1();

    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(newId);
    setPreviousChats([]);

    getAllThreads();
  };

  const changeThread = async (newThreadId) => {

    const selectedThread = allThreads.find(
      thread => thread.threadId === newThreadId
    );

    if (!selectedThread) return;

    setCurrThreadId(selectedThread.threadId);

    try {

      const response = await fetch(
        `http://localhost:8080/chat/thread/${selectedThread.threadId}`
      );

      const res = await response.json();

      setPreviousChats(res);
      setNewChat(false);
      setReply(null);

    } catch (error) {
      console.log("Error fetching thread chats:", error);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`http://localhost:8080/chat/thread/${threadId}`, {
        method: "DELETE"});
      const res = await response.json();
      console.log("Delete response:", res);
      setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
      if (currThreadId === threadId) {
        createNewChat();
      }
    } catch (error) {
      console.log("Error deleting thread:", error);
    }
  };

   
  return (
    <section className="sidebar">

      {/* New Chat Button */}
      <button onClick={createNewChat}>
        <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
        <span>
          <i className="fa-regular fa-pen-to-square"></i>
        </span>
      </button>

      {/* Chat History */}
      <ul className="history">
        {allThreads?.map(thread => (
          <li
            key={thread.threadId}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "highlighted" : " "}
          >
            {thread.title}
            <i className="fa-solid fa-trash"
            onClick={(e) => {
              e.stopPropagation();
              deleteThread(thread.threadId);
            }}></i>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sign">
        <p>By AnshikaMonga ♥</p>
      </div>

    </section>
  );
}

export default Sidebar;