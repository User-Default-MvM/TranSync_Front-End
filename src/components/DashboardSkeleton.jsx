import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="p-5 max-w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8 flex-col md:flex-row md:items-center gap-3">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 animate-pulse"></div>
        <div className="flex items-center gap-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center p-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Container Skeleton */}
      <div className="flex flex-col gap-5">
        {/* First Chart Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Trips Chart Skeleton */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-col md:flex-row gap-3">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
              <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 dark:bg-gray-600 rounded px-3 py-1 animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="flex-grow h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Routes Distribution Chart Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
            <div className="flex-grow h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Second Row - Alerts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Vehicle Status Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-8 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts List Skeleton */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;