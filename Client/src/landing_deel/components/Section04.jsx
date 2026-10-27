import React, { useState } from "react";

const workflows = [
  {
    key: "hire",
    label: "Dechub-Bridge Hire",
    icon: "/deel-assets/images/website-media.deel.com/hire_705b89bb9c-54a21706.svg",
    accent: "#e6f7e0",
    iconAccent: "#c2eeb5",
    steps: [
      { title: "Today", text: "Create compliant contracts for new hires in minutes" },
      { title: "Hours later", text: "Review local employment costs and hiring requirements" },
      { title: "Tomorrow", text: "Onboard global talent without legal or payroll delays" },
    ],
  },
  {
    key: "payroll",
    label: "Dechub-Bridge Payroll",
    icon: "/deel-assets/images/website-media.deel.com/payroll_92b9e25547-ef97117a.svg",
    accent: "#d8ebff",
    iconAccent: "#b1d8fc",
    steps: [
      { title: "Today", text: "Set up payroll countries and owners" },
      { title: "Hours later", text: "Configure pay rules, approvals, and cutoffs" },
      { title: "Tomorrow", text: "Everyone gets paid on time" },
    ],
  },
  {
    key: "hr",
    label: "Dechub-Bridge HR",
    icon: "/deel-assets/images/website-media.deel.com/hr_2bd9cffda1-6a630146.svg",
    accent: "#fef0d8",
    iconAccent: "#f1e8e1",
    steps: [
      { title: "Today", text: "Centralize worker data, contracts, and org structure" },
      { title: "Hours later", text: "Automate onboarding tasks, approvals, and workflows" },
      { title: "Tomorrow", text: "Run HR from one global system for every worker type" },
    ],
  },
  {
    key: "it",
    label: "Dechub-Bridge IT",
    icon: "/deel-assets/images/website-media.deel.com/it_a20117c5c8-51bb4f3d.svg",
    accent: "#f6f0fe",
    iconAccent: "#eadcff",
    steps: [
      { title: "Today", text: "Set device policies and procurement preferences" },
      { title: "Hours later", text: "Automate approvals, shipping, and support requests" },
      { title: "Tomorrow", text: "Keep every device tracked, secured, and supported globally" },
    ],
  },
];

function Section04() {
  const [activeKey, setActiveKey] = useState("hire");
  const active = workflows.find((workflow) => workflow.key === activeKey) ?? workflows[0];

  return (
    <section
      className="w-full bg-white"
      style={{
        paddingTop: "64px",
        paddingRight: "24px",
        paddingBottom: "144px",
        paddingLeft: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1312px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "56px",
          }}
        >
          <p
            className="text-tertiary overline-large-medium !text-secondary uppercase"
            style={{ margin: "0 0 12px" }}
          >
            Dechub-Bridge Speed
          </p>
          <h2 className="heading-h2 !text-primary" style={{ margin: "0 0 20px" }}>
            Accomplish more in less time
          </h2>
        </div>

        <div style={{ marginBottom: "72px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {workflows.map((workflow) => {
              const isActive = workflow.key === active.key;
              return (
                <button
                  key={workflow.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveKey(workflow.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "2px 6px 2px 2px",
                    border: "0",
                    borderRadius: "8px",
                    background: isActive ? workflow.accent : "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: isActive ? workflow.iconAccent : "transparent",
                      opacity: isActive ? 1 : 0.5,
                    }}
                  >
                    <img src={workflow.icon} alt="" width="20" height="20" className="object-contain" />
                  </span>
                  <span
                    className="paragraph-xxlarge !font-semibold"
                    style={{
                      marginRight: "6px",
                      color: isActive ? "#1b1b1b" : "#1b1b1b99",
                    }}
                  >
                    {workflow.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div className="deel-speed-timeline deel-speed-timeline--desktop">
            <div className="deel-speed-timeline__line" />
            {active.steps.map((step, index) => (
              <div key={step.title} className={`flex ${index === 1 ? "justify-center" : index === 2 ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col items-center">
                  <div className="mb-8 relative z-10">
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  </div>
                  <div className="flex flex-col items-center text-center" style={{ marginBottom: "24px" }}>
                    <h3 className="heading-h5" style={{ margin: "0 0 16px" }}>
                      {step.title}
                    </h3>
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        width: index === 1 ? "280px" : "220px",
                        background: active.accent,
                      }}
                    >
                      <p className="paragraph-medium !text-primary" style={{ margin: 0 }}>
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="deel-speed-timeline deel-speed-timeline--mobile">
            {active.steps.map((step, index) => (
              <div
                key={step.title}
                className={`deel-speed-timeline__mobile-step${
                  index < active.steps.length - 1 ? " deel-speed-timeline__mobile-step--spaced" : ""
                }`}
              >
                <div className="deel-speed-timeline__mobile-rail">
                  <div className="deel-speed-timeline__mobile-dot" />
                  {index < active.steps.length - 1 ? <div className="deel-speed-timeline__mobile-line" /> : null}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col items-start text-left" style={{ marginBottom: "16px" }}>
                    <h3 className="heading-h5" style={{ margin: "0 0 16px" }}>
                      {step.title}
                    </h3>
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        width: "100%",
                        background: active.accent,
                      }}
                    >
                      <p className="paragraph-medium !text-primary" style={{ margin: 0 }}>
                        {step.text}
                      </p>
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
