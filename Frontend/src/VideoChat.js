// 'http://localhost:5000/api/token?identity=user123'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Video, { LocalVideoTrack, LocalAudioTrack } from 'twilio-video';

const VideoChat = () => {
  const [room, setRoom] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [identityInput, setIdentityInput] = useState('');

  const localMediaRef = useRef();

  useEffect(() => {
    const fetchToken = async () => {
      const response = await axios.get('http://localhost:5000/api/token?identity=user123');
      return response.data.token;
    };

    const initializeRoom = async () => {
      try {
        const token = await fetchToken();
        const newRoom = await Video.connect(token, { name: 'roomName' });
        console.log(newRoom)
        setRoom(newRoom);

        const audioTrack = await Video.createLocalAudioTrack();
        const videoTrack = await Video.createLocalVideoTrack();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        const localMediaContainer = localMediaRef.current;
        localMediaContainer.appendChild(videoTrack.attach());
        localMediaContainer.appendChild(audioTrack.attach());

        newRoom.on('participantConnected', participant => {
          setParticipants(prevParticipants => [...prevParticipants, participant]);
        });

        newRoom.on('participantDisconnected', participant => {
          setParticipants(prevParticipants =>
            prevParticipants.filter(p => p !== participant)
          );
        });
      } catch (error) {
        console.error('Error connecting to room:', error);
      }
    };

    if (!room) {
      initializeRoom();
    }

    return () => {
      cleanupRoom();
    };
  }, [room]);

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.isEnabled ? localAudioTrack.disable() : localAudioTrack.enable();
      setIsAudioEnabled(!localAudioTrack.isEnabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.isEnabled ? localVideoTrack.disable() : localVideoTrack.enable();
      setIsVideoEnabled(!localVideoTrack.isEnabled);
    }
  };

  const addParticipant = async () => {
    if (!room || !identityInput) return;

    try {
      const participant = await room.connect({ identity: identityInput });
      setParticipants(prevParticipants => [...prevParticipants, participant]);
      setIdentityInput('');
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const cleanupRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setParticipants([]);
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.detach();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.detach();
      }
    }
  };

  return (
    <div>
      {room && (
        <div>
          <p>Connected to Room: {room.name}</p>
          <div ref={localMediaRef}></div>
          <div>
            {participants.map(participant => (
              <div key={participant.sid}>
                <p>Participant: {participant.identity}</p>
                {participant.tracks.map(track => (
                  <div key={track.sid}>
                    {track.kind === 'video' && (
                      <div ref={ref => track.attach(ref)} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <button onClick={toggleAudio}>
              {isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            </button>
            <button onClick={toggleVideo}>
              {isVideoEnabled ? 'Stop Video' : 'Start Video'}
            </button>
            <input
              type="text"
              value={identityInput}
              onChange={e => setIdentityInput(e.target.value)}
              placeholder="Participant Identity"
            />
            <button onClick={addParticipant}>Add Participant</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;



