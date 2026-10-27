import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DEEL_MOBILITY_HTML_CLASSES,
  DEEL_MOBILITY_INLINE_STYLES,
  DEEL_MOBILITY_STYLESHEET_HREFS,
  DeelMobilityContent,
} from './deelMobility/generatedPageData';
import SharedLandingPageLayout from '../components/common/SharedLandingPageLayout';
import { applySolutionPageContent } from './solutionPageContent';
import Section02 from '../landing_deel/components/Section02.jsx';
import Section07 from '../landing_deel/components/Section07.jsx';

const STYLE_DATA_ATTR = 'data-deel-mobility-style';
const LINK_DATA_ATTR = 'data-deel-mobility-stylesheet';
const MOBILITY_LAYOUT_FIXES = `
  html:has(.deel-mobility-page), body:has(.deel-mobility-page) { max-width: 100%; overflow-x: hidden; }
  .deel-mobility-page, .deel-mobility-page [data-ab-page="true"] > .w-full { width: 100%; max-width: 100vw; overflow-x: clip; }
  .deel-mobility-page section { max-width: 100%; }
  .deel-mobility-page .mobility-generated-logo-strip,
  .deel-mobility-page .mobility-generated-key-figures,
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div + div,
  .deel-mobility-page .mui-16f0pz5 .mui-1si5xjn { display: none !important; }
  .deel-mobility-page .mobility-landing-logo-strip-mount,
  .deel-mobility-page .deel-logo-strip,
  .deel-mobility-page .deel-logo-strip__viewport { width: 100%; max-width: 100%; overflow: hidden; }
  .deel-mobility-page .mobility-landing-logo-strip-mount { margin-bottom: 32px; }
  .deel-mobility-page .deel-logo-strip__track { min-width: max-content; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child { width: 100%; overflow: hidden; padding: 12px !important; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div { width: 100% !important; max-width: 1704px !important; min-width: 0; margin-inline: auto !important; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div { min-width: 0; overflow: hidden; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { display: flex !important; flex-direction: column !important; gap: 12px !important; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { display: flex !important; gap: 12px !important; }
  .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { margin-top: 24px !important; }
  .deel-mobility-page .swiper-slider-comparison-slider { overflow-x: auto !important; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .deel-mobility-page .swiper-slider-comparison-slider::-webkit-scrollbar { display: none; }
  .deel-mobility-page .swiper-slider-comparison-slider .swiper-wrapper { display: flex !important; width: max-content !important; }
  .deel-mobility-page .swiper-slider-comparison-slider .swiper-slide { flex: 0 0 min(31vw, 560px); scroll-snap-align: start; }
  .deel-mobility-page section[id="1569"] { margin-bottom: 0 !important; padding: clamp(40px, 4.8vw, 92px) clamp(24px, 3.125vw, 60px) clamp(48px, 5vw, 96px) !important; }
  .deel-mobility-page section[id="1569"] > div:first-child { width: 100% !important; max-width: 1776px !important; min-height: 600px !important; margin-inline: auto !important; border-radius: 30px !important; }
  .deel-mobility-page section[id="1569"] > div:first-child > div:first-child { height: 100% !important; padding-inline: clamp(32px, 5vw, 96px) !important; align-items: center !important; }
  .deel-mobility-page section[id="1569"] > div:first-child > div:first-child > div:first-child { gap: 32px !important; justify-content: center !important; }
  .deel-mobility-page section[id="1569"] h2 { margin: 0 !important; }
  .deel-mobility-page section[id="1569"] + .MuiBox-root { margin-top: 0 !important; }
  @media (min-width: 1050px) {
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div { display: flex !important; flex-direction: row !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 50% !important; flex: 0 1 50% !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { display: flex !important; padding: 96px 64px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child > div:first-child { width: 100% !important; max-width: 450px !important; margin: auto !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1,
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1 + div,
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1 + div > p { text-align: center !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1 { margin-bottom: 48px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1 + div { margin-top: 24px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-height: 80px !important; padding-top: 20px !important; padding-bottom: 20px !important; }

    /* Mobility uses a nested hero section rather than the shared split-card hero. */
    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child {
      padding: 12px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section {
      padding: 80px 64px 0 !important;
      border-radius: 12px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div {
      width: 100% !important;
      max-width: 1492px !important;
      min-height: 530px !important;
      margin-inline: auto !important;
      gap: 48px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:first-child {
      flex: 0 1 612px !important;
      max-width: 612px !important;
      min-height: 530px !important;
      padding-bottom: 80px !important;
      justify-content: space-between !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:last-child {
      flex: 1 1 0 !important;
      width: auto !important;
      max-width: 800px !important;
      height: 530px !important;
      aspect-ratio: auto !important;
      border-radius: 20px 20px 0 0 !important;
    }
  }
  @media (max-width: 1049px) {
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div { flex-direction: column !important; min-height: auto !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child,
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { width: 100% !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:first-child { padding: 48px 24px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child > div > div:last-child { display: none !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child h1 { font-size: 38px !important; line-height: 1.05 !important; overflow-wrap: anywhere; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] { width: 100% !important; gap: 12px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] > div { min-width: 0; gap: 12px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="checkbox"] { min-width: 0 !important; min-height: 76px !important; padding: 12px !important; overflow-wrap: anywhere; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div { width: 100% !important; margin-top: 24px !important; }
    .deel-mobility-page [data-ab-page="true"] > .w-full > section:first-child [role="group"] + div button { width: 100% !important; min-height: 52px; }
    .deel-mobility-page .swiper-slider-comparison-slider .swiper-slide { flex-basis: min(82vw, 420px); }
    .deel-mobility-page section[id="1569"] { padding: 32px 16px 48px !important; }
    .deel-mobility-page section[id="1569"] > div:first-child { min-height: 620px !important; border-radius: 20px !important; }
    .deel-mobility-page section[id="1569"] > div:first-child > div:first-child { padding: 48px 24px 24px !important; }
    .deel-mobility-page section[id="1569"] > div:first-child > div:first-child > div:first-child { align-items: center !important; text-align: center !important; }
    .deel-mobility-page section[id="1569"] h2, .deel-mobility-page section[id="1569"] h2 + div { text-align: center !important; justify-content: center !important; }

    /* Keep the mobility-specific hero comfortable and contained on phones. */
    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child {
      padding: 12px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section {
      padding: 32px 16px 0 !important;
      border-radius: 12px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div {
      gap: 32px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:first-child {
      width: 100% !important;
      min-height: 0 !important;
      padding-bottom: 40px !important;
      gap: 28px !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section h1 + div > div,
    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section h1 + div > p {
      max-width: 100% !important;
      overflow-wrap: anywhere;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:last-child {
      width: 100% !important;
      height: 260px !important;
      border-radius: 20px 20px 0 0 !important;
    }
  }

  @media (max-width: 480px) {
    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:first-child > div:nth-child(2) {
      width: 100% !important;
      flex-direction: column !important;
    }

    .deel-mobility-page [data-ab-page="true"] > .w-full > div:first-child > section > div > div:first-child > div:nth-child(2) > * {
      width: 100% !important;
    }
  }
`;
const MOBILITY_COUNTRIES = [
  ['Albania', 'flag_Albania_9fb8ed1aae-cfb7678b7f.svg'],
  ['Algeria', 'flag_Algeria_1aef21c629-706e9df786.svg'],
  ['Angola', 'flag_angola_2ecb9f8d13-5792f7421f.svg'],
  ['Antarctica', 'flag_Antartica_6d4dfe3af0-98afe6892c.svg'],
  ['Antigua and Barbuda', 'flag_Antigua_And_Barbuda_b1825ef14f-ca66ad8d01.svg'],
  ['Argentina', 'flag_Argentina_0f9af5b3f0-1c31a9bb5f.svg'],
  ['Armenia', 'flag_Armenia_af307411b7-615e2d4df4.svg'],
  ['Australia', 'flag_Australia_6c9d74dedd-be2de53e8a.svg'],
  ['Austria', 'flag_Austria_26a9fb62e7-f70ade0fbd.svg'],
  ['Azerbaijan', 'flag_Azerbaijan_35ab12996d-97d7e7f6a9.svg'],
  ['Bahamas', 'flag_Bahamas_25a50b8fcf-4f7bd22c12.svg'],
  ['Bahrain', 'flag_Bahrain_29a303c6d7-524cd6eaf3.svg'],
  ['Bangladesh', 'flag_Bangladesh_6272a85143-506ef64bd7.svg'],
  ['Barbados', 'flag_Barbados_254fd6ad5b-cc5c206a89.svg'],
  ['Belgium', 'flag_belgium_41df2961cc-578771381a.svg'],
  ['Belize', 'flag_Belize_8f7703fe40-971b09481e.svg'],
  ['Benin', 'flag_Benin_9277a93c3e-84f1121b9a.svg'],
  ['Bermuda', 'flag_Bermuda_8bdb01edb3-9891400f85.svg'],
  ['Bhutan', 'flag_Bhutan_4e7c66ae42-70a560fe4b.svg'],
  ['Bolivia', 'flag_Bolivia_0255e272b1-9b10cfaa53.svg'],
  ['Bosnia and Herzegovina', 'flag_Bosnia_And_Herzegovina_20726bf0ca-00a5881812.svg'],
  ['Botswana', 'flag_botswana_304a74da3e-7463afff79.svg'],
  ['Bulgaria', 'flag_Bulgaria_251dc06a07-e20a8159b7.svg'],
  ['Burkina Faso', 'flag_burkina_faso_2931585164-fcd92e1b59.svg'],
  ['Cambodia', 'flag_Cambodia_92c49cb091-96d102edbc.svg'],
  ['Cameroon', 'flag_Cameroon_ab15b735bb-572e316e5d.svg'],
  ['Canada', 'flag_canada_854a0b57b9-2ed2ab7725.svg'],
  ['Cape Verde', 'flag_Cape_Verde_3306930287-84d4c0821c.svg'],
  ['Cayman Islands', 'flag_Cayman_Islands_b2adacabc9-fff3dbd85c.svg'],
  ['Chad', 'flag_chad_c2efc6980b-f2dc60db74.svg'],
  ['Chile', 'flag_chile_598dd996a1-10d1203143.svg'],
  ['China', 'flag_China_f57e416c5e-3c7eae6f5f.svg'],
  ['Colombia', 'flag_colombia_cf5c57e4b1-90f0956839.svg'],
  ['Costa Rica', 'flag_Costa_Rica_8c74ace003-9e2e154eca.svg'],
  ['Croatia', 'flag_Croatia_921aa07f71-57c978b3cf.svg'],
  ['Cyprus', 'flag_Cyprus_db51b66037-9a93f26c77.svg'],
  ['Czech Republic', 'flag_Czech_Republic_9f6bafcee6-614a9684b7.svg'],
  ['Denmark', 'flag_denmark_8236c674c5-34cc4a85d4.svg'],
  ['Dominican Republic', 'flag_Dominican_Republic_53d0351fa7-0f58bfeaa9.svg'],
  ['East Timor', 'flag_East_Timor_06bee35c7a-b380013fd7.svg'],
  ['Ecuador', 'flag_Ecuador_0ef2051606-ffac10d495.svg'],
  ['Egypt', 'flag_Egypt_74b8672d80-71e300b378.svg'],
  ['El Salvador', 'flag_El_Salvador_1902673378-b9c908cfeb.svg'],
  ['Equatorial Guinea', 'flag_equatorial_guinea_3fa47d3440-95bad6a444.svg'],
  ['Estonia', 'flag_estonia_0e85bd0332-debd593d07.svg'],
  ['Ethiopia', 'flag_ethiopia_37d1f7e896-341cdecf21.svg'],
  ['Fiji', 'flag_Fiji_5f5f2beb8c-75c5b462b7.svg'],
  ['Finland', 'flag_finland_9d0702faf5-c966b90b1c.svg'],
  ['France', 'flag_france_75587eb404-9ffbfaa422.svg'],
  ['Gabon', 'flag_Gabon_35220d2f03-8732bc488d.svg'],
  ['Gambia', 'flag_gambia_42a594f194-da3c72458d.svg'],
  ['Georgia', 'flag_Georgia_ff33a54111-f3eca13dbc.svg'],
  ['Germany', 'flag_germany_e2e5aead79-c3ab8374a1.svg'],
  ['Ghana', 'flag_Ghana_54e112fc37-531cb925d4.svg'],
  ['Gibraltar', 'flag_Gibraltar_c0b2814903-13301803a5.svg'],
  ['Greece', 'flag_Greece_6a7b512927-1a2996c851.svg'],
  ['Greenland', 'flag_Greenland_f50e00ec45-e4b09440fb.svg'],
  ['Grenada', 'flag_Grenada_d6a15736a3-c5c8a86818.svg'],
  ['Guatemala', 'flag_Guatemala_10a384e215-bf42be215c.svg'],
  ['Guyana', 'flag_Guyana_b4c284269d-3461cfb7b2.svg'],
  ['Haiti', 'flag_Haiti_3aee4d91da-86d9d5d3aa.svg'],
  ['Honduras', 'flag_Honduras_d6bb854dc2-00301b8ddf.svg'],
  ['Hong Kong', 'flag_hong_kong_77940eed8b-e6a7336d93.svg'],
  ['Hungary', 'flag_Hungary_421bcb913a-8767c05ff1.svg'],
  ['Iceland', 'flag_Iceland_a4981229ba-476c101fb3.svg'],
  ['India', 'flag_India_8144f564af-0521fd2689.svg'],
  ['Indonesia', 'flag_indonesia_2b8470c132-f3e39da283.svg'],
  ['Ireland', 'flag_Ireland_7814d6e718-646948435a.svg'],
  ['Israel', 'flag_Israel_d2e0d37a5b-776bf79fdc.svg'],
  ['Italy', 'flag_Italy_75eb1ae5da-2270775f96.svg'],
  ['Ivory Coast', 'flag_Ivory_Coast_784461aad4-54488fec37.svg'],
] as const;

