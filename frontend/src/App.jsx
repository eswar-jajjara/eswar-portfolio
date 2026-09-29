import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { adminPath, assetUrl } from './site';
import { usePortfolio } from './usePortfolio';
const AdminPage = lazy(() => import('./AdminPage'));

const projectImageSource = assetUrl;

const navItems = [
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'certifications', label: 'Credentials' },
  { id: 'endorsements', label: 'Endorsements' },
];

function setDocumentMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute('content', content);
}

function PortfolioMetadata({ summary }) {
  useEffect(() => {
    if (!summary) return undefined;
    const fullName = summary.fullName || 'Engineering portfolio';
    const title = summary.headline ? `${fullName} | ${summary.headline}` : `${fullName} | Engineering portfolio`;
    const description = summary.intro || summary.bio || 'Engineering portfolio for AI, edge computing, and IoT work.';
    const canonicalUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    const imageSource = projectImageSource('social-preview.jpg');
    const socialImage = new URL(imageSource, window.location.href).href;
    const sameAs = [summary.githubUrl, summary.linkedinUrl].filter(Boolean);
    const person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: fullName,
      jobTitle: summary.headline || undefined,
      description,
      url: canonicalUrl,
      email: summary.email ? `mailto:${summary.email}` : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    };

    Object.keys(person).forEach((key) => person[key] === undefined && delete person[key]);
    document.title = title;
    setDocumentMeta('name', 'description', description);
    setDocumentMeta('property', 'og:title', title);
    setDocumentMeta('property', 'og:description', description);
    setDocumentMeta('property', 'og:url', canonicalUrl);
    setDocumentMeta('property', 'og:image', socialImage);
    setDocumentMeta('name', 'twitter:title', title);
    setDocumentMeta('name', 'twitter:description', description);
    setDocumentMeta('name', 'twitter:image', socialImage);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.append(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const scriptId = 'portfolio-person-schema';
    let structuredData = document.getElementById(scriptId);
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = scriptId;
      structuredData.type = 'application/ld+json';
      document.head.append(structuredData);
    }
    structuredData.textContent = JSON.stringify(person);

    return () => structuredData?.remove();
  }, [summary]);
  return null;
}

function availabilityDetails(status) {
  const statuses = {
    open_to_work: { label: 'Open to engineering opportunities', className: 'is-open' },
    interviewing: { label: 'Interviewing for engineering roles', className: 'is-interviewing' },
    not_looking: { label: 'Not currently looking for a new role', className: 'is-not-looking' },
  };
  return statuses[status] || { label: 'Available for engineering opportunities', className: 'is-open' };
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return <button className="icon-button" type="button" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Use light theme' : 'Use dark theme'} aria-pressed={dark} title={dark ? 'Use light theme' : 'Use dark theme'}><span aria-hidden="true">{dark ? '☀' : '☾'}</span><span className="sr-only">{dark ? 'Use light theme' : 'Use dark theme'}</span></button>;
}

function SectionHeading({ eyebrow, title, children }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState(() => window.location.hash.replace('#', '') || 'projects');
  useEffect(() => {
    const sections = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const updateFromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (navItems.some((item) => item.id === id)) setActiveSection(id);
    };
    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);
    if (!('IntersectionObserver' in window) || !sections.length) return () => window.removeEventListener('hashchange', updateFromHash);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-24% 0px -62% 0px', threshold: [0.12, 0.35, 0.65] });
    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', updateFromHash);
    };
  }, []);
  return activeSection;
}

