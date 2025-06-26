
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart3, DollarSign, Package, Users, MessageSquare, Star, Download, AlertTriangle, FileSpreadsheet, ShoppingBag } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useState, useMemo } from "react";
import type { MonthlyReportData, ProductPerformance } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
const months = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

export default function AdminReportsPage() {
  const { generateMonthlyReport, orders, products: allProducts } = useAppContext(); 
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleGenerateReport = () => {
    setIsLoadingReport(true);
    // Simulate API call delay for better UX, remove if generateMonthlyReport is instant
    setTimeout(() => {
      const data = generateMonthlyReport(selectedYear, selectedMonth);
      setReportData(data);
      setIsLoadingReport(false);
    }, 300); 
  };

   const totalRevenueAllTime = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [orders]);
  const totalOrdersAllTime = orders.length;
  const totalProductsCount = allProducts.length;
  const averageOrderValueAllTime = totalOrdersAllTime > 0 ? totalRevenueAllTime / totalOrdersAllTime : 0;

  const overallMetrics = [
    { title: "Total Revenue (All Time)", value: `$${totalRevenueAllTime.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
    { title: "Total Orders (All Time)", value: totalOrdersAllTime.toString(), icon: ShoppingBag, color: "text-blue-500" },
    { title: "Avg. Order Value (All Time)", value: `$${averageOrderValueAllTime.toFixed(2)}`, icon: DollarSign, color: "text-purple-500" },
    { title: "Total Products", value: totalProductsCount.toString(), icon: Package, color: "text-orange-500" },
  ];


  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-primary flex items-center"><FileSpreadsheet className="mr-3 h-10 w-10"/>Sales & Performance Reports</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4 font-headline">Overall Store Snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {overallMetrics.map(metric => (
            <Card key={metric.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-body">{metric.title}</CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 font-headline">Monthly Detailed Report</h2>
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-body">Generate Report</CardTitle>
                <CardDescription>Select a year and month to generate a detailed report for {months.find(m=>m.value === selectedMonth)?.label} {selectedYear}.</CardDescription>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
                    <div>
                        <Label htmlFor="report-year">Year</Label>
                        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                            <SelectTrigger id="report-year"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="report-month">Month</Label>
                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                            <SelectTrigger id="report-month"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(month => <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerateReport} disabled={isLoadingReport} className="w-full sm:w-auto">
                        {isLoadingReport ? "Generating..." : "Generate Report"}
                    </Button>
                 </div>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoadingReport && <div className="text-center py-8"><Loader className="mx-auto h-8 w-8 animate-spin text-primary"/><p className="text-muted-foreground mt-2">Loading report data...</p></div>}
                {!isLoadingReport && reportData && (
                    <div className="space-y-6 mt-6">
                        <div className="text-center mb-4">
                            <Button variant="outline" onClick={() => alert("CSV Download functionality would be implemented here for a real app.")}>
                                <Download className="mr-2 h-4 w-4"/> Download Report as CSV (Simulated)
                            </Button>
                        </div>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Sales Summary for {months.find(m=>m.value === selectedMonth)?.label} {selectedYear}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricDisplay title="Total Revenue" value={`$${reportData.salesSummary.totalRevenue.toFixed(2)}`} />
                                <MetricDisplay title="Total Orders" value={reportData.salesSummary.totalOrders.toString()} />
                                <MetricDisplay title="Avg. Order Value" value={`$${reportData.salesSummary.averageOrderValue.toFixed(2)}`} />
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader><CardTitle className="text-lg">Top Selling Products (by Quantity)</CardTitle></CardHeader>
                             <CardContent>
                                {reportData.topSellingProducts.length > 0 ? (
                                    <ReportTable headers={["Product", "Units Sold", "Revenue"]} data={reportData.topSellingProducts} renderRow={(p: ProductPerformance) => (
                                        <TableRow key={p.productId}><TableCell>{p.name}</TableCell><TableCell>{p.unitsSold}</TableCell><TableCell>${p.revenueGenerated.toFixed(2)}</TableCell></TableRow>
                                    )}/>
                                ) : <p className="text-muted-foreground">No sales for top products this period.</p>}
                             </CardContent>
                        </Card>
                        
                        <Card>
                             <CardHeader><CardTitle className="text-lg">Detailed Product Performance</CardTitle></CardHeader>
                             <CardContent>
                                <ScrollArea className="h-[300px]">
                                    {reportData.detailedProductPerformance.length > 0 ? (
                                        <ReportTable headers={["Product", "Units Sold", "Revenue", "Stock Left"]} data={reportData.detailedProductPerformance} renderRow={(p: ProductPerformance) => (
                                            <TableRow key={p.productId}><TableCell>{p.name}</TableCell><TableCell>{p.unitsSold}</TableCell><TableCell>${p.revenueGenerated.toFixed(2)}</TableCell><TableCell>{p.currentStock}</TableCell></TableRow>
                                        )}/>
                                    ) : <p className="text-muted-foreground">No product performance data for this period.</p>}
                                </ScrollArea>
                             </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="text-lg flex items-center"><MessageSquare className="mr-2 h-5 w-5"/> Q&A Activity</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <MetricDisplay title="New Questions" value={reportData.qnaSummary.newQuestions.toString()} simple />
                                    <MetricDisplay title="Answered Questions" value={reportData.qnaSummary.answeredQuestions.toString()} simple />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg flex items-center"><Star className="mr-2 h-5 w-5"/> Review Activity</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     <MetricDisplay title="New Reviews" value={reportData.reviewSummary.newReviews.toString()} simple />
                                     <MetricDisplay title="Avg. Rating (New)" value={`${reportData.reviewSummary.averageNewRating.toFixed(1)} / 5`} simple />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                {!isLoadingReport && !reportData && (
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="mx-auto h-12 w-12 mb-2 text-orange-400" />
                        <p>No data available for the selected period, or report not yet generated.</p>
                        <p className="text-sm mt-1">Please select a year/month and click "Generate Report".</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </section>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-body">Placeholder for Charts</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
             <div className="text-center text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                <p>Chart components (e.g., Recharts or Shadcn/UI Charts) would be integrated here.</p>
                <p className="text-sm mt-1">This would visualize sales trends, product popularity, etc.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for consistent metric display
const MetricDisplay = ({ title, value, simple = false }: { title: string, value: string, simple?: boolean}) => (
  <div className={simple ? "" : "p-4 bg-muted/30 rounded-lg"}>
    <p className={`text-sm ${simple ? "text-muted-foreground" : "text-foreground font-medium"}`}>{title}</p>
    <p className={`${simple ? "text-md" : "text-2xl"} font-bold`}>{value}</p>
  </div>
);

// Helper component for tables (very basic)
const ReportTable = ({ headers, data, renderRow }: { headers: string[], data: any[], renderRow: (item: any) => React.ReactNode }) => (
    <Table>
        <TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{data.map(renderRow)}</TableBody>
    </Table>
);

// Simple Loader component
const Loader = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


    