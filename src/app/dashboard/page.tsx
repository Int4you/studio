"use client"; // Add this directive
import AppViewWrapper from '@/components/prompt-forge/AppViewWrapper'; 

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 h-full">
        <AppViewWrapper />
    </div>
  );
}
