import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from 'uuid';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [previousChats, setPreviousChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshThreads, setRefreshThreads] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setAllThreads([]);
    setPreviousChats([]);
    setNewChat(true);
    setCurrThreadId(uuidv1());
    navigate('/login');
  };

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    previousChats,
    setPreviousChats,
    allThreads,
    setAllThreads,
    user,
    setUser,
    token,
    setToken,
    handleLogout,
    theme,
    setTheme,
    refreshThreads,
    setRefreshThreads,
    isSidebarOpen,
    setIsSidebarOpen
  };

  return (
    <MyContext.Provider value={providerValues}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route 
          path="/" 
          element={
            user ? (
              <div className='app'>
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
                <Sidebar />
                <ChatWindow />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </MyContext.Provider>
  )
}

export default App;
