"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface Course {
  title: string;
  price: number;
}

interface ChartDataItem {
  name: string;
  total: number;
  courses: Course[];
}

interface CompletionRate {
  title: string;
  completionRate: number;
}

interface DemographicInfo {
  category: string;
  count: number;
}

interface ExportButtonProps {
  data: {
    chartData: ChartDataItem[];
    totalRevenue: number;
    totalSales: number;
    completionRates: CompletionRate[];
    studentDemographics: DemographicInfo[];
  };
  fileName: string;
  logoPath: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  logoPath,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const getBase64Image = async (path: string): Promise<string> => {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const exportToCSV = async () => {
    const {
      chartData,
      totalRevenue,
      totalSales,
      completionRates,
      studentDemographics,
    } = data;

    const logoBase64 = await getBase64Image(logoPath);

    let csvContent: string[][] = [];
    csvContent.push(['="' + logoBase64 + '"', "", "Analytics Report"]);
    csvContent.push([]);
    csvContent.push(["Summary"]);
    csvContent.push(["Total Revenue", `$${totalRevenue}`]);
    csvContent.push(["Total Sales", totalSales.toString()]);
    csvContent.push([]);
    csvContent.push(["Monthly Revenue"]);
    csvContent.push(["Month", "Revenue", "Courses"]);
    chartData.forEach((item) => {
      const courseInfo = item.courses
        .map((c) => `${c.title}: $${c.price}`)
        .join("; ");
      csvContent.push([item.name, `$${item.total}`, courseInfo]);
    });
    csvContent.push([]);
    csvContent.push(["Course Completion Rates"]);
    csvContent.push(["Course", "Completion Rate"]);
    completionRates.forEach((item) => {
      csvContent.push([item.title, `${(item.completionRate * 100).toFixed(2)}%`]);
    });
    csvContent.push([]);
    csvContent.push(["Student Demographics"]);
    csvContent.push(["Category", "Count"]);
    studentDemographics.forEach((item) => {
      csvContent.push([item.category, item.count.toString()]);
    });

    const csv = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToPDF = () => {
    const {
      chartData,
      totalRevenue,
      totalSales,
      completionRates,
      studentDemographics,
    } = data;

    const doc = new jsPDF() as jsPDFWithAutoTable;
    let yPosition = 15;

    doc.addImage(logoPath, "PNG", 14, yPosition, 30, 30);
    yPosition += 35;
    doc.setFontSize(18);
    doc.text("Analytics Report", 14, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Total Sales: ${totalSales}`, 14, yPosition);
    yPosition += 10;

    doc.text("Monthly Revenue", 14, yPosition);
    yPosition += 5;
    doc.autoTable({
      startY: yPosition,
      head: [["Month", "Revenue"]],
      body: chartData.map((item) => [item.name, `$${item.total}`]),
    });
    yPosition = (doc.autoTable as any).previous.finalY + 10;

    doc.text("Course Completion Rates", 14, yPosition);
    yPosition += 5;
    doc.autoTable({
      startY: yPosition,
      head: [["Course", "Completion Rate"]],
      body: completionRates.map((item) => [
        item.title,
        `${(item.completionRate * 100).toFixed(2)}%`,
      ]),
    });
    yPosition = (doc.autoTable as any).previous.finalY + 10;

    doc.text("Student Demographics", 14, yPosition);
    yPosition += 5;
    doc.autoTable({
      startY: yPosition,
      head: [["Category", "Count"]],
      body: studentDemographics.map((item) => [item.category, item.count.toString()]),
    });

    doc.save(`${fileName}.pdf`);
  };

  const handleExport = async (type: "csv" | "pdf") => {
    setIsExporting(true);
    if (type === "csv") {
      await exportToCSV();
    } else {
      await exportToPDF();
    }
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isExporting}
          className="flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200/60 shadow-lg">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          className="gap-2 cursor-pointer text-sm"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          className="gap-2 cursor-pointer text-sm"
        >
          <FileText className="h-3.5 w-3.5 text-rose-500" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
