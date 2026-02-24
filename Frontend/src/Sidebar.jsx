import "./Sidebar.css";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect } from "react";

function Sidebar(){
    const { allThreads, setAllThreads, currThreadId } = useContext(MyContext);
    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/chat/thread");
            const res = await response.json();
            const fileteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title,
            }));
            setAllThreads(fileteredData);
        } catch (error) {
            console.log("Error fetching threads:", error);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, []);
    return (
        <section className="sidebar">
            {/* new chat button */}
            <button>
                <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>

            {/* history */}
            <ul className="history">
                {
                    allThreads?.map((thread,idx) => (
                        <li key={idx}>{thread.title}</li>
                    ))}
            </ul>

            {/* sign */}
            <div className="sign">
                <p>By AnshikaMonga &hearts;</p>
            </div>
        </section>
    )
}

export default Sidebar;