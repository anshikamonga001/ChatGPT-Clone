import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef, useEffect } from "react";
import SettingsModal from "./SettingsModal.jsx";
import UpgradeModal from "./UpgradeModal.jsx";

function ChatWindow(){

    const { prompt, setPrompt, currThreadId, setPreviousChats, setNewChat, token, handleLogout, user, setRefreshThreads } = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [selectedModel, setSelectedModel] = useState('chatgpt');

    // Attachments
    const [attachments, setAttachments] = useState([]); // [{type, name, content, preview}]
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showGithubInput, setShowGithubInput] = useState(false);
    const [githubUrl, setGithubUrl] = useState('');
    const [githubLoading, setGithubLoading] = useState(false);

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const attachMenuRef = useRef(null);

    // Dictation
    const [dictationEnabled, setDictationEnabled] = useState(
        localStorage.getItem('setting_dictation') === 'true'
    );
    useEffect(() => {
        const syncDictation = () => {
            setDictationEnabled(localStorage.getItem('setting_dictation') === 'true');
        };
        window.addEventListener('focus', syncDictation);
        return () => window.removeEventListener('focus', syncDictation);
    }, []);

    const recognitionRef = useRef(null);

    // Close attach menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
                setShowAttachMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ── Send message ─────────────────────────────────── */
    const getReply = async () => {
        if (!prompt.trim() && attachments.length === 0) return;

        setNewChat(false);
        setIsPaused(false);
        setIsTyping(false);

        const userMessage = prompt;
        const currentAttachments = [...attachments];
        setPrompt('');
        setAttachments([]);

        // Build context string for AI from attachments
        let attachmentContext = '';
        currentAttachments.forEach(att => {
            if (att.type === 'github') {
                attachmentContext += `\n\n[GitHub Repo: ${att.name}]`;
            } else if (att.type === 'file' && att.content) {
                attachmentContext += `\n\n[File: ${att.name}]\n${att.content.slice(0, 3000)}`;
            } else if (att.type === 'image') {
                attachmentContext += `\n\n[Image attached: ${att.name}]`;
            }
        });

        const fullMessage = userMessage + attachmentContext;

        setPreviousChats(prevChats => [
            ...prevChats,
            { role: 'user', content: userMessage, attachments: currentAttachments }
        ]);

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/chat/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: fullMessage,
                    threadId: currThreadId
                })
            });

            const rep = await response.json();
            setIsTyping(true);
            setRefreshThreads(prev => !prev);

            setPreviousChats(prevChats => [
                ...prevChats,
                { role: 'assistant', content: rep.reply }
            ]);

        } catch (error) {
            console.error('Error fetching reply:', error);
        }

        setIsLoading(false);
        setIsTyping(true);
    };

    /* ── File attachment ──────────────────────────────── */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAttachments(prev => [...prev, {
                type: 'file',
                name: file.name,
                content: ev.target.result,
                preview: null
            }]);
        };
        reader.readAsText(file);
        e.target.value = '';
        setShowAttachMenu(false);
    };

    /* ── Image attachment ─────────────────────────────── */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAttachments(prev => [...prev, {
                type: 'image',
                name: file.name,
                content: null,
                preview: ev.target.result
            }]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        setShowAttachMenu(false);
    };

    /* ── GitHub repo — fetch real content from GitHub API ── */
    const handleAddGithub = async () => {
        if (!githubUrl.trim()) return;

        // Extract owner/repo from URL
        let repoPath = githubUrl
            .replace('https://github.com/', '')
            .replace('http://github.com/', '')
            .replace(/\.git$/, '')
            .replace(/\/$/, '');

        // Must be owner/repo format
        const parts = repoPath.split('/');
        if (parts.length < 2) {
            alert('Please enter a valid GitHub repo URL like https://github.com/owner/repo');
            return;
        }
        const owner = parts[0];
        const repo = parts[1];

        setGithubLoading(true);
        setShowGithubInput(false);
        setShowAttachMenu(false);

        try {
            // 1. Fetch repo metadata
            const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (!repoRes.ok) throw new Error('Repo not found');
            const repoData = await repoRes.json();

            // 2. Fetch README
            let readmeText = '';
            try {
                const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
                if (readmeRes.ok) {
                    const readmeData = await readmeRes.json();
                    readmeText = atob(readmeData.content.replace(/\n/g, ''));
                }
            } catch (_) { /* README might not exist */ }

            // 3. Fetch file tree
            let fileTree = '';
            try {
                const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
                if (treeRes.ok) {
                    const treeData = await treeRes.json();
                    fileTree = treeData.tree
                        .filter(f => f.type === 'blob')
                        .map(f => f.path)
                        .slice(0, 80) // limit to 80 files
                        .join('\n');
                }
            } catch (_) { /* tree might not be accessible */ }

            // Build rich context string for the AI
            const content = [
                `Repository: ${repoData.full_name}`,
                repoData.description ? `Description: ${repoData.description}` : '',
                `Language: ${repoData.language || 'Unknown'}`,
                `Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}`,
                `URL: ${repoData.html_url}`,
                fileTree ? `\nFile Structure:\n${fileTree}` : '',
                readmeText ? `\nREADME:\n${readmeText.slice(0, 4000)}` : ''
            ].filter(Boolean).join('\n');

            setAttachments(prev => [...prev, {
                type: 'github',
                name: `${owner}/${repo}`,
                content,
                preview: null,
                url: repoData.html_url
            }]);

        } catch (err) {
            alert(`Could not fetch repo: ${err.message}. Make sure the repo is public.`);
        }

        setGithubUrl('');
        setGithubLoading(false);
    };

    /* ── Remove attachment ────────────────────────────── */
    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    /* ── Misc ─────────────────────────────────────────── */
    const pauseResponse = () => {
        setIsPaused(true);
        setIsTyping(false);
        setIsLoading(false);
    };

    const handleProfileClick = () => setIsOpen(!isOpen);

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Sorry, your browser does not support voice dictation. Please use Chrome.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = localStorage.getItem('setting_language') === 'hi' ? 'hi-IN' :
                           localStorage.getItem('setting_language') === 'en' ? 'en-US' : '';
        recognition.interimResults = true;
        recognition.continuous = false;
        let finalTranscript = '';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                else interim = event.results[i][0].transcript;
            }
            setPrompt(finalTranscript || interim);
        };
        recognition.onerror = (e) => { console.error('Speech error:', e.error); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    };

    /* ── Render ───────────────────────────────────────── */
    return (
        <div className="chatWindow">

            <div className="navbar">
                <div className="modelSelector" onClick={() => { setIsModelOpen(p => !p); setIsOpen(false); }}>
                    <span className="modelName">ChatGPT</span>
                    <i className="fa-solid fa-chevron-down modelChevron"></i>
                </div>

                {isModelOpen && (
                    <div className="modelDropdown" onClick={() => setIsModelOpen(false)}>
                        <div className={`modelOption ${selectedModel === 'plus' ? 'active' : ''}`}
                            onClick={() => { setSelectedModel('plus'); setIsUpgradeOpen(true); }}>
                            <div className="modelOptionLeft">
                                <div className="modelIconWrap plus"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                <div>
                                    <div className="modelOptionName">ChatGPT Plus</div>
                                    <div className="modelOptionDesc">Our smartest model &amp; more</div>
                                </div>
                            </div>
                            <button className="upgradeChip" onClick={(e) => { e.stopPropagation(); setIsUpgradeOpen(true); setIsModelOpen(false); }}>Upgrade</button>
                        </div>
                        <div className={`modelOption ${selectedModel === 'chatgpt' ? 'active' : ''}`}
                            onClick={() => setSelectedModel('chatgpt')}>
                            <div className="modelOptionLeft">
                                <div className="modelIconWrap"><i className="fa-solid fa-robot"></i></div>
                                <div>
                                    <div className="modelOptionName">ChatGPT</div>
                                    <div className="modelOptionDesc">Great for everyday tasks</div>
                                </div>
                            </div>
                            {selectedModel === 'chatgpt' && <i className="fa-solid fa-check modelCheck"></i>}
                        </div>
                    </div>
                )}

                <div className="userIconDiv" onClick={() => { setIsOpen(p => !p); setIsModelOpen(false); }}>
                    <span className="userIcon">
                        {user?.name ? (
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <i className="fa-solid fa-user"></i>
                        )}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem" onClick={() => { setIsUpgradeOpen(true); setIsOpen(false); }}>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan
                    </div>
                    <div className="dropDownItem" onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }}>
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItem" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out"></i> Logout
                    </div>
                </div>
            )}

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

            <Chat isLoading={isLoading} isPaused={isPaused} setIsTyping={setIsTyping} />

            <div className="chatInput">

                {/* Attachment chips preview */}
                {attachments.length > 0 && (
                    <div className="attachmentChips">
                        {attachments.map((att, i) => (
                            <div className="attachChip" key={i}>
                                {att.type === 'image' && att.preview ? (
                                    <img src={att.preview} alt={att.name} className="chipImg" />
                                ) : att.type === 'github' ? (
                                    <i className="fa-brands fa-github chipIcon"></i>
                                ) : (
                                    <i className="fa-solid fa-file-lines chipIcon"></i>
                                )}
                                <span className="chipName">{att.name.length > 20 ? att.name.slice(0, 20) + '...' : att.name}</span>
                                <span className="chipRemove" onClick={() => removeAttachment(i)}>
                                    <i className="fa-solid fa-xmark"></i>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* GitHub loading chip */}
                {githubLoading && (
                    <div className="attachmentChips">
                        <div className="attachChip">
                            <i className="fa-brands fa-github chipIcon"></i>
                            <span className="chipName">Fetching repo...</span>
                            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:'11px', color:'#aaa'}}></i>
                        </div>
                    </div>
                )}

                <div className="inputBox">

                    {/* Hidden file inputs */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}}
                        accept=".txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.html,.css,.json,.csv,.xml" />
                    <input type="file" ref={imageInputRef} onChange={handleImageChange} style={{display:'none'}}
                        accept="image/*" />

                    {/* Attach button */}
                    <div className="attachWrap" ref={attachMenuRef}>
                        <div id="attachBtn" onClick={() => { setShowAttachMenu(p => !p); setShowGithubInput(false); }} title="Attach">
                            <i className="fa-solid fa-plus"></i>
                        </div>

                        {showAttachMenu && (
                            <div className="attachMenu">
                                <div className="attachOption" onClick={() => { imageInputRef.current.click(); }}>
                                    <i className="fa-solid fa-image"></i>
                                    <span>Add Image</span>
                                </div>
                                <div className="attachOption" onClick={() => { fileInputRef.current.click(); }}>
                                    <i className="fa-solid fa-file-lines"></i>
                                    <span>Attach File</span>
                                </div>
                                <div className="attachOption" onClick={() => { setShowGithubInput(true); setShowAttachMenu(false); }}>
                                    <i className="fa-brands fa-github"></i>
                                    <span>GitHub Repo</span>
                                </div>
                            </div>
                        )}

                        {showGithubInput && (
                            <div className="githubInputPopup">
                                <i className="fa-brands fa-github"></i>
                                <input
                                    type="text"
                                    placeholder="https://github.com/user/repo"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGithub()}
                                    autoFocus
                                />
                                <button onClick={handleAddGithub} disabled={githubLoading}>
                                    {githubLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Add'}
                                </button>
                                <span onClick={() => setShowGithubInput(false)} className="githubClose">
                                    <i className="fa-solid fa-xmark"></i>
                                </span>
                            </div>
                        )}
                    </div>


                    <input
                        placeholder={isListening ? '🎤 Listening...' : 'Ask anything'}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    />
                    {/* Mic button — left of send arrow, absolutely positioned */}
                    {dictationEnabled && (
                        <div
                            id="micBtn"
                            className={isListening ? 'listening' : ''}
                            onClick={toggleListening}
                            title={isListening ? 'Stop recording' : 'Start voice input'}
                        >
                            <i className={`fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                        </div>
                    )}

                    <div id="submit" onClick={(isLoading || isTyping) ? pauseResponse : getReply}>
                        {(isLoading || isTyping) ? (
                            <i className="fa-solid fa-pause"></i>
                        ) : (
                            <i className="fa-solid fa-paper-plane"></i>
                        )}
                    </div>

                </div>

                <p className="info">ChatGPT can make mistakes. Check important info.</p>

            </div>

        </div>
    );
}

export default ChatWindow;