const MOBILITY_COUNTRY_IMAGE_BY_NAME: Record<string, string> = {
  Argentina: '/solutions/mobility/assets/images/argentina_c65d3c3ca0-bee69854a8.jpg',
  Australia: '/solutions/mobility/assets/images/australia_d4bf00df54-4185a392dc.jpeg',
  Austria: '/solutions/mobility/assets/images/Austria_ee21918003-75e9d4fac5.jpeg',
  Bahamas: '/solutions/mobility/assets/images/Bahamas_16649132db-5f442f2aa0.jpeg',
  Bahrain: '/solutions/mobility/assets/images/Bahrain_6e94389d1b-bb8c3ae7fc.jpeg',
  Belgium: '/solutions/mobility/assets/images/card_belgium_cba31796f4-2df23acd82.jpg',
  Belize: '/solutions/mobility/assets/images/Belize_0a5a62c528-8be51bcfce.jpeg',
  Bolivia: '/solutions/mobility/assets/images/Bolivia_a4a590397c-419c1e6058.jpeg',
  Brazil: '/solutions/mobility/assets/images/card_brazil_6a888eb08f-f33fb20587.jpg',
  Bulgaria: '/solutions/mobility/assets/images/Bulgaria_ff621b3226-7d9a0a0873.jpeg',
  Cambodia: '/solutions/mobility/assets/images/Angkor_Wat_Cambodia_79e48b5da3-03fbba2599.webp',
  Cameroon: '/solutions/mobility/assets/images/Cameroon_a3fcdaabae-6f00150001.jpeg',
  Canada: '/solutions/mobility/assets/images/card_canada_82da5003b6-237f2dc61a.jpg',
  Chile: '/solutions/mobility/assets/images/card_chile_bfc19ba833-5ce1fd6136.jpg',
  Colombia: '/solutions/mobility/assets/images/card_colombia_87c5041f45-75b932c09c.jpg',
  'Costa Rica': '/solutions/mobility/assets/images/costa_rica_40824c9548-ab1710dc0c.webp',
  Cyprus: '/solutions/mobility/assets/images/Cyprus_d3977cfcdc-e2e138c5b4.jpeg',
  Denmark: '/solutions/mobility/assets/images/card_denmark_c705ac7f3c-cf0a38a942.jpg',
  Ecuador: '/solutions/mobility/assets/images/Ecuador_60e8f6d4a9-5dd396243e.jpeg',
  'El Salvador': '/solutions/mobility/assets/images/El_20_Salvador_a5d442bfba-d7e7c4d746.jpeg',
  Estonia: '/solutions/mobility/assets/images/card_estonia_45fbeaffda-d9b00c5473.jpg',
  Finland: '/solutions/mobility/assets/images/card_finland_9433a1a207-3a670deb91.jpg',
  France: '/solutions/mobility/assets/images/card_france_2585863da8-a6a46ab380.jpg',
  Georgia: '/solutions/mobility/assets/images/Georgia_8f7a139dfb-5d16fa38e9.jpeg',
  Germany: '/solutions/mobility/assets/images/card_germany_38ef78c629-11ebe079bd.jpg',
  Greece: '/solutions/mobility/assets/images/Greece_f7554c67ed-da9c03d52f.jpeg',
  'Hong Kong': '/solutions/mobility/assets/images/card_hong_kong_2892dc37ef-59a3c93bbb.jpg',
  Hungary: '/solutions/mobility/assets/images/Hungary_5d45f19abe-1c6ef39afd.jpeg',
  India: '/solutions/mobility/assets/images/india_459b28bd52-f4eaed918d.jpeg',
  Indonesia: '/solutions/mobility/assets/images/card_indonesia_4d526de04a-9775140039.jpg',
  Ireland: '/solutions/mobility/assets/images/ireland_3f4a871362-26f2935395.jpg',
  Israel: '/solutions/mobility/assets/images/israel_4a2cb94c32-e14f7a84b2.jpeg',
  Italy: '/solutions/mobility/assets/images/italy_db5b2427f8-0f4e5fbc45.jpeg',
  Japan: '/solutions/mobility/assets/images/card_japan_77b54f8aaf-72906479b5.jpg',
};

