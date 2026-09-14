import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ExportButton from "@/components/ExportButton";
import Link from "next/link";

const ReportsPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // --- GRADE REPORT: Average score per student per class ---
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Fetch results with full related data for the grade report
  const results = await prisma.result.findMany({
    include: {
      student: { select: { name: true, surname: true, classId: true } },
      exam: { select: { title: true, lesson: { select: { class: { select: { name: true } } } } } },
      assignment: { select: { title: true, lesson: { select: { class: { select: { name: true } } } } } },
    },
  });

  // Group by student
  type StudentStat = {
    name: string;
    surname: string;
    className: string;
    scores: number[];
  };
  const studentMap = new Map<string, StudentStat>();

  for (const result of results) {
    const id = result.studentId;
    const className =
      result.exam?.lesson.class.name ??
      result.assignment?.lesson.class.name ??
      "—";
    if (!studentMap.has(id)) {
      studentMap.set(id, {
        name: result.student.name,
        surname: result.student.surname,
        className,
        scores: [],
      });
    }
    studentMap.get(id)!.scores.push(result.score);
  }

  const gradeData = Array.from(studentMap.values()).map((s) => ({
    Student: s.name + " " + s.surname,
    Class: s.className,
    "Avg Score": (s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(1),
    "# Assessments": s.scores.length,
  }));

  // --- ATTENDANCE REPORT: Present % per student ---
  const attendanceRecords = await prisma.attendance.findMany({
    include: {
      student: { select: { name: true, surname: true } },
    },
  });

  type AttStat = { name: string; surname: string; total: number; present: number };
  const attMap = new Map<string, AttStat>();

  for (const rec of attendanceRecords) {
    const id = rec.studentId;
    if (!attMap.has(id)) {
      attMap.set(id, {
        name: rec.student.name,
        surname: rec.student.surname,
        total: 0,
        present: 0,
      });
    }
    const stat = attMap.get(id)!;
    stat.total += 1;
    if (rec.present) stat.present += 1;
  }

  const attendanceData = Array.from(attMap.values()).map((s) => ({
    Student: s.name + " " + s.surname,
    "Present": s.present,
    "Absent": s.total - s.present,
    "Total": s.total,
    "Attendance %": ((s.present / s.total) * 100).toFixed(1) + "%",
  }));

  return (
    <div className="p-4 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Reports</h1>

      {/* GRADE REPORT */}
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Grade Report</h2>
          <ExportButton
            filename="grade-report"
            csvData={gradeData}
            pdfTitle="Grade Report"
            pdfHeaders={["Student", "Class", "Avg Score", "# Assessments"]}
            pdfRows={gradeData.map((r) => [
              r.Student,
              r.Class,
              r["Avg Score"],
              r["# Assessments"],
            ])}
          />
        </div>
        {gradeData.length === 0 ? (
          <p className="text-gray-500 text-sm">No results data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Student</th>
                  <th className="text-left p-3 font-medium text-gray-600">Class</th>
                  <th className="text-left p-3 font-medium text-gray-600">Avg Score</th>
                  <th className="text-left p-3 font-medium text-gray-600"># Assessments</th>
                </tr>
              </thead>
              <tbody>
                {gradeData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-lamaPurpleLight">
                    <td className="p-3">{row.Student}</td>
                    <td className="p-3">{row.Class}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          parseFloat(row["Avg Score"]) >= 75
                            ? "bg-green-100 text-green-700"
                            : parseFloat(row["Avg Score"]) >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row["Avg Score"]}
                      </span>
                    </td>
                    <td className="p-3">{row["# Assessments"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ATTENDANCE REPORT */}
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Attendance Report</h2>
          <ExportButton
            filename="attendance-report"
            csvData={attendanceData}
            pdfTitle="Attendance Report"
            pdfHeaders={["Student", "Present", "Absent", "Total", "Attendance %"]}
            pdfRows={attendanceData.map((r) => [
              r.Student,
              r.Present,
              r.Absent,
              r.Total,
              r["Attendance %"],
            ])}
          />
        </div>
        {attendanceData.length === 0 ? (
          <p className="text-gray-500 text-sm">No attendance data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Student</th>
                  <th className="text-left p-3 font-medium text-gray-600">Present</th>
                  <th className="text-left p-3 font-medium text-gray-600">Absent</th>
                  <th className="text-left p-3 font-medium text-gray-600">Total</th>
                  <th className="text-left p-3 font-medium text-gray-600">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-lamaPurpleLight">
                    <td className="p-3">{row.Student}</td>
                    <td className="p-3 text-green-600 font-medium">{row.Present}</td>
                    <td className="p-3 text-red-500 font-medium">{row.Absent}</td>
                    <td className="p-3">{row.Total}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: row["Attendance %"] }}
                          />
                        </div>
                        <span className="text-xs font-medium">{row["Attendance %"]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
