import Link from "next/link";
import { BLACKOUT_PRODUCT_PATH } from "@/lib/product-routes";

const FEATURES = [
  { label: "100% Light Blocked",         note: "Complete blackout, no edge bleed" },
  { label: "No-Drill Installation",      note: "Tension mount, no wall damage" },
  { label: "Custom Made to Your Size",   note: "Precision-cut to your measurements" },
  { label: "Child-Safe & Cordless",      note: "Spring-roll mechanism, no cords" },
  { label: "Thermal Insulation",         note: "Regulates room temperature year-round" },
  { label: "OEKO-TEX® Certified Fabric", note: "Independently tested, safe for all rooms" },
  { label: "Zero Light Gaps at Edges",   note: "Side channels eliminate all bleed" },
  { label: "Removable & Reusable",       note: "Repositions without tools or adhesive" },
  { label: "Ready in Minutes",           note: "No professional installer required" },
];

const COLUMNS = [
  { label: "Lumina",            sub: "Blackout Blind",  highlight: true  },
  { label: "Standard Blinds",  sub: "Off-the-shelf",   highlight: false },
  { label: "Blackout Curtains", sub: "Fabric panels",   highlight: false },
  { label: "Window Film",       sub: "Adhesive tint",   highlight: false },
];

const MATRIX: (boolean | "partial")[][] = [
  [true,  false,     false,     false    ],
  [true,  false,     false,     true     ],
  [true,  "partial", false,     false    ],
  [true,  false,     true,      true     ],
  [true,  false,     "partial", false    ],
  [true,  false,     false,     false    ],
  [true,  false,     false,     "partial"],
  [true,  false,     true,      false    ],
  [true,  false,     true,      true     ],
];

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Cell({ value, isLumina }: { value: boolean | "partial"; isLumina: boolean }) {
  if (value === true) {
    return (
      <span className="flex justify-center">
        {isLumina ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#131720] text-white">
            <CheckIcon />
          </span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#131720" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="flex justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dbe0e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
}

export default function ComparisonTable() {
  return (
    <section className="bg-white w-full py-20 lg:py-24 px-4 sm:px-6 border-t border-[#eaedf0]">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-14">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="font-playfair font-medium text-[#131720] text-4xl lg:text-[48px] leading-tight lg:leading-13">
            See how we <span className="font-normal italic">compare</span>
          </h2>
          <p className="font-sans font-light text-[#657186] text-base lg:text-[16px] leading-relaxed max-w-100">
            An honest side-by-side against the most common alternatives.
          </p>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-155 border-collapse">

            {/* Column headers */}
            <thead>
              <tr>
                {/* Empty corner */}
                <th className="w-[36%] pb-5" />
                {COLUMNS.map((col) => (
                  <th key={col.label} className="pb-5 px-3 text-center align-bottom">
                    {col.highlight ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-block rounded-full bg-[#131720] px-3 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-white mb-1">
                          Our pick
                        </span>
                        <span className="font-playfair font-medium text-[16px] text-[#131720] leading-tight">
                          {col.label}
                        </span>
                        <span className="font-sans text-[11px] text-[#8c95a4]">{col.sub}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-sans font-medium text-[13px] text-[#657186] leading-tight">
                          {col.label}
                        </span>
                        <span className="font-sans text-[11px] text-[#c8cdd6]">{col.sub}</span>
                      </div>
                    )}
                  </th>
                ))}
              </tr>

              {/* Divider row */}
              <tr>
                <td colSpan={5} className="p-0">
                  <div className="h-px bg-[#eaedf0]" />
                </td>
              </tr>
            </thead>

            {/* Feature rows */}
            <tbody>
              {FEATURES.map((feature, fi) => (
                <tr key={feature.label} className="group">
                  {/* Feature label */}
                  <td className={`py-4 pr-6 ${fi < FEATURES.length - 1 ? "border-b border-[#f4f5f7]" : ""}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans font-medium text-[13px] text-[#131720]">
                        {feature.label}
                      </span>
                      <span className="font-sans text-[12px] text-[#9aa3af] leading-4.5">
                        {feature.note}
                      </span>
                    </div>
                  </td>

                  {COLUMNS.map((col, ci) => (
                    <td
                      key={col.label}
                      className={`py-4 px-3 text-center ${fi < FEATURES.length - 1 ? "border-b border-[#f4f5f7]" : ""} ${col.highlight ? "bg-[#131720]/3" : ""}`}
                    >
                      <Cell value={MATRIX[fi][ci]} isLumina={col.highlight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {/* Footer */}
            <tfoot>
              <tr>
                <td colSpan={5} className="p-0 pt-px">
                  <div className="h-px bg-[#eaedf0]" />
                </td>
              </tr>
              <tr>
                <td className="pt-6 pr-6">
                  <p className="font-sans text-[12px] text-[#9aa3af]">
                    Based on typical product characteristics. &ldquo;—&rdquo; indicates partial support depending on variant.
                  </p>
                </td>
                <td className="pt-6 px-3 text-center bg-[#131720]/3">
                  <Link
                    href={BLACKOUT_PRODUCT_PATH}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#131720] px-5 py-2.5 font-sans text-[12px] font-medium text-white transition-colors hover:bg-black whitespace-nowrap"
                  >
                    Shop the Blind
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </td>
                <td className="pt-6 px-3" />
                <td className="pt-6 px-3" />
                <td className="pt-6 px-3" />
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </section>
  );
}
