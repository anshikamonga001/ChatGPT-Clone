import React, { useState } from 'react';
import './Modals.css';

function UpgradeModal({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState("free");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        
        <div className="upgrade-header">
          <h2>Upgrade your plan</h2>
          <p>Get more out of ChatGPT</p>
        </div>

        <div className="upgrade-cards">
          <div 
            className={`upgrade-card ${selectedPlan === 'free' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedPlan('free');
              onClose();
            }}
          >
            <h3>Free</h3>
            <div className="upgrade-price">USD $0<span>/mo</span></div>
            <ul className="upgrade-features">
              <li><i className="fa-solid fa-check"></i> Standard response speed</li>
              <li><i className="fa-solid fa-check"></i> Regular model updates</li>
              <li style={{color: '#666'}}><i className="fa-solid fa-xmark" style={{color: '#666'}}></i> Access during peak hours</li>
            </ul>
            <button className={`upgrade-btn free ${selectedPlan === 'free' ? 'active-btn' : ''}`} onClick={onClose}>
              Your Current Plan
            </button>
          </div>

          <div 
            className={`upgrade-card premium ${selectedPlan === 'plus' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedPlan('plus');
              alert("Payment Gateway Coming Soon!");
            }}
          >
            <h3>Plus</h3>
            <div className="upgrade-price">USD $20<span>/mo</span></div>
            <ul className="upgrade-features">
              <li><i className="fa-solid fa-check"></i> Faster response speed</li>
              <li><i className="fa-solid fa-check"></i> Priority access to new features</li>
              <li><i className="fa-solid fa-check"></i> Always available during peak hours</li>
            </ul>
            <button className={`upgrade-btn premium ${selectedPlan === 'plus' ? 'active-btn' : ''}`}>
              Upgrade to Plus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
