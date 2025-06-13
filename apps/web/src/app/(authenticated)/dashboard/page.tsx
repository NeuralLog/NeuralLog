import { DashboardController } from '@/components/dashboard/DashboardController';
import { EnhancedDashboard } from '@/components/dashboard/EnhancedDashboard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <div className="space-y-8">
        <EnhancedDashboard />
        <DashboardController />
      </div>
    </div>
  );
}
