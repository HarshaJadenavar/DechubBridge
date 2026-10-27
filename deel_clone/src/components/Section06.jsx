import React, { useMemo, useState } from "react";

const stories = [
  {
    company: "Revolut",
    logo: "/assets/images/website-media.deel.com/logo_revolut_black_0c39688f55-093259cd.svg",
    summary: "See how the Revolut team has hired 150+ workers and relocated 10+ people through Deel.",
    href: "/case-studies/revolut/",
    video: "/assets/videos/website-media.deel.com/DEEL_REVOLUT_MASTER_01_16_X9_1080_2_416352e078-eabba7f3.mp4",
  },
  {
    company: "Cocoroco",
    logo: "/assets/images/website-media.deel.com/cocoroco_logo_1_1_7e36f56f96-bcf104df.webp",
    summary: "By embedding Deel into their platform, Cocoroco automated every hire, contract, and payment through a single, fully branded experience. Check out more on how Deel's become the perfect product partner for Cocoroco.",
    href: "/case-studies/cocoroco/",
    video: "/assets/videos/website-media.deel.com/144ddb7a_bc53_4180_8193_76a9e3715957_fc410b502d-88a83d90.mp4",
  },
  {
    company: "Cal.com",
    logo: "/assets/images/website-media.deel.com/Cal_com_idvc_Cwb_TDI_0_e1df06512b-dd005d31.svg",
    summary: "Cal.com wins in the competitive global market with Deel. From wiring money by hand to running a borderless company on one platform, see how Cal.com uses Deel to hire, pay, and support a global team — without borders slowing them down.",
    href: "/case-studies/",
    video: "/assets/videos/website-media.deel.com/Cal_com_Brand_Love_Final_V1_1_1_720888d162-f33d60e8.mp4",
  },
  {
    company: "Strada",
    logo: "/assets/images/website-media.deel.com/logo_strada_black_94a9eca00a-ba94915d.svg",
    summary: "Strada, a conversational AI platform for insurance brokers, uses Deel to effortlessly manage US payroll, global hiring, and compliance for its growing team.",
    href: "/case-studies/strada/",
    video: "/assets/videos/website-media.deel.com/How_Strada_uses_Deel_to_save_thousands_i_Media_hv_X7_Gm_Q5_Cx_A_001_1080p_9b8e5f1ca2-94b7efdb.mp4",
  },
  {
    company: "Sardine",
    logo: "/assets/images/website-media.deel.com/sardine_74fae8b063-c3e1bfbe.webp",
    summary: "With Deel, Sardine can seamlessly hire the best talent worldwide, ensuring competitive, market-aligned salaries while optimizing capital spend.",
    href: "/case-studies/sardine/",
    video: "/assets/videos/website-media.deel.com/How_Sardine_uses_Deel_to_build_a_world_c_Media_6_OM_94sus_Fwo_001_1080p_ce26f880bd-27846725.mp4",
  },
  {
    company: "Superfiliate",
    logo: "/assets/images/website-media.deel.com/superfiliate_2x_b68ce07b6c-0256f0e3.webp",
    summary: "Superfiliate, a growing word-of-mouth marketing platform, turned to Deel after frustrations with Rippling.",
    href: "/case-studies/superfiliate/",
    video: "/assets/videos/website-media.deel.com/How_Superfiliate_Streamlined_Global_Work_Media_qgu_xa_WN_Ug_001_1080p_3a81172692-5f230102.mp4",
  },
  {
    company: "Bowmans",
    logo: "/assets/images/website-media.deel.com/bowmans_2x_976c4e427c-a1f17c64.webp",
    summary: "Bowmans, a leading pan-African law firm, adopted Deel Local Payroll to unify its payroll operations across a complex, multi-country landscape—covering six jurisdictions and over 400,000 square miles.",
    href: "/case-studies/bowmans/",
    video: "/assets/videos/website-media.deel.com/How_Bowmans_Unified_Payroll_Across_Six_C_Media_ns_Bkc_K_If_MM_001_1080p_04ef940e1f-a34546a4.mp4",
  },
  {
    company: "DICE",
    logo: "/assets/images/website-media.deel.com/DICE_logo_2022_23d2ab39a3-c207c2e9.svg",
    summary: "From wiring payments by hand to running a borderless company on one platform, see how DICE uses Deel to hire, pay, and support a global team without the admin overhead.",
    href: "/case-studies/",
    video: "/assets/videos/website-media.deel.com/Brand_Love_Dicex_Deel_F5_f385fc27c5-f8844b30.mp4",
  },
];

function ArrowForwardIcon() {
  return (
    <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-3mhonh" focusable="false" aria-hidden="true" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <circle cx="64" cy="64" r="64" fill="#1B1B1B" fillOpacity="0.7" />
      <path d="M88 64L51 39V89L88 64Z" fill="white" />
    </svg>
  );
}

