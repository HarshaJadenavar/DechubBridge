import React from "react";

function Section04() {
  return (
    <section className="w-full py-16 tablet:py-24 px-6 tablet:px-10 desktop:px-16 desktop:py-24 bg-white">
      <div className="max-w-[1312px] mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <p className="m-0 text-tertiary overline-large-medium !text-secondary mb-3 uppercase">
            Deel Speed
          </p>
          <h2 className="text-balance m-0 heading-h2 !text-primary m-0">
            Accomplish more in less time
          </h2>
        </div>
        <div className="mb-16 tablet:flex tablet:justify-center">
          <div className="flex gap-5 px-4 -mx-4 tablet:mx-0 tablet:px-0 overflow-x-auto tablet:overflow-x-visible scroll-smooth snap-x snap-mandatory tablet:snap-none scrollbar-hide tablet:flex-wrap tablet:justify-center">
            <button className="flex items-center px-0.5 py-0.5 rounded-sm transition-all duration-200 paragraph-small-medium whitespace-nowrap border-0 snap-center flex-shrink-0 gap-2 bg-blue-150" type="button" aria-pressed="true">
              <span className="flex-shrink-0 p-1.5 flex items-center justify-center rounded-sm transition-colors duration-200 bg-blue-325">
                <img src="assets/images/website-media.deel.com/payroll_92b9e25547-ef97117a.svg" srcSet="assets/images/website-media.deel.com/payroll_92b9e25547-ef97117a.svg 20w" alt="" width="20" height="20" sizes="100vw" loading="lazy" fetchPriority="auto" decoding="async" className="object-contain" />
              </span>
              <p className="m-0 text-tertiary paragraph-xxlarge !text-primary !font-semibold m-0 mr-1.5">
                Deel Payroll
              </p>
            </button>
            <button className="flex items-center px-0.5 py-0.5 rounded-sm transition-all duration-200 paragraph-small-medium whitespace-nowrap border-0 snap-center flex-shrink-0 gap-1 bg-transparent border-transparent hover:bg-surface-latte-light" type="button" aria-pressed="false">
              <span className="flex-shrink-0 p-1.5 flex items-center justify-center rounded-sm transition-colors duration-200 bg-transparent opacity-50">
                <img src="assets/images/website-media.deel.com/hr_2bd9cffda1-6a630146.svg" srcSet="assets/images/website-media.deel.com/hr_2bd9cffda1-6a630146.svg 12w" alt="" width="20" height="20" sizes="100vw" loading="lazy" fetchPriority="auto" decoding="async" className="object-contain" />
              </span>
              <p className="m-0 text-tertiary paragraph-xxlarge !text-[#1b1b1b99] !font-semibold m-0 mr-1.5">
                Deel HR
              </p>
            </button>
            <button className="flex items-center px-0.5 py-0.5 rounded-sm transition-all duration-200 paragraph-small-medium whitespace-nowrap border-0 snap-center flex-shrink-0 gap-1 bg-transparent border-transparent hover:bg-surface-latte-light" type="button" aria-pressed="false">
              <span className="flex-shrink-0 p-1.5 flex items-center justify-center rounded-sm transition-colors duration-200 bg-transparent opacity-50">
                <img src="assets/images/website-media.deel.com/it_a20117c5c8-51bb4f3d.svg" srcSet="assets/images/website-media.deel.com/it_a20117c5c8-51bb4f3d.svg 20w" alt="" width="20" height="20" sizes="100vw" loading="lazy" fetchPriority="auto" decoding="async" className="object-contain" />
              </span>
              <p className="m-0 text-tertiary paragraph-xxlarge !text-[#1b1b1b99] !font-semibold m-0 mr-1.5">
                Deel IT
              </p>
            </button>
            <button className="flex items-center px-0.5 py-0.5 rounded-sm transition-all duration-200 paragraph-small-medium whitespace-nowrap border-0 snap-center flex-shrink-0 gap-1 bg-transparent border-transparent hover:bg-surface-latte-light" type="button" aria-pressed="false">
              <span className="flex-shrink-0 p-1.5 flex items-center justify-center rounded-sm transition-colors duration-200 bg-transparent opacity-50">
                <img src="assets/images/website-media.deel.com/hire_705b89bb9c-54a21706.svg" srcSet="assets/images/website-media.deel.com/hire_705b89bb9c-54a21706.svg 20w" alt="Icon: person with a check icon" width="20" height="20" sizes="100vw" loading="lazy" fetchPriority="auto" decoding="async" className="object-contain" />
              </span>
              <p className="m-0 text-tertiary paragraph-xxlarge !text-[#1b1b1b99] !font-semibold m-0 mr-1.5">
                Deel Hire
              </p>
            </button>
          </div>
        </div>
        <div className="mb-16">
          <div className="hidden tablet:flex tablet:justify-between relative">
            <div className="absolute border-t-2 border-b-0 border-dashed border-neutral-300" style={{ top: "6px", left: "0px", width: "0px" }} />
            <div className="flex justify-start">
              <div className="flex flex-col items-center">
                <div className="mb-8 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Today
                  </h3>
                  <div className="p-5 rounded-md w-[220px] md:w-[280px] bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Set up payroll countries and owners
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="mb-8 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Hours later
                  </h3>
                  <div className="p-5 rounded-md w-[220px] md:w-[280px] bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Configure pay rules, approvals, and cutoffs
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex flex-col items-center">
                <div className="mb-8 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Tomorrow
                  </h3>
                  <div className="p-5 rounded-md w-[220px] md:w-[280px] bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Everyone gets paid on time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tablet:hidden flex flex-col">
            <div className="flex flex-row gap-4">
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-px flex-1 border-l-2 border-r-0 border-dashed border-neutral-300" />
              </div>
              <div className="flex-1 pb-8">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Today
                  </h3>
                  <div className="p-5 rounded-md w-full bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Set up payroll countries and owners
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-px flex-1 border-l-2 border-r-0 border-dashed border-neutral-300" />
              </div>
              <div className="flex-1 pb-8">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Hours later
                  </h3>
                  <div className="p-5 rounded-md w-full bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Configure pay rules, approvals, and cutoffs
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">
                    Tomorrow
                  </h3>
                  <div className="p-5 rounded-md w-full bg-blue-150">
                    <p className="m-0 text-tertiary paragraph-medium !text-primary m-0">
                      Everyone gets paid on time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section04;
