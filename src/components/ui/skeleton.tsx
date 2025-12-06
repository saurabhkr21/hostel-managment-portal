import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-700", className)}
            {...props}
        />
    );
}

export function TableSkeleton() {
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
