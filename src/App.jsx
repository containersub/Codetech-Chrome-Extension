import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [goal, setGoal] = useState('');
  const [dailyGoal, setDailyGoal] = useState(0);
  const [timeData, setTimeData] = useState({});
  const [isExtension, setIsExtension] = useState(false);

  // Check for Chrome extension environment
  useEffect(() => {
    const checkExtensionEnvironment = () => {
      try {
        if (typeof chrome !== 'undefined' && 
            chrome.storage &&
            chrome.runtime &&
            chrome.runtime.id) {
          setIsExtension(true);
          initializeExtensionData();
        }
      } catch (e) {
        console.log("Not running as Chrome extension");
      }
    };

    const initializeExtensionData = () => {
      chrome.storage.sync.get(['dailyGoal'], (result) => {
        setDailyGoal(result.dailyGoal || 0);
      });

      chrome.storage.local.get(['timeData'], (result) => {
        setTimeData(result.timeData || {});
      });
    };

    checkExtensionEnvironment();
  }, []);

  const setProductivityGoal = () => {
    if (!isExtension) return;
    
    const goalNumber = parseInt(goal);
    if (!isNaN(goalNumber)) {
      chrome.storage.sync.set({ dailyGoal: goalNumber }, () => {
        setDailyGoal(goalNumber);
        setGoal('');
      });
    }
  };

  const calculateProductivity = () => {
    if (!isExtension) return 0;
    const totalMinutes = Object.values(timeData).reduce((a, b) => a + b, 0);
    return dailyGoal > 0 ? Math.min((totalMinutes / dailyGoal) * 100, 100) : 0;
  };

  if (!isExtension) {
    return (
      <div className="App">
        <h1>Please install and run as a Chrome extension</h1>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Productivity Tracker</h1>
      
      <div className="goal-section">
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Set daily goal (minutes)"
        />
        <button onClick={setProductivityGoal}>Set Goal</button>
      </div>

      <div className="stats">
        <h2>Daily Summary</h2>
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${calculateProductivity()}%` }}
          ></div>
        </div>
        <p>Goal: {dailyGoal} minutes</p>
        <p>Achieved: {Object.values(timeData).reduce((a, b) => a + b, 0)} minutes</p>
      </div>

      <div className="website-list">
        <h3>Time Spent</h3>
        {Object.entries(timeData).map(([domain, minutes]) => (
          <div key={domain} className="website-item">
            <span>{domain}</span>
            <span>{minutes} mins</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;