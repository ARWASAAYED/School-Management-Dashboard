import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const bgColors = ["bg-lamaSkyLight", "bg-lamaPurpleLight", "bg-lamaYellowLight"];

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role && role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              className={`${bgColors[index % bgColors.length]} rounded-md p-4`}
              key={item.id}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{item.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(item.date)}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{item.description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 py-2">No announcements found.</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;