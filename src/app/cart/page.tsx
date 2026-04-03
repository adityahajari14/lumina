import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  // Using mocked data to showcase the design since there isn't a global cart context yet
  const cartItems = [
    {
      id: 1,
      name: "The Lumina Blind",
      details: "Midnight · 100×150cm",
      price: 118.00,
      quantity: 1,
      image: "/product/gallery-1.webp",
    },
    {
      id: 2,
      name: "The Lumina Blind",
      details: "Nordic White · Custom (80×120cm)",
      price: 135.00,
      quantity: 1,
      image: "/product/gallery-3.webp",
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping: number = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] pt-8 md:pt-16 pb-20">
      <div className="max-w-[1248px] mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 md:mb-14">
          <Link href="/products" className="text-[#657186] font-sans text-sm hover:text-[#131720] transition-colors flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Continue Shopping
          </Link>
          <h1 className="font-playfair font-medium text-[#131720] text-4xl lg:text-[48px] leading-tight">
            Your Cart
          </h1>
          <p className="font-sans text-[#657186] text-[15px]">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Cart Items List */}
          <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-4 md:p-6 shadow-sm border border-[#eaedf0] flex flex-col gap-6">
              {cartItems.map((item, idx) => (
                <div key={item.id} className={`flex flex-col sm:flex-row gap-6 ${idx !== cartItems.length - 1 ? 'pb-6 border-b border-[#eaedf0]' : ''}`}>
                  
                  {/* Item Image */}
                  <div className="relative w-full sm:w-[140px] aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[#f8f9fb] shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover mix-blend-multiply"
                      sizes="(max-width: 640px) 100vw, 140px"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col justify-between flex-1 gap-4 sm:gap-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-playfair font-medium text-[#131720] text-[18px]">
                          {item.name}
                        </h3>
                        <p className="font-sans text-[14px] text-[#657186]">
                          {item.details}
                        </p>
                      </div>
                      <div className="font-sans font-medium text-[#131720] text-[16px]">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-[#eaedf0] rounded-full bg-[#f9fafb]">
                        <button className="w-9 h-9 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors" aria-label="Decrease quantity">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="font-sans text-[14px] font-medium text-[#131720] w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button className="w-9 h-9 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors" aria-label="Increase quantity">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>

                      <button className="text-[#657186] hover:text-red-500 transition-colors flex items-center gap-1.5 text-[13px] font-sans font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#eaedf0]/50 rounded-[16px] p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-sans font-medium text-[13px] text-[#131720]">3-Year Warranty</span>
                   <span className="font-sans text-[12px] text-[#657186]">Built to last</span>
                 </div>
               </div>
               <div className="bg-[#eaedf0]/50 rounded-[16px] p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-sans font-medium text-[13px] text-[#131720]">Secure Checkout</span>
                   <span className="font-sans text-[12px] text-[#657186]">SSL Encrypted</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="col-span-1 lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-[#eaedf0] sticky top-28 flex flex-col gap-6">
              <h2 className="font-playfair font-medium text-[#131720] text-[24px]">
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 font-sans text-[15px]">
                <div className="flex justify-between items-center text-[#657186]">
                  <span>Subtotal</span>
                  <span className="text-[#131720] font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#657186]">
                  <span>Shipping</span>
                  <span className="text-[#131720] font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="w-full h-[1px] bg-[#eaedf0] my-2"></div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[#131720] font-medium text-[18px]">Total</span>
                    <span className="text-[#657186] text-[12px] mt-0.5">Including VAT</span>
                  </div>
                  <span className="font-playfair text-[#131720] font-medium text-[28px]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-[#131720] hover:bg-black text-[#f9fafb] font-sans font-medium text-[16px] py-4 rounded-full transition-colors flex items-center justify-center gap-2 mt-2">
                Proceed to Checkout
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <div className="flex items-center justify-center gap-2 text-[#657186] text-[12px] font-sans mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Ships within 3-5 business days from Europe.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
