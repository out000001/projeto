import { doc, runTransaction } from "firebase/firestore";
import { projects } from "../src/modules/public/data/projects.js";

// Only public catalogue data; never imports demo users or passwords.
// Existing documents are preserved, including when this command is repeated.
export async function seedPublicProjects(firestore) {
  let created = 0;
  for (const project of projects) {
    const reference = doc(firestore, "projects", String(project.id));
    const added = await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (snapshot.exists()) return false;
      const publicData = { ...project };
      delete publicData.id;
      transaction.set(reference, publicData);
      return true;
    });
    if (added) created++;
  }
  return { created, preserved: projects.length - created };
}
