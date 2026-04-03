// prisma/seed.ts
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.activityLog?.deleteMany?.();
  console.log("Cleared existing data");

  // Reset sequences
  await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Task_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "ActivityLog_id_seq" RESTART WITH 1`;
  console.log("Reset sequences");

  // Users
  const usersData = [
    { name: "Dr. Sarah Johnson", email: "sarah.johnson@hospital.com" },
    { name: "Dr. Michael Chen", email: "michael.chen@hospital.com" },
    { name: "Nurse Emily Rodriguez", email: "emily.rodriguez@hospital.com" },
    { name: "Dr. James Wilson", email: "james.wilson@hospital.com" },
    { name: "Nurse Amanda Patel", email: "amanda.patel@hospital.com" },
    { name: "Dr. Robert Kim", email: "robert.kim@hospital.com" },
    { name: "Admin Lisa Wang", email: "lisa.wang@hospital.com" },
    { name: "Dr. Maria Garcia", email: "maria.garcia@hospital.com" },
    { name: "Dr. David Lee", email: "david.lee@hospital.com" },
  ];
  await prisma.user.createMany({ data: usersData });
  console.log(`✓ Created ${usersData.length} users`);

  const users = await prisma.user.findMany();
  const userIds = users.map((u) => u.id);

  // Tasks
  const tasksData = [
    {
      title: "ICU Patient Bed Availability Check",
      description:
        "Check and update ICU bed availability across all departments",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      category: "Emergency",
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      assigneeId: userIds[0],
    },
    {
      title: "Emergency Response Protocol Update",
      description: "Review and update emergency response protocols",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.URGENT,
      category: "Protocols",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assigneeId: userIds[1],
    },
    {
      title: "Staff Shortage Coverage - Night Shift",
      description: "Find coverage for 3 nurses for night shift",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: "Staffing",
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
      assigneeId: userIds[2],
    },
    {
      title: "Medical Equipment Calibration",
      description: "Calibrate all ventilators and patient monitors",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.URGENT,
      category: "Equipment",
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      assigneeId: userIds[3],
    },
    {
      title: "Patient Discharge Summary Review",
      description: "Review and approve discharge summaries for 15 patients",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: "Documentation",
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      assigneeId: userIds[4],
    },
    {
      title: "Pharmacy Inventory Check",
      description: "Conduct weekly inventory check of emergency medications",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Pharmacy",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[5],
    },
    {
      title: "Staff Training - New EMR System",
      description: "Schedule and coordinate training sessions",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Training",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[6],
    },
    {
      title: "Patient Feedback Analysis",
      description: "Compile and analyze patient satisfaction surveys",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Quality",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[7],
    },
    {
      title: "Surgery Schedule Optimization",
      description: "Review and optimize OR scheduling to reduce wait times",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: "Operations",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[0],
    },
    {
      title: "Medical Waste Disposal Audit",
      description: "Conduct audit of medical waste disposal procedures",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Compliance",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[1],
    },
    {
      title: "Website Patient Portal Update",
      description: "Update patient portal with new features",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      category: "IT",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[2],
    },
    {
      title: "Annual Budget Planning",
      description: "Prepare department budget proposals for next fiscal year",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Finance",
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[3],
    },
    {
      title: "Wellness Program Implementation",
      description: "Launch employee wellness program",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      category: "HR",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[4],
    },
    {
      title: "Research Study Recruitment",
      description: "Recruit patients for cardiology research study",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      category: "Research",
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[5],
    },
    {
      title: "Infection Control Audit",
      description: "Monthly infection control audit for all departments",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.HIGH,
      category: "Safety",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[6],
    },
    {
      title: "Vendor Contract Review",
      description:
        "Review and renegotiate contracts with medical supply vendors",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      category: "Procurement",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[7],
    },
    {
      title: "MRI Machine Maintenance",
      description: "Schedule preventive maintenance for MRI machines",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      category: "Equipment",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[0],
    },
    {
      title: "Telemedicine Platform Testing",
      description: "Test new telemedicine platform with pilot patients",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.HIGH,
      category: "Technology",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[1],
    },
    {
      title: "Blood Drive Organization",
      description: "Organize community blood drive with Red Cross",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      category: "Community",
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[2],
    },
    {
      title: "JCI Accreditation Preparation",
      description: "Prepare documentation for JCI accreditation audit",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      category: "Compliance",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[3],
    },
    {
      title: "Nurse Shift Schedule Optimization",
      description: "Optimize nurse scheduling to reduce overtime",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.HIGH,
      category: "Staffing",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[4],
    },
    {
      title: "Patient Transport System Review",
      description: "Review and improve patient transport between departments",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      category: "Operations",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assigneeId: userIds[5],
    },
  ];

  await prisma.task.createMany({ data: tasksData });
  console.log(`✓ Created ${tasksData.length} tasks`);

  // Comments (example)
  const tasks = await prisma.task.findMany();
  const commentsData = [
    {
      taskId: tasks[0].id,
      authorId: userIds[0],
      message: "ICU currently has 3 beds available. Will update by 2 PM.",
    },
    {
      taskId: tasks[0].id,
      authorId: userIds[1],
      message: "Emergency department reports 2 beds available.",
    },
    {
      taskId: tasks[2].id,
      authorId: userIds[2],
      message: "Contacted 3 agencies. Waiting for response.",
    },
    {
      taskId: tasks[4].id,
      authorId: userIds[4],
      message: "Reviewed 10 of 15 summaries. Will complete by end of day.",
    },
    {
      taskId: tasks[8].id,
      authorId: userIds[0],
      message: "OR schedule optimized for next week. Reduced gaps by 30%.",
    },
    {
      taskId: tasks[16].id,
      authorId: userIds[0],
      message: "Scheduled maintenance for Friday. Radiology notified.",
    },
  ];

  await prisma.comment.createMany({ data: commentsData });
  console.log(`✓ Created ${commentsData.length} comments`);

  console.log("✅ Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
