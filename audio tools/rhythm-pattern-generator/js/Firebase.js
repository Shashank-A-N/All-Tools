/**
 * Firebase Integration for Rhythm Pattern Generator
 * Handles Firestore save/load operations.
 */

// Import SDKs (accessed via global window object from CDN in index.html)
// window.firebase

const firebaseConfig = {
    apiKey: "AIzaSyDOFNeEl8rHsfTz-4TGBpYBAq2ukY1awJ0",
    authDomain: "manga-reader-30320.firebaseapp.com",
    projectId: "manga-reader-30320",
    storageBucket: "manga-reader-30320.firebasestorage.app",
    messagingSenderId: "2604892274",
    appId: "1:2604892274:web:ccbb92a3e638f23a8442eb",
    measurementId: "G-PMJPMS181B"
};

export class CloudStorage {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        if (!window.firebase) {
            console.error("Firebase SDK not loaded");
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.db = firebase.firestore();
        console.log("Firebase Initialized");
    }

    async savePattern(name, grid, tempo, swing, mixer) {
        try {
            const docRef = await this.db.collection("rhythm_patterns").add({
                name: name,
                grid: JSON.stringify(grid),
                tempo: tempo,
                swing: swing,
                mixer: JSON.stringify(mixer),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Pattern saved with ID: ", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
            throw error;
        }
    }

    async loadPatterns() {
        try {
            const querySnapshot = await this.db.collection("rhythm_patterns")
                .orderBy("timestamp", "desc")
                .limit(20)
                .get();

            const patterns = [];
            querySnapshot.forEach((doc) => {
                patterns.push({ id: doc.id, ...doc.data() });
            });
            return patterns;
        } catch (error) {
            console.error("Error getting documents: ", error);
            throw error;
        }
    }
}
