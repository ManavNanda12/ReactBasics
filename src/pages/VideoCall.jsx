import React, { useContext, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import io from 'socket.io-client';

// Socket.IO client
const socket = io(process.env.REACT_APP_SOCKET_URL, {
  autoConnect: false,
  auth: { token: localStorage.getItem("token") }
});

export default function VideoCall() {
  const { t } = useTranslation();
  const { currentTheme } = useContext(HeaderContext);
  const theme = createTheme({ palette: { mode: currentTheme } });

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const roomId = 'test-room';

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected from React:", socket.id);
    });

    if (!joined) return;

    socket.on("user-joined", async (userId) => {
      console.log("🟢 New user joined:", userId);
      setRemoteSocketId(userId);

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("offer", {
        target: userId,
        sdp: offer
      });
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("📥 Offer received from", caller);
      setRemoteSocketId(caller);

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer
      });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("✅ Answer received");
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [joined]);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef.current) {
      localRef.current.srcObject = stream;
    }

    peerRef.current = new RTCPeerConnection();

    stream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, stream);
    });

    peerRef.current.ontrack = (event) => {
      console.log("🎥 Received remote stream", event.streams);
      if (remoteRef.current && event.streams[0]) {
        remoteRef.current.srcObject = event.streams[0];
      }
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    peerRef.current.onconnectionstatechange = () => {
      console.log("🧠 Connection state:", peerRef.current.connectionState);
    };

    socket.connect();
    socket.emit("join-room", roomId);
    setJoined(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t("videoCall") || "Video Call"}
        </Typography>

        {!joined && (
          <Button variant="contained" onClick={startCall}>
            {t("startCall") || "Start Call"}
          </Button>
        )}

        <Box display="flex" justifyContent="center" gap={4} mt={4}>
          <Box>
            <Typography variant="subtitle1">{t("localVideo") || "Local Video"}</Typography>
            <video ref={localRef} autoPlay muted playsInline style={{ width: '300px', borderRadius: '8px' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1">{t("remoteVideo") || "Remote Video"}</Typography>
            <video ref={remoteRef} autoPlay playsInline style={{ width: '300px', borderRadius: '8px' }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
