import { auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import  Storage from "@/utils/storage"; // Adjust the import path as needed
import { set } from "lodash";

const authenticateUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("User signed in anonymously:", userCredential.user);
    // You can store the user ID or any other user information here if needed
    Storage.getItem("userId").then(async (userId) => {
      if (userId) {
        console.log("User ID from storage:", userId);
      } else {
      const userId = userCredential.user.uid;
      await Storage.setItem("userId", userId); // Save user ID to AsyncStorage      }
    }
    });
    
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