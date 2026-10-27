import React from "react";

const logoRows = [
  [
    "/deel-assets/images/website-media.deel.com/muji_a588e76130-79c99911.svg",
    "/deel-assets/images/website-media.deel.com/Logoki_ba7b794e12-19a34463.svg",
    "/dechub-assets/trusted-logos/download%20%282%29.png",
    "/deel-assets/images/website-media.deel.com/Balenciaga_Logo_3c70c251ee-4716d7d1.svg",
    "/dechub-assets/trusted-logos/download%20%283%29.png",
    "/deel-assets/images/website-media.deel.com/Canva_Logo_1_90c23958f7-58831325.svg",
    "/deel-assets/images/website-media.deel.com/hm_f015e3fc5e-df43edbf.svg",
    "/dechub-assets/trusted-logos/fastrack-potBj1Kr.png",
    "/dechub-assets/trusted-logos/tanishq_logo.png",
    "/deel-assets/images/website-media.deel.com/Ericsson_logo_2_15f0a199be-afc8b63f.svg",
    "/deel-assets/images/website-media.deel.com/logo_investor_neo_fd6a4b0bf1-56add72b.svg",
    "/dechub-assets/trusted-logos/download.png",
    "/deel-assets/images/website-media.deel.com/logo_investor_emerson_collective_e323c76cee-365ebe97.svg",
    "/dechub-assets/trusted-logos/download%20%281%29.png",
    "/deel-assets/images/website-media.deel.com/logo_investor_spark_capital_857a9a1fac-475b4913.svg",
  ],
  [
    "/deel-assets/images/website-media.deel.com/re_logo_b11ff3c938-a965a859.svg",
    "/dechub-assets/trusted-logos/download%20%285%29.png",
    "/deel-assets/images/website-media.deel.com/Door_Dash_Logo_e52471ae77-3e414f35.svg",
    "/deel-assets/images/website-media.deel.com/logo_KLM_2dcf79f5c9-ac109213.svg",
    "/dechub-assets/trusted-logos/tanishq_logo.png",
    "/dechub-assets/trusted-logos/download.png",
    "/deel-assets/images/website-media.deel.com/Lucid_Motors_logo_289a758b49-01664677.svg",
    "/deel-assets/images/website-media.deel.com/puma_logo_8574e3d454-a88b84ed.svg",
    "/dechub-assets/trusted-logos/download%20%281%29.png",
    "/deel-assets/images/website-media.deel.com/lockhead_logo_aac9270f83-5a48a4b4.svg",
    "/deel-assets/images/website-media.deel.com/Zillow_logo_1_5c75d27ffc-66b46f3e.svg",
    "/dechub-assets/trusted-logos/download%20%282%29.png",
    "/deel-assets/images/website-media.deel.com/linkedin_logo_4a30bc2ea7-c6addbce.svg",
    "/deel-assets/images/website-media.deel.com/rol_8afbc30081-d2317192.svg",
  ],
];

function LogoMarquee({ logos, variant = "primary", reverse = false }) {
  const marqueeLogos = [...logos, ...logos];

  return (
    <div className="deel-logo-strip__viewport">
      <div
        className={[
          "deel-logo-strip__track",
          variant === "secondary" ? "deel-logo-strip__track--secondary" : "",
          reverse ? "deel-logo-strip__track--reverse" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {marqueeLogos.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            className="deel-logo-strip__logo"
          />
        ))}
      </div>
    </div>
  );
}

function Section02() {
  return (
    <section className="logo-stripe-standard-wrapper deel-logo-strip">
      <div className="deel-logo-strip__inner">
        <p className="deel-logo-strip__eyebrow">
          Trusted by 50+ companies from startups to enterprise
        </p>

        <div className="deel-logo-strip__rows">
          <LogoMarquee logos={logoRows[0]} variant="primary" />
          <LogoMarquee logos={logoRows[1]} variant="secondary" reverse />
        </div>
      </div>
    </section>
  );
}

export default Section02;
