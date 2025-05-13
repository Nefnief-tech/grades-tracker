import { NextResponse } from "next/server";
import { getDatabases } from "@/lib/appwrite";
import {
  DATABASE_ID,
  USERS_COLLECTION_ID,
  SUBJECTS_COLLECTION_ID,
  GRADES_COLLECTION_ID,
} from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET() {
  try {
    const db = getDatabases();
    // Fetch counts
    const usersRes = await db.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    const subjectsRes = await db.listDocuments(
      DATABASE_ID,
      SUBJECTS_COLLECTION_ID
    );
    const gradesRes = await db.listDocuments(DATABASE_ID, GRADES_COLLECTION_ID);
    const totalUsers = usersRes.documents.length;
    const totalSubjects = subjectsRes.documents.length;
    const totalGrades = gradesRes.documents.length;

    // Calculate average GPA (assumes each grade doc has a 'value' field out of 100)
    const sumGrades = gradesRes.documents.reduce(
      (sum, doc) => sum + (doc.value || 0),
      0
    );
    const averageGpa = totalGrades > 0 ? sumGrades / totalGrades / 25 : 0;

    // New users today
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newUsersRes = await db.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.greaterEqual("$createdAt", midnight.toISOString())]
    );
    const newUsersToday = newUsersRes.documents.length;

    // Active users (example: all users currently registered)
    const activeUsers = totalUsers;

    // Server metrics
    const os = await import("os");
    const uptimeSeconds = os.uptime();
    const memoryUsage = process.memoryUsage();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    // External metric: GitHub stars for this repo
    let githubStars = null;
    try {
      const ghRes = await fetch(
        "https://api.github.com/repos/YOUR_USERNAME/grade-tracker-v2"
      );
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        githubStars = ghData.stargazers_count;
      }
    } catch {}

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      totalSubjects,
      totalGrades,
      averageGpa,
      uptimeSeconds,
      freeMem,
      totalMem,
      memoryUsage,
      githubStars,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch summary data" },
      { status: 500 }
    );
  }
}