const MOBILITY_COUNTRY_DETAILS_BY_NAME: Record<string, readonly string[]> = {
  Bahrain: ['Work Visa', 'Work permit for Residence Visa holders'],
  Belgium: ['Type B Work Permit', 'EU Blue card'],
  Bolivia: ['Mercosur Temporary Residence', 'Temporary Residence (Permanencia Temporal)', 'Short-Term Visa'],
  Brazil: ['Vitem V- Mercosur Visa', 'Technical visa'],
  Bulgaria: ['EU Blue card'],
  Cambodia: ['Ordinary Type E Visa', 'Work Permit', 'Dependent Visa'],
};

const MOBILITY_COUNTRY_DURATION_BY_NAME: Record<string, string> = {
  Brazil: '3-4 mo.',
  Bulgaria: '4-5 mo.',
  Cambodia: '4-6 weeks',
};

export function getMobilityCountryEntries() {
  return MOBILITY_COUNTRIES.map(([label, fileName]) => {
    return {
      label,
      src: `/solutions/mobility/assets/svg/${fileName}`,
      imageSrc: MOBILITY_COUNTRY_IMAGE_BY_NAME[label],
      details:
        MOBILITY_COUNTRY_DETAILS_BY_NAME[label] ?? [
          'Country-specific visa support',
          'Mobility case guidance from Deel experts',
        ],
      duration: MOBILITY_COUNTRY_DURATION_BY_NAME[label],
    };
  });
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function wireSlider(root: HTMLElement) {
  const cleanupFns: Array<() => void> = [];
  const tracks = Array.from(root.querySelectorAll<HTMLElement>('[id]')).filter((element) =>
    element.querySelector('.swiper-wrapper'),
  );

  tracks.forEach((track) => {
    const wrapper = track.querySelector<HTMLElement>('.swiper-wrapper');
    if (!wrapper) {
      return;
    }

    const trackId = track.id;
    const nav = trackId ? root.querySelector<HTMLElement>(`#nav-${trackId}`) : null;
    const previousButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-prev');
    const nextButton = nav?.querySelector<HTMLButtonElement>('.swiper-button-next');

    if (!previousButton || !nextButton) {
      return;
    }

    track.style.overflowX = 'auto';
    track.style.scrollBehavior = 'smooth';
    track.style.scrollbarWidth = 'none';
    wrapper.style.display = 'flex';

    Array.from(wrapper.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.scrollSnapAlign = 'start';
      }
    });

    const scrollAmount = () => Math.max(track.clientWidth * 0.9, 320);
    const handlePrevious = () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    const handleNext = () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });

    previousButton.addEventListener('click', handlePrevious);
    nextButton.addEventListener('click', handleNext);

    cleanupFns.push(() => {
      previousButton.removeEventListener('click', handlePrevious);
      nextButton.removeEventListener('click', handleNext);
    });
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireTabs(root: HTMLElement) {
  const tabLists = Array.from(root.querySelectorAll<HTMLElement>('[role="tablist"]'));
  const cleanupFns = tabLists.map((tabList, listIndex) => {
    const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (tabs.length === 0) {
      return () => undefined;
    }

    const tabContainer = tabList.closest('.MuiTabs-root') ?? tabList.parentElement;
    const panels = Array.from(
      tabContainer?.parentElement?.querySelectorAll<HTMLElement>('[role="tabpanel"]') ?? [],
    );

    const activateTab = (nextTab: HTMLElement) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tab === nextTab;
        const generatedId = tab.id || `deel-mobility-tab-${listIndex}-${tabIndex}`;
        const generatedPanelId = `deel-mobility-tabpanel-${listIndex}-${tabIndex}`;

        tab.id = generatedId;
        tab.setAttribute('aria-controls', generatedPanelId);
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        tab.classList.toggle('Mui-selected', selected);
      });

      panels.forEach((panel, panelIndex) => {
        const linkedTab = tabs[panelIndex];
        const active = linkedTab === nextTab;

        panel.hidden = !active;
        panel.style.display = active ? '' : 'none';
        panel.setAttribute('tabindex', active ? '0' : '-1');

        if (!linkedTab) {
          return;
        }

        const generatedId = linkedTab.id || `deel-mobility-tab-${listIndex}-${panelIndex}`;
        const generatedPanelId = `deel-mobility-tabpanel-${listIndex}-${panelIndex}`;

        linkedTab.id = generatedId;
        linkedTab.setAttribute('aria-controls', generatedPanelId);
        panel.id = generatedPanelId;
        panel.setAttribute('aria-labelledby', generatedId);
      });
    };

    const disposers = tabs.map((tab, tabIndex) => {
      tab.id ||= `deel-mobility-tab-${listIndex}-${tabIndex}`;

      const handleClick = () => activateTab(tab);
      const handleKeyDown = (event: KeyboardEvent) => {
        const currentIndex = tabs.indexOf(tab);

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const nextTab = tabs[(currentIndex + 1) % tabs.length];
          activateTab(nextTab);
          nextTab.focus();
          return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
          activateTab(nextTab);
          nextTab.focus();
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          activateTab(tabs[0]);
          tabs[0].focus();
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          const nextTab = tabs[tabs.length - 1];
          activateTab(nextTab);
          nextTab.focus();
        }
      };

      tab.addEventListener('click', handleClick);
      tab.addEventListener('keydown', handleKeyDown);

      return () => {
        tab.removeEventListener('click', handleClick);
        tab.removeEventListener('keydown', handleKeyDown);
      };
    });

    const initiallySelected =
      tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
    activateTab(initiallySelected);

    return () => {
      disposers.forEach((dispose) => dispose());
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireAccordions(root: HTMLElement) {
  const accordions = Array.from(root.querySelectorAll<HTMLElement>('.MuiAccordion-root'));

  const cleanupFns = accordions.map((accordion, index) => {
    const summary = accordion.querySelector<HTMLElement>('.MuiAccordionSummary-root');
    const collapse = accordion.querySelector<HTMLElement>('.MuiCollapse-root');
    const region = accordion.querySelector<HTMLElement>('.MuiAccordion-region');
    const details = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root');

    if (!summary || !collapse || !region || !details) {
      return () => undefined;
    }

    summary.style.display = 'flex';
    summary.style.alignItems = 'center';
    summary.style.justifyContent = 'space-between';
    summary.style.gap = '16px';
    summary.style.width = '100%';

    const ensureIconWrapper = (
      className: 'expandIconWrapper' | 'collapseIconWrapper',
      symbol: '+' | '−',
    ) => {
      let wrapper = accordion.querySelector<HTMLElement>(`.${className}`);
      if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = className;
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.textContent = symbol;
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.width = '34px';
        wrapper.style.height = '34px';
        wrapper.style.minWidth = '34px';
        wrapper.style.borderRadius = '999px';
        wrapper.style.backgroundColor = '#1B1B1B';
        wrapper.style.color = '#FFFFFF';
        wrapper.style.fontSize = symbol === '+' ? '28px' : '24px';
        wrapper.style.fontWeight = '500';
        wrapper.style.lineHeight = '1';
        wrapper.style.flexShrink = '0';
        wrapper.style.marginLeft = 'auto';
        summary.appendChild(wrapper);
      }

      return wrapper;
    };

    const expandIcon = ensureIconWrapper('expandIconWrapper', '+');
    const collapseIcon = ensureIconWrapper('collapseIconWrapper', '−');

    // The generated SVG wrapper names are reversed, so use direct symbols for each state.
    const openIcon = accordion.querySelector<HTMLElement>('.expandIconWrapper');
    const closedIcon = accordion.querySelector<HTMLElement>('.collapseIconWrapper');
    const setIcon = (icon: HTMLElement | null, symbol: '+' | '-') => {
      if (!icon) {
        return;
      }

      icon.replaceChildren(symbol);
      icon.setAttribute('aria-hidden', 'true');
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.width = '48px';
      icon.style.height = '48px';
      icon.style.minWidth = '48px';
      icon.style.borderRadius = '999px';
      icon.style.backgroundColor = '#1B1B1B';
      icon.style.color = '#FFFFFF';
      icon.style.fontSize = symbol === '+' ? '32px' : '28px';
      icon.style.fontWeight = '500';
      icon.style.lineHeight = '1';
      icon.style.flexShrink = '0';
      icon.style.marginLeft = 'auto';
    };

    setIcon(openIcon, '-');
    setIcon(closedIcon, '+');

    const summaryId = `deel-mobility-accordion-header-${index}`;
    const regionId = `deel-mobility-accordion-panel-${index}`;

    summary.id = summaryId;
    summary.setAttribute('aria-controls', regionId);
    summary.setAttribute('role', 'button');
    summary.tabIndex = 0;

    region.id = regionId;
    region.setAttribute('aria-labelledby', summaryId);

    const setExpanded = (expanded: boolean) => {
      accordion.classList.toggle('Mui-expanded', expanded);
      summary.classList.toggle('Mui-expanded', expanded);
      region.classList.toggle('Mui-expanded', expanded);
      collapse.classList.toggle('MuiCollapse-hidden', !expanded);
      collapse.classList.toggle('Mui-expanded', expanded);

      summary.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      region.hidden = !expanded;
      collapse.style.minHeight = expanded ? 'unset' : '0px';
      collapse.style.height = expanded ? 'auto' : '0px';
      collapse.style.overflow = expanded ? 'visible' : 'hidden';
      collapse.style.visibility = expanded ? 'visible' : 'hidden';
      region.style.display = expanded ? '' : 'none';
      details.style.display = expanded ? '' : 'none';

      expandIcon.style.setProperty('display', expanded ? 'inline-flex' : 'none', 'important');
      collapseIcon.style.setProperty('display', expanded ? 'none' : 'inline-flex', 'important');
    };

    const toggle = () => {
      const expanded = summary.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    };

    summary.addEventListener('click', toggle);
    summary.addEventListener('keydown', handleKeyDown);

    const initiallyExpanded =
      accordion.classList.contains('Mui-expanded') || summary.getAttribute('aria-expanded') === 'true';
    setExpanded(initiallyExpanded);

    return () => {
      summary.removeEventListener('click', toggle);
      summary.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireCheckboxButtons(root: HTMLElement) {
  const checkboxes = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'));

  const setChecked = (button: HTMLButtonElement, checked: boolean) => {
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
    button.style.background = checked ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)';
    button.style.borderColor = checked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';

    const marker = button.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (marker) {
      marker.style.background = checked ? 'var(--color-purple-525)' : 'transparent';
      marker.style.borderColor = 'var(--color-purple-525)';
      marker.style.boxShadow = checked ? 'inset 0 0 0 3px rgba(255,255,255,0.95)' : '';
    }
  };

  const cleanupFns = checkboxes.map((button) => {
    setChecked(button, button.getAttribute('aria-checked') === 'true');

    const handleClick = () => {
      const nextChecked = button.getAttribute('aria-checked') !== 'true';
      setChecked(button, nextChecked);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    button.addEventListener('click', handleClick);
    button.addEventListener('keydown', handleKeyDown);

    return () => {
      button.removeEventListener('click', handleClick);
      button.removeEventListener('keydown', handleKeyDown);
    };
  });

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function wireCountryDirectory(root: HTMLElement) {
  const trigger = root.querySelector<HTMLButtonElement>('.mui-vyagqu > .mui-6abm5b');
  if (!trigger) {
    return () => undefined;
  }

  const wrapper = trigger.closest('.mui-vyagqu');
  const countrySection = wrapper?.parentElement;
  if (!wrapper || !countrySection) {
    return () => undefined;
  }

  const cardGrid = countrySection.firstElementChild?.firstElementChild;
  if (!(cardGrid instanceof HTMLElement)) {
    return () => undefined;
  }

  const featuredCountries = [
    {
      name: 'India',
      duration: '2-4 mo.',
      flag: 'flag_India_8144f564af-0521fd2689.svg',
      image: 'india_459b28bd52-f4eaed918d.jpeg',
      details: ['Employment Visa', 'Business Visa', 'Intra-Company Transfer'],
    },
    {
      name: 'United Arab Emirates',
      duration: '2-4 weeks',
      flag: 'flag_uae_25152d21ee-7be7ae755d.svg',
      image: 'global-travel-india-uae-usa.png',
      details: ['Work Permit and Residence Visa', 'Green Visa', 'Golden Visa'],
    },
    {
      name: 'United States',
      duration: '2-6 mo.',
      flag: 'flag_usa_d647f25180-0ee328aadb.svg',
      image: 'card_usa_75c1a30c08-48d8f420b5.jpg',
      details: ['H-1B Specialty Occupation', 'L-1 Intracompany Transfer', 'O-1 Extraordinary Ability'],
    },
  ];

  featuredCountries.forEach((country, index) => {
    const card = cardGrid.children[index];
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const duration = card.querySelector<HTMLElement>('.mui-1urzrci p');
    if (duration) {
      duration.textContent = country.duration;
    }

    const image = card.querySelector<HTMLImageElement>('.mui-1vr0szm img');
    if (image) {
      image.src = `/solutions/mobility/assets/images/${country.image}`;
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
    }

    const content = card.querySelector<HTMLElement>('.mui-11y1chw');
    const flag = content?.querySelector<HTMLImageElement>('.mui-1gllrvz img');
    const heading = content?.querySelector<HTMLElement>('.mui-1gllrvz h5');
    if (flag) {
      flag.src = `/solutions/mobility/assets/svg/${country.flag}`;
      flag.removeAttribute('srcset');
    }
    if (heading) {
      heading.textContent = country.name;
    }

    const details = content?.querySelector<HTMLElement>('.mui-1kq77n9');
    const detailTemplate = details?.firstElementChild;
    if (!details || !detailTemplate) {
      return;
    }

    details.replaceChildren(
      ...country.details.map((detail) => {
        const item = detailTemplate.cloneNode(true) as HTMLElement;
        const text = item.querySelector<HTMLElement>('p');
        if (text) {
          text.textContent = detail;
        }
        return item;
      }),
    );
  });

  const hiddenCards = Array.from(cardGrid.querySelectorAll<HTMLElement>(':scope > *'))
    .slice(3)
    .map((card) => ({
      card,
      display: card.style.getPropertyValue('display'),
      priority: card.style.getPropertyPriority('display'),
    }));
  const wrapperDisplay = wrapper.style.getPropertyValue('display');
  const wrapperDisplayPriority = wrapper.style.getPropertyPriority('display');

  hiddenCards.forEach(({ card }) => card.style.setProperty('display', 'none', 'important'));
  wrapper.style.setProperty('display', 'none', 'important');

  return () => {
    hiddenCards.forEach(({ card, display, priority }) => {
      if (display) card.style.setProperty('display', display, priority);
      else card.style.removeProperty('display');
    });
    if (wrapperDisplay) {
      wrapper.style.setProperty('display', wrapperDisplay, wrapperDisplayPriority);
    } else {
      wrapper.style.removeProperty('display');
    }
  };
}

export default function DeelMobilityPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [landingLogoStripTarget, setLandingLogoStripTarget] = useState<HTMLDivElement | null>(null);
  const [landingKeyFiguresTarget, setLandingKeyFiguresTarget] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlClassName = document.documentElement.className;
    const previousBodyClassName = document.body.className;

    document.title = 'Dechub-Bridge Mobility | Project Delivery Tracking';

    const mergedHtmlClasses = Array.from(
      new Set(
        `${previousHtmlClassName} ${DEEL_MOBILITY_HTML_CLASSES}`
          .split(/\s+/)
          .map((className) => className.trim())
          .filter(Boolean),
      ),
    ).join(' ');

    document.documentElement.className = mergedHtmlClasses;

    const cleanupNodes: HTMLElement[] = [];

    DEEL_MOBILITY_STYLESHEET_HREFS.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(LINK_DATA_ATTR, href);
      document.head.appendChild(link);
      cleanupNodes.push(link);
    });

    DEEL_MOBILITY_INLINE_STYLES.forEach((cssText, index) => {
      const style = document.createElement('style');
      style.setAttribute(STYLE_DATA_ATTR, String(index));
      style.textContent = cssText;
      document.head.appendChild(style);
      cleanupNodes.push(style);
    });

    const layoutStyle = document.createElement('style');
    layoutStyle.setAttribute(STYLE_DATA_ATTR, 'layout-fixes');
    layoutStyle.textContent = MOBILITY_LAYOUT_FIXES;
    document.head.appendChild(layoutStyle);
    cleanupNodes.push(layoutStyle);

    return () => {
      cleanupNodes.forEach((node) => node.remove());
      document.title = previousTitle;
      document.documentElement.className = previousHtmlClassName;
      document.body.className = previousBodyClassName;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (root) {
      const cleanup = applySolutionPageContent(root, 'mobility');
      const heroImages = root.querySelectorAll<HTMLImageElement>(
        'img[src*="Global_mobility_simplified_df32643866"], img[src*="global_mobility_simplified_3170c98a50"]',
      );
      heroImages.forEach((heroImage) => {
        heroImage.src = '/solutions/mobility/assets/images/global-travel-india-uae-usa.png';
        heroImage.removeAttribute('srcset');
        heroImage.alt = 'Employee traveling through an international airport with India, UAE, and USA signs';
      });
      root.querySelectorAll<HTMLImageElement>('img[src*="every_case_experts"]').forEach((image) => {
        image.src = '/solutions/mobility/assets/images/mobility-experts-no-country-flag.png';
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.alt = 'Mia S. visa approved';
      });
      const mobilityCardImages = [
        {
          headingText: 'Immigration for founders',
          imageSrc: '/solutions/mobility/assets/images/mobility-immigration-founders.png',
        },
        {
          headingText: 'Immigration for your team',
          imageSrc: '/solutions/mobility/assets/images/mobility-immigration-team.png',
        },
      ];
      mobilityCardImages.forEach(({ headingText, imageSrc }) => {
        const heading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h3')).find(
          (element) => element.textContent?.trim() === headingText,
        );
        let card = heading?.parentElement;
        while (card && !card.querySelector('img')) {
          card = card.parentElement;
        }
        const image = card?.querySelector<HTMLImageElement>('img');
        if (!image) return;
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = imageSrc;
        if (image.parentElement instanceof HTMLElement) {
          image.parentElement.style.height = 'auto';
          image.parentElement.style.minHeight = '0';
        }
        image.style.width = '100%';
        image.style.height = 'auto';
        image.style.maxWidth = '100%';
        image.style.maxHeight = 'none';
        image.style.objectFit = 'contain';
        image.style.objectPosition = 'center';
      });
      return cleanup;
    }

    return undefined;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedLogoStrip = root?.querySelector<HTMLElement>('section.logo-stripe-standard-wrapper');

    if (!generatedLogoStrip?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'mobility-landing-logo-strip-mount';
    generatedLogoStrip.classList.add('mobility-generated-logo-strip');
    generatedLogoStrip.parentElement.insertBefore(mount, generatedLogoStrip);
    setLandingLogoStripTarget(mount);

    return () => {
      generatedLogoStrip.classList.remove('mobility-generated-logo-strip');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const generatedKeyFigures = root?.querySelector<HTMLElement>('div.key-figures-wrapper');

    if (!generatedKeyFigures?.parentElement) {
      return undefined;
    }

    const mount = document.createElement('div');
    mount.className = 'mobility-landing-key-figures-mount';
    generatedKeyFigures.classList.add('mobility-generated-key-figures');
    generatedKeyFigures.parentElement.insertBefore(mount, generatedKeyFigures);
    setLandingKeyFiguresTarget(mount);

    return () => {
      generatedKeyFigures.classList.remove('mobility-generated-key-figures');
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    root.querySelectorAll('header, footer').forEach((element) => {
      element.remove();
    });

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const rawHref = anchor.getAttribute('href')?.trim() ?? '';
      if (!rawHref || rawHref === '#' || rawHref === '#!') {
        event.preventDefault();
        return;
      }

      if (anchor.target === '_blank' || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      const nextUrl = `${normalizePathname(url.pathname)}${url.search}${url.hash}`;
      const currentUrl = `${normalizePathname(window.location.pathname)}${window.location.search}${window.location.hash}`;

      if (nextUrl !== currentUrl) {
        window.history.pushState({}, '', nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const cleanupSlider = wireSlider(root);
    const cleanupTabs = wireTabs(root);
    const cleanupAccordions = wireAccordions(root);
    const cleanupCheckboxes = wireCheckboxButtons(root);
    const cleanupCountryDirectory = wireCountryDirectory(root);

    root.addEventListener('click', handleAnchorClick);

    return () => {
      root.removeEventListener('click', handleAnchorClick);
      cleanupSlider();
      cleanupTabs();
      cleanupAccordions();
      cleanupCheckboxes();
      cleanupCountryDirectory();
    };
  }, []);

  return (
    <SharedLandingPageLayout>
      <div ref={rootRef} className="deel-mobility-page" data-page="deel-mobility-react">
        <DeelMobilityContent />
        {landingLogoStripTarget ? createPortal(<Section02 />, landingLogoStripTarget) : null}
        {landingKeyFiguresTarget ? createPortal(<Section07 />, landingKeyFiguresTarget) : null}
      </div>
    </SharedLandingPageLayout>
  );
}
