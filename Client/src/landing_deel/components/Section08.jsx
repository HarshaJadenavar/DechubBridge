import React, { useMemo, useState } from "react";

const reviews = [
  { author: "Jeremy C.", text: "The best payroll solution for teams managing both US and India payroll. Work that used to feel fragmented is now handled in one place." },
  { author: "Kanshobi S.", text: "Simply the best platform for US and Indian payroll. Admin that used to take days now takes 5 minutes." },
  { author: "Sparsh S.", text: "I love how easy Dechub-Bridge makes payroll operations. The workflow is clear, fast, and much easier for our finance team to manage." },
  { author: "Jose Mario L.", text: "An indispensable tool for handling US and India payroll. Dechub-Bridge gives us better visibility and much smoother execution." },
  { author: "Mohammed H.", text: "The best choice for companies managing payroll across the US and India. It removes a huge amount of operational complexity for us." },
  { author: "Juan Pablo C.", text: "One of the most flexible payroll platforms we have used for US and Indian workforce operations." },
  { author: "Chanelle D.", text: "Dechub-Bridge has made paying and managing our US and India teams far more straightforward and dependable." },
  { author: "Alexandra S.", text: "Makes it easy to run payroll for teams across the US and India. Everything feels more organized and predictable." },
  { author: "Jose M.", text: "Dechub-Bridge helps us run payroll accurately for both US and India teams, with less back-and-forth and better control." },
];

function ArrowBackIcon() {
  return (
    <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
    </svg>
  );
}

function ArrowForwardIcon() {
  return (
    <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function StarRating() {
  return <div className="text-[#FFE27C] text-[14px] leading-none tracking-[2px] mt-[8px]">★★★★★</div>;
}

function Section08() {
  const [startIndex, setStartIndex] = useState(0);

  const visibleReviews = useMemo(() => {
    return Array.from({ length: 4 }, (_, offset) => reviews[(startIndex + offset) % reviews.length]);
  }, [startIndex]);

  return (
    <div className="MuiBox-root mui-16f0pz5" style={{ width: "100%", background: "#1b1b1b" }}>
      <div className="MuiBox-root mui-1em5jyh">
        <div className="MuiBox-root mui-3fwlhn">
          <div className="MuiBox-root mui-1si5xjn">
            <div className="MuiBox-root mui-1m67saq">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-1f5a0jj">Excellent global payroll</h3>
              <a href="https://www.g2.com/sellers/deel" className="underline mui-15k05j0" target="_blank" rel="noopener">
                <p className="MuiTypography-root MuiTypography-body1 mui-1o8lr4j">
                  <span className="bold notranslate mui-1gzsonn">4.8/5</span> based on <span className="notranslate mui-1gzsonn">100+</span> reviews
                </p>
              </a>
            </div>
          </div>

          <div className="MuiBox-root mui-z93j84" id="nav-g2-reviews-688">
            <button
              type="button"
              className="swiper-button-prev mui-15uxuy5"
              aria-label="Previous slide"
              onClick={() => setStartIndex((current) => (current - 1 + reviews.length) % reviews.length)}
            >
              <ArrowBackIcon />
            </button>
            <button
              type="button"
              className="swiper-button-next mui-15uxuy5"
              aria-label="Next slide"
              onClick={() => setStartIndex((current) => (current + 1) % reviews.length)}
            >
              <ArrowForwardIcon />
            </button>
          </div>
        </div>

        <div className="swiper-slider-g2-reviews-688 MuiBox-root mui-ehwe3" id="g2-reviews-688">
          <div className="swiper-wrapper grid grid-cols-1 gap-sm md:grid-cols-2 xl:grid-cols-4">
            {visibleReviews.map((review) => (
              <div key={`${review.author}-${review.text}`} className="swiper-slide carusel mui-1a3obve">
                <p className="MuiTypography-root MuiTypography-body1 semibd mui-1xetm6f">{review.author}</p>
                <StarRating />
                <p className="MuiTypography-root MuiTypography-body1 mui-v9d4ft">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section08;

