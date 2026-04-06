import Image from "next/image";
const features = [
    {
      title: "Cut to Your Exact Size",
      description: "Enter your dimensions and we cut every blind to the millimetre.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <path d="M21.3 15.3l-3.6-3.6"></path>
          <path d="M14 8l-6-6"></path>
          <path d="M4 14l-2 2"></path>
          <path d="M22 22l-2-2"></path>
          <path d="M14.7 14.7l-9.4-9.4"></path>
          <path d="M4 4l16 16"></path>
        </svg>
      )
    },
    {
      title: "Built to Last",
      description: "Premium materials engineered for durability and long-term performance.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: "Minimal Aesthetic",
      description: "Clean Scandinavian-influenced design that complements any interior.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      title: "Easy No-Drill Install",
      description: "Spring tension mount — fits in seconds, leaves no marks.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <polyline points="15 14 20 9 15 4"></polyline>
          <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
        </svg>
      )
    },
    {
      title: "Total Light Control",
      description: "Block 100% of light or let it all in. Complete control, zero compromise.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )
    },
    {
      title: "Dedicated Support",
      description: "Real humans, fast replies. We're here before, during, and after.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }
  ];

export default function ProductWhyLumina() {

  return (
    <section className="bg-[#f9fafb] w-full py-16 md:py-24 px-4 md:px-6 relative">
      <div className="max-w-[1248px] mx-auto flex flex-col gap-10 md:gap-14">

        {/* Header Content */}
        <div className="flex flex-col gap-4">
          <span className="text-[#4051b5] font-sans font-medium text-[12px] tracking-[1.2px] uppercase">
            Why Lumina
          </span>
          <h2 className="text-[#131720] text-4xl lg:text-[48px] font-playfair font-medium leading-tight">
            Why choose <span className="italic"><br />Lumina?</span>
          </h2>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-[#eaedf0] rounded-[16px] p-6 flex flex-col gap-5 sm:flex-row sm:items-start"
            >
              <div className="bg-[#f9fafb] rounded-xl w-12 h-12 shrink-0 flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-playfair font-medium text-[#131720] text-[16px]">
                  {feature.title}
                </h3>
                <p className="font-sans text-[14px] text-[#657186] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Craftsmanship Banner */}
        <div className="relative w-full h-[360px] rounded-[24px] overflow-hidden mt-6">
          <Image 
            src="/home/craftsmanship-bg.webp"
            alt="Premium craftsmanship banner"
            fill
            className="object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#131720]/55" />
          
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
            <h3 className="font-playfair font-medium text-white text-[32px] md:text-[36px] mb-2 leading-tight">
              Proudly made in Texas
            </h3>
            <p className="font-sans text-[14px] text-white/70 max-w-md leading-relaxed">
              Designed and manufactured with care, quality, and
              sustainability. Every blind built to last.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