function Header({ name, resumeUrl, showEndorsements = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const activeSection = useActiveSection();
  const closeMenu = (returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);
  const brandName = name || 'Portfolio';
  const headerNavItems = navItems.filter((item) => item.id !== 'endorsements' || showEndorsements);
  return <header className="site-header" id="top">
    <div className="nav-shell">
      <a className="brand" href="#top" aria-label={`Back to the top of ${brandName}'s portfolio`}><span className="wordmark">{name?.split(' ').map((word) => word[0]).join('').slice(0, 2) || 'EV'}</span><span className="brand-copy"><strong>{brandName}</strong><small>Engineering portfolio</small></span></a>
      <nav id="primary-navigation" className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        {headerNavItems.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? 'is-active' : ''} aria-current={activeSection === item.id ? 'location' : undefined} onClick={() => closeMenu()}>{item.label}</a>)}
        {resumeUrl && <a className="nav-mobile-resume" href={assetUrl(resumeUrl)} download onClick={() => closeMenu()}>Download résumé <span aria-hidden="true">↓</span></a>}
        <a className="nav-mobile-cta" href="#contact" onClick={() => closeMenu()}>Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="header-actions">{resumeUrl && <a className="header-resume" href={assetUrl(resumeUrl)} download>Résumé <span aria-hidden="true">↓</span></a>}<a className="header-cta" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a><ThemeToggle /><button ref={menuButtonRef} className="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span className="menu-toggle-icon" aria-hidden="true"><i /><i /></span><span>{menuOpen ? 'Close' : 'Menu'}</span></button></div>
    </div>
    {menuOpen && <button className="nav-scrim" type="button" aria-label="Close navigation menu" onClick={() => closeMenu(true)} />}
  </header>;
}

function technologiesFrom(techStack) {
  const technologies = (techStack || '').split(',').map((tech) => tech.trim()).filter(Boolean);
  return technologies;
}

function sameTechnology(first, second) {
  return first?.trim().toLowerCase() === second?.trim().toLowerCase();
}

function projectUsesTechnology(project, technology) {
  return technologiesFrom(project.techStack).some((item) => sameTechnology(item, technology));
}

function TechnologyList({ techStack, limit }) {
  const technologies = technologiesFrom(techStack);
  const visibleTechnologies = limit ? technologies.slice(0, limit) : technologies;
  const remainingCount = technologies.length - visibleTechnologies.length;
  return <div className="tech-list">{visibleTechnologies.map((tech) => <span key={tech}>{tech}</span>)}{remainingCount > 0 && <span className="tech-overflow" aria-label={`${remainingCount} additional technologies`}>+{remainingCount} more</span>}</div>;
}

function impactMetricsFrom(value) {
  return (value || '').split(/[|;\n]/).map((metric) => metric.trim()).filter(Boolean).slice(0, 3);
}

