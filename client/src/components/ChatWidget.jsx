import { useState, useEffect, useRef } from 'react';
import { FaHeadset, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { io } from 'socket.io-client';

function getChatRoomId(user) {
  if (user?._id) return `user_${user._id}`;
  if (user?.id) return `user_${user.id}`;

  let guestId = localStorage.getItem('comeagain_guest_chat_id');
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem('comeagain_guest_chat_id', guestId);
  }
  return guestId;
}

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatBottomRef = useRef(null);

  const chatRoom = getChatRoomId(user);
  const senderName = user?.username || 'Guest';
  const senderId = user?._id || user?.id || chatRoom;

  // 1. Load history from server
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/history/${chatRoom}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    loadHistory();
  }, [chatRoom]);

  // 2. Setup socket connection & room listener
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', chatRoom);
    });

    newSocket.on('receive_message', (incomingMsg) => {
      setMessages((prev) => {
        // Prevent duplicate if already added optimistically
        const isDuplicate = prev.some(
          (m) =>
            m._id === incomingMsg._id ||
            (m.text === incomingMsg.text &&
              m.sender === incomingMsg.sender &&
              Math.abs(new Date(m.createdAt) - new Date(incomingMsg.createdAt)) < 3000)
        );
        if (isDuplicate) return prev;
        return [...prev, incomingMsg];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatRoom]);

  // Auto-scroll chat box to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgText = message.trim();
    setMessage('');

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      chatRoom,
      sender: 'user',
      senderName,
      senderId,
      text: msgText,
      createdAt: new Date().toISOString(),
    };

    // Show message immediately in UI
    setMessages((prev) => [...prev, tempMessage]);

    // Send to backend via Socket.io
    if (socket) {
      socket.emit('send_message', {
        chatRoom,
        sender: 'user',
        senderName,
        senderId,
        text: msgText,
      });
    }
  };

  return (
    <div className="chat-widget-container">
      <button
        className="floating-chat-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Customer Support"
      >
        {isOpen ? <FaXmark /> : <FaHeadset />}
        {!isOpen && <span className="chat-badge-pulse" />}
      </button>

      {isOpen && (
        <div className="chat-box-popup">
          <div className="chat-header">
            <div className="chat-header-info">
              <h4>💬 Customer Support</h4>
              <p>We typically reply in a few minutes</p>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <FaXmark />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome-msg">
                👋 Hi {senderName}! How can we help you today?
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`chat-bubble ${
                    msg.sender === 'user' ? 'user' : 'support'
                  }`}
                >
                  <p className="chat-text">{msg.text}</p>
                  <span className="chat-time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                      [],
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" disabled={!message.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;