import React from "react";

const cards = [
  {
    title: "Deel Payroll",
    description: "Local and global payroll, your way.",
    href: "/solutions/payroll/",
    image: "/assets/images/website-media.deel.com/Go_live_quickly_with_US_payroll_cba17cce08-235ee26e.webp",
    alt: "Go live quickly with US payroll",
  },
  {
    title: "Deel HR",
    description: "One HR system for every worker.",
    href: "/solutions/hr/",
    image: "/assets/images/website-media.deel.com/HR_9158c8c5a0-514f2ca4.webp",
    alt: "Deel HR",
  },
  {
    title: "Deel IT",
    description: "Devices and support, anywhere.",
    href: "/solutions/it/",
    image: "/assets/images/website-media.deel.com/Screenshot_2026_07_07_at_10_38_29_a_m_0091974c43-d0d00c13.png",
    alt: "Deel IT",
  },
  {
    title: "Deel Benefits",
    description: "Easily set up plans, handle enrollment, sync deductions, and more.",
    href: "/solutions/benefits/",
    image: "/assets/images/website-media.deel.com/Benefits_5f8ee9bbeb-e54fb98b.webp",
    alt: "Deel Benefits",
  },
  {
    title: "Deel Hire",
    description: "Hire anywhere in days, fully compliant.",
    href: "/solutions/hire/",
    image: "/assets/images/website-media.deel.com/1_66074e871e-8a936a5d.webp",
    alt: "Deel Hire",
  },
  {
    title: "Deel Mobility",
    description: "Visas handled in-house, end to end.",
    href: "/solutions/mobility/",
    image: "/assets/images/website-media.deel.com/Mobility_0d0fdddfac-ccc45f15.webp",
    alt: "Deel Mobility",
  },
];

function Section03() {
  return (
    <section className="w-full py-16 tablet:py-32 px-6 tablet:px-10 desktop:px-8 bg-white">
      <div className="max-w-[1312px] mx-auto">
        <div className="flex flex-col gap-1.5 tablet:gap-[14px] mb-10 tablet:mb-12">
          <p className="m-0 text-tertiary overline-large-medium !text-tertiary uppercase">WHAT DEEL DOES</p>
          <h2 className="text-balance m-0 heading-h2 text-wrap">The global people platform</h2>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 md:!grid-cols-3 gap-4 tablet:gap-5 desktop:gap-7">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group relative flex flex-col rounded-lg bg-surface-latte-light p-5 tablet:p-6 transition-all duration-300 ease-out hover:shadow-lg h-[438px] w-full"
            >
              <h3 className="text-balance m-0 heading-h5 !text-primary mb-2">{card.title}</h3>
              <p className="m-0 text-tertiary paragraph-xxlarge">{card.description}</p>
              <div className="flex-1 flex items-center justify-center mt-auto pt-4 overflow-hidden">
                <div className="w-full h-full flex items-start justify-center mt-6">
                  <img
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    className="w-auto h-auto max-w-full max-h-[310px] object-contain"
                  />
                </div>
              </div>
              <div className="absolute bottom-5 right-5 tablet:bottom-6 tablet:right-6 flex items-center gap-1.5 transition-all duration-300 ease-out opacity-100 translate-y-0 desktop:opacity-0 desktop:translate-y-2 desktop:group-hover:opacity-100 desktop:group-hover:translate-y-0">
                <span className="!font-bagoss-standard text-base font-medium text-primary flex items-center gap-2 whitespace-nowrap">
                  Learn more
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Section03;
