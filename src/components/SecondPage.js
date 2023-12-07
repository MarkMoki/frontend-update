import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/styles.css'; 


const SecondPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [initialResponseTimestamp, setInitialResponseTimestamp] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const number = urlParams.get('phoneNumber');
    const responseMsg = urlParams.get('responseMessage');
    setPhoneNumber(number || ''); // Set the phone number from URL parameter
    setResponseMessage(responseMsg || ''); // Set the response message from URL parameter

    if (responseMsg && !hasInteracted) {
      setResponseMessage(cleanResponse(responseMsg)); // Set the initial response message
      setInitialResponseTimestamp(new Date().toLocaleString()); // Set timestamp for the initial response
    }

    const storedConversations = localStorage.getItem('conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, [hasInteracted]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const cleanResponse = (response) => {
    if (response && typeof response === 'string') {
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse.status) {
          return parsedResponse.status;
        }
      } catch (error) {
        return response;
      }
    }
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const trimmedMessage = message.trim();
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/message/', {
        phone_number: phoneNumber,
        message: trimmedMessage,
      });
  
      const responseData = cleanResponse(JSON.stringify(response.data.status));
      const newConversation = {
        sentMessage: trimmedMessage,
        responses: [responseData],
        sentTimestamp: new Date().toISOString(),
        responseTimestamps: [new Date().toISOString()],
      };

      if (!hasInteracted) {
        setResponseMessage('');
        setInitialResponseTimestamp(null);
        setHasInteracted(true);
      }

      if (conversations.length > 0) {
        setConversations((prevConversations) => [...prevConversations, newConversation]);
      } else {
        setConversations([newConversation]);
      }
  
      setError('');
    } catch (error) {
      setError('Error occurred while sending the message.');
      console.error('Error occurred:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="wcontainer">
      <div className="profile-info">
        <p className="profile-name">Phone Number: {phoneNumber}</p>
        <h1>Welcome to our dating service with 6000 potential dating partners!</h1>
      </div>
      <div className="message-history">
        {responseMessage && !hasInteracted && (
          <div className="message response">
            <p>{cleanResponse(responseMessage)}</p>
            <small>{initialResponseTimestamp}</small>  
          </div>
        )}

        {conversations.slice(0).reverse().map((conversation, convIndex) => (
          <div key={convIndex} className="conversation">
            {conversation.responses.map((response, respIndex) => (
              <div key={respIndex} className="received-bubble">
                <p>{cleanResponse(response)}</p>
                <small>{`${new Date(conversation.responseTimestamps[respIndex]).toLocaleString()}`}</small>  
              </div>
            ))}
            <div className="sent-bubble">
              <p>{`${conversation.sentMessage}`}</p>
              <small>{`${new Date(conversation.sentTimestamp).toLocaleString()}`}</small>  
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-input">
        <textarea
          placeholder="Write your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-area"
        ></textarea>
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default SecondPage;
