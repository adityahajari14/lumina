const facts = [
  {
    label: "100% blackout guaranteed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    label: "Free USA shipping",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Delivered in 7–11 days",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "No-drill install",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export default function QuickAnswersStrip() {
  return (
    <div className="w-full bg-[#131720] px-6 py-4">
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {facts.map((fact, i) => (
          <div key={i} className="flex items-center gap-2 text-white/80">
            <span className="text-[#4ade80]">{fact.icon}</span>
            <span className="font-sans text-[13px]">{fact.label}</span>
            {i < facts.length - 1 && (
              <span className="hidden sm:block text-white/20 ml-8 select-none">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
