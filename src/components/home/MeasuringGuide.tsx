import Image from 'next/image';

export default function MeasuringGuide() {
  return (
    <section className="bg-[#f9fafb] w-full flex flex-col items-center py-16 lg:py-[96px] px-6">
      <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[64px] items-center">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-start gap-4 max-w-[550px] w-full lg:hidden order-1">
          <span className="font-sans font-medium text-[#4051b5] text-[12px] tracking-[1.2px] uppercase leading-[16px]">
            Measuring Guide
          </span>
          <h2 className="font-playfair font-medium text-[#131720] text-4xl leading-tight flex flex-col mb-0">
            <span>Measure once,</span>
            <span className="font-normal italic">fit perfectly</span>
          </h2>
        </div>

        {/* Left Column - Content */}
        <div className="flex flex-col items-start gap-4 max-w-[550px] justify-self-center lg:justify-self-start order-3 lg:order-1">

          {/* Eyebrow - Desktop */}
          <span className="hidden lg:block font-sans font-medium text-[#4051b5] text-[12px] tracking-[1.2px] uppercase leading-[16px]">
            Measuring Guide
          </span>

          {/* Heading - Desktop */}
          <h2 className="hidden lg:flex font-playfair font-medium text-[#131720] text-[48px] leading-[48px] flex-col mb-1">
            <span className="font-normal italic">fit perfectly</span>
          </h2>

          {/* Intro Text */}
          <p className="font-sans font-normal text-[#657186] text-base lg:text-[16px] leading-[26px]">
            Our blinds are made to your exact measurements. Follow these three simple steps and your blind will fit your window flawlessly — first time, every time.
          </p>

          {/* Steps List */}
          <div className="flex flex-col gap-8 mt-6">
            
            {/* Step 01 */}
            <div className="flex gap-5 items-start">
              <div className="bg-[#eaedf0] rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <span className="font-playfair font-semibold text-[#657186] text-[14px] leading-[20px]">01</span>
              </div>
              <div className="flex flex-col gap-[3.4px] pt-1">
                <h3 className="font-playfair font-medium text-[#131720] text-[18px] leading-[28px]">
                  Measure the width
                </h3>
                <p className="font-sans font-normal text-[#657186] text-[14px] leading-[22.75px]">
                  Measure the inside width of your window recess at three points — top, middle, and bottom. Use the smallest measurement.
                </p>
                <p className="font-sans font-medium text-[#4051b5] text-[12px] leading-[16px] mt-1">
                  💡 For recess fit: subtract 5mm for clearance.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex gap-5 items-start">
              <div className="bg-[#eaedf0] rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <span className="font-playfair font-semibold text-[#657186] text-[14px] leading-[20px]">02</span>
              </div>
              <div className="flex flex-col gap-[3.4px] pt-1">
                <h3 className="font-playfair font-medium text-[#131720] text-[18px] leading-[28px]">
                  Measure the drop
                </h3>
                <p className="font-sans font-normal text-[#657186] text-[14px] leading-[22.75px]">
                  Measure the full height of the window recess from top to sill. Measure on both sides and use the smaller figure.
                </p>
                <p className="font-sans font-medium text-[#4051b5] text-[12px] leading-[16px] mt-1">
                  💡 For exact sill coverage, add 20mm to your drop.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex gap-5 items-start">
              <div className="bg-[#eaedf0] rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <span className="font-playfair font-semibold text-[#657186] text-[14px] leading-[20px]">03</span>
              </div>
              <div className="flex flex-col gap-[3.4px] pt-1">
                <h3 className="font-playfair font-medium text-[#131720] text-[18px] leading-[28px]">
                  Enter your dimensions
                </h3>
                <p className="font-sans font-normal text-[#657186] text-[14px] leading-[22.75px]">
                  At checkout, enter your chosen width and drop. We make every blind to your supplied measurements.
                </p>
                <p className="font-sans font-medium text-[#4051b5] text-[12px] leading-[16px] mt-1">
                  💡 We accept measurements in both cm and mm.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative w-full h-[500px] lg:h-[730px] order-2 lg:order-2">
          
          <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] bg-zinc-200">
            <Image 
              src="/home/measuring-guide-img.webp" 
              alt="Measuring a window"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Precision Badge Overlay */}
          <div className="absolute top-6 right-0 lg:-right-8 bg-[#f9fafb] border border-[#dbe0e6] rounded-[16px] p-[21px] w-[150px] lg:w-[176px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] z-10 flex flex-col gap-1">
            <span className="font-sans font-normal text-[#657186] text-[12px] leading-[16px]">Custom</span>
            <span className="font-playfair font-semibold text-[#131720] text-[24px] leading-[32px]">Made</span>
            <span className="font-sans font-normal text-[#657186] text-[12px] leading-[16px]">to measure</span>
          </div>

        </div>

      </div>
    </section>
  );
}
