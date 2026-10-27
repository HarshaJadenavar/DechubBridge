const TANISHQ_CASE_STUDY_IMAGE = '/dechub-assets/tanishq-jewellery-experience.png';
const TITAN_CASE_STUDY_IMAGE = '/dechub-assets/titan-payroll-management.png';
const MIA_CASE_STUDY_IMAGE = '/dechub-assets/mia-payroll-experience.png';
const MIA_CASE_STUDY_LOGO = '/dechub-assets/mia_logo.png';
const FASTRACK_CASE_STUDY_IMAGE = '/dechub-assets/fastrack-payroll-experience.png';
const FASTRACK_CASE_STUDY_LOGO = '/dechub-assets/fastrack_logo.png';

type SolutionType = 'payroll' | 'it' | 'hr' | 'benefits';
type CaseStudyBrand = 'tanishq' | 'titan' | 'mia' | 'fastrack';
export type NonPayrollSolutionType =
  | 'it'
  | 'hr'
  | 'benefits'
  | 'hire'
  | 'mobility'
  | 'embedded'
  | 'services'
  | 'eor'
  | 'contractors'
  | 'open-api';

const BRAND_NAMES: Record<CaseStudyBrand, string> = {
  tanishq: 'Tanishq',
  titan: 'Titan',
  mia: 'Mia',
  fastrack: 'Fastrack',
};

const CASE_STUDY_CARDS: Array<{
  brand: CaseStudyBrand;
  image: string;
  imageAlt: string;
  logo: string;
}> = [
  {
    brand: 'tanishq',
    image: TANISHQ_CASE_STUDY_IMAGE,
    imageAlt: 'Tanishq jewellery showroom',
    logo: '/dechub-assets/trusted-logos/tanishq_logo.png',
  },
  {
    brand: 'titan',
    image: TITAN_CASE_STUDY_IMAGE,
    imageAlt: 'Titan showroom displaying watches',
    logo: '/dechub-assets/titan_logo.png',
  },
  {
    brand: 'mia',
    image: MIA_CASE_STUDY_IMAGE,
    imageAlt: 'Mia by Tanishq jewellery collection',
    logo: MIA_CASE_STUDY_LOGO,
  },
  {
    brand: 'fastrack',
    image: FASTRACK_CASE_STUDY_IMAGE,
    imageAlt: 'Fastrack brand campaign',
    logo: FASTRACK_CASE_STUDY_LOGO,
  },
];

const ADDITIONAL_SOLUTION_COPY: Record<
  Exclude<NonPayrollSolutionType, SolutionType>,
  { title: string; description: string }
> = {
  hire: {
    title: 'Building the Right Team for Every Project',
    description:
      'Helping {brand} find skilled professionals, organize project teams, and move from hiring needs to delivery with a clear workflow.',
  },
  mobility: {
    title: 'Keeping Every Project and Team in Motion',
    description:
      'Helping {brand} coordinate project progress, team access, updates, and payment milestones in one organized delivery workflow.',
  },
  embedded: {
    title: 'Connecting Every Step of Project Delivery',
    description:
      'Helping {brand} connect client requests, project teams, contracts, and updates in a single delivery experience.',
  },
  services: {
    title: 'Delivering Better Outcomes for Every Project',
    description:
      'Supporting {brand} with the right team, project setup, delivery coordination, and payment follow-through from brief to completion.',
  },
  eor: {
    title: 'Supporting Global Teams with Compliant Employment',
    description:
      'Helping {brand} coordinate onboarding, employment documents, local payroll requirements, and employee records across markets.',
  },
  contractors: {
    title: 'Making Contractor Management More Seamless',
    description:
      'Helping {brand} organize contractor onboarding, agreements, payments, and workforce records in a consistent management workflow.',
  },
  'open-api': {
    title: 'Building Connected Payroll Workflows',
    description:
      'Helping {brand} connect payroll data and workforce systems through flexible integrations that support accurate, efficient operations.',
  },
};

