import React from 'react';
import leftImage from '../../assets/images/left-image.png';
import rightImage from '../../assets/images/right-image.png';

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
      <div className="media-container">
        <img src={leftImage} alt="Left" className="side-image left-image" />
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/XQbPaBRvaJw?autoplay=1&start=38&si=eaWWfUkdSthxmVV3"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <img src={rightImage} alt="Right" className="side-image right-image" />
      </div>
    </div>
  );
}

export default Home;