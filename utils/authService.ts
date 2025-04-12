import { auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const authenticateUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("User signed in anonymously:", userCredential.user);
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
};

// Call this function when your app starts
authenticateUser();

// Optionally, listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Authenticated user:", user);
  } else {
    console.log("No user is authenticated.");
  }
});

export { authenticateUser };