const SOLUTION_CASE_STUDY_COPY: Record<SolutionType, Record<CaseStudyBrand, { title: string; description: string }>> = {
  payroll: {
    tanishq: {
      title: 'Simplifying Payroll for a Growing Retail Workforce',
      description:
        "Supporting Tanishq's payroll management with streamlined processes, better workforce coordination, and efficient payroll operations.",
    },
    titan: {
      title: 'Making Payroll Management More Efficient',
      description:
        'Helping Titan simplify payroll workflows, improve payment accuracy, and support seamless payroll management across its workforce.',
    },
    mia: {
      title: 'Bringing Clarity and Control to Every Pay Cycle',
      description:
        'Helping Mia manage payroll complexities with better visibility into employee compensation, timely salary disbursements, and a more organized approach to payroll administration.',
    },
    fastrack: {
      title: 'Keeping Payroll on Track for a Dynamic Workforce',
      description:
        "Supporting Fastrack's payroll operations with greater visibility into salary processing, reduced administrative complexity, and consistent pay-cycle management.",
    },
  },
  it: {
    tanishq: {
      title: 'Creating a More Connected Digital Workplace',
      description:
        'Helping Tanishq coordinate employee devices, secure access, and IT support through clearer workflows across its workforce.',
    },
    titan: {
      title: 'Simplifying Technology Management Across the Workforce',
      description:
        'Helping Titan organize device deployment, access, and lifecycle management so employees can get the technology they need.',
    },
    mia: {
      title: 'Making Employee Technology Easier to Manage',
      description:
        'Helping Mia streamline device management and secure employee access while making day-to-day IT support easier to coordinate.',
    },
    fastrack: {
      title: 'Keeping a Fast-Moving Workforce Connected',
      description:
        'Supporting Fastrack with organized device operations, secure access, and responsive IT support for employees across the business.',
    },
  },
  hr: {
    tanishq: {
      title: 'Bringing Employee Operations Together',
      description:
        'Helping Tanishq organize employee records, onboarding, and everyday people operations in a more consistent workflow.',
    },
    titan: {
      title: 'Making Workforce Management More Seamless',
      description:
        'Helping Titan coordinate employee information and key HR processes to support a smoother experience throughout the employee lifecycle.',
    },
    mia: {
      title: 'Creating a More Organized Employee Experience',
      description:
        'Helping Mia bring people records, onboarding, and core HR tasks together for clearer and more consistent employee operations.',
    },
    fastrack: {
      title: 'Supporting a Dynamic Workforce with Connected HR',
      description:
        'Supporting Fastrack with organized employee information and streamlined HR workflows from onboarding through ongoing people operations.',
    },
  },
  benefits: {
    tanishq: {
      title: 'Making Employee Benefits Easier to Navigate',
      description:
        'Helping Tanishq organize benefits information and enrollment workflows so employees can better understand and access their benefits.',
    },
    titan: {
      title: 'Bringing More Clarity to Employee Benefits',
      description:
        'Helping Titan coordinate benefits information, eligibility, and enrollment for a clearer employee benefits experience.',
    },
    mia: {
      title: 'Making Benefits More Accessible for Employees',
      description:
        'Helping Mia simplify benefits communication and enrollment so employees can find and understand the support available to them.',
    },
    fastrack: {
      title: 'Supporting Employee Wellbeing with Clear Benefits',
      description:
        'Supporting Fastrack with organized benefits information and simpler enrollment workflows for its dynamic workforce.',
    },
  },
};

function getSolutionCopy(
  solution: NonPayrollSolutionType,
  brand: CaseStudyBrand,
): { title: string; description: string } {
  if (solution === 'it' || solution === 'hr' || solution === 'benefits') {
    return SOLUTION_CASE_STUDY_COPY[solution][brand];
  }

  const copy = ADDITIONAL_SOLUTION_COPY[solution];
  return {
    title: `${BRAND_NAMES[brand]}: ${copy.title}`,
    description: copy.description.replace('{brand}', BRAND_NAMES[brand]),
  };
}

function setImageSource(image: HTMLImageElement, src: string, alt: string): void {
  image.src = src;
  image.alt = alt;
  image.removeAttribute('srcset');
  image.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
}

