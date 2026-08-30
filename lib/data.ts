export const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Team", href: "/team" },
  { label: "Insights", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const TAGLINE = "Consultancy. Strategy. Solution.";

export const CONTACT = {
  email: "hello@zoolyum.com",
  phone: "+880 1700-000000",
  address: "House 11, Road 11, Mirpur 11, Dhaka 1216, Bangladesh",
  mapUrl: "https://maps.google.com/?q=Mirpur+11,+Dhaka",
} as const;

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  problem: string;
  solution: string;
  deliverables: string[];
  process: { step: string; detail: string }[];
  faqs: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "brand-strategy",
    name: "Brand Strategy",
    tagline: "Position before promotion.",
    heroCopy:
      "A logo isn't a brand. We build the system that makes every touchpoint unmistakably yours.",
    problem:
      "In a crowded category, most brands look like their competitors, sound like them, and get ignored like them. Good work, invisible brand.",
    solution:
      "We find the position only you can defend, then arm every touchpoint with it: identity, voice, messaging, and motion, engineered as one system.",
    deliverables: [
      "Brand positioning & competitive map",
      "Visual identity system",
      "Verbal identity & tone of voice",
      "Brand guidelines playbook",
      "Collateral & rollout kit",
    ],
    process: [
      { step: "Discover", detail: "Category audit, competitor scan, and audience research. We map the terrain before we move." },
      { step: "Position", detail: "We isolate the one position only your brand can defend, then stress-test it against the market." },
      { step: "Design", detail: "Identity, voice, and system design. Every asset built to be unmistakable at a glance." },
      { step: "Arm", detail: "Guidelines, templates, and rollout kits your team can execute without us in the room." },
    ],
    faqs: [
      { q: "How long does a full brand system take?", a: "A complete strategy-to-identity engagement runs 6-10 weeks depending on scope. We work in weekly sprints so you see progress from day one." },
      { q: "Do you work with early-stage startups?", a: "Yes. We run a compressed First Position sprint for young brands that need a sharp identity and messaging fast." },
      { q: "Will you redesign our existing logo?", a: "Sometimes. If your mark has equity, we evolve it. If it's holding you back, we'll tell you honestly and rebuild." },
    ],
  },
  {
    slug: "digital-design",
    name: "Digital Design & UI/UX",
    tagline: "Interfaces with intent.",
    heroCopy:
      "Beautiful gets ignored. We design interfaces that convert — every screen built around what the user needs to do next.",
    problem:
      "Your website is your most visible asset, and most agency-built sites whisper when they should be working.",
    solution:
      "Research-driven UX and editorial UI: websites and products designed around one question — what does the user need to do next, and how do we make it effortless?",
    deliverables: [
      "UX research & user flows",
      "Wireframes & interactive prototypes",
      "High-fidelity UI design system",
      "Next.js development",
      "Motion & interaction design",
    ],
    process: [
      { step: "Map", detail: "User journeys, conversion goals, and content architecture. The plan before the design." },
      { step: "Prototype", detail: "Rapid wireframes and clickable prototypes, tested with real users before a single pixel is polished." },
      { step: "Design", detail: "High-fidelity UI with a component system your team can extend for years." },
      { step: "Build", detail: "Production-grade Next.js builds: fast, accessible, and animated with restraint." },
    ],
    faqs: [
      { q: "Do you design and develop, or just design?", a: "Both. Our design and engineering teams work in one room, so nothing gets lost in translation between mockup and build." },
      { q: "Can you audit our existing product?", a: "Yes. Our UX audit delivers a prioritized list of friction points and quick wins within two weeks." },
      { q: "What stack do you build on?", a: "Next.js, Tailwind CSS, and Framer Motion for interaction. Headless CMS of your choice for content." },
    ],
  },
  {
    slug: "growth-marketing",
    name: "Growth Marketing",
    tagline: "Precision, not volume.",
    heroCopy:
      "Reach is not a lottery. We engineer growth — performance campaigns, funnels, and content that compound.",
    problem:
      "Random posts and boosted ads scatter energy everywhere and move nothing. The market rewards patience and precision, not noise.",
    solution:
      "Full-funnel growth: paid performance, SEO, and lifecycle marketing built on measurement. Every taka accountable to a metric that matters.",
    deliverables: [
      "Growth strategy & channel plan",
      "Paid campaign management (Meta, Google)",
      "SEO & content engine",
      "Funnel & landing page optimization",
      "Monthly performance reporting",
    ],
    process: [
      { step: "Track", detail: "Analytics, attribution, and baseline metrics. We never work blind." },
      { step: "Target", detail: "Audience research and channel selection based on where your buyers actually are." },
      { step: "Launch", detail: "Campaigns with clear hypotheses. Creative built to be tested, not admired." },
      { step: "Compound", detail: "Weekly optimization loops that feed wins back into the system." },
    ],
    faqs: [
      { q: "What is the minimum viable budget?", a: "For paid campaigns we typically recommend starting at BDT 50,000/month in media spend. Strategy-only engagements start lower." },
      { q: "How fast will we see results?", a: "Paid channels show signal in 2-4 weeks. SEO and content compound over 3-6 months. We set expectations per channel up front." },
      { q: "Do you require long contracts?", a: "We ask for a 3-month minimum so campaigns have time to exit the learning phase. After that it is month-to-month." },
    ],
  },
  {
    slug: "content-strategy",
    name: "Content & Storytelling",
    tagline: "Signal over noise.",
    heroCopy:
      "Attention is earned. We help brands claim it with stories people actually stop scrolling for.",
    problem:
      "Everyone is publishing. Almost nobody is saying anything. Content without a point of view is just noise.",
    solution:
      "Editorial strategy, content systems, and storytelling that carries your positioning into every caption, article, and campaign.",
    deliverables: [
      "Editorial strategy & content pillars",
      "Brand storytelling framework",
      "Content calendar & production system",
      "Copywriting for web, campaigns & social",
      "Photography & visual direction",
    ],
    process: [
      { step: "Listen", detail: "Audience language mining: the exact words your market uses, found in reviews, forums, and interviews." },
      { step: "Frame", detail: "Content pillars and narrative arcs built on your positioning." },
      { step: "Produce", detail: "A repeatable production system: writing, design, and shoots on a sustainable cadence." },
      { step: "Measure", detail: "Every piece tracked against engagement and pipeline, not vanity metrics." },
    ],
    faqs: [
      { q: "Do you produce content in Bangla and English?", a: "Yes, and we recommend most Bangladeshi brands run bilingual content. We'll find the right mix for your audience." },
      { q: "Can you train our in-house team?", a: "Yes. We run content sprints where your team produces alongside ours, then leave the system with you." },
      { q: "What does a content system include?", a: "Pillars, formats, templates, a calendar, and measurement. Everything your team needs to keep publishing without us." },
    ],
  },
  {
    slug: "video-production",
    name: "Video & Motion Production",
    tagline: "Motion with meaning.",
    heroCopy:
      "A static brand is a quiet one. We make brands move — cinematically, strategically, unforgettably.",
    problem:
      "The feed moves. If your brand doesn't, it disappears between two videos of somebody's lunch.",
    solution:
      "Brand films, product videos, and motion identity — planned, shot, and cut by one team with a narrative director's eye.",
    deliverables: [
      "Brand films & campaign videos",
      "Product & service explainers",
      "Motion identity & logo animation",
      "Social video system (reels, shorts)",
      "Post-production & sound design",
    ],
    process: [
      { step: "Concept", detail: "The story before the shoot. Scripts and storyboards tied to your positioning." },
      { step: "Shoot", detail: "Direction, cinematography, and production management. Cinema discipline on brand budgets." },
      { step: "Cut", detail: "Edit, color, motion graphics, and sound. The difference between a video and a film." },
      { step: "Deploy", detail: "Cutdowns and formats engineered for every placement it will live in." },
    ],
    faqs: [
      { q: "What does a brand film cost?", a: "Concept-to-delivery brand films start around BDT 3,50,000. Social video systems run smaller monthly retainers." },
      { q: "Do you handle casting and locations?", a: "Full production management: casting, locations, permits, and crew. You approve the plan, we handle the logistics." },
      { q: "Can you animate our existing brand assets?", a: "Yes. Logo animation, motion identities, and animated templates for your static systems are a core offering." },
    ],
  },
];

