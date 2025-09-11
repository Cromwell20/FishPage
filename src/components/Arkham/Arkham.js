import React, { useState, useEffect, useCallback } from 'react';
import './Arkham.css'; // Import the CSS file for styling

function Arkham() {
  const initialOptions = ['Star', '0', '-1', '-1', '-2', '-2', '-3', '-3', '-4', '-4', '-5', '-6', '-8', 'Autofail', 'Skull', 'Skull', 'Stone', 'Tentacles'];
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

  // Stable callback: reveal a random token (uses functional setState to avoid stale closures)
  const revealToken = useCallback(() => {
    setAvailableOptions(prev => {
      if (prev.length === 0) return prev;
      const randomIndex = Math.floor(Math.random() * prev.length);
      const selectedOption = prev[randomIndex];
      setDrawLog(prevLog => [{ token: selectedOption, ts: Date.now() }, ...prevLog]);
      setRevealedOptions(prevRev => [...prevRev, selectedOption]);
      return prev.filter((option, index) => index !== randomIndex);
    });
  }, []);

  // Stable callback: move all revealed tokens back to the bag
  const resetRevealed = useCallback(() => {
    setRevealedOptions(prevRev => {
      if (prevRev.length === 0) return prevRev;
      setAvailableOptions(prevAvail => [...prevAvail, ...prevRev]);
      return [];
    });
  }, []);

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

  // --- Keyboard shortcuts ---
  // D => draw (revealToken)
  // R => reset revealed back into the bag (resetRevealed)
  useEffect(() => {
    const onKeyDown = (e) => {
      // Don't trigger while typing in inputs/textareas/selects/contenteditable
      const target = e.target;
      const tag = target && target.tagName ? target.tagName.toUpperCase() : '';
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable);
      if (isTyping) return;

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        revealToken();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetRevealed();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [revealToken, resetRevealed]);

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

        {/* Shortcut hint */}
        <div className="shortcut-hint">Press <strong>D</strong> to draw, <strong>R</strong> to reset.</div>
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
