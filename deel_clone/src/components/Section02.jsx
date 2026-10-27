import React from "react";

const investorLogos = [
  "/assets/images/website-media.deel.com/logo_investor_gbv_5e751a9a5c-a9d690dc.svg",
  "/assets/images/website-media.deel.com/logo_investor_a16z_c17319a0d5-c4f5639d.svg",
  "/assets/images/website-media.deel.com/logo_investor_altimeter_7bcca1fa1a-8006ed56.svg",
  "/assets/images/website-media.deel.com/logo_investor_ycombinator_834d3e9f17-b07c9892.svg",
  "/assets/images/website-media.deel.com/logo_investor_neo_fd6a4b0bf1-56add72b.svg",
  "/assets/images/website-media.deel.com/logo_investor_emerson_collective_e323c76cee-365ebe97.svg",
  "/assets/images/website-media.deel.com/logo_investor_spark_capital_857a9a1fac-475b4913.svg",
  "/assets/images/website-media.deel.com/muji_a588e76130-79c99911.svg",
  "/assets/images/website-media.deel.com/Logoki_ba7b794e12-19a34463.svg",
  "/assets/images/website-media.deel.com/Balenciaga_Logo_3c70c251ee-4716d7d1.svg",
  "/assets/images/website-media.deel.com/Canva_Logo_1_90c23958f7-58831325.svg",
  "/assets/images/website-media.deel.com/hm_f015e3fc5e-df43edbf.svg",
  "/assets/images/website-media.deel.com/Ericsson_logo_2_15f0a199be-afc8b63f.svg",
  "/assets/images/website-media.deel.com/logo_scroller_on_running_cff30fcd5e-e1bfa77a.svg",
];

const customerLogos = [
  "/assets/images/website-media.deel.com/Door_Dash_Logo_e52471ae77-3e414f35.svg",
  "/assets/images/website-media.deel.com/logo_KLM_2dcf79f5c9-ac109213.svg",
  "/assets/images/website-media.deel.com/Lucid_Motors_logo_289a758b49-01664677.svg",
  "/assets/images/website-media.deel.com/puma_logo_8574e3d454-a88b84ed.svg",
  "/assets/images/website-media.deel.com/lockhead_logo_aac9270f83-5a48a4b4.svg",
  "/assets/images/website-media.deel.com/Zillow_logo_1_5c75d27ffc-66b46f3e.svg",
  "/assets/images/website-media.deel.com/linkedin_logo_4a30bc2ea7-c6addbce.svg",
  "/assets/images/website-media.deel.com/ve_Logo_12ce1a8ef6-a57f67d5.svg",
  "/assets/images/website-media.deel.com/iee_logo_986f0cdfaf-952b5f33.svg",
  "/assets/images/website-media.deel.com/re_logo_b11ff3c938-a965a859.svg",
  "/assets/images/website-media.deel.com/Hersheys_1c5efab234-7376cfb2.svg",
  "/assets/images/website-media.deel.com/rol_8afbc30081-d2317192.svg",
];

function LogoRail({ logos, label }) {
  return (
    <div className="w-full overflow-hidden" role="region" aria-label={label}>
      <div
        className="flex w-max items-center gap-10 py-4"
        style={{ animation: "logo-scroll 28s linear infinite" }}
      >
        {[...logos, ...logos].map((src, index) => (
          <img
            key={`${label}-${index}`}
            src={src}
            alt=""
            loading="lazy"
            className="h-8 md:h-10 w-auto shrink-0 object-contain opacity-90"
          />
        ))}
      </div>
    </div>
  );
}

function Section02() {
  return (
    <section className="logo-stripe-standard-wrapper w-full px-xxxs md:px-xxxs lg:px-xxl pt-md md:pt-xxl lg:pt-xxxl pb-[40px] bg-surface-white">
      <div className="mx-auto max-w-[1312px] flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <p className="m-0 text-content-secondary paragraph-large">
            Trusted by 40,000+ companies from startups to enterprise
          </p>
          <a href="/case-studies/" className="mui-15k05j0 flex items-center gap-2">
            <span className="paragraph-small-medium">175 STORIES</span>
            <span className="underline">Read about real results</span>
          </a>
        </div>
        <LogoRail logos={investorLogos} label="Company logos strip 1" />
        <LogoRail logos={customerLogos} label="Company logos strip 2" />
      </div>
    </section>
  );
}

export default Section02;
