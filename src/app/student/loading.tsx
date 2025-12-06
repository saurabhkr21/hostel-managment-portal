import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 rounded-2xl md:col-span-1" />
                    <Skeleton className="h-48 rounded-2xl md:col-span-2" />
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        </div>
    );
}
