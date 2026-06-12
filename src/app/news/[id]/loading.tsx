export default function LoadingNewsDetail() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="w-full h-[520px] bg-gray-200" />
      <div className="max-w-4xl mx-auto px-6 pb-16 -mt-32 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 md:p-14">
          <div className="h-12 bg-gray-200 rounded-xl w-3/4" />
          <div className="mt-6 h-4 bg-gray-200 rounded w-1/4" />

          <div className="mt-10 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}