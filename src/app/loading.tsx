export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
