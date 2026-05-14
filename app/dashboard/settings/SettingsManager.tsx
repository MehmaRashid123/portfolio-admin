'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import TagInput from '@/components/ui/TagInput';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavLink { label: string; href: string; order: number }
interface Stat { value: string; label: string }
interface FAQ { question: string; answer: string }
interface FooterLink { label: string; href: string }
interface Value { title: string; description: string }

interface SiteSettings {
  siteName: string;
  logoText: string;
  logoDotColor: string;
  faviconUrl: string;
  navbar: { links: NavLink[]; ctaLabel: string; ctaLink: string };
  hero: { headline: string; headlineLine2: string; subheadline: string; cta1Label: string; cta1Link: string; cta2Label: string; cta2Link: string; showreelUrl: string; scrollText: string };
  marquee: { items: string[]; speed: number };
  featuredWork: { heading: string; subheading: string; ctaLabel: string; ctaLink: string };
  servicesSection: { heading: string; subheading: string };
  stats: Stat[];
  aboutTeaser: { heading: string; body: string; ctaLabel: string; ctaLink: string; image: { url: string; publicId: string } | null };
  testimonialsSection: { heading: string; subheading: string };
  ctaBanner: { heading: string; subheading: string; buttonLabel: string; buttonLink: string };
  footer: { tagline: string; links: FooterLink[]; socials: { instagram: string; behance: string; linkedin: string; dribbble: string; twitter: string }; copyrightText: string };
  workPage: { heading: string; subheading: string; filterLabels: { all: string; graphic: string; web: string; threeD: string } };
  servicesPage: { heading: string; subheading: string; faqHeading: string; faqs: FAQ[] };
  about: { heroHeading: string; heroSubheading: string; story: string; mission: string; foundedYear: string; heroImage: { url: string; publicId: string } | null; values: Value[]; toolsLabel: string; tools: string[] };
  contact: { heading: string; subheading: string; email: string; whatsapp: string; location: string; instagram: string; behance: string; linkedin: string; formSuccessMessage: string; serviceOptions: string[]; budgetOptions: string[] };
  blogPage: { heading: string; subheading: string };
  seo: { siteTitle: string; metaDescription: string; ogImage: string; twitterHandle: string };
  frontendUrl: string;
}

