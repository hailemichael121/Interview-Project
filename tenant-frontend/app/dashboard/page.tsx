export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your workspace dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats cards */}
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Outlines</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">24</p>
        </div>
        
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">8</p>
        </div>
        
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">12</p>
        </div>
      </div>
    </div>
  );
}