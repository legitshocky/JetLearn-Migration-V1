/**
 * One-time script: Import all 12 GAS users into Firebase Auth + Firestore
 *
 * Run with:
 *   npx tsx server/scripts/importUsers.ts
 *
 * Each user gets:
 *   - A Firebase Auth account (email + password)
 *   - A Firestore doc at users/{uid} with role, username, isActive
 */

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getServiceAccount } from "../lib/serviceAccount.js";
import firebaseConfig from "../../firebase-applet-config.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount() as admin.ServiceAccount),
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

// ── Users from the GAS "User Profiles" sheet ──────────────────────────────
const USERS = [
  { username: "Admin",    password: "Admin@123",    role: "Super Admin", email: "sourav.pal@jet-learn.com",    isActive: true  },
  { username: "Ops_team", password: "Ops@123",      role: "Ops",     email: "ops@jet-learn.com",           isActive: false },
  { username: "Apeksha",  password: "Apeksha@123",  role: "Ops",     email: "apeksha@jet-learn.com",       isActive: true  },
  { username: "Shubham",  password: "Shubham@123",  role: "Ops",     email: "shubham@jet-learn.com",       isActive: true  },
  { username: "Shabina",  password: "Shabina@123",  role: "Ops",     email: "shabina@jet-learn.com",       isActive: false },
  { username: "Ankita",   password: "Ankita@123",   role: "Ops",     email: "ankita@jet-learn.com",        isActive: true  },
  { username: "Sakshi",   password: "Sakshi@123",   role: "Ops",     email: "sakshi@jet-learn.com",        isActive: true  },
  { username: "Manika",   password: "Manika@123",   role: "Ops",     email: "manika@jet-learn.com",        isActive: false },
  { username: "Zainab",   password: "Zainab@123",   role: "Ops",     email: "zainab@jet-learn.com",        isActive: true  },
  { username: "Naureen",  password: "Naureen@123",  role: "Ops",     email: "naureen@jet-learn.com",       isActive: true  },
  { username: "Kapil",    password: "Kapil@123",    role: "Ops",     email: "kapil@jet-learn.com",         isActive: true  },
  { username: "Namrata",  password: "Namrata@123",  role: "Ops",     email: "namrata@jet-learn.com",       isActive: true  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function importUsers() {
  console.log(`\n[importUsers] Starting import of ${USERS.length} users...\n`);

  for (const user of USERS) {
    const { username, password, role, email, isActive } = user;
    try {
      // 1. Create Firebase Auth account
      let authUser: admin.auth.UserRecord;
      try {
        authUser = await admin.auth().createUser({
          email,
          password,
          displayName: username,
          disabled: !isActive,
        });
        console.log(`  ✅ Created Auth: ${username} <${email}> (uid: ${authUser.uid})`);
      } catch (err: any) {
        if (err.code === "auth/email-already-exists") {
          // Already exists — fetch and update password + displayName
          authUser = await admin.auth().getUserByEmail(email);
          await admin.auth().updateUser(authUser.uid, { password, displayName: username, disabled: !isActive });
          console.log(`  ⚠️  Auth exists (password updated): ${username} <${email}> (uid: ${authUser.uid})`);
        } else {
          throw err;
        }
      }

      // 2. Create/update Firestore profile
      await db.collection("users").doc(authUser.uid).set(
        {
          uid: authUser.uid,
          username,
          email,
          role,
          isActive,
          lastLogin: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`     📄 Firestore profile written for ${username}`);
    } catch (err: any) {
      console.error(`  ❌ Failed for ${username}: ${err.message}`);
    }
  }

  console.log("\n[importUsers] Done.\n");
  process.exit(0);
}

importUsers().catch((err) => {
  console.error("[importUsers] Fatal error:", err);
  process.exit(1);
});