export function applySolutionCaseStudyCards(root: ParentNode, solution: NonPayrollSolutionType): void {
  const carousel = root.querySelector<HTMLElement>('.swiper-slider-comparison-slider');
  const wrapper = carousel?.querySelector<HTMLElement>('.swiper-wrapper');
  if (!carousel || !wrapper) {
    if (root.querySelector('.solution-case-study-section')) {
      return;
    }

    const main = root.querySelector<HTMLElement>('main');
    if (!main) {
      console.error(`Unable to find a content area for the ${solution} solution case studies.`);
      return;
    }

    const section = document.createElement('section');
    section.className = 'solution-case-study-section';
    section.setAttribute('aria-labelledby', 'solution-case-study-title');
    section.innerHTML = `
      <style>
        .solution-case-study-section { padding: 64px 24px; background: #f7f5ff; }
        .solution-case-study-section__inner { max-width: 1312px; margin: 0 auto; }
        .solution-case-study-section__title { margin: 0 0 28px; color: #1b1b1b; font-size: clamp(28px, 3vw, 40px); }
        .solution-case-study-section__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
        .solution-case-study-section__card { overflow: hidden; border-radius: 16px; background: #fff; box-shadow: 0 4px 20px #1b1b1b12; }
        .solution-case-study-section__hero { display: block; width: 100%; height: 190px; object-fit: cover; }
        .solution-case-study-section__content { padding: 20px; }
        .solution-case-study-section__logo { display: block; width: auto; max-width: 120px; height: 32px; object-fit: contain; object-position: left center; }
        .solution-case-study-section__heading { margin: 16px 0 0; color: #1b1b1b; font-size: 18px; line-height: 1.35; }
        .solution-case-study-section__description { margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6; }
        @media (max-width: 900px) { .solution-case-study-section__grid { grid-template-columns: repeat(2, minmax(240px, 1fr)); } }
        @media (max-width: 600px) {
          .solution-case-study-section { padding: 48px 16px; }
          .solution-case-study-section__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
          .solution-case-study-section__card { flex: 0 0 min(82vw, 360px); scroll-snap-align: start; }
        }
      </style>
      <div class="solution-case-study-section__inner">
        <h2 id="solution-case-study-title" class="solution-case-study-section__title">Customer stories</h2>
        <div class="solution-case-study-section__grid"></div>
      </div>`;
    const grid = section.querySelector<HTMLElement>('.solution-case-study-section__grid');
    if (!grid) {
      console.error(`Unable to create the case-study card list for the ${solution} solution.`);
      return;
    }

    CASE_STUDY_CARDS.forEach((card) => {
      const copy = getSolutionCopy(solution, card.brand);
      const article = document.createElement('article');
      article.className = 'solution-case-study-section__card';
      const image = document.createElement('img');
      image.className = 'solution-case-study-section__hero';
      setImageSource(image, card.image, card.imageAlt);

      const content = document.createElement('div');
      content.className = 'solution-case-study-section__content';
      const logo = document.createElement('img');
      logo.className = 'solution-case-study-section__logo';
      setImageSource(logo, card.logo, BRAND_NAMES[card.brand]);
      const heading = document.createElement('h3');
      heading.className = 'solution-case-study-section__heading';
      heading.textContent = copy.title;
      const description = document.createElement('p');
      description.className = 'solution-case-study-section__description';
      description.textContent = copy.description;
      content.append(logo, heading, description);
      article.append(image, content);
      grid.append(article);
    });

    main.append(section);
    return;
  }

  const existingSlides = wrapper
    ? Array.from(wrapper.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
    : [];
  const template = existingSlides[0];

  if (!template) {
    console.error(`Unable to find the case-study card carousel for the ${solution} solution.`);
    return;
  }

  const slides: HTMLElement[] = [];
  for (const [index, card] of CASE_STUDY_CARDS.entries()) {
    const slide = (existingSlides[index] ?? template).cloneNode(true) as HTMLElement;
    const cardElement = slide.querySelector<HTMLElement>('.MuiCard-root');
    const cardContent = cardElement?.querySelector<HTMLElement>('.MuiCardContent-root');
    const heading = cardContent?.querySelector<HTMLElement>('h3');
    const heroImage = cardElement
      ? Array.from(cardElement.querySelectorAll<HTMLImageElement>('img')).find(
          (image) => !image.closest('.MuiCardContent-root'),
        )
      : undefined;
    const logo = cardContent?.querySelector<HTMLImageElement>('img');

    if (!cardElement || !cardContent || !heading || !heroImage || !logo) {
      console.error(`Unable to prepare the ${card.brand} case-study card for the ${solution} solution.`);
      return;
    }

    const copy = getSolutionCopy(solution, card.brand);
    heading.textContent = copy.title;
    setImageSource(heroImage, card.image, card.imageAlt);
    setImageSource(logo, card.logo, BRAND_NAMES[card.brand]);
    logo.style.filter = 'none';

    const description = cardContent.querySelector<HTMLParagraphElement>(
      '[data-solution-case-study-description]',
    ) ?? cardContent.querySelector<HTMLParagraphElement>('p') ?? document.createElement('p');
    description.dataset.solutionCaseStudyDescription = 'true';
    description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
    description.textContent = copy.description;
    if (!description.parentElement) {
      heading.insertAdjacentElement('afterend', description);
    }

    cardContent.querySelectorAll('p').forEach((paragraph) => {
      if (paragraph !== description) paragraph.remove();
    });

    slides.push(slide);
  }

  wrapper.replaceChildren(...slides);
  disableCaseStudyCardLinks(carousel);
}

export function disableCaseStudyCardLinks(root: ParentNode): void {
  root.querySelectorAll<HTMLAnchorElement>('.swiper-slider-comparison-slider a').forEach((link) => {
    link.removeAttribute('href');
    link.removeAttribute('role');
    link.tabIndex = -1;
    link.setAttribute('aria-disabled', 'true');
    link.style.cursor = 'default';
  });
}

export function updateITCaseStudyContent(root: ParentNode): void {
  const heading = Array.from(root.querySelectorAll<HTMLElement>('.swiper-slider-comparison-slider h3')).find(
    (element) => element.textContent?.includes('Directional Pizza') && element.textContent.includes('scaled payroll'),
  );
  const cardContent = heading?.closest<HTMLElement>('.MuiCardContent-root');
  if (heading && cardContent) {
    heading.textContent = 'Coordinating IT equipment and support across locations';

    let description = cardContent.querySelector<HTMLParagraphElement>('[data-it-case-study-description]');
    if (!description) {
      description = document.createElement('p');
      description.dataset.itCaseStudyDescription = 'true';
      description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
      heading.insertAdjacentElement('afterend', description);
    }
    description.textContent =
      'Bring device requests, employee access, and IT support workflows together to keep teams connected across locations.';
  }

  disableCaseStudyCardLinks(root);
}

export function updateTanishqCaseStudy(root: ParentNode, currentTitle: string, solution: SolutionType): void {
  const heading = Array.from(root.querySelectorAll<HTMLElement>('h3')).find(
    (element) => element.textContent?.trim() === currentTitle,
  );
  if (!heading) return;

  const copy = SOLUTION_CASE_STUDY_COPY[solution].tanishq;
  heading.textContent = copy.title;

  const card = heading.closest<HTMLElement>('.MuiCard-root');
  const cardContent = heading.closest<HTMLElement>('.MuiCardContent-root');
  if (card) {
    const image = Array.from(card.querySelectorAll<HTMLImageElement>('img')).find(
      (element) => !element.closest('.MuiCardContent-root'),
    );
    if (image) {
      image.src = TANISHQ_CASE_STUDY_IMAGE;
      image.removeAttribute('srcset');
      image.alt = 'Tanishq jewellery showroom';
    }

  }

  disableCaseStudyCardLinks(root);

  if (cardContent) {
    let description = cardContent.querySelector<HTMLParagraphElement>('[data-tanishq-case-study-description]');
    if (!description) {
      description = document.createElement('p');
      description.dataset.tanishqCaseStudyDescription = 'true';
      description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
      heading.insertAdjacentElement('afterend', description);
    }
    description.textContent = copy.description;
  }
}

export function updateTitanCaseStudy(root: ParentNode, solution: SolutionType): void {
  const image = root.querySelector<HTMLImageElement>('img[src*="revolut_hero"]');
  const card = image?.closest<HTMLElement>('.MuiCard-root');
  const heading = card?.querySelector<HTMLElement>('h3');
  const cardContent = heading?.closest<HTMLElement>('.MuiCardContent-root');
  if (!image || !card || !heading || !cardContent) return;

  const copy = SOLUTION_CASE_STUDY_COPY[solution].titan;
  heading.textContent = copy.title;
  image.src = TITAN_CASE_STUDY_IMAGE;
  image.removeAttribute('srcset');
  image.alt = 'Titan showroom displaying watches';

  const logo = cardContent.querySelector<HTMLImageElement>('img');
  if (logo) {
    logo.src = '/dechub-assets/titan_logo.png';
    logo.removeAttribute('srcset');
    logo.alt = 'Titan';
    logo.style.filter = 'none';
  }

  let description = cardContent.querySelector<HTMLParagraphElement>('[data-titan-case-study-description]');
  if (!description) {
    description = document.createElement('p');
    description.dataset.titanCaseStudyDescription = 'true';
    description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
    heading.insertAdjacentElement('afterend', description);
  }
  description.textContent = copy.description;

  disableCaseStudyCardLinks(root);
}

export function updateMiaCaseStudy(root: ParentNode, solution: SolutionType): void {
  const logo = root.querySelector<HTMLImageElement>('img[src*="magic_logo"]');
  const card = logo?.closest<HTMLElement>('.MuiCard-root');
  const heading = card?.querySelector<HTMLElement>('h3');
  const cardContent = heading?.closest<HTMLElement>('.MuiCardContent-root');
  if (!logo || !card || !heading || !cardContent) return;

  const image = Array.from(card.querySelectorAll<HTMLImageElement>('img')).find(
    (element) => !element.closest('.MuiCardContent-root'),
  );
  if (image) {
    image.src = MIA_CASE_STUDY_IMAGE;
    image.removeAttribute('srcset');
    image.alt = 'Mia by Tanishq jewellery collection';
  }

  const copy = SOLUTION_CASE_STUDY_COPY[solution].mia;
  heading.textContent = copy.title;
  logo.src = MIA_CASE_STUDY_LOGO;
  logo.removeAttribute('srcset');
  logo.alt = 'Mia by Tanishq';
  logo.style.filter = 'none';

  let description = cardContent.querySelector<HTMLParagraphElement>('[data-mia-case-study-description]');
  if (!description) {
    description = document.createElement('p');
    description.dataset.miaCaseStudyDescription = 'true';
    description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
    heading.insertAdjacentElement('afterend', description);
  }
  description.textContent = copy.description;

  disableCaseStudyCardLinks(root);
}

export function updateFastrackCaseStudy(root: ParentNode, solution: SolutionType): void {
  const logo = root.querySelector<HTMLImageElement>('img[src*="bcglogo"]');
  const card = logo?.closest<HTMLElement>('.MuiCard-root');
  const heading = card?.querySelector<HTMLElement>('h3');
  const cardContent = heading?.closest<HTMLElement>('.MuiCardContent-root');
  if (!logo || !card || !heading || !cardContent) return;

  const image = Array.from(card.querySelectorAll<HTMLImageElement>('img')).find(
    (element) => !element.closest('.MuiCardContent-root'),
  );
  if (image) {
    image.src = FASTRACK_CASE_STUDY_IMAGE;
    image.removeAttribute('srcset');
    image.alt = 'Fastrack brand campaign';
  }

  const copy = SOLUTION_CASE_STUDY_COPY[solution].fastrack;
  heading.textContent = copy.title;
  logo.src = FASTRACK_CASE_STUDY_LOGO;
  logo.removeAttribute('srcset');
  logo.alt = 'Fastrack';
  logo.style.filter = 'none';

  let description = cardContent.querySelector<HTMLParagraphElement>('[data-fastrack-case-study-description]');
  if (!description) {
    description = document.createElement('p');
    description.dataset.fastrackCaseStudyDescription = 'true';
    description.style.cssText = 'margin: 12px 0 0; color: #5d6672; font-size: 14px; line-height: 1.6;';
    heading.insertAdjacentElement('afterend', description);
  }
  description.textContent = copy.description;

  disableCaseStudyCardLinks(root);
}
