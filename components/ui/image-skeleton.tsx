export const ImageSkeleton = () => {
    return (
        <div className="relative w-[200px] h-[200px] rounded-md bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div className="absolute inset-0 animate-pulse">
                <div className="h-full w-full bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-600" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg
                    className="w-12 h-12 text-zinc-400 dark:text-zinc-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        </div>
    )
}

