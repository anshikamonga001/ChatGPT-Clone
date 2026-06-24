import React, { useState, useContext } from 'react';
import { MyContext } from './MyContext.jsx';
import './Modals.css';

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const { token, setAllThreads, theme, setTheme } = useContext(MyContext);

  // Persistent settings — read from localStorage on mount
  const [language, setLanguage] = useState(localStorage.getItem('setting_language') || 'auto');
  const [higherIntel, setHigherIntel] = useState(localStorage.getItem('setting_higherIntel') !== 'false');
  const [dictation, setDictation] = useState(localStorage.getItem('setting_dictation') === 'true');

  const handleLanguage = (e) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('setting_language', val);
  };

  const handleHigherIntel = (e) => {
    const val = e.target.checked;
    setHigherIntel(val);
    localStorage.setItem('setting_higherIntel', val);
  };

  const handleDictation = (e) => {
    const val = e.target.checked;
    setDictation(val);
    localStorage.setItem('setting_dictation', val);
  };

  if (!isOpen) return null;


  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL your chats? This cannot be undone.")) {
      try {
        const response = await fetch("http://localhost:8080/chat/thread", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          setAllThreads([]);
          window.location.reload(); // Quick refresh to reset state
        }
      } catch (err) {
        console.error("Failed to delete all threads", err);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        
        <div className="settings-sidebar">
          <div className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <i className="fa-solid fa-gear"></i> General
          </div>
          <div className={`settings-tab ${activeTab === 'personalization' ? 'active' : ''}`} onClick={() => setActiveTab('personalization')}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> Personalization
          </div>
          <div className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            <i className="fa-solid fa-database"></i> Data controls
          </div>
        </div>

        <div className="settings-body">
          {activeTab === 'general' && (
            <div>
              <h3>General Settings</h3>
              
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Appearance</h4>
                </div>
                <div className="setting-control">
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <h4>Language</h4>
                </div>
                <div className="setting-control">
                  <select 
                    value={language} 
                    onChange={handleLanguage}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <h4>Higher intelligence</h4>
                  <p>Automatically use a higher intelligence setting for complex questions.</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={higherIntel} onChange={handleHigherIntel} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <h4>Enable Dictation</h4>
                  <p>Use dictation in the chat composer.</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={dictation} onChange={handleDictation} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personalization' && (
            <div>
              <h3>Personalization</h3>
              
              <div className="setting-row" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <div className="setting-info" style={{marginBottom: '15px'}}>
                  <h4>Custom Instructions</h4>
                  <p>What would you like ChatGPT to know about you to provide better responses?</p>
                </div>
                <div className="setting-control" style={{width: '100%'}}>
                  <textarea 
                    placeholder="E.g., I am a software developer. Always provide code in Python."
                    style={{width: '100%', height: '100px', background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px', resize: 'vertical', fontFamily: 'inherit'}}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <h3>Data Controls</h3>
              
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Clear Chat History</h4>
                  <p>Delete all your chats completely from the database.</p>
                </div>
                <div className="setting-control">
                  <button className="setting-danger-btn" onClick={handleDeleteAll}>Clear all chats</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
