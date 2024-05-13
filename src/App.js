import React from 'react';
import './App.css';
import VideoChat from './VideoChat';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Twilio Video Chat App</h1>
      </header>
      <main>
        <VideoChat />
      </main>
    </div>
  );
}

export default App;
