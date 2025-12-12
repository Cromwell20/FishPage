import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import './Arkham.css';

function Arkham() {
  // ---------------------------------------------------------------------------
  // 1. Static defaults
  // ---------------------------------------------------------------------------

  const initialOptions = [
    'Star', '0',
    '-1', '-1',
    '-2', '-2',
    '-3', '-3',
    '-4', '-4',
    '-5',
    '-6',
    '-8',
    'Autofail',
    'Skull', 'Skull',
    'Stone', 'Stone',
    'Tentacles', 'Tentacles',
  ];

  const thresholds = [0, -1, -2, -3, -4, -5, -6, -7, -8];

  // ---------------------------------------------------------------------------
  // 2. React state
  // ---------------------------------------------------------------------------

  const [availableOptions, setAvailableOptions] = useState([]);
  const [revealedOptions, setRevealedOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [savedList, setSavedList] = useState([]);
  const [curseCount, setCurseCount] = useState(0);
  const [blessCount, setBlessCount] = useState(0);
  const [drawLog, setDrawLog] = useState([]);
  const [showOdds, setShowOdds] = useState(true);

  // Editable values for special symbol tokens
  const [stoneValue, setStoneValue] = useState(-4);
  const [alienValue, setAlienValue] = useState(-2); // Tentacles / Alien
  const [hoodValue, setHoodValue] = useState(-5);
  const [skullValue, setSkullValue] = useState(-3);

  // Toggles: treat these as "chain tokens" in the CHART ONLY
  const [skullChains, setSkullChains] = useState(false);
  const [stoneChains, setStoneChains] = useState(false);
  const [alienChains, setAlienChains] = useState(false);
  const [hoodChains, setHoodChains] = useState(false);

  // ---------------------------------------------------------------------------
  // 3. Effects: Bless/Curse counts + localStorage hydrate
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const curse = availableOptions.filter((option) => option === 'Curse').length;
    const bless = availableOptions.filter((option) => option === 'Bless').length;
    setCurseCount(curse);
    setBlessCount(bless);
  }, [availableOptions]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const stored = window.localStorage.getItem('arkhamSavedBag');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSavedList(parsed);
      }
    } catch (err) {
      console.error('Failed to load Arkham bag from localStorage:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 4. Bag management actions
  // ---------------------------------------------------------------------------

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
      setAvailableOptions((prev) => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  const addCurse = () => {
    if (curseCount < 10) {
      setAvailableOptions((prev) => [...prev, 'Curse']);
    }
  };

  const addBless = () => {
    if (blessCount < 10) {
      setAvailableOptions((prev) => [...prev, 'Bless']);
    }
  };

  const saveBag = () => {
    const newSaved = [...availableOptions];
    setSavedList(newSaved);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('arkhamSavedBag', JSON.stringify(newSaved));
      }
    } catch (err) {
      console.error('Failed to save Arkham bag to localStorage:', err);
    }
  };

  const removeFirstCurse = () => {
    const index = availableOptions.findIndex((option) => option === 'Curse');
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  const removeFirstBless = () => {
    const index = availableOptions.findIndex((option) => option === 'Bless');
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  const removeRevealedItem = (item) => {
    const index = revealedOptions.findIndex((option) => option === item);
    if (index !== -1) {
      const newRevealedOptions = [...revealedOptions];
      newRevealedOptions.splice(index, 1);
      setRevealedOptions(newRevealedOptions);
    }
  };

  const removeBagItem = (item) => {
    const index = availableOptions.findIndex((option) => option === item);
    if (index !== -1) {
      const newAvailableOptions = [...availableOptions];
      newAvailableOptions.splice(index, 1);
      setAvailableOptions(newAvailableOptions);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Draw / reset actions
  //    One click = one draw. No automatic chaining.
  //    (No side-effects inside setState updaters.)
  // ---------------------------------------------------------------------------

  const revealToken = useCallback(() => {
    if (availableOptions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedOption = availableOptions[randomIndex];

    // Update bag: remove that token
    setAvailableOptions((prev) =>
      prev.filter((_, index) => index !== randomIndex),
    );

    // Update log & revealed based on the selected token
    setDrawLog((prevLog) => [{ token: selectedOption, ts: Date.now() }, ...prevLog]);
    setRevealedOptions((prevRev) => [...prevRev, selectedOption]);
  }, [availableOptions]);

  const resetRevealed = useCallback(() => {
    if (revealedOptions.length === 0) return;
    // Put everything back into bag
    setAvailableOptions((prevAvail) => [...prevAvail, ...revealedOptions]);
    // Clear revealed list
    setRevealedOptions([]);
  }, [revealedOptions]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts: D = draw, R = reset
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const tag = target && target.tagName ? target.tagName.toUpperCase() : '';
      const isTyping =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (target && target.isContentEditable);

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

  // ---------------------------------------------------------------------------
  // 6. Token base value helper (for CHART math only)
  // ---------------------------------------------------------------------------

  const getTokenBaseValue = useCallback(
    (token) => {
      if (token === 'Autofail' || token === 'Bless' || token === 'Curse') return null;

      if (token === 'Star' || token === '0') return 0;

      if (token === 'Skull') return skullValue;
      if (token === 'Stone') return stoneValue;
      if (token === 'Tentacles' || token === 'Alien') return alienValue;
      if (token === 'Hood') return hoodValue;

      const parsed = parseInt(token, 10);
      if (!Number.isNaN(parsed)) return parsed;

      return 0;
    },
    [skullValue, stoneValue, alienValue, hoodValue],
  );

  // ---------------------------------------------------------------------------
  // 7. Probability chart logic (exact DP, no randomness)
  // ---------------------------------------------------------------------------

  const probabilityData = useMemo(() => {
    // For the chart, treat the "bag" as everything:
    // current bag + currently revealed tokens.
    const bagForCalc = [...availableOptions, ...revealedOptions];

    if (bagForCalc.length === 0) {
      return thresholds.map((t) => ({
        threshold: t,
        probability: 0,
      }));
    }

    // Build counts map: tokenLabel -> count
    const initialCounts = {};
    for (let i = 0; i < bagForCalc.length; i++) {
      const tk = bagForCalc[i];
      initialCounts[tk] = (initialCounts[tk] || 0) + 1;
    }

    const memo = new Map();

    const makeKey = (counts, bonus) => {
      const keys = Object.keys(counts).sort();
      const parts = [];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        parts.push(k + ':' + counts[k]);
      }
      return bonus + '|' + parts.join(',');
    };

    const rec = (counts, bonus) => {
      const key = makeKey(counts, bonus);
      if (memo.has(key)) {
        return memo.get(key);
      }

      let totalCount = 0;
      for (const label in counts) {
        if (Object.prototype.hasOwnProperty.call(counts, label)) {
          totalCount += counts[label];
        }
      }

      // No tokens left: whatever bonus we have is the final outcome
      if (totalCount === 0) {
        const baseDist = {};
        baseDist[bonus] = 1;
        memo.set(key, baseDist);
        return baseDist;
      }

      const dist = {};

      const addToDist = (subDist, weight) => {
        for (const outcome in subDist) {
          if (!Object.prototype.hasOwnProperty.call(subDist, outcome)) continue;
          const p = subDist[outcome] * weight;
          dist[outcome] = (dist[outcome] || 0) + p;
        }
      };

      for (const label in counts) {
        if (!Object.prototype.hasOwnProperty.call(counts, label)) continue;
        const count = counts[label];
        if (!count) continue;

        const p = count / totalCount;

        // Clone counts, remove one instance of this label
        const nextCounts = { ...counts };
        nextCounts[label] = count - 1;
        if (nextCounts[label] === 0) {
          delete nextCounts[label];
        }

        let subDist;

        // Autofail: resolves immediately to a special low value
        if (label === 'Autofail') {
          subDist = { '-9999': 1 };
        }
        // Bless / Curse: adjust bonus, keep drawing
        else if (label === 'Bless') {
          subDist = rec(nextCounts, bonus + 2);
        } else if (label === 'Curse') {
          subDist = rec(nextCounts, bonus - 2);
        }
        // Chaining specials if toggled ON
        else if (
          (label === 'Skull' && skullChains) ||
          (label === 'Stone' && stoneChains) ||
          ((label === 'Tentacles' || label === 'Alien') && alienChains) ||
          (label === 'Hood' && hoodChains)
        ) {
          const baseVal = getTokenBaseValue(label);
          const add = baseVal == null ? 0 : baseVal;
          subDist = rec(nextCounts, bonus + add);
        }
        // Normal resolving token: add its value and stop
        else {
          const baseVal = getTokenBaseValue(label);
          const add = baseVal == null ? 0 : baseVal;
          const finalTotal = bonus + add;
          subDist = {};
          subDist[finalTotal] = 1;
        }

        addToDist(subDist, p);
      }

      memo.set(key, dist);
      return dist;
    };

    const rawDist = rec(initialCounts, 0);

    // Convert to probabilities for each threshold: P(result >= threshold)
    const baseData = thresholds.map((threshold) => {
      let prob = 0;
      for (const key in rawDist) {
        if (!Object.prototype.hasOwnProperty.call(rawDist, key)) continue;
        const val = Number(key);
        if (Number.isNaN(val)) continue;
        if (val >= threshold) {
          prob += rawDist[key];
        }
      }
      if (prob > 1) prob = 1;
      if (prob < 0) prob = 0;
      return { threshold, probability: prob };
    });

    return baseData;
  }, [
    availableOptions,
    revealedOptions,
    getTokenBaseValue,
    skullChains,
    stoneChains,
    alienChains,
    hoodChains,
    thresholds,
  ]);

  // ---------------------------------------------------------------------------
  // 8. Render
  // ---------------------------------------------------------------------------

  return (
    <div className="arkham-container">
      {/* Left panel: controls & log */}
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
              </li>
            ))}
          </ul>
        </div>

        <div className="shortcut-hint">
          Press <strong>D</strong> to draw, <strong>R</strong> to reset.
        </div>
      </div>

      {/* Center panel: draw + revealed + probabilities */}
      <div className="center-panel">
        <button
          onClick={revealToken}
          className="reveal-token-button"
          disabled={availableOptions.length === 0}
        >
          {revealedOptions.length > 0 ? 'Draw another token' : 'Draw a token'}
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

        {/* Probability chart + token values + chain toggles */}
        {showOdds && (
          <div className="arkham-probability-section">
            <div className="probability-chart">
              {probabilityData.map(({ threshold, probability }) => (
                <div key={threshold} className="probability-bar-wrapper">
                  <div className="probability-bar-column">
                    <div
                      className="probability-bar"
                      style={{ height: `${probability * 100}%` }}
                    >
                      <span className="probability-percent">
                        {Math.round(probability * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="probability-threshold">{threshold}</div>
                </div>
              ))}
            </div>

            <div className="token-values-settings">
              <label className="token-setting">
                <span
                  className={`token-toggle ${stoneChains ? 'token-toggle-active' : ''}`}
                  onClick={() => setStoneChains((v) => !v)}
                >
                  Stone
                </span>
                <input
                  type="number"
                  value={stoneValue}
                  onChange={(e) => setStoneValue(Number(e.target.value) || 0)}
                />
              </label>

              <label className="token-setting">
                <span
                  className={`token-toggle ${alienChains ? 'token-toggle-active' : ''}`}
                  onClick={() => setAlienChains((v) => !v)}
                >
                  Alien
                </span>
                <input
                  type="number"
                  value={alienValue}
                  onChange={(e) => setAlienValue(Number(e.target.value) || 0)}
                />
              </label>

              <label className="token-setting">
                <span
                  className={`token-toggle ${hoodChains ? 'token-toggle-active' : ''}`}
                  onClick={() => setHoodChains((v) => !v)}
                >
                  Hood
                </span>
                <input
                  type="number"
                  value={hoodValue}
                  onChange={(e) => setHoodValue(Number(e.target.value) || 0)}
                />
              </label>

              <label className="token-setting">
                <span
                  className={`token-toggle ${skullChains ? 'token-toggle-active' : ''}`}
                  onClick={() => setSkullChains((v) => !v)}
                >
                  Skull
                </span>
                <input
                  type="number"
                  value={skullValue}
                  onChange={(e) => setSkullValue(Number(e.target.value) || 0)}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: current bag items */}
      <div className="right-panel">
        <div className="odds-toggle">
          <button onClick={() => setShowOdds(s => !s)}>
            {showOdds ? "Hide Odds" : "Show Odds"}
          </button>
        </div>

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