function ImpactMetrics({ value }) {
  const metrics = impactMetricsFrom(value);
  if (!metrics.length) return null;
  return <div className="impact-metrics" aria-label="Project impact">
    <span className="impact-label">Impact</span>
    {metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
  </div>;
}

function formatGithubUpdated(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Updated ${new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date)}`;
}

function GithubProof({ proof }) {
  if (!proof) return null;
  const details = [];
  if (proof.stars !== null && proof.stars !== undefined && Number.isFinite(Number(proof.stars))) details.push(`★ ${proof.stars}`);
  if (proof.primaryLanguage) details.push(proof.primaryLanguage);
  const updated = formatGithubUpdated(proof.pushedAt);
  if (updated) details.push(updated);
  if (!details.length) return null;
  return <p className="github-proof" aria-label="Live GitHub project information"><span aria-hidden="true">⌘</span>{details.map((detail) => <b key={detail}>{detail}</b>)}</p>;
}

function projectVisualType(project) {
  const projectText = `${project.title || ''} ${project.techStack || ''}`.toLowerCase();
  if (/animal|vision|detect/.test(projectText)) return 'vision';
  if (/camera|stream|video|django/.test(projectText)) return 'stream';
  return 'platform';
}

function projectLinkLabel(link) {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    return hostname === 'github.com' || hostname === 'www.github.com' ? 'View source' : 'View project';
  } catch {
    return 'View project';
  }
}

function isGithubLink(link) {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    return hostname === 'github.com' || hostname === 'www.github.com';
  } catch {
    return false;
  }
}

function ProjectCard({ project, index, featured = false, active = false, onPreview, githubProof }) {
  const visualType = projectVisualType(project);
  const imageSource = projectImageSource(project.imageUrl);
  return <article className={`project-card ${featured ? 'is-featured' : ''} ${active ? 'is-active' : ''}`}>
    <div className={`project-art project-art--${visualType}`}>
      {imageSource ? <img src={imageSource} alt={`${project.title} project preview`} width="1280" height="853" decoding="async" loading="lazy" /> : <div className="project-topology" aria-hidden="true"><i /><b /><em /></div>}
      <div className="project-art-meta"><span>{String(index + 1).padStart(2, '0')}</span><p>{featured ? 'Featured build' : 'Selected work'}</p></div>
      <span className="project-art-type" aria-hidden="true">{visualType}</span>
    </div>
    <div className="project-content">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ImpactMetrics value={project.impactMetrics} />
      <TechnologyList techStack={project.techStack} limit={4} />
      {isGithubLink(project.link) && <GithubProof proof={githubProof} />}
      <div className="project-actions">
        {onPreview && <button className="project-preview" type="button" aria-pressed={active} aria-controls="project-preview" onClick={() => onPreview(project.id)}>{active ? 'Previewing' : 'Preview'} <span aria-hidden="true">↑</span></button>}
        {project.link && <a className="text-link" href={assetUrl(project.link)} target="_blank" rel="noreferrer">{projectLinkLabel(project.link)} <span aria-hidden="true">↗</span></a>}
      </div>
    </div>
  </article>;
}

function FeaturedProjectSpotlight({ project, featured, projects, onProjectSelect }) {
  if (!project) return null;
  const visualType = projectVisualType(project);
  return <aside className="hero-spotlight" id="project-preview" aria-labelledby="spotlight-title">
    <div className="spotlight-topline"><span><i aria-hidden="true" /> {featured ? 'Featured build' : 'Selected build'}</span><span>{visualType}</span></div>
    <div className="spotlight-visual">{project.imageUrl ? <img src={assetUrl(project.imageUrl)} alt={`${project.title} preview`} width="1280" height="853" fetchPriority="high" decoding="async" /> : <div className="spotlight-grid" />}<span aria-hidden="true">{visualType}</span></div>
    <div className="spotlight-content" key={project.id}>
      <h2 id="spotlight-title">{project.title}</h2>
      <p>{project.description}</p>
      <TechnologyList techStack={project.techStack} limit={3} />
      {project.link && <a className="spotlight-link" href={assetUrl(project.link)} target="_blank" rel="noreferrer">{projectLinkLabel(project.link)} <span aria-hidden="true">↗</span></a>}
      {projects.length > 1 && <div className="spotlight-switcher"><p>Explore projects</p><div role="group" aria-label="Choose a project preview">{projects.map((item, index) => <button key={item.id} className={item.id === project.id ? 'is-active' : ''} type="button" aria-pressed={item.id === project.id} onClick={() => onProjectSelect(item.id)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</div></div>}
    </div>
    <p className="sr-only" aria-live="polite">Project preview: {project.title}</p>
  </aside>;
}

function ProjectExplorer({ technologies, activeTechnology, onSelectTechnology, visibleCount, totalCount }) {
  if (!technologies.length) return null;
  const showingAll = !activeTechnology;
  const visibleLabel = visibleCount === 1 ? 'project' : 'projects';
  return <div className="project-explorer">
    <div className="project-explorer-copy"><p className="eyebrow">Explore the work</p><p>Filter the portfolio by the tools used in each build.</p></div>
    <div className="project-explorer-controls">
      <div className="project-filters" role="group" aria-label="Filter projects by technology">
        <button className={showingAll ? 'is-active' : ''} type="button" aria-pressed={showingAll} onClick={() => onSelectTechnology('')}>All work <span>{totalCount}</span></button>
        {technologies.map((technology) => <button key={technology} className={sameTechnology(activeTechnology, technology) ? 'is-active' : ''} type="button" aria-pressed={sameTechnology(activeTechnology, technology)} onClick={() => onSelectTechnology(technology)}>{technology}</button>)}
      </div>
      <p className="filter-result" role="status" aria-live="polite">{showingAll ? `Showing all ${visibleCount} ${visibleLabel}.` : `Showing ${visibleCount} ${visibleLabel} built with ${activeTechnology}.`}</p>
    </div>
  </div>;
}

function ProofStrip({ projectCount, githubProjectCount, certificationCount, linkedCertificationCount }) {
  const proofItems = [
    githubProjectCount > 0 ? { value: githubProjectCount, label: githubProjectCount === 1 ? 'GitHub-linked project' : 'GitHub-linked projects' } : projectCount > 0 && { value: projectCount, label: projectCount === 1 ? 'selected build' : 'selected builds' },
    linkedCertificationCount > 0 ? { value: linkedCertificationCount, label: linkedCertificationCount === 1 ? 'credential link' : 'credential links' } : certificationCount > 0 && { value: certificationCount, label: certificationCount === 1 ? 'certification' : 'certifications' },
  ].filter(Boolean);
  if (!proofItems.length) return null;
  return <section className="proof-strip shell" aria-label="Portfolio at a glance">
    <p>Portfolio at a glance</p>
    <div className="proof-items">{proofItems.map((item) => <div className="proof-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
  </section>;
}

function EndorsementsSection({ endorsements }) {
  if (!endorsements.length) return null;
  return <section className="shell endorsements-section" id="endorsements">
    <SectionHeading eyebrow="06 / Recommendations" title="Trusted by people who have worked alongside me." />
    <div className="endorsement-list">
      {endorsements.map((endorsement) => <article className="endorsement-card" key={endorsement.id}>
        <span className="endorsement-mark" aria-hidden="true">“</span>
        <blockquote>{endorsement.quote}</blockquote>
        <div className="endorsement-person"><div><strong>{endorsement.name}</strong><p>{endorsement.role}</p></div>{endorsement.link && <a href={assetUrl(endorsement.link)} target="_blank" rel="noreferrer" aria-label={`Open ${endorsement.name}'s profile`}>↗</a>}</div>
      </article>)}
    </div>
  </section>;
}

