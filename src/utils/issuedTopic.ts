import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const getIssuedTopicTitles = async (
  department: string,
  areaOfInterest: string
): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "issuedTopics"),
      where("department", "==", department),
      where("areaOfInterest", "==", areaOfInterest)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().title as string);
  } catch (err) {
    console.log("Fetching issued topics failed:", err);
    return []; // fail open — a lookup failure should never block topic generation
  }
};

export const recordIssuedTopic = async (
  department: string,
  areaOfInterest: string,
  title: string
): Promise<void> => {
  try {
    await addDoc(collection(db, "issuedTopics"), {
      department,
      areaOfInterest,
      title,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.log("Recording issued topic failed:", err);
  }
};