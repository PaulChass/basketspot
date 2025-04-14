import { auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import  Storage from "@/utils/storage"; // Adjust the import path as needed

const authenticateUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("User signed in anonymously:", userCredential.user);
    // You can store the user ID or any other user information here if needed
    // save the user ID to AsyncStorage or your app's state
    const userId = userCredential.user.uid;
    console.log("User ID:", userId);
    await Storage.setItem("userId", userId); // Save user ID to AsyncStorage
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
};

// Call this function when your app starts
authenticateUser();

// Optionally, listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
  } else {
    console.log("No user is authenticated.");
  }
});

export { authenticateUser };