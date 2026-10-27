import React from "react";

function Section01() {
  return (
    <section className="w-full overflow-hidden p-3 bg-white">
      <div className="w-full flex flex-col gap-3 h-fit max-w-[1704px] mx-auto min-[1050px]:flex-row min-[1050px]:items-stretch min-[1050px]:h-auto min-[1050px]:min-h-[var(--hero-height)]" style={{ '--hero-height': "86vh" }}>
        <div className="w-full flex flex-col rounded-md [background:var(--color-purple-gradient-dark)] py-xxs px-nano min-[390px]:px-xxs tablet:p-lg min-[1050px]:w-1/2 min-[1050px]:pl-big min-[1050px]:pr-md min-[1050px]:pt-xxxl min-[1050px]:pb-md desktop:pb-xl">
          <div className="flex-1 flex flex-col w-full max-w-[450px] mx-auto items-center text-center min-[1050px]:max-w-none min-[1050px]:mx-0 min-[1050px]:items-stretch min-[1050px]:text-left">
            <h1 className="text-balance m-0 heading-h1 !font-bagoss-condensed font-medium text-center text-[38px] leading-[1.05] tracking-[-0.19px] text-white min-[1050px]:text-left min-[1050px]:text-[42px] desktop:text-6xl text-wrap mt-xxxs mb-0 w-full min-[1050px]:mb-[44px] whitespace-pre-line min-h-[120px] min-[768px]:min-h-[150px] min-[1050px]:min-h-[190px] [&_em]:text-[var(--color-purple-525)]! desktop:max-w-[592px]">
              Hire, manage, pay, & equip anyone, anywhere. 
            </h1>
            <div className="w-full min-[1050px]:max-w-[375px]">
              <p className="font-inter text-[18px] font-semibold leading-[1.6] tracking-[-0.09px] text-surface-white text-center mt-[30px] mb-xxxs min-[1050px]:mt-0 min-[1050px]:text-left min-[1050px]:text-[20px] min-[1050px]:tracking-[-0.1px] min-[1050px]:mb-xxs">
                What would you like to do with Deel?
              </p>
              <div role="group" aria-label="What would you like to do with Deel?" className="flex flex-col gap-xxxs">
                <div className="flex gap-xxxs">
                  <button type="button" role="checkbox" aria-checked="false" aria-label="Hire anywhere" className="group flex flex-1 basis-0 flex-col items-center justify-start gap-xxxs rounded-md px-xxxs py-xxxs min-h-[72px] min-[1050px]:min-h-[80px] border text-sm font-semibold text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white">
                    <span aria-hidden="true" className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 transition-colors border-[var(--color-purple-525)] bg-transparent" />
                    <span className="leading-[1.2] whitespace-pre-line">
                      Hire anywhere
                    </span>
                  </button>
                  <button type="button" role="checkbox" aria-checked="false" aria-label="Run payroll" className="group flex flex-1 basis-0 flex-col items-center justify-start gap-xxxs rounded-md px-xxxs py-xxxs min-h-[72px] min-[1050px]:min-h-[80px] border text-sm font-semibold text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white">
                    <span aria-hidden="true" className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 transition-colors border-[var(--color-purple-525)] bg-transparent" />
                    <span className="leading-[1.2] whitespace-pre-line">
                      Run payroll
                    </span>
                  </button>
                </div>
                <div className="flex gap-xxxs">
                  <button type="button" role="checkbox" aria-checked="false" aria-label="Secure visas" className="group flex flex-1 basis-0 flex-col items-center justify-start gap-xxxs rounded-md px-xxxs py-xxxs min-h-[72px] min-[1050px]:min-h-[80px] border text-sm font-semibold text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white">
                    <span aria-hidden="true" className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 transition-colors border-[var(--color-purple-525)] bg-transparent" />
                    <span className="leading-[1.2] whitespace-pre-line">
                      {"Secure\nvisas"}
                    </span>
                  </button>
                  <button type="button" role="checkbox" aria-checked="false" aria-label="Manage HR & people" className="group flex flex-1 basis-0 flex-col items-center justify-start gap-xxxs rounded-md px-xxxs py-xxxs min-h-[72px] min-[1050px]:min-h-[80px] border text-sm font-semibold text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white">
                    <span aria-hidden="true" className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 transition-colors border-[var(--color-purple-525)] bg-transparent" />
                    <span className="leading-[1.2] whitespace-pre-line">
                      {"Manage\nHR & people"}
                    </span>
                  </button>
                  <button type="button" role="checkbox" aria-checked="false" aria-label="Ship equipment" className="group flex flex-1 basis-0 flex-col items-center justify-start gap-xxxs rounded-md px-xxxs py-xxxs min-h-[72px] min-[1050px]:min-h-[80px] border text-sm font-semibold text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white">
                    <span aria-hidden="true" className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-2 transition-colors border-[var(--color-purple-525)] bg-transparent" />
                    <span className="leading-[1.2] whitespace-pre-line">
                      {"Ship\nequipment"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="mt-[20px] min-[1050px]:mt-sm w-full">
                <button type="button" className="!bg-white !text-[#1B1B1B] !rounded-full !w-full font-semibold! font-inter! text-[18px]! hover:!bg-white/90 mui-wcylc2">
                  Book a demo
                </button>
              </div>
              <div className="mt-xs flex justify-center min-[1050px]:mt-sm">
                <div className="flex flex-wrap items-center justify-center gap-xxs text-white">
                  <div className="flex items-center py-0.5 gap-nano shrink-0">
                    <img alt="G2 logo" loading="lazy" width="25" height="25" decoding="async" style={{ color: "transparent" }} sizes="25px" srcSet="assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 16w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 32w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 48w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 64w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 96w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 128w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 256w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 384w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 640w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 640w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 750w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 768w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 828w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1024w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1080w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1200w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1280w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1920w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 1920w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 2048w, assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg 3840w" src="assets/images/website-media.deel.com/g2_logo.0a5793d3-1b608abd.svg" />
                    <div className="flex items-center gap-tiny">
                      <span className="font-inter leading-[1.7] text-xs font-semibold">
                        4.8/5
                      </span>
                      <span className="font-inter leading-[1.7] text-xs" style={{ color: "rgba(250,244,238,0.16)" }}>
                        |
                      </span>
                      <span className="font-inter leading-[1.7] text-xs">
                        14K+ Reviews
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-tiny font-inter text-xs leading-[1.7]">
                    <img alt="" loading="lazy" width="29" height="28" decoding="async" style={{ color: "transparent" }} sizes="29px" srcSet="assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 16w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 32w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 48w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 64w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 96w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 128w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 256w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 384w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 640w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 640w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 750w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 768w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 828w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1024w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1080w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1200w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1280w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1920w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 1920w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 2048w, assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg 3840w" src="assets/images/website-media.deel.com/trustpilot-star.aadabb5b-db9b285e.svg" />
                    <span className="font-semibold">
                      4.8/5
                    </span>
                    <span className="opacity-40">
                      |
                    </span>
                    <span>
                      8K+ Reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full relative max-[1049px]:hidden min-[1050px]:block min-[1050px]:w-1/2 min-[1050px]:self-stretch">
          <div className="rounded-md overflow-hidden w-full min-[1050px]:h-full min-[1050px]:min-h-[var(--hero-height)]" style={{ '--hero-height': "86vh" }}>
            <div className="relative h-full w-full min-h-[466px] [background:var(--color-purple-gradient-dark)]">
              <div className="absolute inset-0 transition-opacity duration-700 opacity-100 z-10" aria-hidden="false">
                <img alt="" aria-hidden="true" decoding="async" className="object-cover object-left-top" style={{ position: "absolute", height: "100%", width: "100%", left: "0", top: "0", right: "0", bottom: "0", color: "transparent" }} sizes="(max-width: 792px) 100vw, 50vw" srcSet="assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 384w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 640w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 640w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 750w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 768w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 828w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1024w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1080w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1200w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1280w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1920w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 1920w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 2048w, assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp 3840w" src="assets/images/website-media.deel.com/default_e9eb14fb23-40cb4f83.webp" />
              </div>
              <div className="w-fit max-w-[min(540px,100%)] absolute bottom-4 right-4 z-20 min-[1050px]:bottom-6 min-[1050px]:right-6">
                <div className="relative z-10 ml-5 inline-flex w-fit items-center gap-2 rounded-md bg-white pr-2.5 top-4 shadow-[0_1.2px_19.2px_rgba(27,27,27,0.05),0_9.6px_19.2px_rgba(27,27,27,0.16)]">
                  <div className="flex h-[35px] w-[35px] items-center justify-center rounded-md border-[0.44px] border-black/20 p-[5px]">
                    <img alt="" aria-hidden="true" loading="lazy" width="35" height="35" decoding="async" className="object-contain" style={{ color: "transparent" }} sizes="35px" srcSet="assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 16w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 32w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 48w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 64w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 96w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 128w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 256w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 384w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 640w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 640w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 750w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 768w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 828w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1024w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1080w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1200w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1280w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1920w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 1920w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 2048w, assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp 3840w" src="assets/images/website-media.deel.com/Rob_Icon_9a3f78a9c0-5813f0c9.webp" />
                  </div>
                  <span className="font-inter text-[13px] font-normal leading-[1.254] text-[#0c0a08]">
                    Robinhood
                  </span>
                </div>
                <div className="rounded-md bg-white px-7 pt-5 pb-4 shadow-[0_1.2px_19.2px_rgba(27,27,27,0.05),0_9.6px_19.2px_rgba(27,27,27,0.16)]">
                  <p className="font-feature-2 m-0 whitespace-pre-line indent-[-0.45em] text-[18px] leading-[1.2] tracking-[-0.09px] !font-bagoss-condensed text-[#1b1b1b]">
                    “Deel is a  game changer.”
                  </p>
                  <p className="font-inter m-0 mt-1 text-[14px] leading-[1.6] tracking-[-0.14px] text-[#878787]">
                    — Shiv Verma, SVP of Finance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section01;
