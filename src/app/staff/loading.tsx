import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        </div>
    );
}
