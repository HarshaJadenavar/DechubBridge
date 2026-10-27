import React, { Suspense, useEffect } from "react";
import Header from "./components/Header.jsx";
import Section01 from "./components/generated/Section01.jsx";
const Section02 = React.lazy(() => import("./components/Section02.jsx"));
const Section03 = React.lazy(() => import("./components/Section03.jsx"));
const Section04 = React.lazy(() => import("./components/Section04.jsx"));
const Section05 = React.lazy(() => import("./components/Section05.jsx"));
const Section06 = React.lazy(() => import("./components/Section06.jsx"));
const Section07 = React.lazy(() => import("./components/Section07.jsx"));
const Section08 = React.lazy(() => import("./components/Section08.jsx"));
import Footer from "./components/generated/Footer.jsx";
import "./styles/landing.css";

function App() {
  useEffect(() => {
    document.title = "Deel | Global Payroll, Compliance, HR Solutions | HRIS";
  }, []);

  return (
    <>
      <Header />
      <main className="m-0 p-0">
        <div className="relative">
          <div data-ab-page="true" className="bg-surface-secondary flex flex-col items-center">
            <Section01 />
            <Suspense fallback={null}>
              <Section02 />
              <Section03 />
              <Section04 />
              <Section05 />
              <Section06 />
              <Section07 />
              <Section08 />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