export type Project = {
  slug: string;
  client: string;
  industry: string;
  services: string[];
  title: string;
  result: string;
  challenge: string;
  strategy: string;
  execution: string[];
  stats: { value: string; label: string }[];
  quote?: string;
  quoteAuthor?: string;
  gradient: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "apex-academy",
    client: "Apex Academy",
    industry: "Education",
    services: ["Brand Strategy", "Digital Design"],
    title: "From one campus among many to the school parents talk about",
    result: "+42% enrollment in 3 months",
    challenge:
      "A rising school in Dhaka with strong results and zero distinction. Parents couldn't tell it apart from five competitors on the same road.",
    strategy:
      "We repositioned Apex around its uniquely strict-but-nurturing culture, built an identity system around the idea of earned achievement, and redesigned the admission funnel around parent anxiety — answered before it was asked.",
    execution: [
      "Full identity system with a crest rebuilt for the digital era",
      "Admission microsite with a 3-step enquiry flow",
      "Parent testimonial film series",
      "Social content engine for admission season",
    ],
    stats: [
      { value: "+42%", label: "Enrollment growth" },
      { value: "3.2x", label: "Admission enquiries" },
      { value: "-61%", label: "Cost per enquiry" },
    ],
    quote: "Admission season used to be a fight. This year parents came to us already convinced.",
    quoteAuthor: "Principal, Apex Academy",
    gradient: "from-[#3A2E26] via-[#C9702E] to-[#B99456]",
  },
  {
    slug: "meridian-health",
    client: "Meridian Health",
    industry: "Healthcare",
    services: ["Brand Strategy", "Digital Design"],
    title: "A diagnostics chain that became the second opinion people trust",
    result: "+67% appointment bookings",
    challenge:
      "A growing diagnostics chain with modern machines and an old-fashioned brand. Patients assumed expensive meant unnecessary, and GPs hesitated to refer.",
    strategy:
      "We positioned Meridian around clarity, not fear: 'Answers, not anxiety.' Every touchpoint — from the report layout to the waiting-room signage — was rebuilt to make patients feel informed rather than processed.",
    execution: [
      "Positioning & verbal identity across 11 branches",
      "Report and results experience redesign",
      "Referral portal for practicing physicians",
      "Appointment system with reminder lifecycle",
    ],
    stats: [
      { value: "+67%", label: "Appointment bookings" },
      { value: "-38%", label: "No-show rate" },
      { value: "4.8", label: "Average patient rating" },
    ],
    quote: "Doctors refer to us by name now. That didn't happen before the rebrand.",
    quoteAuthor: "Managing Director, Meridian Health",
    gradient: "from-[#241F1B] via-[#3A2E26] to-[#7A7A5C]",
  },
  {
    slug: "loom-lane",
    client: "Loom & Lane",
    industry: "Fashion Retail",
    services: ["Brand Strategy", "Content & Storytelling"],
    title: "A handloom brand that priced like a premium label — and sold like one",
    result: "+210% D2C revenue",
    challenge:
      "A handloom collective making genuinely exceptional fabrics, stuck selling them as commodities on marketplace listings — competing on price against factory imitations.",
    strategy:
      "We built the brand around the makers, not the fabric: every piece traceable to a weaver, a village, and a technique. Premium pricing became a story people could retell, not a number to negotiate.",
    execution: [
      "Brand identity & premium packaging system",
      "Weaver story series — 14 films from 6 districts",
      "D2C storefront with craft-traceability pages",
      "Launch collaboration with 8 Bangladeshi designers",
    ],
    stats: [
      { value: "+210%", label: "D2C revenue" },
      { value: "3.1x", label: "Average order value" },
      { value: "40k", label: "Organic followers" },
    ],
    quote: "We stopped explaining our prices. The brand does it for us.",
    quoteAuthor: "Founder, Loom & Lane",
    gradient: "from-[#B99456] via-[#C9702E] to-[#3A2E26]",
  },
  {
    slug: "ledgerline",
    client: "LedgerLine",
    industry: "SaaS",
    services: ["Digital Design", "Growth Marketing"],
    title: "An accounting SaaS that stopped competing on features",
    result: "+88% trial-to-paid conversion",
    challenge:
      "A capable accounting platform drowning in a feature war. Every competitor listed fifty features; buyers couldn't tell any of them apart, so they chose on price and churned.",
    strategy:
      "We repositioned LedgerLine around the hour it gives back: 'Close your books by Thursday.' The product story, website, and onboarding were rebuilt around one measurable promise instead of a feature grid.",
    execution: [
      "Positioning & messaging architecture",
      "Website rebuild with interactive product story",
      "Onboarding flow redesigned to first-value in 8 minutes",
      "Demo-led performance campaigns",
    ],
    stats: [
      { value: "+88%", label: "Trial-to-paid conversion" },
      { value: "-52%", label: "Customer acquisition cost" },
      { value: "2.3x", label: "Demo bookings" },
    ],
    quote: "Prospects now repeat our promise back to us on sales calls. That's new.",
    quoteAuthor: "CMO, LedgerLine",
    gradient: "from-[#3A2E26] via-[#C9702E] to-[#B99456]",
  },
  {
    slug: "ember-eats",
    client: "Ember & Eats",
    industry: "F&B",
    services: ["Brand Strategy", "Video & Motion Production"],
    title: "A cloud kitchen that became a city-wide craving",
    result: "12,000+ orders in launch month",
    challenge:
      "A new cloud kitchen entering the most crowded food delivery market in the country. Invisible by default, competing on discount like everyone else.",
    strategy:
      "We built a brand with an attitude problem — in the best way. 'Hunt Your Hunger' gave the kitchen a voice that owned social feeds, with food films engineered for the first three seconds of a scroll.",
    execution: [
      "Brand identity & packaging system",
      "Launch film + 20 social cutdowns",
      "Influencer seeding with 12 Dhaka food creators",
      "Delivery-app store optimization",
    ],
    stats: [
      { value: "12k+", label: "Orders in month one" },
      { value: "2.1M", label: "Organic reach" },
      { value: "#1", label: "Local search ranking" },
    ],
    quote: "We stopped discounting three months in. Demand held.",
    quoteAuthor: "Founder, Ember & Eats",
    gradient: "from-[#C9702E] via-[#3A2E26] to-[#241F1B]",
  },
  {
    slug: "verandah",
    client: "Verandah Resorts",
    industry: "Hospitality",
    services: ["Content & Storytelling", "Video & Motion Production"],
    title: "A boutique resort that filled its quiet season",
    result: "92% off-season occupancy",
    challenge:
      "A beautiful boutique resort in Sylhet that emptied every monsoon. OTA commissions were eating the margin, and the brand had nothing to say beyond 'nice rooms'.",
    strategy:
      "We made the rain the reason to come. 'The Verandah Season' reframed monsoon as the resort's best product — long reads, slow food, rain on the tin roof — and sold it direct through a content engine.",
    execution: [
      "Seasonal brand platform & campaign concept",
      "Rain-season film shot entirely on property",
      "Editorial content engine — 3 stories a week",
      "Direct booking system with member pricing",
    ],
    stats: [
      { value: "92%", label: "Off-season occupancy" },
      { value: "+156%", label: "Direct bookings" },
      { value: "4.9", label: "Guest rating" },
    ],
    quote: "Our quietest quarter became our most profitable. That was the whole brief.",
    quoteAuthor: "General Manager, Verandah Resorts",
    gradient: "from-[#7A7A5C] via-[#3A2E26] to-[#C9702E]",
  },
  {
    slug: "urban-prowl",
    client: "Urban Prowl",
    industry: "Real Estate",
    services: ["Brand Strategy", "Growth Marketing"],
    title: "A boutique developer that started winning listings it shouldn't have",
    result: "+180% qualified leads in one quarter",
    challenge:
      "A boutique real estate developer competing against giants with 20x budgets. Every listing looked identical, every promise sounded the same.",
    strategy:
      "We stopped selling square feet and started selling the life those feet hold. The 'Own Your Corner of the City' platform ran across premium targeting, cinematic listing films, and a broker portal that made inventory disappear.",
    execution: [
      "Positioning & verbal identity for the flagship project",
      "Cinematic project film + photography direction",
      "Meta & Google performance engine",
      "Broker-first CRM funnel",
    ],
    stats: [
      { value: "+180%", label: "Qualified leads" },
      { value: "27", label: "Units sold in Q1" },
      { value: "4.6x", label: "ROAS on premium inventory" },
    ],
    quote: "Zoolyum made us the project people mention by name.",
    quoteAuthor: "Managing Director, Urban Prowl",
    gradient: "from-[#241F1B] via-[#3A2E26] to-[#C9702E]",
  },
  {
    slug: "canopy-commerce",
    client: "Canopy Commerce",
    industry: "E-commerce",
    services: ["Digital Design", "Growth Marketing"],
    title: "A fashion marketplace rebuilt for the 3-second decision",
    result: "+96% conversion rate",
    challenge:
      "A fashion marketplace with great inventory and a store that leaked customers at every step: 71% cart abandonment, brutal page-speed scores, zero brand recall.",
    strategy:
      "We rebuilt the experience around the mobile thumb: a visual-first design system, sub-2-second loads, and a checkout stripped from five steps to two. Growth campaigns then had somewhere worth landing.",
    execution: [
      "UX audit & complete interface redesign",
      "Next.js storefront rebuild",
      "Two-step checkout & saved payment rails",
      "Retention lifecycle (email + SMS)",
    ],
    stats: [
      { value: "+96%", label: "Conversion rate" },
      { value: "-58%", label: "Cart abandonment" },
      { value: "1.4s", label: "Largest contentful paint" },
    ],
    quote: "The redesign paid for itself in seven weeks.",
    quoteAuthor: "CEO, Canopy Commerce",
    gradient: "from-[#3A2E26] via-[#7A7A5C] to-[#C9702E]",
  },
];

