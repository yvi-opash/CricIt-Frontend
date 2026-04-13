const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
};

export default Loader;