function Section06() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderedStories = useMemo(
    () =>
      stories.map((story, index) => {
        const distance = Math.abs(index - activeIndex);
        const isActive = index === activeIndex;
        return {
          ...story,
          isActive,
          className: isActive
            ? "opacity-100 blur-0 scale-100"
            : distance === 1
              ? "opacity-50 blur-sm scale-[0.95]"
              : "opacity-20 blur-sm scale-[0.9]",
        };
      }),
    [activeIndex],
  );

  return (
    <div style={{ display: "contents" }}>
      <div className="video-carousel w-full bg-white">
        <div className="w-full mx-auto py-xl md:py-big">
          <div className="max-w-container mx-auto w-full px-xs md:px-lg flex flex-col gap-xxxs md:gap-xxs mb-sm md:mb-xxl items-start">
            <p className="m-0 text-tertiary overline-large-medium text-content-secondary">TESTIMONIALS</p>
            <div className="w-full flex flex-col md:flex-row gap-xxs md:gap-sm md:items-center justify-between">
              <h2 className="text-balance m-0 heading-h2 text-content-primary">Our customer reviews</h2>
              <p className="m-0 text-tertiary paragraph-large max-w-[444px] text-content-secondary">
                Discover the insights from customers regarding their experiences with Deel.
              </p>
            </div>
          </div>

          <div className="revamp-carousel w-full h-full flex flex-col gap-xxs md:gap-md relative [&_.items]:max-w-[888px] max-sm:[&_.items]:w-[90%]!">
            <div className="revamp-carousel-wrapper w-full h-full flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {renderedStories.map((story, index) => (
                <div
                  key={story.company}
                  className={`items flex-none shrink-0 relative snap-center transition-all duration-300 px-xxs md:px-sm ${index === 0 ? "sm-old:ml-[30%]" : ""} ${index === renderedStories.length - 1 ? "sm-old:mr-[30%]" : ""}`}
                  style={{ width: "80%", flexShrink: "0" }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className={`w-full h-full min-h-[350px] relative overflow-hidden transition-all duration-300 ${story.className}`}>
                    <div>
                      <div className="w-full flex flex-col gap-md">
                        <div className="relative w-full h-[250px] sm-old:h-[350px] md:h-[500px] bg-neutral-900 rounded-xl overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center relative [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-b-none">
                            <video
                              src={story.video}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover rounded-b-none"
                            />
                          </div>
                          {story.isActive ? (
                            <>
                              <button className="hidden md:block absolute bottom-4 left-lg transform -translate-x-1/2 z-10 bg-transparent hover:bg-opacity-90 rounded-full p-2 transition-all border-0" aria-label="Play video" type="button">
                                <PlayIcon />
                              </button>
                              <button className="md:hidden absolute bottom-4 left-sm transform -translate-x-1/2 z-10 bg-transparent hover:bg-opacity-90 rounded-full p-2 transition-all border-0" aria-label="Play video" type="button">
                                <PlayIcon />
                              </button>
                            </>
                          ) : null}
                        </div>

                        <div className="w-full flex flex-col gap-xxs">
                          <div className="w-fit max-w-[99.2px] h-[26px]">
                            <img alt={`${story.company} logo`} loading="lazy" className="w-full h-full object-contain" src={story.logo} />
                          </div>
                          <div className="w-full flex flex-col md:flex-row md:items-end md:justify-between gap-xxs">
                            <p className="m-0 text-tertiary subtitle-small text-content-accessory max-w-[550px]">{story.summary}</p>
                            <div className="w-fit">
                              <a href={story.href} target="_self" className="mui-15k05j0">
                                <span type="button" className="mui-mv42ai">
                                  Learn more
                                  <div className="cta-icon mui-1e5u1e9">
                                    <ArrowForwardIcon />
                                  </div>
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full pagination-container">
              <div className="flex justify-center items-center gap-1 mt-md md:mt-xxl">
                {stories.map((story, index) => (
                  <button
                    key={story.company}
                    className="w-[24px] h-[24px] flex items-center justify-center p-0 m-0 bg-transparent hover:bg-transparent border-0 rounded-full transition-all duration-200"
                    aria-label={`Go to item ${index + 1}`}
                    aria-current={activeIndex === index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                  >
                    {activeIndex === index ? (
                      <div className="w-[12px] h-[12px] border border-purple-750 rounded-full p-[2px] flex items-center justify-center transition-all duration-200 shadow-[0px_16px_32px_0px_rgba(27,27,27,0.16),0px_2px_32px_0px_rgba(27,27,27,0.05)]">
                        <div className="w-full h-full rounded-full bg-surface-brand-purple-02" />
                      </div>
                    ) : (
                      <div className="w-[8px] h-[8px] border-0 bg-content-disabled rounded-full p-[2px] hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-[0px_16px_32px_0px_rgba(27,27,27,0.16),0px_2px_32px_0px_rgba(27,27,27,0.05)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section06;