export const TEAM = [
  { name: "Sakib Chowdhury", role: "Founder & Creative Director", expertise: "Brand strategy, creative direction", initials: "SC" },
  { name: "Nusrat Jahan", role: "Head of Design", expertise: "Identity systems, UI/UX", initials: "NJ" },
  { name: "Tanvir Ahmed", role: "Head of Growth", expertise: "Performance marketing, funnels", initials: "TA" },
  { name: "Farhana Rahman", role: "Strategy Lead", expertise: "Positioning, research", initials: "FR" },
  { name: "Rafiul Islam", role: "Motion & Film Director", expertise: "Brand films, motion identity", initials: "RI" },
  { name: "Maliha Karim", role: "Content Strategist", expertise: "Editorial, storytelling", initials: "MK" },
  { name: "Arif Hossain", role: "Senior Engineer", expertise: "Next.js, interaction engineering", initials: "AH" },
  { name: "Sharmin Akter", role: "Client Success Lead", expertise: "Accounts, delivery", initials: "SA" },
] as const;

export const TESTIMONIALS = [
  {
    quote: "Most agencies show you decks. Zoolyum showed us the pattern in our market — where we were invisible, and exactly what it would take to be impossible to miss.",
    author: "Managing Director",
    company: "Urban Prowl",
    industry: "Real Estate",
  },
  {
    quote: "They treat your budget like their own money. Every campaign defends its ground with numbers, not opinions.",
    author: "Head of Marketing",
    company: "Canopy Commerce",
    industry: "E-commerce",
  },
  {
    quote: "Our admission season used to be a fight. This year parents came to us already convinced. That's what reading the market first gets you.",
    author: "Principal",
    company: "Apex Academy",
    industry: "Education",
  },
  {
    quote: "The rare agency that says no. They killed two of our campaign ideas because the strategy demanded better. They were right.",
    author: "Founder",
    company: "Ember & Eats",
    industry: "F&B",
  },
  {
    quote: "Doctors refer to us by name now. Patients describe us as 'the clear one'. Both were unthinkable before the repositioning.",
    author: "Managing Director",
    company: "Meridian Health",
    industry: "Healthcare",
  },
  {
    quote: "We stopped explaining our prices. The brand does it for us — customers now quote our story back at checkout.",
    author: "Founder",
    company: "Loom & Lane",
    industry: "Fashion Retail",
  },
  {
    quote: "Prospects repeat our promise back to us on sales calls. SaaS marketing is usually noise; this one landed.",
    author: "CMO",
    company: "LedgerLine",
    industry: "SaaS",
  },
  {
    quote: "Our quietest quarter became our most profitable. That was the whole brief, and they nailed it.",
    author: "General Manager",
    company: "Verandah Resorts",
    industry: "Hospitality",
  },
] as const;

