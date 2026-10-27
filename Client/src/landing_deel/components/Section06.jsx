import React, { useState } from "react";

const stories = [
  {
    company: "Tanishq",
    summary: "Watch how Tanishq presents its customer story and brand experience through a polished video showcase.",
    href: "https://www.youtube.com/watch?v=QONO-d6seDI",
    embedUrl: "https://www.youtube-nocookie.com/embed/QONO-d6seDI",
  },
  {
    company: "Titan",
    summary: "Explore Titan's video story and how the brand communicates trust, scale, and customer connection.",
    href: "https://www.youtube.com/watch?v=3rzHKUMeWMM",
    embedUrl: "https://www.youtube-nocookie.com/embed/3rzHKUMeWMM",
  },
  {
    company: "Wildcraft",
    summary: "See Wildcraft's customer-facing video and the way the brand brings its product story to life on screen.",
    href: "https://www.youtube.com/watch?v=hZqaKCEIxUM",
    embedUrl: "https://www.youtube-nocookie.com/embed/hZqaKCEIxUM",
  },
  {
    company: "Fastrack",
    summary: "Watch Fastrack's energetic brand video and how it speaks to a modern, fast-moving customer audience.",
    href: "https://www.youtube.com/watch?v=2Hgu2zkD0JU",
    embedUrl: "https://www.youtube-nocookie.com/embed/2Hgu2zkD0JU",
  },
  {
    company: "Mia",
    summary: "Discover Mia's brand video and the visual storytelling approach used to connect with customers.",
    href: "https://www.youtube.com/watch?v=RLwzZ_vxUTw",
    embedUrl: "https://www.youtube-nocookie.com/embed/RLwzZ_vxUTw",
  },
];

function Section06() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("next");
  const activeStory = stories[activeIndex];
  const previousIndex = (activeIndex - 1 + stories.length) % stories.length;
  const nextIndex = (activeIndex + 1) % stories.length;
  const previousStory = stories[previousIndex];
  const nextStory = stories[nextIndex];

  const renderPreview = (story, index, side) => (
    <button
      key={`${side}-${story.company}`}
      className={`customer-preview customer-preview--${side}`}
      type="button"
      aria-label={`Play ${story.company} customer video`}
      onClick={() => {
        setSlideDirection(side === "right" ? "next" : "previous");
        setActiveIndex(index);
      }}
      style={{
        position: "absolute",
        top: "50%",
        width: "11%",
        height: "70%",
        padding: 0,
        border: 0,
        borderRadius: "12px",
        overflow: "hidden",
        background: "#171717",
        cursor: "pointer",
        transform: "translateY(-50%)",
        zIndex: 1,
      }}
    >
      <img
        src={`https://img.youtube.com/vi/${new URL(story.href).searchParams.get("v")}/hqdefault.jpg`}
        alt=""
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(10px) brightness(0.72)",
          transform: "scale(1.06)",
        }}
      />
      <span
        className={`customer-preview-arrow customer-preview-arrow--${side}`}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 1px 4px rgba(0,0,0,.65))",
          pointerEvents: "none",
        }}
      >
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );

  return (
    <div style={{ display: "contents" }}>
      <style>{`
        .customer-preview--left { left: 8.5%; }
        .customer-preview--right { left: 80.5%; }
        .customer-preview-arrow--left { left: 39%; }
        .customer-preview-arrow--right { left: 61%; }
        @media (max-width: 767px) {
          .customer-preview--left { left: 0; }
          .customer-preview--right { left: 89%; }
          .customer-preview-arrow--left { left: 32%; }
          .customer-preview-arrow--right { left: 68%; }
        }
        @keyframes customer-slide-from-next {
          from { opacity: .68; transform: translateX(14%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes customer-slide-from-previous {
          from { opacity: .68; transform: translateX(-14%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="video-carousel w-full bg-white" style={{ marginTop: "56px" }}>
        <div className="w-full mx-auto py-xl md:py-big">
          <div className="max-w-container mx-auto w-full px-xs md:px-lg flex flex-col gap-xxxs md:gap-xxs mb-sm md:mb-xxl items-start">
            <p className="m-0 text-tertiary overline-large-medium text-content-secondary">TESTIMONIALS</p>
            <div className="w-full flex flex-col md:flex-row gap-xxs md:gap-sm md:items-center justify-between">
              <h2 className="text-balance m-0 heading-h2 text-content-primary" style={{ marginBottom: "24px" }}>
                Our customers
              </h2>
              <p className="m-0 text-tertiary paragraph-large max-w-[444px] text-content-secondary" style={{ marginBottom: "24px" }}>
                Discover customer videos and brand stories from the companies we work with.
              </p>
            </div>
          </div>

          <div className="revamp-carousel w-full flex flex-col gap-xxs md:gap-md relative" style={{ marginTop: "24px" }}>
            <div className="relative left-1/2 w-[94%] md:w-[90%] -translate-x-1/2 grid place-items-center overflow-hidden">
              {renderPreview(previousStory, previousIndex, "left")}
              {renderPreview(nextStory, nextIndex, "right")}
              <div
                className="relative w-[86%] md:w-[66%] aspect-video z-[2]"
              >
                <div
                  key={activeStory.company}
                  className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden"
                  style={{
                    animation: `customer-slide-from-${slideDirection} 520ms cubic-bezier(.22,.8,.28,1) both`,
                  }}
                >
                  <iframe
                    src={`${activeStory.embedUrl}?autoplay=1&mute=1&playsinline=1&rel=0`}
                    title={`${activeStory.company} customer video`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <h3 className="m-0 heading-h5 text-content-primary">{activeStory.company}</h3>
            </div>

            <div className="w-full pagination-container">
              <div className="flex justify-center items-center gap-1 mt-md md:mt-xxl">
                {stories.map((story, index) => (
                  <button
                    key={story.company}
                    className="w-[24px] h-[24px] flex items-center justify-center p-0 m-0 bg-transparent hover:bg-transparent border-0 rounded-full transition-all duration-200"
                    aria-label={`Go to item ${index + 1}`}
                    aria-current={activeIndex === index}
                    type="button"
                    onClick={() => {
                      const forwardDistance = (index - activeIndex + stories.length) % stories.length;
                      setSlideDirection(forwardDistance <= stories.length / 2 ? "next" : "previous");
                      setActiveIndex(index);
                    }}
                  >
                    {activeIndex === index ? (
                      <div className="w-[12px] h-[12px] border border-purple-750 rounded-full p-[2px] flex items-center justify-center transition-all duration-200 shadow-[0px_16px_32px_0px_rgba(27,27,27,0.16),0px_2px_32px_0px_rgba(27,27,27,0.05)]">
                        <div className="w-full h-full rounded-full bg-surface-brand-purple-02" />
                      </div>
                    ) : (
                      <div className="w-[8px] h-[8px] border-0 bg-content-disabled rounded-full p-[2px] hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-[0px_16px_32px_0px_rgba(27,27,27,0.16),0px_2px_32px_0px_rgba(27,27,27,0.05)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section06;
