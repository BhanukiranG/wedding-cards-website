export default function SkeletonCard() {
  return (
    <div className="bg-cream-light border border-gold/20 rounded-lg p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gold-dark/10 rounded w-1/3"></div>
        <div className="h-5 bg-gold-dark/15 rounded-full w-12"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gold-dark/10 rounded w-full"></div>
        <div className="h-3 bg-gold-dark/10 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 bg-gold-dark/10 rounded w-1/4"></div>
        <div className="h-7 bg-gold-dark/20 rounded w-20"></div>
      </div>
    </div>
  );
}