export const POSTS = [
  { slug: "why-bangladeshi-brands-lose", title: "Why Most Bangladeshi Brands Lose (And the Few That Don't)", category: "Branding", excerpt: "The market isn't crowded — it's camouflaged. A field guide to the four patterns we see in brands that dominate their category versus those that disappear into the background.", date: "2025-11-18", readTime: "7 min" },
  { slug: "positioning-is-a-territory", title: "Positioning Is a Territory, Not a Sentence", category: "Marketing", excerpt: "Everyone writes positioning statements. Almost nobody defends ground. The difference between a tagline and a moat, explained through three Dhaka case studies.", date: "2025-10-02", readTime: "9 min" },
  { slug: "motion-is-advantage", title: "Motion Is a Strategic Advantage. On Screens Too.", category: "Design", excerpt: "Why moving brands outperform static ones in feed environments, and how to add motion without turning your identity into a circus.", date: "2025-08-21", readTime: "6 min" },
  { slug: "dhaka-market-trends-2026", title: "Bangladesh Market Trends 2026: The Year of Category Kings", category: "Bangladesh Market Trends", excerpt: "Consolidation is coming for every category. Our annual trend report on which sectors will crown a dominant brand — and what contenders should do before it happens.", date: "2026-01-15", readTime: "12 min" },
  { slug: "first-position-startup", title: "First Position: A Brand Sprint for Startups That Cannot Wait", category: "Branding", excerpt: "You have a product, a deadline, and no identity. Here is the exact 4-week sprint we run with early-stage teams — and what you can safely skip.", date: "2025-12-05", readTime: "5 min" },
  { slug: "performance-branding", title: "Performance Branding: Where Growth Marketing Meets the Long Game", category: "Marketing", excerpt: "Performance teams think in weeks. Brands compound in years. A practical framework for running both without killing either.", date: "2025-09-11", readTime: "8 min" },
] as const;

