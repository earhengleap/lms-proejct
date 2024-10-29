"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

// Extend the jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface ExportButtonProps {
  data: {
    chartData: { date: string; amount: number }[];
    totalRevenue: number;
    totalSales: number;
    studentDemographics: { category: string; count: number }[];
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

  const getBase64ImageFromURL = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const addFooter = (doc: jsPDFWithAutoTable) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    const { chartData, totalRevenue, totalSales, studentDemographics } = data;
    const doc = new jsPDF({ unit: "mm", format: "a4" }) as jsPDFWithAutoTable;
    let yPosition = 20;

    // Load the logo image
    const logoBase64 = await getBase64ImageFromURL(logoPath);
    doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);

    // Add Report Title with underline
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Dark Blue
    doc.text("Analytics Report", 50, yPosition + 5);
    doc.setLineWidth(0.5);
    doc.line(10, yPosition + 10, 200, yPosition + 10);
    yPosition += 25;

    // Summary Section
    const summaryData = [
      { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}` },
      { title: "Total Sales", value: totalSales.toLocaleString() },
      {
        title: "Average Revenue per Sale",
        value: `$${(totalRevenue / totalSales).toFixed(2)}`,
      },
    ];

    summaryData.forEach((item, index) => {
      const xPos = 15 + index * 65;
      doc.setFillColor(245, 245, 245); // Light gray background
      doc.roundedRect(xPos, yPosition, 60, 20, 3, 3, "F");

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(item.title, xPos + 5, yPosition + 8);

      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.text(item.value, xPos + 5, yPosition + 15);
    });
    yPosition += 30;

    // Monthly Revenue Table
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Monthly Revenue Breakdown", 15, yPosition);
    yPosition += 5;

    doc.autoTable({
      startY: yPosition,
      head: [["Month", "Revenue", "% Change"]],
      body: chartData.map((item, index) => {
        const prevAmount =
          index > 0 ? chartData[index - 1].amount : item.amount;
        const change = (
          ((item.amount - prevAmount) / prevAmount) *
          100
        ).toFixed(1);
        return [item.date, `$${item.amount.toLocaleString()}`, `${change}%`];
      }),
      theme: "striped",
      headStyles: {
        fillColor: [41, 128, 185], // Custom blue for header
        fontSize: 12,
        textColor: 255,
      },
      bodyStyles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { top: 15, left: 15, right: 15 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Student Demographics Table
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Student Demographics", 15, yPosition);
    yPosition += 5;

    const totalStudents = studentDemographics.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    doc.autoTable({
      startY: yPosition,
      head: [["Category", "Count", "Percentage"]],
      body: studentDemographics.map((item) => [
        item.category,
        item.count.toLocaleString(),
        `${((item.count / totalStudents) * 100).toFixed(1)}%`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [39, 174, 96], // Custom green for header
        fontSize: 12,
        textColor: 255,
      },
      bodyStyles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { top: 15, left: 15, right: 15 },
    });

    // Add footer with page numbers and generated date
    addFooter(doc);

    // Save the PDF
    doc.save(`${fileName}.pdf`);
    setIsExporting(false);
  };

  return (
    <Button
      onClick={exportToPDF}
      variant="outline"
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export Report
    </Button>
  );
};

export default ExportButton;
