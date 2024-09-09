import React, { useState } from 'react';
import './Arkham.css'; // Import the CSS file for styling

function Arkham() {
  const initialOptions = ['Star', '0', '-1', '-1', '-2', '-2', '-3', '-4', '-6', '-8', 'Autofail', 'Skull', 'Skull', 'Stone', 'Stone'];
  const [availableOptions, setAvailableOptions] = useState([]);
  const [revealedOptions, setRevealedOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [savedList, setSavedList] = useState([]);

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
    setAvailableOptions([...availableOptions, 'Curse']);
  };

  const addBless = () => {
    setAvailableOptions([...availableOptions, 'Bless']);
  };

  const saveBag = () => {
    setSavedList([...availableOptions]);
  };

  const revealToken = () => {
    if (availableOptions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedOption = availableOptions[randomIndex];

    setRevealedOptions([...revealedOptions, selectedOption]);
    setAvailableOptions(availableOptions.filter((option, index) => index !== randomIndex));
  };

  const resetRevealed = () => {
    setAvailableOptions([...availableOptions, ...revealedOptions]);
    setRevealedOptions([]);
  };

  const removeRevealedItem = (item) => {
    setRevealedOptions(revealedOptions.filter(option => option !== item));
    setAvailableOptions(availableOptions.filter(option => option !== item));
  };

  const removeBagItem = (item) => {
    setAvailableOptions(availableOptions.filter(option => option !== item));
  };

  return (
    <div className="arkham-container">
      <div className="left-panel">
        <button onClick={loadBag}>Load Bag</button>
        <button onClick={saveBag}>Save Bag</button>
        <button onClick={addCurse}>Add Curse</button>
        <button onClick={addBless}>Add Bless</button>
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
      </div>
      <div className="center-panel">
  <button onClick={revealToken} className="reveal-token-button" disabled={availableOptions.length === 0}>
    {revealedOptions.length > 0 ? 'Reveal another token' : 'Reveal a token'}
  </button>
  <div className="revealed-container">
    <div className="revealed-items">
      {revealedOptions.map((option, index) => (
        <div key={index} onClick={() => removeRevealedItem(option)} className="revealed-item">
          {option}{index < revealedOptions.length - 1 ? ', ' : ''}
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
          {availableOptions.slice().sort().map((option, index) => (
            <div key={index} onClick={() => removeBagItem(option)} className="bag-item">
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Arkham;