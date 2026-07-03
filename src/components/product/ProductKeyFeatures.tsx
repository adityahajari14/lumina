const features = [
  {
    title: "Total Blackout",
    description: "Enjoy complete darkness anytime with total blackout fabric that blocks all external light.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
      </svg>
    )
  },
  {
    title: "Cordless & Safe",
    description: "Designed with safety in mind, featuring a sleek cordless system with no cords or chains.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
      </svg>
    )
  },
  {
    title: "Energy Efficient",
    description: "Thermal pleated fabric helps keep rooms cooler in summer and warmer in winter.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
        <path d="M12 2v20"></path>
        <path d="M2 12h20"></path>
        <path d="M4.93 4.93l14.14 14.14"></path>
        <path d="M19.07 4.93L4.93 19.07"></path>
      </svg>
    )
  }
];

export default function ProductKeyFeatures() {
  return (
    <section className="bg-white w-full py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-[1248px] mx-auto flex flex-col gap-10">

        <div className="flex flex-col gap-4 text-center items-center">
          <span className="text-[#4051b5] font-sans font-medium text-[12px] tracking-[1.2px] uppercase">
            Key Features
          </span>
          <h2 className="text-[#131720] text-4xl lg:text-[48px] font-playfair font-medium leading-tight">
            Built for comfort<span className="italic">, made for you</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      </div>
    </section>
  );
}
