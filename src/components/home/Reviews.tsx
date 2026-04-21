
const reviewsData = [
  {
    name: 'Megan H.',
    location: 'Leeds',
    product: 'Lumina · Anthracite · 100×150cm',
    text: `"The blind arrived well packed and fitted the window neatly. It cuts the morning light down a lot, and the finish looks clean in the room."`,
  },
  {
    name: 'Daniel P.',
    location: 'Bristol',
    product: 'Lumina · Cream · 80×120cm',
    text: `"Installation was straightforward and the tension fit feels secure. We used it in a guest room and the difference in light control was immediate."`,
  },
  {
    name: 'Priya S.',
    location: 'London',
    product: 'Lumina · White · Custom',
    text: `"The custom size matched our recess well and the blind looks tidy once installed. It has made the bedroom noticeably darker at night."`,
  },
  {
    name: 'Oliver J.',
    location: 'Manchester',
    product: 'Lumina · Anthracite · 120×180cm',
    text: `"Good option for a rental because it does not need drilling. The blind feels solid, and the colour matched the product photos closely."`,
  },
  {
    name: 'Sophie L.',
    location: 'Edinburgh',
    product: 'Lumina · White · 60×90cm',
    text: `"It sits neatly against the frame and looks minimal from the outside. The white finish is close to what I expected from the photos."`,
  },
  {
    name: 'James C.',
    location: 'Cardiff',
    product: 'Lumina · Cream · 140×200cm',
    text: `"Delivery was quick and the blind was easy to set up. It gives us much better room darkening than the old roller blind we had before."`,
  },
];

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0L13.09 6.26L20 7.27L15 12.14L16.18 19.02L10 16.27L3.82 19.02L5 12.14L0 7.27L6.91 6.26L10 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="bg-[#f9fafb] py-16 md:py-24 px-6 relative w-full">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-10 md:gap-14">
        {/* Header container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
          {/* Header left */}
          <div className="flex flex-col gap-4 max-w-[283px] w-full">
            <p className="font-[family-name:var(--font-dm-sans)] font-medium text-[#4051b5] text-xs tracking-[1.2px] uppercase">
              Reviews
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[#131720] text-4xl md:text-[48px] leading-tight md:leading-[48px] whitespace-nowrap">
              What our <br />
              <span className="font-normal italic">customers say</span>
            </h2>
          </div>
          
          {/* Header right (Overall rating) */}
          <div className="flex items-center gap-4 pb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="text-[#131720] w-5 h-5 shrink-0" />
              ))}
            </div>
            <div className="flex flex-col items-start gap-px">
              <p className="font-[family-name:var(--font-playfair)] font-semibold text-[#131720] text-2xl leading-[32px]">
                4.9 / 5
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-xs leading-[16px]">
                from recent customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviewsData.map((review, i) => (
            <div
              key={i}
              className="bg-[#eaedf0] rounded-2xl flex flex-col gap-4 items-start p-7 self-start h-full"
            >
              {/* Card stars */}
              <div className="flex gap-1 w-full">
                {[...Array(5)].map((_, idx) => (
                  <StarIcon key={idx} className="text-[#131720] w-3.5 h-3.5 shrink-0" />
                ))}
              </div>
              
              {/* Card text */}
              <div className="flex-grow pb-2 w-full">
                <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#131720] text-sm leading-[22.75px]">
                  {review.text}
                </p>
              </div>
              
              {/* Card footer (User details) */}
              <div className="border-t border-[#dbe0e6] pt-3 flex gap-3 items-center w-full">
                {/* Avatar */}
                <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden bg-[#dbe0e6] flex items-center justify-center">
                  <span className="font-[family-name:var(--font-playfair)] font-semibold text-[#131720] text-sm leading-none">
                    {review.name.charAt(0)}
                  </span>
                </div>
                
                {/* Info Text */}
                <div className="flex flex-col gap-0.5 items-start">
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-5">
                    <span className="font-medium text-[#131720]">{review.name} &middot; </span>
                    <span className="font-normal text-[#657186]">{review.location}</span>
                  </p>
                  <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-xs leading-4">
                    {review.product}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