export const JOBS = [
  { title: "Senior Brand Designer", type: "Full-time", location: "Mirpur 11, Dhaka", dept: "Design" },
  { title: "Performance Marketing Executive", type: "Full-time", location: "Mirpur 11, Dhaka", dept: "Growth" },
  { title: "Motion Designer", type: "Full-time", location: "Mirpur 11, Dhaka", dept: "Film & Motion" },
  { title: "Content Strategist (English/Bangla)", type: "Contract", location: "Remote / Hybrid", dept: "Content" },
] as const;

export const RESOURCES = [
  { title: "Brand Audit Checklist", description: "27 questions to find where your brand is invisible. Used internally on every engagement kickoff.", format: "PDF, 12 pages", slug: "brand-audit" },
  { title: "Content Calendar Template", description: "The exact quarterly planning grid our content team runs: pillars, formats, and measurement columns included.", format: "Notion + Sheets", slug: "content-calendar" },
  { title: "Campaign Brief One-Pager", description: "The brief template that keeps campaigns on-strategy. If it doesn't fit one page, the strategy isn't sharp enough.", format: "PDF, 1 page", slug: "campaign-brief" },
] as const;

export const STATS = [
  { value: 8, suffix: "+", label: "Years in the market" },
  { value: 120, suffix: "+", label: "Engagements delivered" },
  { value: 80, suffix: "+", label: "Brands sharpened" },
  { value: 14, suffix: "", label: "Industry awards" },
] as const;

