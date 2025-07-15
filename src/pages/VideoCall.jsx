import React, { useContext, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import io from 'socket.io-client';

// Socket instance (single connection)
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
  const roomId = "test-room";

  const targetUserRef = useRef(null); // to store peer ID for signaling

  // Unified call setup for both initiator/responder
  const setupConnection = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localRef.current.srcObject = stream;

    peerRef.current = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
      peerRef.current.addTrack(track, stream);
    });

    peerRef.current.ontrack = (event) => {
      remoteRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate && targetUserRef.current) {
        socket.emit("ice-candidate", {
          target: targetUserRef.current,
          candidate: event.candidate
        });
      }
    };
  };

  const startCall = async () => {
    await setupConnection();

    socket.connect();
    socket.emit("join-room", roomId);
    setJoined(true);
  };

  useEffect(() => {
    if (!joined) return;

    socket.on("user-joined", async (userId) => {
      console.log("🟢 New user joined:", userId);
      targetUserRef.current = userId;

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("offer", {
        target: userId,
        sdp: offer
      });
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("📥 Received offer from:", caller);
      targetUserRef.current = caller;

      if (!peerRef.current) {
        await setupConnection();
      }

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer
      });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("✅ Received answer");
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [joined]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t("videoCall")}
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
