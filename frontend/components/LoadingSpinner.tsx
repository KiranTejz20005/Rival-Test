export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
      <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors duration-200">
        {spinner}
      </div>
    );
  }

  return <div className="py-12">{spinner}</div>;
}
