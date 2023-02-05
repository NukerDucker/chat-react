import React, { useState, useEffect, Fragment } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { Button, Form, List, Container, Header } from 'semantic-ui-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyDD1VXc8X2onaRsPky1a_eJdPbl2R2_77o",
      authDomain: "cholechatweb-f3f7c.firebaseapp.com",
      databaseURL: "https://cholechatweb-f3f7c-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "cholechatweb-f3f7c",
      storageBucket: "cholechatweb-f3f7c.appspot.com",
      messagingSenderId: "1042820584496",
      appId: "1:1042820584496:web:25a7988ab8242cd4f889f5",
      
    };
    
    firebase.initializeApp(firebaseConfig);

    const database = firebase.database();
    const messagesRef = database.ref('messages');
    
    messagesRef.on('value', (snapshot) => {
      setMessages(Object.values(snapshot.val()));
    });

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const userRef = firebase.database().ref(`users/${user.uid}`);
        userRef.once('value').then((snapshot) => {
          if (snapshot.val().username) {
            setUsername(snapshot.val().username);
            setIsUsernameSet(true);
          } else {
            setShowUsernameInput(true);
          }
        });
      }
      setUser(user);
    });
  }, []);

  const submitMessage = (e) => {
    e.preventDefault();
    if (!user) {
      return alert('You must sign in first');
    }
    if (!username && !isUsernameSet && showUsernameInput) {
      return alert('You must enter a username');
    }
    if (!input) {
      return alert('You must enter a message');
    }
  
    const userRef = firebase.database().ref(`users/${user.uid}`);
    const messagesRef = firebase.database().ref('messages');
  
    userRef.once('value').then((snapshot) => {
      if (snapshot.val().username !== username) {
        userRef.set({ username });
      }
    });
  
    messagesRef.push({
      content: input,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      sender: username,
    });
  
    setInput('');
  };
    
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        setUser(user);
      })
      .catch(error => {
        console.error(error);
      });
  };
  
  const signOut = () => {
    firebase.auth().signOut().then(() => {
      setUser(null);
    }).catch(error => {
      console.error(error);
    });
  };
  return (
    <Container text style={{marginTop: '10px'}}>
      <Header as='h2'>Chat</Header>
      {!user && (
        <Button onClick={signInWithGoogle} size="small" primary style={{marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
        <span>Sign in with</span> 
        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" style={{ width: '50px', height: 'auto', marginRight: '5px' }} />
        </Button>      
      )}
      {user && (
  <Fragment>
    <Header as='h3'>Welcome, { username || user.email}</Header>
    <Form onSubmit={submitMessage} style={{marginTop: '10px'}}>
        <Form.Input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{marginBottom: '10px'}}
        />
        <Form.Input
          placeholder="Enter a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{marginBottom: '10px'}}
        />
        <Button type="submit">Submit</Button>
      </Form>
      <Button onClick={signOut} size="big" style={{marginBottom: '10px'}}>
      Sign out
    </Button>
  </Fragment>
)}
      <List style={{marginTop: '10px'}}>
        {messages.map((message, i) => (
          <List.Item key={i}>
            <List.Header>{message.sender}</List.Header>
            <List.Description>{message.content}</List.Description>
          </List.Item>
        ))}
      </List>
    </Container>
  );

  };
  
  export default Chat;
  