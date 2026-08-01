export default function AdminLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Loading content...</p>
      </div>
    </div>
  );
}
