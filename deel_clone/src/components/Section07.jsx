import React from "react";

const metrics = [
  { value: "150+", label: "countries" },
  { value: "+40,000", label: "customers" },
  { value: "$20B+", label: "compliantly processed global payroll" },
  { value: "90+", label: "NPS for enterprise customers" },
];

function Section07() {
  return (
    <section className="key-figures-wrapper MuiBox-root mui-c0fl15">
      <div className="MuiBox-root mui-57ckbi">
        <div className="MuiBox-root mui-1lwwami">
          <h3 className="MuiTypography-root MuiTypography-h3 mui-1t1gvrv">
            Deel makes growing remote and international teams effortless
          </h3>
        </div>
        <div className="key-fig-container MuiBox-root mui-ze9kid">
          {metrics.map((metric) => (
            <div className="MuiBox-root mui-179v373" key={metric.label}>
              <div className="MuiBox-root mui-11ph1yg">
                <p className="MuiTypography-root MuiTypography-body1 center !font-bagoss-extended key-fig-title mui-10ex3ld">
                  {metric.value}
                </p>
                <p className="MuiTypography-root MuiTypography-body1 semibd key-fig-subtitle mui-85xu46">
                  {metric.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="MuiBox-root mui-74zl7b">
          <a href="/book-a-demo/" className="mui-gcrq9f inline-flex items-center justify-center">
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}

export default Section07;
