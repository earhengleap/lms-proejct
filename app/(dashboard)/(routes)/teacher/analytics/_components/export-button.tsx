"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

// Extend the jsPDF type to include autoTable
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
  const [exportType, setExportType] = useState<"csv" | "pdf" | null>(null);

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

    let csvContent = [];

    // Add logo and title
    csvContent.push([
      '="' + logoBase64 + '"',
      "",
      "Analytics Report",
      "",
      "",
      "",
    ]);
    csvContent.push([]);

    // Add summary
    csvContent.push(["Summary", "", "", "", "", ""]);
    csvContent.push(["Total Revenue", `$${totalRevenue}`, "", "", "", ""]);
    csvContent.push(["Total Sales", totalSales, "", "", "", ""]);
    csvContent.push([]);

    // Add monthly data
    csvContent.push(["Monthly Revenue", "", "", "", "", ""]);
    csvContent.push(["Month", "Revenue", "Courses", "", "", ""]);
    chartData.forEach((item) => {
      const courseInfo = item.courses
        .map((course) => `${course.title}: $${course.price}`)
        .join("; ");
      csvContent.push([item.name, `$${item.total}`, courseInfo, "", "", ""]);
    });
    csvContent.push([]);

    // Add completion rates
    csvContent.push(["Course Completion Rates", "", "", "", "", ""]);
    csvContent.push(["Course", "Completion Rate", "", "", "", ""]);
    completionRates.forEach((item) => {
      csvContent.push([
        item.title,
        `${(item.completionRate * 100).toFixed(2)}%`,
        "",
        "",
        "",
        "",
      ]);
    });
    csvContent.push([]);

    // Add demographics
    csvContent.push(["Student Demographics", "", "", "", "", ""]);
    csvContent.push(["Category", "Count", "", "", "", ""]);
    studentDemographics.forEach((item) => {
      csvContent.push([item.category, item.count.toString(), "", "", "", ""]);
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

    // Add logo
    doc.addImage(logoPath, "PNG", 14, yPosition, 30, 30);
    yPosition += 35;

    doc.setFontSize(18);
    doc.text("Analytics Report", 14, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    // Summary
    doc.text(`Total Revenue: $${totalRevenue}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Total Sales: ${totalSales}`, 14, yPosition);
    yPosition += 10;

    // Monthly Data
    doc.text("Monthly Revenue", 14, yPosition);
    yPosition += 5;
    const monthlyData = chartData.map((item) => [item.name, `$${item.total}`]);
    doc.autoTable({
      startY: yPosition,
      head: [["Month", "Revenue"]],
      body: monthlyData,
    });
    yPosition = (doc.autoTable as any).previous.finalY + 10;

    // Course Completion Rates
    doc.text("Course Completion Rates", 14, yPosition);
    yPosition += 5;
    const completionData = completionRates.map((item) => [
      item.title,
      `${(item.completionRate * 100).toFixed(2)}%`,
    ]);
    doc.autoTable({
      startY: yPosition,
      head: [["Course", "Completion Rate"]],
      body: completionData,
    });
    yPosition = (doc.autoTable as any).previous.finalY + 10;

    // Student Demographics
    doc.text("Student Demographics", 14, yPosition);
    yPosition += 5;
    const demographicData = studentDemographics.map((item) => [
      item.category,
      item.count.toString(),
    ]);
    doc.autoTable({
      startY: yPosition,
      head: [["Category", "Count"]],
      body: demographicData,
    });

    doc.save(`${fileName}.pdf`);
  };

  const handleExport = async (type: "csv" | "pdf") => {
    setIsExporting(true);
    setExportType(type);
    if (type === "csv") {
      await exportToCSV();
    } else {
      await exportToPDF();
    }
    setTimeout(() => {
      setIsExporting(false);
      setExportType(null);
    }, 1000); // Add a delay to show the completion state
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
            isExporting
              ? "bg-green-100 dark:bg-green-900"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              {exportType === "csv" && <Loader2 className="h-4 w-4 animate-spin" />}
              {exportType === "pdf" && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="ml-2">
                {exportType === "csv" ? "Exporting CSV..." : "Exporting PDF..."}
              </span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          className="cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          className="cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};