function deriveSkills(projects) {
  const allSkills = [...new Set(projects.flatMap((project) => (project.techStack || '').split(',').map((item) => item.trim()).filter(Boolean)))];
  const groups = [
    ['AI & ML', ['Python', 'TensorFlow', 'PyTorch', 'OpenCV', 'Scikit-learn', 'ONNX']],
    ['Edge & IoT', ['Raspberry Pi', 'Arduino', 'ESP32', 'MQTT', 'Edge Impulse', 'NVIDIA Jetson']],
    ['Engineering', ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Docker', 'AWS', 'Git']],
  ].map(([title, preferred]) => ({ title, skills: preferred.filter((skill) => allSkills.some((known) => known.toLowerCase() === skill.toLowerCase())) }));
  const used = new Set(groups.flatMap((group) => group.skills));
  const uncategorized = allSkills.filter((skill) => ![...used].some((usedSkill) => usedSkill.toLowerCase() === skill.toLowerCase()));
  if (uncategorized.length) groups.push({ title: 'Additional tools', skills: uncategorized });
  return groups.filter((group) => group.skills.length);
}

function PortfolioLoading() {
  return <main className="loading-shell shell" role="status" aria-live="polite"><div className="loading-nav" /><div className="loading-columns"><div><p className="eyebrow">Engineering portfolio</p><div className="skeleton skeleton-title" /><div className="skeleton skeleton-title short" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><p className="loading-message">Opening the portfolio. This may take a moment on your first visit.</p></div><div className="skeleton skeleton-preview" /></div></main>;
}

function PublicPortfolio({ portfolio, loading, error, reload }) {
  const { summary, projects, experience, certifications, endorsements = [], githubProjects = [] } = portfolio;
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTechnology, setActiveTechnology] = useState('');
  const skillGroups = useMemo(() => deriveSkills(projects), [projects]);
  const featuredProject = useMemo(() => projects.find((project) => project.featured) || projects[0] || null, [projects]);
  const orderedProjects = useMemo(() => featuredProject ? [featuredProject, ...projects.filter((project) => project.id !== featuredProject.id)] : projects, [featuredProject, projects]);
  const availableTechnologies = useMemo(() => {
    const seen = new Set();
    return projects.flatMap((project) => technologiesFrom(project.techStack)).filter((technology) => {
      const key = technology.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [projects]);
  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedProjectId) || featuredProject, [featuredProject, projects, selectedProjectId]);
  const spotlightProjects = useMemo(() => orderedProjects.slice(0, 3), [orderedProjects]);
  const visibleProjects = useMemo(() => activeTechnology ? orderedProjects.filter((project) => projectUsesTechnology(project, activeTechnology)) : orderedProjects, [activeTechnology, orderedProjects]);
  const focusSkills = useMemo(() => skillGroups.flatMap((group) => group.skills).slice(0, 4), [skillGroups]);
  const githubProjectCount = useMemo(() => projects.filter((project) => isGithubLink(project.link)).length, [projects]);
  const linkedCertificationCount = useMemo(() => certifications.filter((certification) => Boolean(certification.link)).length, [certifications]);
  const githubProofByProjectId = useMemo(() => new Map(githubProjects.map((proof) => [String(proof.projectId), proof])), [githubProjects]);
  const availability = availabilityDetails(summary?.availabilityStatus);
  const selectTechnology = (technology) => {
    const nextTechnology = sameTechnology(activeTechnology, technology) ? '' : technology;
    setActiveTechnology(nextTechnology);
    const matchingProject = nextTechnology ? orderedProjects.find((project) => projectUsesTechnology(project, nextTechnology)) : featuredProject;
    if (matchingProject) setSelectedProjectId(matchingProject.id);
  };
  const selectProject = (projectId, returnToPreview = false) => {
    setSelectedProjectId(projectId);
    if (!returnToPreview) return;
    requestAnimationFrame(() => {
      const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      document.getElementById('project-preview')?.scrollIntoView({ behavior, block: 'center' });
    });
  };
  if (loading) return <PortfolioLoading />;
  if (error || !summary) return <main className="status-page" role="alert"><p>The portfolio is taking longer to respond than usual.</p><button className="button" type="button" onClick={reload}>Try again</button></main>;

  return <>
    <PortfolioMetadata summary={summary} />
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Header name={summary.fullName} resumeUrl={assetUrl(summary.resumeUrl)} showEndorsements={endorsements.length > 0} />
    <main id="main-content" tabIndex="-1">
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className={`availability ${availability.className}`}><span /> {availability.label}</p>
          <p className="eyebrow">Based in {summary.location} <span aria-hidden="true">/</span> Engineering portfolio</p>
          <h1 id="hero-title">{summary.fullName.split(' ').slice(0, -1).join(' ')}<span className="name-accent">{summary.fullName.split(' ').at(-1)}<span className="name-dot">.</span></span></h1>
          <p className="hero-role">{summary.headline}</p>
          <p className="hero-intro">{summary.intro}</p>
          {summary.currentlyBuilding && <p className="currently-building"><span>Now</span>{summary.currentlyBuilding}</p>}
          <div className="hero-actions"><a className="button" href="#projects">View selected work <span aria-hidden="true">↓</span></a>{summary.resumeUrl && <a className="ghost-button" href={assetUrl(summary.resumeUrl)} download>Download résumé <span aria-hidden="true">↓</span></a>}{summary.linkedinUrl && <a className="ghost-button" href={summary.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>}{summary.bookingUrl && <a className="text-link hero-contact" href={summary.bookingUrl} target="_blank" rel="noreferrer">Book a call <span aria-hidden="true">↗</span></a>}{summary.email && <a className="text-link hero-contact" href={`mailto:${summary.email}`}>Email me <span aria-hidden="true">↗</span></a>}</div>
        </div>
        <div className="hero-visual"><div className="visual-caption"><span>Ideas → working systems</span><span aria-hidden="true">↗</span></div><FeaturedProjectSpotlight project={selectedProject} featured={Boolean(selectedProject?.featured)} projects={spotlightProjects} onProjectSelect={selectProject} /></div>
      </section>

      <ProofStrip projectCount={projects.length} githubProjectCount={githubProjectCount} certificationCount={certifications.length} linkedCertificationCount={linkedCertificationCount} />

      <section className="shell projects-section" id="projects">
        <SectionHeading eyebrow="01 / Selected work" title="Built to solve. Made to work."><span className="project-count">{activeTechnology ? `${visibleProjects.length} ${visibleProjects.length === 1 ? 'build' : 'builds'} using ${activeTechnology}` : projects.length ? `${projects.length} ${projects.length === 1 ? 'build' : 'builds'} in the portfolio` : 'Projects are managed from the CMS.'}</span></SectionHeading>
        {orderedProjects.length ? <><ProjectExplorer technologies={availableTechnologies} activeTechnology={activeTechnology} onSelectTechnology={selectTechnology} visibleCount={visibleProjects.length} totalCount={projects.length} /><div className="projects-grid">{visibleProjects.map((project, index) => <ProjectCard project={project} index={index} featured={project.id === featuredProject?.id && Boolean(project.featured)} active={project.id === selectedProject?.id} onPreview={(projectId) => selectProject(projectId, true)} githubProof={githubProofByProjectId.get(String(project.id))} key={project.id} />)}</div></> : <p className="empty-collection project-empty">Projects will appear here as they are added in the CMS.</p>}
      </section>

      <section className="shell section-grid" id="about">
        <SectionHeading eyebrow="02 / About" title="Building intelligence where it matters most." />
        <div className="prose"><p>{summary.bio}</p>{focusSkills.length > 0 && <div className="focus-grid" aria-label="Technical focus">{focusSkills.map((skill) => <button key={skill} className={sameTechnology(activeTechnology, skill) ? 'is-active' : ''} type="button" aria-pressed={sameTechnology(activeTechnology, skill)} onClick={() => selectTechnology(skill)}>{skill}<span aria-hidden="true">↗</span></button>)}</div>}</div>
      </section>

      <section className="shell section-grid skills-section" id="skills">
        <SectionHeading eyebrow="03 / Skills" title="A practical stack for intelligent systems." />
        <div className="skill-groups">{skillGroups.length ? skillGroups.map((group) => <article className="skill-group" key={group.title}><h3>{group.title}</h3><div>{group.skills.map((skill) => <button key={skill} className={sameTechnology(activeTechnology, skill) ? 'is-active' : ''} type="button" aria-pressed={sameTechnology(activeTechnology, skill)} onClick={() => selectTechnology(skill)}>{skill}</button>)}</div></article>) : <p className="muted">Skills will appear as projects are added.</p>}</div>
      </section>

      <section className="shell section-grid experience-section" id="experience">
        <SectionHeading eyebrow="04 / Experience" title="Learning by shipping." />
        {experience.length ? <div className="timeline">{experience.map((item) => <article className="timeline-item" key={item.id}><p className="date">{item.startDate}{item.endDate ? ` — ${item.endDate}` : ''}</p><div><h3>{item.role}</h3><p className="company">{item.company}</p><p>{item.description}</p></div></article>)}</div> : <p className="empty-collection">Experience entries will appear here as they are added in the CMS.</p>}
      </section>

      <section className="shell certifications-section" id="certifications">
        <SectionHeading eyebrow="05 / Certifications" title="Formal learning, applied with intent." />
        <div className="certification-list">{certifications.length ? certifications.map((certification) => <article key={certification.id}><div><p className="date">{certification.issuedDate}</p><h3>{certification.name}</h3><p>{certification.issuer}</p></div>{certification.link && <a href={assetUrl(certification.link)} target="_blank" rel="noreferrer" aria-label={`Open ${certification.name}`}>↗</a>}</article>) : <p className="empty-collection">Verified credentials can be added from the protected CMS.</p>}</div>
      </section>

      <EndorsementsSection endorsements={endorsements} />

      <section className="contact shell" id="contact"><p className="eyebrow">{endorsements.length ? '07' : '06'} / Contact</p><h2>Let’s build something that works beyond the cloud.</h2>{summary.email && <a href={`mailto:${summary.email}`}>{summary.email}</a>}<div className="contact-links">{summary.resumeUrl && <a href={assetUrl(summary.resumeUrl)} download>Download résumé</a>}{summary.bookingUrl && <a href={summary.bookingUrl} target="_blank" rel="noreferrer">Book a call</a>}{summary.linkedinUrl && <a href={summary.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}{summary.githubUrl && <a href={summary.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}</div></section>
    </main>
    <footer className="shell"><span>© {new Date().getFullYear()} {summary.fullName}</span></footer>
  </>;
}

export default function App() {
  const normalizePath = (value) => value.length > 1 ? value.replace(/[/]+$/, '') : value;
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const { portfolio, loading, error, reload } = usePortfolio(path !== adminPath);
  useEffect(() => { const onPopState = () => setPath(normalizePath(window.location.pathname)); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState); }, []);
  return path === adminPath ? <Suspense fallback={<PortfolioLoading />}><AdminPage /></Suspense> : <PublicPortfolio portfolio={portfolio} loading={loading} error={error} reload={reload} />;
}
