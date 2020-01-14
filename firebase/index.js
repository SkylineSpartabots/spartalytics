// firebase/index.js
import firebase from 'firebase/app';
import 'firebase/database';
import clientCredentials from '../credentials/client.js'

if (!firebase.apps.length) {
    firebase.initializeApp(clientCredentials);
}
const db = firebase.database();
export {
    firebase,
    db
};