const DEFAULT: SiteSettings = {
  siteName: '', logoText: '', logoDotColor: '#FF4D00', faviconUrl: '',
  navbar: { links: [], ctaLabel: '', ctaLink: '' },
  hero: { headline: '', headlineLine2: '', subheadline: '', cta1Label: '', cta1Link: '', cta2Label: '', cta2Link: '', showreelUrl: '', scrollText: '' },
  marquee: { items: [], speed: 40 },
  featuredWork: { heading: '', subheading: '', ctaLabel: '', ctaLink: '' },
  servicesSection: { heading: '', subheading: '' },
  stats: [],
  aboutTeaser: { heading: '', body: '', ctaLabel: '', ctaLink: '', image: null },
  testimonialsSection: { heading: '', subheading: '' },
  ctaBanner: { heading: '', subheading: '', buttonLabel: '', buttonLink: '' },
  footer: { tagline: '', links: [], socials: { instagram: '', behance: '', linkedin: '', dribbble: '', twitter: '' }, copyrightText: '' },
  workPage: { heading: '', subheading: '', filterLabels: { all: '', graphic: '', web: '', threeD: '' } },
  servicesPage: { heading: '', subheading: '', faqHeading: '', faqs: [] },
  about: { heroHeading: '', heroSubheading: '', story: '', mission: '', foundedYear: '', heroImage: null, values: [], toolsLabel: '', tools: [] },
  contact: { heading: '', subheading: '', email: '', whatsapp: '', location: '', instagram: '', behance: '', linkedin: '', formSuccessMessage: '', serviceOptions: [], budgetOptions: [] },
  blogPage: { heading: '', subheading: '' },
  seo: { siteTitle: '', metaDescription: '', ogImage: '', twitterHandle: '' },
  frontendUrl: '',
};

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, id, open, onToggle, children }: { title: string; id: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
      <button type="button" onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors">
        <span className="font-clash font-semibold">{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4 border-t border-[var(--border)] pt-5">{children}</div>}
    </div>
  );
}
export default function SettingsManager() {
  const { toast } = useToast();
  const [s, setS] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [open, setOpen] = useState<string>('siteGlobal');

  const toggle = (id: string) => setOpen(prev => prev === id ? '' : id);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success) setS(prev => ({ ...prev, ...data.data }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('Saved ' + key + ' \u2713', 'success');
    } catch { toast('Failed to save', 'error'); }
    finally { setSaving(null); }
  };

  const u = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const uNested = <K extends keyof SiteSettings>(key: K, field: string, val: unknown) =>
    setS(prev => ({ ...prev, [key]: { ...(prev[key] as object), [field]: val } }));

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader title="Settings" description="Control every piece of content on the public site" />
      <div className="space-y-4 max-w-3xl">

        {/* ── Site Global ── */}
        <Section title="Site Global" id="siteGlobal" open={open === 'siteGlobal'} onToggle={toggle}>
          <Input label="Site Name" value={s.siteName} onChange={e => u('siteName', e.target.value)} placeholder="ZENDXB TechHub" />
          <Input label="Logo Text" value={s.logoText} onChange={e => u('logoText', e.target.value)} placeholder="ZENDXB" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Logo Dot Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={s.logoDotColor || '#FF4D00'} onChange={e => u('logoDotColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border border-[#333]" />
              <Input value={s.logoDotColor} onChange={e => u('logoDotColor', e.target.value)} placeholder="#FF4D00" className="flex-1" />
            </div>
          </div>
          <Input label="Favicon URL" value={s.faviconUrl} onChange={e => u('faviconUrl', e.target.value)} placeholder="https://..." />
          <Button variant="primary" loading={saving === 'siteGlobal'} onClick={() => { save('siteName', s.siteName); save('logoText', s.logoText); save('logoDotColor', s.logoDotColor); save('faviconUrl', s.faviconUrl); }}>Save Site Global</Button>
        </Section>

        {/* ── Navbar ── */}
        <Section title="Navbar" id="navbar" open={open === 'navbar'} onToggle={toggle}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Nav Links</label>
            {s.navbar.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                <Input value={link.label} onChange={e => { const links = [...s.navbar.links]; links[i] = { ...links[i], label: e.target.value }; uNested('navbar', 'links', links); }} placeholder="Label" className="flex-1" />
                <Input value={link.href} onChange={e => { const links = [...s.navbar.links]; links[i] = { ...links[i], href: e.target.value }; uNested('navbar', 'links', links); }} placeholder="/path" className="flex-1" />
                <button onClick={() => { const links = s.navbar.links.filter((_, j) => j !== i); uNested('navbar', 'links', links); }} className="text-[var(--danger)] hover:opacity-70 p-1" aria-label="Remove link"><Trash2 size={14} /></button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => uNested('navbar', 'links', [...s.navbar.links, { label: '', href: '', order: s.navbar.links.length }])}>Add Link</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Label" value={s.navbar.ctaLabel} onChange={e => uNested('navbar', 'ctaLabel', e.target.value)} placeholder="Get a Quote" />
            <Input label="CTA Link" value={s.navbar.ctaLink} onChange={e => uNested('navbar', 'ctaLink', e.target.value)} placeholder="/contact" />
          </div>
          <Button variant="primary" loading={saving === 'navbar'} onClick={() => save('navbar', s.navbar)}>Save Navbar</Button>
        </Section>

        {/* ── Hero ── */}
        <Section title="Hero Section" id="hero" open={open === 'hero'} onToggle={toggle}>
          <Input label="Headline" value={s.hero.headline} onChange={e => uNested('hero', 'headline', e.target.value)} placeholder="WE BUILD THINGS THAT MOVE" />
          <Input label="Headline Line 2 (optional)" value={s.hero.headlineLine2} onChange={e => uNested('hero', 'headlineLine2', e.target.value)} />
          <Textarea label="Subheadline" value={s.hero.subheadline} onChange={e => uNested('hero', 'subheadline', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA 1 Label" value={s.hero.cta1Label} onChange={e => uNested('hero', 'cta1Label', e.target.value)} placeholder="View Our Work" />
            <Input label="CTA 1 Link" value={s.hero.cta1Link} onChange={e => uNested('hero', 'cta1Link', e.target.value)} placeholder="/work" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA 2 Label" value={s.hero.cta2Label} onChange={e => uNested('hero', 'cta2Label', e.target.value)} placeholder="Get a Quote" />
            <Input label="CTA 2 Link" value={s.hero.cta2Link} onChange={e => uNested('hero', 'cta2Link', e.target.value)} placeholder="/contact" />
          </div>
          <Input label="Showreel / BG Video URL" value={s.hero.showreelUrl} onChange={e => uNested('hero', 'showreelUrl', e.target.value)} placeholder="https://..." />
          <Input label="Scroll Indicator Text" value={s.hero.scrollText} onChange={e => uNested('hero', 'scrollText', e.target.value)} placeholder="Scroll" />
          <Button variant="primary" loading={saving === 'hero'} onClick={() => save('hero', s.hero)}>Save Hero</Button>
        </Section>

        {/* ── Marquee ── */}
        <Section title="Marquee / Ticker" id="marquee" open={open === 'marquee'} onToggle={toggle}>
          <TagInput label="Ticker Items (press Enter to add)" value={s.marquee.items} onChange={val => uNested('marquee', 'items', val)} placeholder="GRAPHIC DESIGN" />
          <Input label="Speed (px/s, default 40)" type="number" value={String(s.marquee.speed || 40)} onChange={e => uNested('marquee', 'speed', Number(e.target.value))} />
          <Button variant="primary" loading={saving === 'marquee'} onClick={() => save('marquee', s.marquee)}>Save Marquee</Button>
        </Section>

        {/* ── Featured Work ── */}
        <Section title="Featured Work Section" id="featuredWork" open={open === 'featuredWork'} onToggle={toggle}>
          <Input label="Heading" value={s.featuredWork.heading} onChange={e => uNested('featuredWork', 'heading', e.target.value)} placeholder="Selected Work" />
          <Input label="Subheading" value={s.featuredWork.subheading} onChange={e => uNested('featuredWork', 'subheading', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Label" value={s.featuredWork.ctaLabel} onChange={e => uNested('featuredWork', 'ctaLabel', e.target.value)} placeholder="View All Work" />
            <Input label="CTA Link" value={s.featuredWork.ctaLink} onChange={e => uNested('featuredWork', 'ctaLink', e.target.value)} placeholder="/work" />
          </div>
          <Button variant="primary" loading={saving === 'featuredWork'} onClick={() => save('featuredWork', s.featuredWork)}>Save</Button>
        </Section>

        {/* ── Services Section ── */}
        <Section title="Services Section (Homepage)" id="servicesSection" open={open === 'servicesSection'} onToggle={toggle}>
          <Input label="Heading" value={s.servicesSection.heading} onChange={e => uNested('servicesSection', 'heading', e.target.value)} placeholder="What We Do" />
          <Input label="Subheading" value={s.servicesSection.subheading} onChange={e => uNested('servicesSection', 'subheading', e.target.value)} />
          <Button variant="primary" loading={saving === 'servicesSection'} onClick={() => save('servicesSection', s.servicesSection)}>Save</Button>
        </Section>

        {/* ── Stats ── */}
        <Section title="Stats Strip" id="stats" open={open === 'stats'} onToggle={toggle}>
          <div className="space-y-2">
            {s.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={stat.value} onChange={e => { const stats = [...s.stats]; stats[i] = { ...stats[i], value: e.target.value }; u('stats', stats); }} placeholder="50+" className="w-24" />
                <Input value={stat.label} onChange={e => { const stats = [...s.stats]; stats[i] = { ...stats[i], label: e.target.value }; u('stats', stats); }} placeholder="Projects" className="flex-1" />
                <button onClick={() => u('stats', s.stats.filter((_, j) => j !== i))} className="text-[var(--danger)] p-1" aria-label="Remove stat"><Trash2 size={14} /></button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => u('stats', [...s.stats, { value: '', label: '' }])}>Add Stat</Button>
          </div>
          <Button variant="primary" loading={saving === 'stats'} onClick={() => save('stats', s.stats)}>Save Stats</Button>
        </Section>

        {/* ── About Teaser ── */}
        <Section title="About Teaser (Homepage)" id="aboutTeaser" open={open === 'aboutTeaser'} onToggle={toggle}>
          <Input label="Heading" value={s.aboutTeaser.heading} onChange={e => uNested('aboutTeaser', 'heading', e.target.value)} placeholder="We Are [Agency]" />
          <Textarea label="Body Text" value={s.aboutTeaser.body} onChange={e => uNested('aboutTeaser', 'body', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Label" value={s.aboutTeaser.ctaLabel} onChange={e => uNested('aboutTeaser', 'ctaLabel', e.target.value)} placeholder="About Us" />
            <Input label="CTA Link" value={s.aboutTeaser.ctaLink} onChange={e => uNested('aboutTeaser', 'ctaLink', e.target.value)} placeholder="/about" />
          </div>
          <FileUpload label="Teaser Image" value={s.aboutTeaser.image} onChange={val => uNested('aboutTeaser', 'image', val)} />
          <Button variant="primary" loading={saving === 'aboutTeaser'} onClick={() => save('aboutTeaser', s.aboutTeaser)}>Save</Button>
        </Section>

        {/* ── Testimonials Section ── */}
        <Section title="Testimonials Section" id="testimonialsSection" open={open === 'testimonialsSection'} onToggle={toggle}>
          <Input label="Heading" value={s.testimonialsSection.heading} onChange={e => uNested('testimonialsSection', 'heading', e.target.value)} placeholder="What Clients Say" />
          <Input label="Subheading" value={s.testimonialsSection.subheading} onChange={e => uNested('testimonialsSection', 'subheading', e.target.value)} />
          <Button variant="primary" loading={saving === 'testimonialsSection'} onClick={() => save('testimonialsSection', s.testimonialsSection)}>Save</Button>
        </Section>

        {/* ── CTA Banner ── */}
        <Section title="CTA Banner" id="ctaBanner" open={open === 'ctaBanner'} onToggle={toggle}>
          <Input label="Heading" value={s.ctaBanner.heading} onChange={e => uNested('ctaBanner', 'heading', e.target.value)} placeholder="Ready to build something?" />
          <Input label="Subheading" value={s.ctaBanner.subheading} onChange={e => uNested('ctaBanner', 'subheading', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Button Label" value={s.ctaBanner.buttonLabel} onChange={e => uNested('ctaBanner', 'buttonLabel', e.target.value)} placeholder="Start a Project" />
            <Input label="Button Link" value={s.ctaBanner.buttonLink} onChange={e => uNested('ctaBanner', 'buttonLink', e.target.value)} placeholder="/contact" />
          </div>
          <Button variant="primary" loading={saving === 'ctaBanner'} onClick={() => save('ctaBanner', s.ctaBanner)}>Save</Button>
        </Section>

        {/* ── Footer ── */}
        <Section title="Footer" id="footer" open={open === 'footer'} onToggle={toggle}>
          <Input label="Tagline" value={s.footer.tagline} onChange={e => uNested('footer', 'tagline', e.target.value)} placeholder="We build things that move." />
          <Input label="Copyright Text" value={s.footer.copyrightText} onChange={e => uNested('footer', 'copyrightText', e.target.value)} placeholder="© 2025 Agency Name" />
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Footer Links</label>
            {s.footer.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={link.label} onChange={e => { const links = [...s.footer.links]; links[i] = { ...links[i], label: e.target.value }; uNested('footer', 'links', links); }} placeholder="Label" className="flex-1" />
                <Input value={link.href} onChange={e => { const links = [...s.footer.links]; links[i] = { ...links[i], href: e.target.value }; uNested('footer', 'links', links); }} placeholder="/path" className="flex-1" />
                <button onClick={() => uNested('footer', 'links', s.footer.links.filter((_, j) => j !== i))} className="text-[var(--danger)] p-1" aria-label="Remove"><Trash2 size={14} /></button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => uNested('footer', 'links', [...s.footer.links, { label: '', href: '' }])}>Add Link</Button>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Socials</label>
            <div className="grid grid-cols-2 gap-3">
              {(['instagram','behance','linkedin','dribbble','twitter'] as const).map(k => (
                <Input key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} value={s.footer.socials[k]} onChange={e => uNested('footer', 'socials', { ...s.footer.socials, [k]: e.target.value })} placeholder="https://..." />
              ))}
            </div>
          </div>
          <Button variant="primary" loading={saving === 'footer'} onClick={() => save('footer', s.footer)}>Save Footer</Button>
        </Section>

        {/* ── Work Page ── */}
        <Section title="Work Page" id="workPage" open={open === 'workPage'} onToggle={toggle}>
          <Input label="Page Heading" value={s.workPage.heading} onChange={e => uNested('workPage', 'heading', e.target.value)} placeholder="Our Work" />
          <Input label="Subheading" value={s.workPage.subheading} onChange={e => uNested('workPage', 'subheading', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Filter: All" value={s.workPage.filterLabels.all} onChange={e => uNested('workPage', 'filterLabels', { ...s.workPage.filterLabels, all: e.target.value })} placeholder="All" />
            <Input label="Filter: Graphic" value={s.workPage.filterLabels.graphic} onChange={e => uNested('workPage', 'filterLabels', { ...s.workPage.filterLabels, graphic: e.target.value })} placeholder="Graphic Design" />
            <Input label="Filter: Web" value={s.workPage.filterLabels.web} onChange={e => uNested('workPage', 'filterLabels', { ...s.workPage.filterLabels, web: e.target.value })} placeholder="Web Development" />
            <Input label="Filter: 3D" value={s.workPage.filterLabels.threeD} onChange={e => uNested('workPage', 'filterLabels', { ...s.workPage.filterLabels, threeD: e.target.value })} placeholder="3D Art" />
          </div>
          <Button variant="primary" loading={saving === 'workPage'} onClick={() => save('workPage', s.workPage)}>Save</Button>
        </Section>

        {/* ── Services Page ── */}
        <Section title="Services Page" id="servicesPage" open={open === 'servicesPage'} onToggle={toggle}>
          <Input label="Page Heading" value={s.servicesPage.heading} onChange={e => uNested('servicesPage', 'heading', e.target.value)} placeholder="Services & Pricing" />
          <Input label="Subheading" value={s.servicesPage.subheading} onChange={e => uNested('servicesPage', 'subheading', e.target.value)} />
          <Input label="FAQ Section Heading" value={s.servicesPage.faqHeading} onChange={e => uNested('servicesPage', 'faqHeading', e.target.value)} placeholder="FAQ" />
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">FAQs</label>
            {s.servicesPage.faqs.map((faq, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">FAQ {i + 1}</span>
                  <button onClick={() => uNested('servicesPage', 'faqs', s.servicesPage.faqs.filter((_, j) => j !== i))} className="text-[var(--danger)] p-1" aria-label="Remove FAQ"><Trash2 size={12} /></button>
                </div>
                <Input value={faq.question} onChange={e => { const faqs = [...s.servicesPage.faqs]; faqs[i] = { ...faqs[i], question: e.target.value }; uNested('servicesPage', 'faqs', faqs); }} placeholder="Question..." />
                <Textarea value={faq.answer} onChange={e => { const faqs = [...s.servicesPage.faqs]; faqs[i] = { ...faqs[i], answer: e.target.value }; uNested('servicesPage', 'faqs', faqs); }} placeholder="Answer..." />
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => uNested('servicesPage', 'faqs', [...s.servicesPage.faqs, { question: '', answer: '' }])}>Add FAQ</Button>
          </div>
          <Button variant="primary" loading={saving === 'servicesPage'} onClick={() => save('servicesPage', s.servicesPage)}>Save</Button>
        </Section>

        {/* ── About Page ── */}
        <Section title="About Page" id="about" open={open === 'about'} onToggle={toggle}>
          <Input label="Hero Heading" value={s.about.heroHeading} onChange={e => uNested('about', 'heroHeading', e.target.value)} placeholder="We Are [Agency]" />
          <Textarea label="Hero Subheading" value={s.about.heroSubheading} onChange={e => uNested('about', 'heroSubheading', e.target.value)} />
          <Textarea label="Story" value={s.about.story} onChange={e => uNested('about', 'story', e.target.value)} />
          <Textarea label="Mission Statement" value={s.about.mission} onChange={e => uNested('about', 'mission', e.target.value)} />
          <Input label="Founded Year" value={s.about.foundedYear} onChange={e => uNested('about', 'foundedYear', e.target.value)} placeholder="2021" />
          <FileUpload label="Hero Image" value={s.about.heroImage} onChange={val => uNested('about', 'heroImage', val)} />
          <div className="space-y-3">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Values</label>
            {s.about.values.map((v, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Value {i + 1}</span>
                  <button onClick={() => uNested('about', 'values', s.about.values.filter((_, j) => j !== i))} className="text-[var(--danger)] p-1" aria-label="Remove value"><Trash2 size={12} /></button>
                </div>
                <Input value={v.title} onChange={e => { const vals = [...s.about.values]; vals[i] = { ...vals[i], title: e.target.value }; uNested('about', 'values', vals); }} placeholder="Value title" />
                <Textarea value={v.description} onChange={e => { const vals = [...s.about.values]; vals[i] = { ...vals[i], description: e.target.value }; uNested('about', 'values', vals); }} placeholder="Description" />
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => uNested('about', 'values', [...s.about.values, { title: '', description: '' }])}>Add Value</Button>
          </div>
          <Input label="Tools Section Label" value={s.about.toolsLabel} onChange={e => uNested('about', 'toolsLabel', e.target.value)} placeholder="Tools & Tech" />
          <TagInput label="Tools (press Enter to add)" value={s.about.tools} onChange={val => uNested('about', 'tools', val)} placeholder="Next.js" />
          <Button variant="primary" loading={saving === 'about'} onClick={() => save('about', s.about)}>Save About Page</Button>
        </Section>

        {/* ── Contact Page ── */}
        <Section title="Contact Page" id="contact" open={open === 'contact'} onToggle={toggle}>
          <Input label="Page Heading" value={s.contact.heading} onChange={e => uNested('contact', 'heading', e.target.value)} placeholder="Let's Build Something" />
          <Textarea label="Subheading" value={s.contact.subheading} onChange={e => uNested('contact', 'subheading', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" value={s.contact.email} onChange={e => uNested('contact', 'email', e.target.value)} placeholder="hello@agency.com" />
            <Input label="WhatsApp" value={s.contact.whatsapp} onChange={e => uNested('contact', 'whatsapp', e.target.value)} placeholder="+1234567890" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={s.contact.location} onChange={e => uNested('contact', 'location', e.target.value)} placeholder="Berlin, Germany" />
            <Input label="Instagram URL" value={s.contact.instagram} onChange={e => uNested('contact', 'instagram', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Behance URL" value={s.contact.behance} onChange={e => uNested('contact', 'behance', e.target.value)} />
            <Input label="LinkedIn URL" value={s.contact.linkedin} onChange={e => uNested('contact', 'linkedin', e.target.value)} />
          </div>
          <Input label="Form Success Message" value={s.contact.formSuccessMessage} onChange={e => uNested('contact', 'formSuccessMessage', e.target.value)} placeholder="We'll get back to you within 24 hours." />
          <TagInput label="Service Options (form dropdown)" value={s.contact.serviceOptions} onChange={val => uNested('contact', 'serviceOptions', val)} placeholder="Graphic Design" />
          <TagInput label="Budget Options (form dropdown)" value={s.contact.budgetOptions} onChange={val => uNested('contact', 'budgetOptions', val)} placeholder="Under $5,000" />
          <Button variant="primary" loading={saving === 'contact'} onClick={() => save('contact', s.contact)}>Save Contact</Button>
        </Section>

        {/* ── Blog Page ── */}
        <Section title="Blog Page" id="blogPage" open={open === 'blogPage'} onToggle={toggle}>
          <Input label="Page Heading" value={s.blogPage.heading} onChange={e => uNested('blogPage', 'heading', e.target.value)} placeholder="Blog" />
          <Input label="Subheading" value={s.blogPage.subheading} onChange={e => uNested('blogPage', 'subheading', e.target.value)} />
          <Button variant="primary" loading={saving === 'blogPage'} onClick={() => save('blogPage', s.blogPage)}>Save</Button>
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO Defaults" id="seo" open={open === 'seo'} onToggle={toggle}>
          <Input label="Site Title" value={s.seo.siteTitle} onChange={e => uNested('seo', 'siteTitle', e.target.value)} placeholder="Agency — Creative Studio" />
          <Textarea label="Meta Description" value={s.seo.metaDescription} onChange={e => uNested('seo', 'metaDescription', e.target.value)} />
          <Input label="OG Image URL" value={s.seo.ogImage} onChange={e => uNested('seo', 'ogImage', e.target.value)} />
          <Input label="Twitter Handle" value={s.seo.twitterHandle} onChange={e => uNested('seo', 'twitterHandle', e.target.value)} placeholder="@agency" />
          <Button variant="primary" loading={saving === 'seo'} onClick={() => save('seo', s.seo)}>Save SEO</Button>
        </Section>

        {/* ── Frontend URL ── */}
        <Section title="Frontend / Portfolio URL" id="frontendUrl" open={open === 'frontendUrl'} onToggle={toggle}>
          <p className="text-xs text-[var(--text-secondary)]">
            The public URL of your portfolio site. Used to generate shareable portfolio links.
          </p>
          <Input
            label="Frontend URL"
            value={s.frontendUrl}
            onChange={e => u('frontendUrl', e.target.value)}
            placeholder="https://your-portfolio.vercel.app"
          />
          <Button variant="primary" loading={saving === 'frontendUrl'} onClick={() => save('frontendUrl', s.frontendUrl)}>
            Save
          </Button>
        </Section>

      </div>
    </div>
  );
}
