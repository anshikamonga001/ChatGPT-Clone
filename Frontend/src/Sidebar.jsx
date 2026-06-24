import "./Sidebar.css";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { API_URL } from "./config.js";
import blackLogo from "./assets/blacklogo.png";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPreviousChats,
    token,
    user,
    handleLogout,
    refreshThreads,
    isSidebarOpen,
    setIsSidebarOpen
  } = useContext(MyContext);

  const getAllThreads = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/chat/thread`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const res = await response.json();

      if (!Array.isArray(res)) {
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
  }, [currThreadId, token, refreshThreads]);

  const createNewChat = () => {
    const newId = uuidv1();

    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(newId);
    setPreviousChats([]);
    setIsSidebarOpen(false);

    getAllThreads();
  };

  const changeThread = async (newThreadId) => {
    const selectedThread = allThreads.find(
      thread => thread.threadId === newThreadId
    );

    if (!selectedThread) return;

    setCurrThreadId(selectedThread.threadId);
    setIsSidebarOpen(false);

    try {
      const response = await fetch(
        `${API_URL}/chat/thread/${selectedThread.threadId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
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
      const response = await fetch(`${API_URL}/chat/thread/${threadId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const res = await response.json();
      setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
      if (currThreadId === threadId) {
        createNewChat();
      }
    } catch (error) {
      console.log("Error deleting thread:", error);
    }
  };

  return (
    <section className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebarHeader">
        <button onClick={createNewChat} style={{ flex: 1 }}>
          <img src={blackLogo} alt="gpt logo" className="logo" />
          <span>
            <i className="fa-regular fa-pen-to-square"></i>
          </span>
        </button>
        <div className="closeSidebarBtn" onClick={() => setIsSidebarOpen(false)}>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

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