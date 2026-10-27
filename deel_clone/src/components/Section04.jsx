import React, { useState } from "react";

const workflows = [
  {
    key: "payroll",
    label: "Deel Payroll",
    icon: "/assets/images/website-media.deel.com/payroll_92b9e25547-ef97117a.svg",
    accent: "bg-blue-150",
    iconAccent: "bg-blue-325",
    steps: [
      { title: "Today", text: "Set up payroll countries and owners" },
      { title: "Hours later", text: "Configure pay rules, approvals, and cutoffs" },
      { title: "Tomorrow", text: "Everyone gets paid on time" },
    ],
  },
  {
    key: "hr",
    label: "Deel HR",
    icon: "/assets/images/website-media.deel.com/hr_2bd9cffda1-6a630146.svg",
    accent: "bg-latte-100",
    iconAccent: "bg-surface-highlight-02",
    steps: [
      { title: "Today", text: "Centralize worker data, contracts, and org structure" },
      { title: "Hours later", text: "Automate onboarding tasks, approvals, and workflows" },
      { title: "Tomorrow", text: "Run HR from one global system for every worker type" },
    ],
  },
  {
    key: "it",
    label: "Deel IT",
    icon: "/assets/images/website-media.deel.com/it_a20117c5c8-51bb4f3d.svg",
    accent: "bg-purple-100",
    iconAccent: "bg-purple-200",
    steps: [
      { title: "Today", text: "Set device policies and procurement preferences" },
      { title: "Hours later", text: "Automate approvals, shipping, and support requests" },
      { title: "Tomorrow", text: "Keep every device tracked, secured, and supported globally" },
    ],
  },
  {
    key: "hire",
    label: "Deel Hire",
    icon: "/assets/images/website-media.deel.com/hire_705b89bb9c-54a21706.svg",
    accent: "bg-green-100",
    iconAccent: "bg-green-250",
    steps: [
      { title: "Today", text: "Create compliant contracts for new hires in minutes" },
      { title: "Hours later", text: "Review local employment costs and hiring requirements" },
      { title: "Tomorrow", text: "Onboard global talent without legal or payroll delays" },
    ],
  },
];

function Section04() {
  const [activeKey, setActiveKey] = useState("payroll");
  const active = workflows.find((workflow) => workflow.key === activeKey) ?? workflows[0];

  return (
    <section className="w-full py-16 tablet:py-24 px-6 tablet:px-10 desktop:px-16 desktop:py-24 bg-white">
      <div className="max-w-[1312px] mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <p className="m-0 text-tertiary overline-large-medium !text-secondary mb-3 uppercase">Deel Speed</p>
          <h2 className="text-balance m-0 heading-h2 !text-primary">Accomplish more in less time</h2>
        </div>

        <div className="mb-16 tablet:flex tablet:justify-center">
          <div className="flex gap-5 px-4 -mx-4 tablet:mx-0 tablet:px-0 overflow-x-auto tablet:overflow-x-visible scroll-smooth snap-x snap-mandatory tablet:snap-none scrollbar-hide tablet:flex-wrap tablet:justify-center">
            {workflows.map((workflow) => {
              const isActive = workflow.key === active.key;
              return (
                <button
                  key={workflow.key}
                  className={`flex items-center px-0.5 py-0.5 rounded-sm transition-all duration-200 paragraph-small-medium whitespace-nowrap border-0 snap-center flex-shrink-0 gap-2 ${isActive ? workflow.accent : "bg-transparent hover:bg-surface-latte-light"}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveKey(workflow.key)}
                >
                  <span className={`flex-shrink-0 p-1.5 flex items-center justify-center rounded-sm transition-colors duration-200 ${isActive ? workflow.iconAccent : "bg-transparent opacity-50"}`}>
                    <img src={workflow.icon} alt="" width="20" height="20" className="object-contain" />
                  </span>
                  <p className={`m-0 paragraph-xxlarge !font-semibold mr-1.5 ${isActive ? "!text-primary" : "!text-[#1b1b1b99]"}`}>
                    {workflow.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <div className="hidden tablet:flex tablet:justify-between relative">
            <div className="absolute left-0 right-0 top-[6px] border-t-2 border-dashed border-neutral-300" />
            {active.steps.map((step, index) => (
              <div key={step.title} className={`flex ${index === 1 ? "justify-center" : index === 2 ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col items-center">
                  <div className="mb-8 relative z-10">
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">{step.title}</h3>
                    <div className={`p-5 rounded-md w-[220px] md:w-[280px] ${active.accent}`}>
                      <p className="m-0 paragraph-medium !text-primary">{step.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tablet:hidden flex flex-col">
            {active.steps.map((step, index) => (
              <div key={step.title} className="flex flex-row gap-4">
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  {index < active.steps.length - 1 ? <div className="w-px flex-1 border-l-2 border-dashed border-neutral-300" /> : null}
                </div>
                <div className={`flex-1 ${index < active.steps.length - 1 ? "pb-8" : ""}`}>
                  <div className="flex flex-col items-start text-left">
                    <h3 className="text-balance m-0 heading-h5 mb-[7px] mt-0">{step.title}</h3>
                    <div className={`p-5 rounded-md w-full ${active.accent}`}>
                      <p className="m-0 paragraph-medium !text-primary">{step.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section04;
