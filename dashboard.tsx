import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScheduleCard } from "@/components/dashboard/ScheduleCard";
import { JobsTable } from "@/components/dashboard/JobsTable";
import { CallsCard } from "@/components/dashboard/CallsCard";
import { InvoicesCard } from "@/components/dashboard/InvoicesCard";

import { 
  CheckSquare, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Phone 
} from "lucide-react";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs', { businessId: 1, status: 'completed' }],
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices', { businessId: 1 }],
  });

  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments', { 
      businessId: 1, 
      startDate: new Date().toISOString().split('T')[0]
    }],
  });

  const { data: calls } = useQuery({
    queryKey: ['/api/call-logs', { businessId: 1 }],
  });

  // Calculate monthly revenue
  const calculateMonthlyRevenue = () => {
    if (!invoices) return 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return invoices
      .filter((invoice: any) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear &&
               invoice.status === 'paid';
      })
      .reduce((sum: number, invoice: any) => sum + invoice.total, 0);
  };

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Top Section - Analytics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Completed Jobs"
            value={jobs?.length || 0}
            icon={<CheckSquare />}
            iconBgColor="bg-primary-100"
            iconColor="text-primary-600"
            change={12}
            changeType="increase"
            linkText="View all"
            linkHref="/jobs"
          />
          
          <StatCard
            title="Revenue MTD"
            value={`$${Math.round(calculateMonthlyRevenue())}`}
            icon={<DollarSign />}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            change={8.5}
            changeType="increase"
            linkText="View details"
            linkHref="/invoices"
          />
          
          <StatCard
            title="Today's Appointments"
            value={appointments?.length || 0}
            icon={<CalendarIcon />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            changeText={appointments?.length === 0 ? "No appointments" : "Today"}
            changeType="neutral"
            linkText="View schedule"
            linkHref="/appointments"
          />
          
          <StatCard
            title="Calls This Week"
            value={calls?.length || 0}
            icon={<Phone />}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            changeText={calls?.length > 0 ? `${calls.filter((call: any) => 
              new Date(call.callTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length} new` : "No recent calls"}
            changeType={calls?.length > 0 ? "increase" : "neutral"}
            linkText="View logs"
            linkHref="/receptionist"
          />
        </div>
        
        {/* Middle Section - Appointments and Jobs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <div className="lg:col-span-1">
            <ScheduleCard date={new Date()} businessId={1} />
          </div>
          
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <JobsTable businessId={1} limit={3} />
          </div>
        </div>
        
        {/* Bottom Section - Recent Calls and Invoices */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Calls from Virtual Receptionist */}
          <CallsCard businessId={1} limit={3} />
          
          {/* Recent Invoices */}
          <InvoicesCard businessId={1} limit={3} />
        </div>
      </div>
    </PageLayout>
  );
}
