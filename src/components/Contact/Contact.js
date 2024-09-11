import React, { useState } from 'react';
import './Contact.css'; // Import the CSS file

// Import images
import img0 from '../../assets/images/0.png';
import img1 from '../../assets/images/1.png';
import img2 from '../../assets/images/2.png';
import img3 from '../../assets/images/3.png';
import img4 from '../../assets/images/4.png';
import img5 from '../../assets/images/5.png';
import img6 from '../../assets/images/6.png';
import img7 from '../../assets/images/7.png';
import img8 from '../../assets/images/8.png';
import img9 from '../../assets/images/9.png';

// Import sounds
import sound1 from '../../assets/sounds/lets-go-gambling_01.mp3';
import sound2 from '../../assets/sounds/lets-go-gambling_02.mp3';
import sound3 from '../../assets/sounds/lets-go-gambling_03.mp3';

const images = [img0, img1, img2, img3, img4, img5, img6, img7, img8, img9];

function Contact() {
  // Create audio objects
  const audio1 = new Audio(sound1);
  const audio2 = new Audio(sound2);
  const audio3 = new Audio(sound3);

  const generateRandomList = () => {
    const list = Array.from({ length: 10 }, (_, i) => i);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const [list1] = useState(generateRandomList());
  const [list2] = useState(generateRandomList());
  const [list3] = useState(generateRandomList());
  const [grid, setGrid] = useState([]);
  const [winner, setWinner] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  const generateNumbers = () => {
    const getRandomIndex = (list) => Math.floor(Math.random() * list.length);

    const index1 = getRandomIndex(list1);
    const index2 = getRandomIndex(list2);
    const index3 = getRandomIndex(list3);

    const num1 = list1[index1];
    const num2 = list2[index2];
    const num3 = list3[index3];

    const grid = [
      [list1[(index1 - 1 + 10) % 10], list2[(index2 - 1 + 10) % 10], list3[(index3 - 1 + 10) % 10]],
      [num1, num2, num3],
      [list1[(index1 + 1) % 10], list2[(index2 + 1) % 10], list3[(index3 + 1) % 10]],
    ];

    setGrid(grid);

    const checkWinner = () => {
      const rows = grid;
      const cols = [0, 1, 2].map(i => [grid[0][i], grid[1][i], grid[2][i]]);
      const diags = [
        [grid[0][0], grid[1][1], grid[2][2]],
        [grid[0][2], grid[1][1], grid[2][0]],
      ];

      const lines = [...rows, ...cols, ...diags];

      return lines.some(line => line.every(num => num === line[0]));
    };

    const isWinner = checkWinner();
    setWinner(isWinner);

    // Play sound2 if the player did not win
    if (!isWinner) {
      audio2.play();
    } else {
      // Play sound3 if the player wins
      audio3.play();
    }
  };

  const handleAgeVerification = (isAdult) => {
    if (isAdult) {
      audio1.play();
      setIsAgeVerified(true);
    } else {
      window.location.href = 'https://www.minimax.hu/';
    }
  };

  return (
    <div className="contact-container">
      <h1>Contact Page</h1>
      <p>Get in touch with us!</p>
      {!isAgeVerified ? (
        <div className="age-verification-container">
          <button className="age-verification-button" onClick={() => handleAgeVerification(true)}>I am 18 or older</button>
          <button className="age-verification-button" onClick={() => handleAgeVerification(false)}>I am under 18</button>
        </div>
      ) : (
        <button onClick={generateNumbers}>Spin</button>
      )}
      {grid.length > 0 && (
        <div>
          <div className="grid-container">
            {grid.flat().map((num, index) => (
              <div key={index} className="grid-item">
                <img src={images[num]} alt={`Number ${num}`} />
              </div>
            ))}
          </div>
          {winner && <p className="winner-text">Winner!</p>}
        </div>
      )}
    </div>
  );
}

export default Contact;