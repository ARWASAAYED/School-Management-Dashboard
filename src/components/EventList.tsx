import prisma from "@/lib/prisma";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // If no dateParam was selected and today has no events, fetch all recent/upcoming events as fallback
  if (!dateParam && data.length === 0) {
    data = await prisma.event.findMany({
      take: 10,
      orderBy: { startTime: "asc" },
    });
  }

  if (data.length === 0) {
    return <p className="text-gray-400 text-sm py-2">No events found for this date.</p>;
  }

  return (
    <>
      {data.map((event) => (
        <div
          className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
          key={event.id}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-gray-600">{event.title}</h1>
            <span className="text-gray-300 text-xs">
              {event.startTime.toLocaleTimeString("en-UK", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
          <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
        </div>
      ))}
    </>
  );
};

export default EventList;