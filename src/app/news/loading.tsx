export default function LoadingNews() {
  return (
    <div className="min-h-screen bg-white py-20 px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="w-48 h-10 bg-gray-200 rounded-full mb-12"></div>
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-80"></div>
        ))}
      </div>
    </div>
  );
}