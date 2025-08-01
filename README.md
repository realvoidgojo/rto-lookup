# RTO Lookup - India Vehicle Registration Search

A lightweight web application to search and find details about Indian vehicle registration numbers and RTO codes.

# Live Demo

Check out the live application: [India RTO Lookup](https://india-rto-lookup.netlify.app/)


### 1. Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a collection named `rto-data`
4. Upload your RTO data to the collection
5. Set up Firestore rules (for production, restrict read access as needed)


```

