import React from "react";
import { useEffect, useState } from "react";

const cards = [
  {
    title: "Dechub-Bridge Benefits",
    description: "Manage employee benefits and support teams with clear benefit administration.",
    href: "/solutions/benefits/",
    image: "/solutions/benefits/assets/images/dechub-benefits-team.png",
    alt: "Employee benefits and compensation overview",
  },
  {
    title: "Dechub-Bridge Hire",
    description: "Find and hire skilled talent across borders, then manage their onboarding.",
    href: "/solutions/hire/",
    image: "/solutions/hire/assets/images/dechub-hire-team.png",
    alt: "New employee hiring and onboarding dashboard",
  },
  {
    title: "Dechub-Bridge Mobility",
    description: "Coordinate immigration, visas, and employee moves across countries.",
    href: "/solutions/mobility/",
    image: "/solutions/mobility/assets/images/global-travel-india-uae-usa.png",
    alt: "Traveler at an airport with India, UAE, and USA departure signs",
  },
  {
    title: "Dechub-Bridge Payroll",
    description: "Run and review employee payroll across India, the USA, and the UAE from one workflow.",
    href: "/solutions/payroll/",
    image: "/solutions/payroll/assets/images/global-payroll-dubai-office.png",
    alt: "Global payroll dashboard for India, USA, and UAE",
  },
  {
    title: "Dechub-Bridge HR",
    description: "Manage employee records, onboarding, and everyday HR processes across your workforce.",
    href: "/solutions/hr/",
    image: "/solutions/hr/assets/images/global-hr-dashboard-workspace.png",
    alt: "Global HR dashboard showing employee records and workforce headcount",
  },
  {
    title: "Dechub-Bridge IT",
    description: "Manage employee devices, access, and global IT operations from one place.",
    href: "/solutions/it/",
    image: "/solutions/it/assets/images/global-it-operations-dashboard.png",
    alt: "Global IT operations dashboard showing devices, access, and support requests",
  },
];

function Section03() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) {
        setColumns(1);
        return;
      }

      if (window.innerWidth < 1024) {
        setColumns(2);
        return;
      }

      setColumns(3);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return (
    <section
      className="w-full bg-white"
      style={{
        paddingTop: "0px",
        paddingBottom: "64px",
        paddingLeft: "24px",
        paddingRight: "24px",
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
            maxWidth: "1312px",
            margin: "0 auto 48px",
            width: "100%",
          }}
        >
          <p
            className="text-tertiary overline-large-medium uppercase"
            style={{
              margin: "0 0 12px",
            }}
          >
            DECHUB-BRIDGE SOLUTIONS
          </p>
          <h2
            className="heading-h2 text-wrap"
            style={{
              margin: "0 0 20px",
            }}
          >
            Manage your global workforce with one connected platform
          </h2>
        </div>

        <div
          style={{
            maxWidth: "1312px",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minHeight: "438px",
                padding: "28px",
                borderRadius: "16px",
                background: "#f7f5f2",
                textDecoration: "none",
              }}
            >
              <h3
                className="heading-h5 !text-primary"
                style={{
                  margin: "0 0 12px",
                  minHeight: "44px",
                }}
              >
                {card.title}
              </h3>
              <p
                className="text-tertiary paragraph-xxlarge"
                style={{
                  margin: "0 0 24px",
                  minHeight: "96px",
                }}
              >
                {card.description}
              </p>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "auto",
                  paddingTop: "16px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "310px",
                      maxWidth: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Section03;