export const PROCESS_STAGES = [
  { num: "01", title: "Discover", detail: "Category audit, competitor scan, audience research. We map the terrain before we move — every engagement starts with the market, not our opinions.", outputs: ["Category & competitor map", "Audience language report", "Opportunity brief"] },
  { num: "02", title: "Strategize", detail: "We isolate the one position only your brand can defend, then build the plan to take it. Positioning first, always. Tactics follow strategy or they drift.", outputs: ["Positioning statement", "Messaging architecture", "Channel strategy"] },
  { num: "03", title: "Design", detail: "Identity, experience, and content engineered as one system. Every asset unmistakable at a glance, every touchpoint reinforcing the same position.", outputs: ["Identity system", "UI & content templates", "Motion language"] },
  { num: "04", title: "Launch", detail: "Coordinated release across channels. Campaigns, PR, and content that land as one clear signal, not a scatter of noises.", outputs: ["Campaign kit", "Launch film & assets", "PR & rollout plan"] },
  { num: "05", title: "Grow", detail: "Measure, defend, expand. Growth loops compound the position while we watch the edges of the category for challengers.", outputs: ["Measurement dashboard", "Optimization backlog", "Quarterly review"] },
] as const;

export const GLOBAL_FAQS = [
  { q: "What does a typical engagement look like?", a: "Every engagement runs the same five-stage method — Discover, Strategize, Design, Launch, Grow — scoped to your timeline. A full brand system runs 6-10 weeks; growth retainers are quarterly; design sprints can ship in 3." },
  { q: "How do you price work?", a: "Fixed-price for defined scopes (brand systems, websites, films) so there are no surprise invoices, and monthly retainers for ongoing work (growth, content). Every proposal itemizes exactly what you're paying for." },
  { q: "Do you work with startups and small businesses?", a: "Yes. Our First Position sprint is built specifically for early-stage brands: four weeks, one team, one sharp identity and messaging system. We also offer strategy-only engagements for teams that just need direction." },
  { q: "What industries do you know best?", a: "Education, real estate, F&B, e-commerce, healthcare, fashion retail, SaaS, and hospitality — the categories where most of our 120+ engagements live. That said, the method is industry-agnostic; the research phase adapts it to your market." },
  { q: "Do you work in Bangla, English, or both?", a: "Both. Strategy and internal documents run in whichever language your team thinks in; consumer-facing deliverables are bilingual by default unless your market dictates otherwise." },
  { q: "Can you work with our in-house team?", a: "That's our favorite setup. We lead strategy and system design, your team executes within it, and we coach through the first cycles. Several clients run entirely on systems we left behind." },
  { q: "How do you measure success?", a: "Every engagement defines its success metrics before work starts — enrollment growth, conversion rate, qualified leads, direct bookings. If a metric can't be measured, we don't promise it." },
  { q: "What if we already have a brand we like?", a: "Then we won't touch it. We start with a brand audit; if your equity is strong, we build around it. If something is actively costing you business, we'll show you exactly where and why." },
] as const;

export const NEWSLETTER_BENEFITS = [
  { title: "The Market Pattern", detail: "One trend read from the Bangladesh market each month — what's consolidating, who's gaining ground, and why." },
  { title: "The Case Teardown", detail: "One engagement decoded: the strategy, the numbers, and what we'd do differently now." },
  { title: "The Framework Corner", detail: "One actionable template or checklist you can apply to your brand the same day." },
] as const;

export const INDUSTRIES_TICKER = [
  "Brand Strategy",
  "Digital Design",
  "Growth Marketing",
  "Content & Storytelling",
  "Video & Motion",
  "Education",
  "Healthcare",
  "Real Estate",
  "Fashion Retail",
  "E-commerce",
  "SaaS",
  "Hospitality",
] as const;