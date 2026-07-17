import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { db } from "@/lib/db";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { AdminStat } from "../_components/admin-stat";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { SettingsPanel } from "./_components/settings-panel";

const AdministratorSettingsPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  const [totalUsers, totalCourses, totalEducators, totalRevenueAgg] =
    await Promise.all([
      db.user.count(),
      db.course.count(),
      db.user.count({ where: { isInstructor: true } }),
      db.purchase.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: "completed" },
      }),
    ]);

  const stats = {
    totalUsers,
    totalCourses,
    totalEducators,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Settings
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Platform configuration and overview.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStat icon={Users} title="Users" value={stats.totalUsers} />
        <AdminStat icon={BookOpen} title="Courses" value={stats.totalCourses} />
        <AdminStat
          icon={GraduationCap}
          title="Educators"
          value={stats.totalEducators}
        />
        <AdminStat
          icon={DollarSign}
          title="Revenue"
          value={stats.totalRevenue}
          shouldFormat
        />
      </div>

      <SettingsPanel stats={stats} />
    </div>
  );
};

export default AdministratorSettingsPage;
