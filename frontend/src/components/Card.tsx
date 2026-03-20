export default function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-kite-dark-card rounded-xl p-4 shadow-lg ${className}`}>
      {title && (
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
