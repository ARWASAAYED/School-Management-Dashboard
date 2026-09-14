import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Map real Clerk user IDs to existing seeded record IDs.
// Pick seeded IDs that have NO dependent rows (see notes below).
const mapping = {
  admin:   { clerkId: "user_3IkZYSY9AJ56r7BjDytQsCAOTUR",   seededId: "admin2" },
  teacher: { clerkId: "user_3JA24owM6CKTSTISwo8sfVDfXfI", seededId: "teacher15" },
  student: { clerkId: "user_3IkeCzN0N5VZJd43jWnAb4dcpGP", seededId: "student11" },
   
  parent:  { clerkId: "user_3IkeMRhGeZysYhXbrsG2Qo6mUCO",  seededId: "parentId13" },
};

async function main() {
  const admin = await prisma.admin.update({
    where: { id: mapping.admin.seededId },
    data: { id: mapping.admin.clerkId },
  });
  console.log("Admin updated:", admin);

  const teacher = await prisma.teacher.update({
    where: { id: mapping.teacher.seededId },
    data: { id: mapping.teacher.clerkId },
  });
  console.log("Teacher updated:", teacher);

  // Student must be updated AFTER parent if parentId is being changed too,
  // otherwise update the parent's own linked students separately (see note).
  const parent = await prisma.parent.update({
    where: { id: mapping.parent.seededId },
    data: { id: mapping.parent.clerkId },
  });
  console.log("Parent updated:", parent);

  const student = await prisma.student.update({
    where: { id: mapping.student.seededId },
    data: { id: mapping.student.clerkId },
  });
  console.log("Student updated:", student);

  console.log("\nAll roles linked to Clerk IDs successfully.");
}


main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());