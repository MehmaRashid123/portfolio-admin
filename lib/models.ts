import mongoose, { Schema, model, models } from 'mongoose';

// ─── Category ─────────────────────────────────────────────────────────────
const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true }, // e.g. "graphic"
    label: { type: String, required: true },              // e.g. "Graphic Design"
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Project ───────────────────────────────────────────────────────────────
const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    shortDescription: { type: String, maxlength: 200 },
    fullDescription: { type: String },
    tags: [String],
    client: String,
    year: String,
    tools: [String],
    thumbnail: { url: String, publicId: String },
    images: [{ url: String, publicId: String, order: Number }],
    videoUrl: String,
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Service ───────────────────────────────────────────────────────────────
const ServiceSchema = new Schema(
  {
    name: String,
    slug: { type: String, required: true, unique: true },
    description: String,
    features: [String],
    startingPrice: String,
    ctaLabel: String,
  },
  { timestamps: true }
);

// ─── TeamMember ────────────────────────────────────────────────────────────
const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: String,
    photo: { url: String, publicId: String },
    socials: {
      linkedin: String,
      behance: String,
      instagram: String,
    },
    displayOrder: Number,
  },
  { timestamps: true }
);

// ─── Testimonial ───────────────────────────────────────────────────────────
const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true },
    company: String,
    quote: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    avatar: { url: String, publicId: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

// ─── BlogPost ──────────────────────────────────────────────────────────────
const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: { url: String, publicId: String },
    category: String,
    content: String,
    readTime: Number,
    seo: {
      metaTitle: String,
      metaDescription: String,
      ogImage: String,
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

// ─── Settings ──────────────────────────────────────────────────────────────
const SettingsSchema = new Schema({
  // ── Site Global ──
  siteName: String,
  logoText: String,
  logoDotColor: String,
  faviconUrl: String,

  // ── Navbar ──
  navbar: {
    links: [{ label: String, href: String, order: Number }],
    ctaLabel: String,
    ctaLink: String,
  },

  // ── Hero ──
  hero: {
    headline: String,
    headlineLine2: String,
    subheadline: String,
    cta1Label: String,
    cta1Link: String,
    cta2Label: String,
    cta2Link: String,
    showreelUrl: String,
    scrollText: String,
  },

  // ── Marquee ──
  marquee: {
    items: [String],
    speed: Number,
  },

  // ── Featured Work Section ──
  featuredWork: {
    heading: String,
    subheading: String,
    ctaLabel: String,
    ctaLink: String,
  },

  // ── Services Section (homepage) ──
  servicesSection: {
    heading: String,
    subheading: String,
  },

  // ── Stats ──
  stats: [{ value: String, label: String }],

  // ── About Teaser ──
  aboutTeaser: {
    heading: String,
    body: String,
    ctaLabel: String,
    ctaLink: String,
    image: { url: String, publicId: String },
  },

  // ── Testimonials Section ──
  testimonialsSection: {
    heading: String,
    subheading: String,
  },

  // ── CTA Banner ──
  ctaBanner: {
    heading: String,
    subheading: String,
    buttonLabel: String,
    buttonLink: String,
  },

  // ── Footer ──
  footer: {
    tagline: String,
    links: [{ label: String, href: String }],
    socials: {
      instagram: String,
      behance: String,
      linkedin: String,
      dribbble: String,
      twitter: String,
    },
    copyrightText: String,
  },

  // ── Work Page ──
  workPage: {
    heading: String,
    subheading: String,
    filterLabels: {
      all: String,
      graphic: String,
      web: String,
      threeD: String,
    },
  },

  // ── Services Page ──
  servicesPage: {
    heading: String,
    subheading: String,
    faqHeading: String,
    faqs: [{ question: String, answer: String }],
  },

  // ── About Page ──
  about: {
    heroHeading: String,
    heroSubheading: String,
    story: String,
    mission: String,
    foundedYear: String,
    heroImage: { url: String, publicId: String },
    values: [{ title: String, description: String }],
    toolsLabel: String,
    tools: [String],
  },

  // ── Contact Page ──
  contact: {
    heading: String,
    subheading: String,
    email: String,
    whatsapp: String,
    location: String,
    instagram: String,
    behance: String,
    linkedin: String,
    formSuccessMessage: String,
    serviceOptions: [String],
    budgetOptions: [String],
  },

  // ── Blog Page ──
  blogPage: {
    heading: String,
    subheading: String,
  },

  // ── SEO ──
  seo: {
    siteTitle: String,
    metaDescription: String,
    ogImage: String,
    twitterHandle: String,
  },

  // ── Frontend URL ──
  frontendUrl: { type: String, default: '' },
});

// ─── User ──────────────────────────────────────────────────────────────────
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

// In dev, delete stale cached models so schema changes (like removing enums) take effect on hot reload
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose as any).models.Service;
  delete (mongoose as any).models.Category;
}

export const Project = models.Project || model('Project', ProjectSchema);
export const Service = models.Service || model('Service', ServiceSchema);
export const TeamMember = models.TeamMember || model('TeamMember', TeamMemberSchema);
export const Testimonial = models.Testimonial || model('Testimonial', TestimonialSchema);
export const BlogPost = models.BlogPost || model('BlogPost', BlogPostSchema);
export const Settings = models.Settings || model('Settings', SettingsSchema);
export const User = models.User || model('User', UserSchema);
export const Category = models.Category || model('Category', CategorySchema);

// ─── PortfolioLink ─────────────────────────────────────────────────────────
const PortfolioLinkSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => /^[a-z0-9-]+$/.test(v),
        message: 'Slug must be lowercase letters, numbers, and hyphens only',
      },
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    lastViewedAt: Date,
  },
  { timestamps: true }
);

export const PortfolioLink = models.PortfolioLink || model('PortfolioLink', PortfolioLinkSchema);
