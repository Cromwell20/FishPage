import React, { useState, useEffect } from 'react';
import './Arkham.css'; // Import the CSS file for styling

function Arkham() {
  const initialOptions = ['Star', '-1', '-1', '-1', '-2', '-2', '-3', '-3', '-4', '-5', '-5', '-6', '-7', '-8', 'Autofail', 'Skull', 'Skull', 'Stone', 'Stone', 'Hood', 'Hood',];
  const [availableOptions, setAvailableOptions] = useState([]);
  const [revealedOptions, setRevealedOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [savedList, setSavedList] = useState([]);
  const [curseCount, setCurseCount] = useState(0);
  const [blessCount, setBlessCount] = useState(0);
  const [drawLog, setDrawLog] = useState([]);

  useEffect(() => {
    const countCurse = availableOptions.filter(option => option === 'Curse').length;
    setCurseCount(countCurse);

    const countBless = availableOptions.filter(option => option === 'Bless').length;
    setBlessCount(countBless);
  }, [availableOptions]);

  const loadBag = () => {
    if (savedList.length > 0) {
      setAvailableOptions([...savedList]);
    } else {
      setAvailableOptions([...initialOptions]);
    }
  };

  const clearBag = () => {
    setAvailableOptions([]);
  };

  const addToBag = () => {
    if (newOption.trim() !== '') {
      setAvailableOptions([...availableOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const addCurse = () => {
    if (curseCount < 10) {
      setAvailableOptions([...availableOptions, 'Curse']);
    }
  };

  const addBless = () => {
    if (blessCount < 10) {
    setAvailableOptions([...availableOptions, 'Bless']);
    }
  };

  const saveBag = () => {
    setSavedList([...availableOptions]);
  };

  const removeFirstCurse = () => {
    const index = availableOptions.findIndex(option => option === 'Curse');
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  const removeFirstBless = () => {
    const index = availableOptions.findIndex(option => option === 'Bless');
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  const revealToken = () => {
    if (availableOptions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedOption = availableOptions[randomIndex];
    setDrawLog(prev => [{ token: selectedOption, ts: Date.now() }, ...prev]);
    setRevealedOptions([...revealedOptions, selectedOption]);
    setAvailableOptions(availableOptions.filter((option, index) => index !== randomIndex));
  };

  const resetRevealed = () => {
    setAvailableOptions([...availableOptions, ...revealedOptions]);
    setRevealedOptions([]);
  };

  const removeRevealedItem = (item) => {
    const index = revealedOptions.findIndex(option => option === item);
    if (index !== -1) {
      const newRevealedOptions = [...revealedOptions];
      newRevealedOptions.splice(index, 1);
      setRevealedOptions(newRevealedOptions);
    }
  };

  const removeBagItem = (item) => {
    const index = availableOptions.findIndex(option => option === item);
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  return (
  <div className="arkham-container">
    <div className="left-panel">
      <button onClick={loadBag}>Load Bag</button>
      <button onClick={saveBag}>Save Bag</button>
      <button onClick={addCurse}>Add Curse</button>
      <button onClick={removeFirstCurse}>Curses: {curseCount}</button>
      <button onClick={addBless}>Add Bless</button>
      <button onClick={removeFirstBless}>Blesses: {blessCount}</button>
      <div className="input-add-container">
        <button onClick={addToBag}>Custom token</button>
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Enter new item"
        />
      </div>
      <button onClick={clearBag}>Clear Bag</button>

      {/* Rolling Log */}
      <div className="log-container">
        <div className="log-header">
          <h4>Draw Log</h4>
          <button
            className="log-clear"
            onClick={() => setDrawLog([])}
            title="Clear log"
          >
            Clear
          </button>
        </div>
        <ul className="log-list">
          {drawLog.map((entry, i) => (
            <li key={i} className="log-item">
              <span className="log-token">{entry.token}</span>
              {/* Optional: <span className="log-time">{new Date(entry.ts).toLocaleTimeString()}</span> */}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="center-panel">
      <button
        onClick={revealToken}
        className="reveal-token-button"
        disabled={availableOptions.length === 0}
      >
        {revealedOptions.length > 0 ? 'Reveal another token' : 'Reveal a token'}
      </button>
      <div className="revealed-container">
        <div className="revealed-items">
          {revealedOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => removeRevealedItem(option)}
              className="revealed-item"
            >
              {option}
              {index < revealedOptions.length - 1 ? ', ' : ''}
            </div>
          ))}
        </div>
        {revealedOptions.length > 0 && (
          <button onClick={resetRevealed} className="reset-button">
            Reset
          </button>
        )}
      </div>
    </div>

    <div className="right-panel">
      <h3>Current Bag Items</h3>
      <div className="bag-items">
        {availableOptions
          .slice()
          .sort()
          .map((option, index) => (
            <div
              key={index}
              onClick={() => removeBagItem(option)}
              className="bag-item"
            >
              {option}
            </div>
          ))}
      </div>
    </div>
  </div>
);
}

export default Arkham;