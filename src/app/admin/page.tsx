
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, HelpCircle, Package, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, orders, questions, reviews } = useAppContext();

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingQuestions = questions.filter(q => !q.answerText).length;
  const totalReviews = reviews.length;
  
  const metrics = [
    { title: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500" },
    { title: "Total Orders", value: totalOrders, icon: DollarSign, color: "text-green-500" },
    { title: "Pending Questions", value: pendingQuestions, icon: HelpCircle, color: "text-yellow-500" },
    { title: "Total Reviews", value: totalReviews, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-primary">Admin Dashboard</h1>

      {/* Key Metrics Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 font-headline">Key Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map(metric => (
            <Card key={metric.title} className="shadow-lg hover:shadow-xl transition-shadow">
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
      
      {/* Placeholder for more dashboard components */}
      {/* 
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Activity feed will be shown here.</p>
          </CardContent>
        </Card>
      </section>
      */}
    </div>
  );
}
