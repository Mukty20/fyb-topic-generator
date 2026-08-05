import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";

const DAILY_LIMIT = 15; 

export const checkAndIncrementUsage = async (uid: string): Promise<boolean> => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ref = doc(db, "usageLimits", uid);
  const snap = await getDoc(ref);

  if (!snap.exists() || snap.data().date !== today) {
    //  reset counter
    await setDoc(ref, { date: today, count: 1 });
    return true;
  }

  const current = snap.data().count;
  if (current >= DAILY_LIMIT) {
    return false; // limit hit  block this call
  }

  await setDoc(ref, { date: today, count: increment(1) }, { merge: true });
  return true;
};