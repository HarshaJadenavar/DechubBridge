import React, { useState } from "react";

const cards = [
  {
    title: "150+ currencies supported,",
    description: "including crypto, for centralized compliant payroll.",
    href: "/use-cases/run-global-payroll/",
    cta: "Learn more",
    image: "/assets/images/website-media.deel.com/150currencysupport_8c1cb419a0-1e399de9.webp",
  },
  {
    title: "Actionable AI",
    description: "for approving hiring, payroll, IT flows on Deel. More scaling, not headcount.",
    href: "/hr-platform/ai/",
    cta: "Learn more",
    image: "/assets/images/website-media.deel.com/actionable_ai_2x_d651c6da17-98e9cbe6.webp",
  },
  {
    title: "2,000+ local experts",
    description: "combined with in-house compliance logic and real-time AI.",
    href: "#",
    cta: "Book a demo",
    image: "/assets/images/website-media.deel.com/200localexpert_2x_7e32045951-9cec7ef9.webp",
  },
];

function ArrowForwardIcon() {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="ArrowForwardIcon"
    >
      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function AccordionChevron({ open }) {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium transition-transform text-content-on-dark-primary mui-iidc0b"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 18 18"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
    >
      <path d="M7.49891 4.5L6.44141 5.5575L9.87641 9L6.44141 12.4425L7.49891 13.5L11.9989 9L7.49891 4.5Z" fill="white" />
    </svg>
  );
}

function Section05() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full tablet:px-xxxs">
      <div className="w-full bg-surface-dark px-xxs py-xxl tablet:px-lg tablet:py-xxxl rounded-0 tablet:rounded-[20px]">
        <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-lg tablet:gap-[60px]">
          <div className="flex flex-col gap-xxxs tablet:gap-sm">
            <h2 className="text-balance m-0 heading-h2 text-content-on-dark-primary!">
              One modern experience for today's workforce
            </h2>
          </div>

          <div className="flex flex-col gap-xs">
            <div className="hidden grid-cols-1 gap-md tablet:grid tablet:grid-cols-3">
              {cards.map((card, index) => (
                <div
                  key={card.title}
                  className={`rounded-lg p-xs transition-colors flex flex-col justify-between hover:bg-white/5 ${index === 0 ? "bg-white/5" : ""}`}
                  tabIndex="0"
                >
                  <div className="text-[18px]! [&_p]:m-0! text-content-on-dark-accessory! [&_strong]:text-surface-white! MuiBox-root mui-5a971u">
                    <p>
                      <strong>{card.title}</strong> {card.description}
                    </p>
                  </div>
                  <div className="mt-xxs !-ml-xxxs">
                    <a href={card.href} target="_self" className="mui-15k05j0">
                      <span type="button" className="mui-m6qohc">
                        {card.cta}
                        <div className="cta-icon mui-1e5u1e9">
                          <ArrowForwardIcon />
                        </div>
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden tablet:block max-h-[550px] h-[550px] overflow-hidden rounded-xl">
              <div className="[&_img]:!object-left w-full h-full max-h-[550px] [&_img]:w-full [&_img]:h-[550px]! MuiBox-root mui-ov1atl" style={{ maxWidth: "1312px" }}>
                <img
                  alt=""
                  fetchPriority="auto"
                  loading="lazy"
                  width="1312"
                  height="550"
                  decoding="async"
                  className="mui-16kkgg"
                  style={{ color: "transparent" }}
                  sizes="(min-width: 1312px) 1312px, 100vw"
                  src={cards[activeIndex].image}
                />
              </div>
            </div>

            <div className="tablet:hidden">
              <ul className="flex flex-col p-0">
                {cards.map((card, index) => {
                  const open = activeIndex === index;
                  return (
                    <li className="border-b border-border-primary-on-dark" key={card.title}>
                      <button
                        type="button"
                        className="flex w-full gap-sm py-xs text-left outline-0 border-0 bg-transparent items-center"
                        aria-expanded={open}
                        aria-label={`${open ? "Collapse" : "Expand"} ${card.title}`}
                        onClick={() => setActiveIndex((current) => (current === index ? current : index))}
                      >
                        <div className="flex-1">
                          <div className="text-[17px]! [&_p]:m-0! text-content-on-dark-accessory! [&_strong]:text-surface-white! MuiBox-root mui-5a971u">
                            <p>
                              <strong>{card.title}</strong> {card.description}
                            </p>
                          </div>
                        </div>
                        <AccordionChevron open={open} />
                      </button>

                      {open ? (
                        <div className="pb-sm">
                          <div className="mt-0 tablet:mt-xxs !-ml-quark sm-old:!-ml-nano">
                            <a href={card.href} target="_self" className="mui-15k05j0">
                              <button type="button" className="mui-y9wt1e">
                                {card.cta}
                                <div className="cta-icon mui-1e5u1e9">
                                  <ArrowForwardIcon />
                                </div>
                              </button>
                            </a>
                          </div>
                          <div className="mt-sm overflow-hidden rounded-lg h-full w-full max-h-[312px] [&_img]:h-[312px]!">
                            <div className="[&_img]:!object-left h-auto w-full max-w-[unset]! MuiBox-root mui-ov1atl" style={{ maxWidth: "382px" }}>
                              <img
                                alt=""
                                fetchPriority="auto"
                                loading="lazy"
                                width="382"
                                height="312"
                                decoding="async"
                                className="mui-16kkgg"
                                style={{ color: "transparent" }}
                                sizes="(min-width: 382px) 382px, 100vw"
                                src={card.image}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl tablet:flex-row tablet:items-stretch h-auto tablet:h-[311px] bg-surface-card-on-dark">
            <div className="flex flex-1 flex-col justify-center gap-xxxs px-md py-lg">
              <div className="text-[18px]! [&_p]:m-0! text-content-on-dark-accessory! [&_strong]:text-surface-white! MuiBox-root mui-5a971u">
                <p>
                  <strong>Built on in-house infrastructure,</strong> with single payroll engines, owned entities, and more.
                </p>
              </div>
              <div className="!-ml-xxxs sm-old:!-ml-xxs">
                <a href="/solutions/payroll-engine/" target="_self" aria-label="solutions payroll-engine" className="mui-15k05j0">
                  <span type="button" className="mui-y9wt1e" aria-label="solutions payroll-engine">
                    Learn more
                    <div className="cta-icon mui-1e5u1e9">
                      <ArrowForwardIcon />
                    </div>
                  </span>
                </a>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center h-full max-h-[311px] overflow-hidden tablet:order-last">
              <div className="h-auto w-full MuiBox-root mui-ov1atl" style={{ maxWidth: "656px" }}>
                <img
                  alt=""
                  fetchPriority="auto"
                  loading="lazy"
                  width="656"
                  height="311"
                  decoding="async"
                  className="mui-16kkgg"
                  style={{ color: "transparent" }}
                  sizes="(min-width: 656px) 656px, 100vw"
                  src="/assets/images/website-media.deel.com/build_on_in_house_infrastructure_a972d8fcdf-b192e539.webp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section05;
