type SolutionPageContent = {
  title: string;
  heroTitle: string;
  heroDescription: string;
  optionPrompt: string;
  options: string[];
};

const PAGE_CONTENT: Record<'hire' | 'mobility' | 'embedded' | 'services', SolutionPageContent> = {
  hire: {
    title: 'Dechub-Bridge Hire | Project Team Delivery',
    heroTitle: 'Build the right delivery team for every project',
    heroDescription:
      'Dechub-Bridge helps you assemble a vetted specialist or a complete delivery team for your client project.',
    optionPrompt: 'What do you need for your project?',
    options: [
      'Find a specialist',
      'Build a delivery team',
      'Review shortlisted profiles',
      'Create a project contract',
      'Track project delivery',
    ],
  },
  mobility: {
    title: 'Dechub-Bridge Mobility | Project Delivery Tracking',
    heroTitle: 'Keep every delivery project moving',
    heroDescription:
      'Give your company, delivery team, and Dechub-Bridge admins one clear place to track project work and progress.',
    optionPrompt: 'What would you like to manage?',
    options: ['Project progress', 'Delivery tasks', 'Team access', 'Project updates', 'Payment status'],
  },
  embedded: {
    title: 'Dechub-Bridge Embedded | Connected Delivery Workspace',
    heroTitle: 'Bring project delivery into your workflow',
    heroDescription:
      'Connect client requests, contracts, delivery teams, tasks, and project updates in one Dechub-Bridge workspace.',
    optionPrompt: 'What would you like to connect?',
    options: ['Client requests', 'Project contracts', 'Delivery tasks', 'Project notifications', 'Payment updates'],
  },
  services: {
    title: 'Dechub-Bridge Services | Managed Project Delivery',
    heroTitle: 'Delivery support from project brief to completion',
    heroDescription:
      'Our Dechub-Bridge team helps you set up the right team, contract, project workflow, and delivery plan.',
    optionPrompt: 'How can Dechub-Bridge support your project?',
    options: [
      'Build a delivery team',
      'Set up the project',
      'Coordinate project delivery',
      'Support contracts',
      'Support payment completion',
    ],
  },
};

function replaceText(text: string, replacements: ReadonlyArray<readonly [string, string]>) {
  return replacements.reduce((updatedText, [from, to]) => updatedText.split(from).join(to), text);
}

function normalizeLabel(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Rebrands generated solution content without changing its imported visual layout. */
export function applySolutionPageContent(
  root: HTMLElement,
  page: keyof typeof PAGE_CONTENT,
) {
  const content = PAGE_CONTENT[page];
  const genericReplacements: ReadonlyArray<readonly [string, string]> = [
    ['Book a demo', 'Discuss your project'],
    ['Deel Services', 'Dechub-Bridge Services'],
    ['Deel Embedded', 'Dechub-Bridge Embedded'],
    ['Deel Mobility', 'Dechub-Bridge Mobility'],
    ['Deel Hire', 'Dechub-Bridge Hire'],
    ['Deel', 'Dechub-Bridge'],
  ];

  const hero = root.querySelector('main h1');
  if (hero) {
    hero.textContent = content.heroTitle;
    const description = hero.parentElement?.querySelector('p');
    if (description) {
      description.textContent = content.heroDescription;
    }
  }

  const heroSection = hero?.closest('section');
  const optionGroup = heroSection?.querySelector<HTMLElement>('[role="group"][aria-label]');
  const options: HTMLElement[] = [];
  if (optionGroup) {
    heroSection?.classList.add('dechub-bridge-solution-hero');
    optionGroup.setAttribute('aria-label', content.optionPrompt);
    optionGroup.querySelectorAll<HTMLElement>('[role="checkbox"]').forEach((option, index) => {
      const label = content.options[index];
      if (!label) {
        return;
      }

      option.setAttribute('aria-label', label);
      const text = option.lastElementChild;
      if (text) {
        text.textContent = label;
      }
      const indicator = option.querySelector<HTMLElement>('span[aria-hidden="true"]');
      indicator?.classList.add('dechub-bridge-hero-option-check');
      options.push(option);
    });
  }

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!node.parentElement?.closest('.solution-footer-banner')) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const original = textNode.textContent ?? '';
    const next = replaceText(original, genericReplacements);
    if (next !== original) {
      textNode.textContent = next;
    }
  });

  const hireDemoActions: HTMLElement[] = [];
  if (page === 'hire') {
    root.querySelectorAll<HTMLElement>('button, a').forEach((action) => {
      const label = normalizeLabel(action.textContent);
      if (label === 'book a demo' || label === 'discuss your project') {
        action.setAttribute('data-demo-trigger', 'true');
        hireDemoActions.push(action);
      }
    });
  }

  const callToAction = Array.from(heroSection?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
    (button) => normalizeLabel(button.textContent) === 'discuss your project',
  );
  const selectedOptions = new Set<string>();

  const syncOptionState = (option: HTMLElement, isSelected: boolean) => {
    const label = option.getAttribute('aria-label') ?? '';
    option.setAttribute('aria-checked', String(isSelected));

    if (isSelected) {
      selectedOptions.add(label);
    } else {
      selectedOptions.delete(label);
    }
  };

  const syncCallToAction = () => {
    if (!callToAction) {
      return;
    }

    callToAction.setAttribute('data-demo-trigger', 'true');
    callToAction.setAttribute('data-requested-services', JSON.stringify(Array.from(selectedOptions)));
  };

  const optionHandlers = options.map((option) => {
    syncOptionState(option, option.getAttribute('aria-checked') === 'true');
    const handleOptionClick = () => {
      syncOptionState(option, option.getAttribute('aria-checked') !== 'true');
      syncCallToAction();
    };
    option.addEventListener('click', handleOptionClick);
    return () => option.removeEventListener('click', handleOptionClick);
  });
  syncCallToAction();

  const hireDemoHandlers = hireDemoActions.map((action) => {
    const handleDemoClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      const requestedServices = action.getAttribute('data-requested-services');
      let services: string[] = [];
      if (requestedServices) {
        try {
          const parsed = JSON.parse(requestedServices);
          services = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
        } catch {
          services = [];
        }
      }

      window.dispatchEvent(
        new CustomEvent('dechub:open-talent-request-modal', { detail: { services } }),
      );
    };

    action.addEventListener('click', handleDemoClick);
    return () => action.removeEventListener('click', handleDemoClick);
  });

  const resetOptions = () => {
    selectedOptions.clear();
    options.forEach((option) => syncOptionState(option, false));
    syncCallToAction();
  };

  window.addEventListener('dechub:talent-request-submitted', resetOptions);

  return () => {
    optionHandlers.forEach((dispose) => dispose());
    hireDemoHandlers.forEach((dispose) => dispose());
    window.removeEventListener('dechub:talent-request-submitted', resetOptions);
    heroSection?.classList.remove('dechub-bridge-solution-hero');
  };
}
import './solutionPageContent.css';
