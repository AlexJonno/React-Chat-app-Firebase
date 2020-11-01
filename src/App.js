import React, { useRef, useState } from 'react';
import './App.css';

// firebase sdks

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

// hooks

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({

})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  // if logged in, user is object, if logged out user is null

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  // google pop up sign in

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
// if user signed in show sign out

  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {

// get db data

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  // listen to changes in data with hook

  const [messages] = useCollectionData(query, { idField: 'id' });

  // add formvalue state to component, listen with useState hook, set to empty string

  const [formValue, setFormValue] = useState('');

  // listen to form submit as async e = event


  const sendMessage = async (e) => {
    // prevent page refresh
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    // create new document in firestore

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    // reset formValue after submit

    setFormValue('');

  // scroll empty div below messages into view after submit

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  // loop over each document in firestore database

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}

// ^^ when user types in form, triggers change event. take that change value and set it to the state


function ChatMessage(props) {

  // show data in child message component

  const { text, uid, photoURL } = props.message;

  // compare currently logged in user id to user id in firestore db -> conditional css

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
