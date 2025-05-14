
import AppViewWrapper from '@/components/prompt-forge/AppViewWrapper'; 

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 h-full"> {/* Ensure this container takes up remaining height */}
        <AppViewWrapper />
    </div>
  );
}
