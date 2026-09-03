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

export const CONTACT_FAQS = [
  {
    q: "How fast will you get back to me?",
    a: "Within one working day. If you write on a Friday evening, expect a reply on Monday. If it is urgent, say so in your message and we will jump the queue.",
  },
  {
    q: "What should I prepare for the discovery call?",
    a: "Nothing formal. Bring the problem you keep running into and any numbers you care about - revenue, traffic, spend. We bring the questions.",
  },
  {
    q: "Do you work with early-stage brands?",
    a: "Yes. We run a compressed First Position sprint for young brands that need a sharp identity and message fast - smaller scope, same rigor.",
  },
  {
    q: "What if I am not sure what I need?",
    a: "That is what the call is for. Most first conversations end with a clearer picture of the problem - whether or not you engage us.",
  },
] as const;

export const SITE_URL = "https://zoolyum.com";

export type StoryAct = {
  label: string;
  title: string;
  body: string;
};

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  problem: string;
  solution: string;
  oneParagraph: string;
  situation: string;
  noise: string;
  position: string;
  proofStat: { value: string; label: string };
  deliverables: string[];
  process: { step: string; detail: string }[];
  faqs: { q: string; a: string }[];
  story?: StoryAct[];
};

export const SERVICES: Service[] = [
  {
    slug: "brand-strategy",
    name: "Brand Strategy",
    tagline: "Position before promotion.",
    heroCopy:
      "A logo isn't a brand. We build the system that makes every touchpoint unmistakably yours.",
    oneParagraph:
      "Brand strategy is the discipline of claiming one defensible position in your market and arming every touchpoint with it. Zoolyum runs category audits, isolates the position only your brand can defend, then engineers identity, voice, and messaging as one system - so the market stops confusing you with your competitors.",
    situation:
      "You do good work - better than some of the brands ranking above you. But in the buyer's mind the category blurs together, and you are filed under 'one more option' alongside everyone else.",
    noise:
      "Every competitor has a nice logo, a friendly voice, and the same three promises. When everyone shouts 'quality' and 'trust', buyers stop hearing any of it - and discounting becomes the only lever left.",
    position:
      "We isolate the one claim only you can defend - built from your proof, not aspiration - then arm identity, voice, and system with it. Competitors can copy a look; they cannot copy a position that is true.",
    proofStat: { value: "+42%", label: "avg. brand-recall lift after repositioning" },
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
    oneParagraph:
      "Digital design & UI/UX at Zoolyum means research-driven interfaces that convert: websites and products designed around what the user needs to do next. Every engagement pairs UX research and editorial UI with production-grade Next.js engineering - beautiful gets ignored, intent-built wins.",
    situation:
      "Traffic arrives, browses, and leaves. The site looks fine - honestly, better than fine - but 'fine' does not close: visitors cannot tell what to do next, so they do nothing.",
    noise:
      "Most agency sites are brochure pieces: stunning on first scroll, silent on conversion. Animation for applause, layouts for awards, and a contact form waiting at the bottom like an afterthought.",
    position:
      "We design the interface backwards from the decision: every screen answers 'what does the user need to do next - and how do we make it effortless?' Editorial surface, conversion engineering underneath.",
    proofStat: { value: "+96%", label: "avg. conversion-rate lift after UX rebuild" },
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
    oneParagraph:
      "Growth marketing at Zoolyum is full-funnel campaigning where every taka is accountable to a metric: search, content, and PR aimed precisely where your buyers already are. We set the measurement dashboard up first, then scale only the channels that prove themselves.",
    situation:
      "Marketing spend continues, reports keep arriving, and growth stays flat. Something is working, something is leaking - but the dashboard cannot tell you which is which.",
    noise:
      "Channels multiply, agencies report in their own currency, and 'brand awareness' absorbs every unexplained taka. Without attribution, every budget meeting is a debate between opinions.",
    position:
      "Measurement before spend. We instrument the full funnel first, then concentrate budget on the two or three channels your own data proves are working - and cut the rest without sentiment.",
    proofStat: { value: "3.2x", label: "avg. return on ad spend within two quarters" },
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
    oneParagraph:
      "Content strategy at Zoolyum builds the editorial system that makes your brand the source buyers cite: topic territories grounded in search demand, a publishing rhythm you can sustain, and pieces engineered to rank for the queries your market actually asks.",
    situation:
      "You publish when there is time, about whatever feels right. Some pieces land, most disappear - and the blog quietly became a graveyard of good intentions from two years ago.",
    noise:
      "Every brand is 'creating content' now, which means almost none of it gets read. Volume without a territory is noise; consistency without demand research is theatre.",
    position:
      "We build an editorial system, not a content calendar: territories grounded in what your buyers search, formats matched to the funnel, and a rhythm engineered for the team you actually have.",
    proofStat: { value: "4.1x", label: "avg. organic traffic growth in 12 months" },
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
    oneParagraph:
      "Video production at Zoolyum turns your positioning into films people finish watching: brand films, campaign assets, and product stories scripted from strategy - shot, edited, and delivered as a system your channels can actually use.",
    situation:
      "You know video is where attention lives, but what you have is a folder of event clips and a reel that felt dated a month after launch. Nothing carries the brand's argument.",
    noise:
      "Everyone owns a camera now, and feeds are full of beautifully graded nothing. Production value without a position is wallpaper - watched by no one, remembered by none.",
    position:
      "We script from strategy first: one film built around your position, then cut down into the system - hero, social edits, ads - every asset carrying the same argument.",
    proofStat: { value: "68%", label: "avg. completion rate on hero brand films" },
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
  timeline: string;
  images: string[];
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
    timeline: "3 months",
    images: ["/work/apex-academy/01.svg", "/work/apex-academy/02.svg", "/work/apex-academy/03.svg", "/work/apex-academy/04.svg", "/work/apex-academy/05.svg"],
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
    gradient: "from-[#3A2E26] via-[#FF5001] to-[#FF7A3D]",
  },
  {
    slug: "meridian-health",
    client: "Meridian Health",
    industry: "Healthcare",
    services: ["Brand Strategy", "Digital Design"],
    title: "A diagnostics chain that became the second opinion people trust",
    result: "+67% appointment bookings",
    timeline: "4 months",
    images: ["/work/meridian-health/01.svg", "/work/meridian-health/02.svg", "/work/meridian-health/03.svg", "/work/meridian-health/04.svg", "/work/meridian-health/05.svg"],
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
    timeline: "6 months",
    images: ["/work/loom-lane/01.svg", "/work/loom-lane/02.svg", "/work/loom-lane/03.svg", "/work/loom-lane/04.svg", "/work/loom-lane/05.svg"],
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
    gradient: "from-[#FF7A3D] via-[#FF5001] to-[#3A2E26]",
  },
  {
    slug: "ledgerline",
    client: "LedgerLine",
    industry: "SaaS",
    services: ["Digital Design", "Growth Marketing"],
    title: "An accounting SaaS that stopped competing on features",
    result: "+88% trial-to-paid conversion",
    timeline: "5 months",
    images: ["/work/ledgerline/01.svg", "/work/ledgerline/02.svg", "/work/ledgerline/03.svg", "/work/ledgerline/04.svg", "/work/ledgerline/05.svg"],
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
    gradient: "from-[#3A2E26] via-[#FF5001] to-[#FF7A3D]",
  },
  {
    slug: "ember-eats",
    client: "Ember & Eats",
    industry: "F&B",
    services: ["Brand Strategy", "Video & Motion Production"],
    title: "A cloud kitchen that became a city-wide craving",
    result: "12,000+ orders in launch month",
    timeline: "6 weeks",
    images: ["/work/ember-eats/01.svg", "/work/ember-eats/02.svg", "/work/ember-eats/03.svg", "/work/ember-eats/04.svg", "/work/ember-eats/05.svg"],
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
    gradient: "from-[#FF5001] via-[#3A2E26] to-[#241F1B]",
  },
  {
    slug: "verandah",
    client: "Verandah Resorts",
    industry: "Hospitality",
    services: ["Content & Storytelling", "Video & Motion Production"],
    title: "A boutique resort that filled its quiet season",
    result: "92% off-season occupancy",
    timeline: "8 weeks",
    images: ["/work/verandah/01.svg", "/work/verandah/02.svg", "/work/verandah/03.svg", "/work/verandah/04.svg", "/work/verandah/05.svg"],
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
    gradient: "from-[#7A7A5C] via-[#3A2E26] to-[#FF5001]",
  },
  {
    slug: "urban-prowl",
    client: "Urban Prowl",
    industry: "Real Estate",
    services: ["Brand Strategy", "Growth Marketing"],
    title: "A boutique developer that started winning listings it shouldn't have",
    result: "+180% qualified leads in one quarter",
    timeline: "3 months",
    images: ["/work/urban-prowl/01.svg", "/work/urban-prowl/02.svg", "/work/urban-prowl/03.svg", "/work/urban-prowl/04.svg", "/work/urban-prowl/05.svg"],
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
    gradient: "from-[#241F1B] via-[#3A2E26] to-[#FF5001]",
  },
  {
    slug: "canopy-commerce",
    client: "Canopy Commerce",
    industry: "E-commerce",
    services: ["Digital Design", "Growth Marketing"],
    title: "A fashion marketplace rebuilt for the 3-second decision",
    result: "+96% conversion rate",
    timeline: "10 weeks",
    images: ["/work/canopy-commerce/01.svg", "/work/canopy-commerce/02.svg", "/work/canopy-commerce/03.svg", "/work/canopy-commerce/04.svg", "/work/canopy-commerce/05.svg"],
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
    gradient: "from-[#3A2E26] via-[#7A7A5C] to-[#FF5001]",
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
  { slug: "why-bangladeshi-brands-lose", title: "Why Most Bangladeshi Brands Lose (And the Few That Don't)", category: "Branding", excerpt: "The market isn't crowded — it's camouflaged. A field guide to the four patterns we see in brands that dominate their category versus those that disappear into the background.", date: "2025-11-18", readTime: "7 min", keywords: ["Brand Distinction", "Positioning", "Category Audit", "Brand Recall", "Identity Systems", "Bangladesh Market"], author: "Sakib Chowdhury", authorRole: "Founder & Creative Director", cover: "/blog/why-bangladeshi-brands-lose/cover.svg", quote: "Being 10% better than competitors gets you nothing. Being 10% different gets you everything.", takeaways: ["In a crowded category, being 10% better gets you nothing - being 10% different gets you everything.", "The camouflage trap has four patterns: borrowed identity, feature shouting, random acts of marketing, and silence.", "Audit test: if a competitor could paste their logo over your last ten posts, you have a placeholder, not a brand."], images: [{ src: "/blog/why-bangladeshi-brands-lose/01.svg", caption: "The camouflage audit: where every touchpoint reads like everyone else." }, { src: "/blog/why-bangladeshi-brands-lose/02.svg", caption: "Distinction compounds. Camouflage compounds too - into invisibility." }] },
  { slug: "positioning-is-a-territory", title: "Positioning Is a Territory, Not a Sentence", category: "Marketing", excerpt: "Everyone writes positioning statements. Almost nobody defends ground. The difference between a tagline and a moat, explained through three Dhaka case studies.", date: "2025-10-02", readTime: "9 min", keywords: ["Positioning", "Defensibility", "Category Strategy", "Pricing Power", "Brand Moats", "Dhaka Case Studies"], author: "Farhana Rahman", authorRole: "Strategy Lead", cover: "/blog/positioning-is-a-territory/cover.svg", quote: "Price is a border dispute, and border disputes exhaust everyone.", takeaways: ["A tagline is a claim you make once; a position is a claim you defend every single day.", "Positioning changes your competitive instincts - reinforce what they cannot copy instead of matching prices.", "Before writing the statement, answer: what do we claim, what do we refuse, what will we defend for five years?"], images: [{ src: "/blog/positioning-is-a-territory/01.svg", caption: "The territory map: what you claim, refuse, and defend." }, { src: "/blog/positioning-is-a-territory/02.svg", caption: "None of them were the cheapest. All of them were the clearest." }] },
  { slug: "motion-is-advantage", title: "Motion Is a Strategic Advantage. On Screens Too.", category: "Design", excerpt: "Why moving brands outperform static ones in feed environments, and how to add motion without turning your identity into a circus.", date: "2025-08-21", readTime: "6 min", keywords: ["Motion Design", "Brand Physics", "Feed Environments", "Motion Systems", "Brand Energy"], author: "Rafiul Islam", authorRole: "Motion & Film Director", cover: "/blog/motion-is-advantage/cover.svg", quote: "You are competing in a moving market with a still weapon.", takeaways: ["Motion identity is the physics of your brand: how fast it enters, how it settles, its energy signature.", "A static brand in a moving feed reads as asleep.", "Start with three decisions: default speed, entrance energy, and resting behavior."], images: [{ src: "/blog/motion-is-advantage/01.svg", caption: "The motion system: speed, energy, rest - three decisions." }, { src: "/blog/motion-is-advantage/02.svg", caption: "Every movement must have a reason traceable to the strategy." }] },
  { slug: "dhaka-market-trends-2026", title: "Bangladesh Market Trends 2026: The Year of Category Kings", category: "Bangladesh Market Trends", excerpt: "Consolidation is coming for every category. Our annual trend report on which sectors will crown a dominant brand — and what contenders should do before it happens.", date: "2026-01-15", readTime: "12 min", keywords: ["Market Trends 2026", "Category Kings", "Consolidation", "Video-First", "Trend Report", "Bangladesh Market"], author: "Sakib Chowdhury", authorRole: "Founder & Creative Director", cover: "/blog/dhaka-market-trends-2026/cover.svg", quote: "The polish era is ending; the proof era is here.", takeaways: ["By the end of 2026, most Bangladeshi categories will have one brand owning the category conversation.", "Discounting builds no memory. Distinction does.", "Taking a crown from a sitting king costs ten times what claiming an open one costs today."], images: [{ src: "/blog/dhaka-market-trends-2026/01.svg", caption: "Category consolidation: winner-take-most dynamics across sectors." }, { src: "/blog/dhaka-market-trends-2026/02.svg", caption: "The video-first consumer is now the default consumer." }] },
  { slug: "first-position-startup", title: "First Position: A Brand Sprint for Startups That Cannot Wait", category: "Branding", excerpt: "You have a product, a deadline, and no identity. Here is the exact 4-week sprint we run with early-stage teams — and what you can safely skip.", date: "2025-12-05", readTime: "5 min", keywords: ["Startup Branding", "Brand Sprint", "Early-Stage", "Fast Identity", "Founders", "Positioning"], author: "Farhana Rahman", authorRole: "Strategy Lead", cover: "/blog/first-position-startup/cover.svg", quote: "Identity amplifies positioning. It does not replace it.", takeaways: ["Week one is positioning only: who it is for, what you claim, what you refuse.", "You can skip the mascot and the 40-page guidelines. You cannot skip the positioning.", "The early game: be unmistakable, be everywhere your buyer looks, do not burn cash on decoration."], images: [{ src: "/blog/first-position-startup/01.svg", caption: "The sprint: positioning, voice, identity, rollout - four weeks." }, { src: "/blog/first-position-startup/02.svg", caption: "One team, one system, then every taka into being seen." }] },
  { slug: "performance-branding", title: "Performance Branding: Where Growth Marketing Meets the Long Game", category: "Marketing", excerpt: "Performance teams think in weeks. Brands compound in years. A practical framework for running both without killing either.", date: "2025-09-11", readTime: "8 min", keywords: ["Performance Branding", "Growth Marketing", "Brand Building", "Full-Funnel", "Measurement", "CPA"], author: "Tanvir Ahmed", authorRole: "Head of Growth", cover: "/blog/performance-branding/cover.svg", quote: "Performance rents attention; branding owns it.", takeaways: ["Every performance campaign should reinforce the brand; every brand asset should be built to convert.", "Results compound in order: performance lifts first, CPA drops second, brand search rises at 60-90 days.", "Run both, in one voice, on one strategy - the market learns your name either way."], images: [{ src: "/blog/performance-branding/01.svg", caption: "The three-layer stack: position, demand, memory." }, { src: "/blog/performance-branding/02.svg", caption: "One voice, one strategy, two time-horizons." }] },
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

/** Editorial freshness + AEO layer for Insights articles.
 * `POST_UPDATED` marks the last verification pass (shown as "Updated"
 * and emitted as dateModified). `POST_FAQS` feeds the visible FAQ
 * section and the FAQPage JSON-LD - answers are grounded in each
 * article's own takeaways. */
export const POST_UPDATED: Record<string, string> = {
  "why-bangladeshi-brands-lose": "2026-09-03",
  "positioning-is-a-territory": "2026-09-03",
  "motion-is-advantage": "2026-09-03",
  "dhaka-market-trends-2026": "2026-09-03",
  "first-position-startup": "2026-09-03",
  "performance-branding": "2026-09-03",
};

export const POST_FAQS: Record<string, { q: string; a: string }[]> = {
  "why-bangladeshi-brands-lose": [
    { q: "Why do most Bangladeshi brands fail to stand out?", a: "They fall into the camouflage trap: borrowed identity, feature shouting, random acts of marketing, and long silences. In a crowded category, being 10% better gets you nothing - being 10% different gets you everything." },
    { q: "What is the camouflage trap in branding?", a: "Our name for the four patterns that make brands invisible: copying a bigger competitor's look, leading with specs and prices, running disconnected promotions, and publishing nothing for months." },
    { q: "How can I test whether my brand is distinctive?", a: "Run the logo-swap audit: if a competitor could paste their logo over your last ten posts, packaging, and pitch without anyone noticing, you have a placeholder, not a brand." },
  ],
  "positioning-is-a-territory": [
    { q: "What is the difference between a tagline and a positioning?", a: "A tagline is a claim you make once; a position is a claim you defend every single day - in pricing, product choices, and what you refuse to do." },
    { q: "How should a brand respond to competitor price cuts?", a: "Do not match prices - reinforce what competitors cannot copy. Positioning changes your competitive instincts from reaction to reinforcement." },
    { q: "What comes before writing a positioning statement?", a: "Three questions: what do we claim, what do we refuse, and what will we defend for five years? Answer those first and the sentence writes itself." },
  ],
  "motion-is-advantage": [
    { q: "What is a motion identity?", a: "The physics of your brand: how fast it enters, how it settles, its energy signature. Decide three things once - default speed, entrance energy, resting behavior - and apply them everywhere." },
    { q: "Why does motion matter more inside social feeds?", a: "A static brand in a moving feed reads as asleep. Motion is how the eye finds you before the mind decides to care." },
    { q: "Where should a brand start with motion?", a: "Start with the rules, not the spectacle: default speed, entrance energy, resting behavior. Motion should be a system, not a circus." },
  ],
  "dhaka-market-trends-2026": [
    { q: "What is happening in Bangladeshi markets in 2026?", a: "Consolidation. By the end of 2026, most categories will have one brand owning the category conversation - the window for claiming open ground is closing." },
    { q: "Do discounts build brands?", a: "No. Discounting builds no memory; distinction does. Price promotions rent attention, while a defensible position owns it." },
    { q: "Is it harder to challenge a market leader later?", a: "Far harder. Taking a crown from a sitting king costs roughly ten times what claiming an open position costs today - move while ground is still open." },
  ],
  "first-position-startup": [
    { q: "What should a startup brand do in week one?", a: "Positioning only: who it is for, what you claim, and what you refuse. Everything else can wait; the position cannot." },
    { q: "What can early-stage brands skip?", a: "The mascot, the 40-page guidelines, the decoration. What you cannot skip is positioning - be unmistakable before you try to be everywhere." },
    { q: "How should startups spend early marketing cash?", a: "Be unmistakable, be everywhere your buyer looks, and do not burn cash on decoration. Distinct identity plus focused presence beats a big launch." },
  ],
  "performance-branding": [
    { q: "Should performance marketing and branding run separately?", a: "No. Every performance campaign should reinforce the brand, and every brand asset should be built to convert - run both, in one voice, on one strategy." },
    { q: "How long before brand investment shows in performance numbers?", a: "Results compound in order: performance lifts first, CPA drops second, and branded search rises around day 60 to 90." },
    { q: "Does spending on brand waste performance budget?", a: "The opposite. The market learns your name either way, and campaigns that reinforce the brand make every future click cheaper." },
  ],
};

/** Case-dossier layer (v7.0). Drafted from each project's own
 * challenge / strategy / execution. Review per-project strings
 * before publishing - numbers below repeat the verified stats. */
export type ProjectMeta = {
  overview: string;
  obstacles: { title: string; how: string }[];
  toolbox: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
};

export const PROJECT_META: Record<string, ProjectMeta> = {
  "apex-academy": {
    overview:
      "Apex Academy had strong results but zero distinction on a road full of competitors. Zoolyum repositioned the school around its strict-but-nurturing culture, rebuilt the crest for the digital era, and redesigned admissions around parent anxiety - lifting enrollment 42% in three months.",
    obstacles: [
      { title: "Invisible on a crowded road", how: "Five nearby schools made the same promises. We isolated the one culture only Apex could claim - strict-but-nurturing - and made it the entire message." },
      { title: "Parent anxiety stalled enquiries", how: "The admission funnel was rebuilt to answer fears before they were asked: a 3-step enquiry flow plus parent testimonial films at every step." },
      { title: "No presence in decision season", how: "A social content engine timed to admission season kept Apex in parents' feeds exactly when choices were made." },
    ],
    toolbox: ["Design: Figma", "Design: Adobe Illustrator", "Build: Next.js", "Build: Tailwind CSS", "Growth: Meta Ads Manager", "Growth: Google Analytics 4", "AI: Claude (message testing)"],
    deliverables: ["Identity system with rebuilt crest", "Admission microsite with 3-step enquiry flow", "Parent testimonial film series", "Social content engine for admission season"],
    faqs: [
      { q: "How did Apex Academy grow enrollment 42% in 3 months?", a: "By repositioning around one defensible culture, rebuilding the admission funnel around parent anxiety, and running a content engine through admission season - not by spending more on ads." },
      { q: "What was the core positioning?", a: "Strict-but-nurturing: an identity built around earned achievement that no competitor on the same road could credibly copy." },
      { q: "How long did the engagement take?", a: "Three months, timed to land fully before admission season opened." },
    ],
  },
  "meridian-health": {
    overview:
      "Meridian Health had modern machines and an old-fashioned brand: patients assumed expensive meant unnecessary, and GPs hesitated to refer. Zoolyum positioned the chain around clarity - 'Answers, not anxiety' - rebuilding reports, signage, and referrals, lifting bookings 67% in four months.",
    obstacles: [
      { title: "Price read as a warning sign", how: "We reframed cost as clarity: report layouts and signage that make patients feel informed rather than processed." },
      { title: "GPs would not refer by name", how: "A dedicated referral portal plus consistent verbal identity across 11 branches gave physicians something reliable to recommend." },
      { title: "Missed appointments leaked revenue", how: "An appointment system with a reminder lifecycle cut the no-show rate by 38%." },
    ],
    toolbox: ["Design: Figma", "Design: Adobe Illustrator", "Build: Next.js", "Build: Tailwind CSS", "Growth: Google Ads", "Growth: Google Analytics 4", "AI: Claude (message testing)"],
    deliverables: ["Positioning and verbal identity across 11 branches", "Report and results experience redesign", "Physician referral portal", "Appointment system with reminder lifecycle"],
    faqs: [
      { q: "How did Meridian lift bookings 67%?", a: "By positioning around clarity instead of fear and rebuilding every patient touchpoint - reports, signage, referrals, reminders - as one system." },
      { q: "How did you win GP referrals?", a: "A referral portal for practicing physicians plus identical verbal identity across all 11 branches made Meridian easy to recommend by name." },
      { q: "How long did the engagement take?", a: "Four months, covering positioning, identity rollout, and the digital systems." },
    ],
  },
  "loom-lane": {
    overview:
      "Loom & Lane wove exceptional fabric but sold it as a commodity on marketplace listings, losing on price to factory imitations. Zoolyum built the brand around the makers - every piece traceable to a weaver, a village, a technique - and D2C revenue grew 210% in six months.",
    obstacles: [
      { title: "Priced against factory imitations", how: "Maker-first storytelling made premium pricing retellable: traceability pages turned cost into provenance." },
      { title: "No audience of its own", how: "A 14-film weaver series from 6 districts plus a designer collaboration launched the brand to 40,000 organic followers." },
      { title: "Marketplace anonymity", how: "A D2C storefront with craft-traceability pages moved the brand off listings and onto owned ground." },
    ],
    toolbox: ["Design: Figma", "Design: Adobe Illustrator", "Build: Next.js", "Content: Premiere Pro", "Content: Meta native video", "Growth: Shopify-grade D2C patterns", "AI: Midjourney (concept explorations)"],
    deliverables: ["Brand identity and premium packaging system", "Weaver story series - 14 films from 6 districts", "D2C storefront with craft-traceability pages", "Launch collaboration with 8 Bangladeshi designers"],
    faqs: [
      { q: "How did Loom & Lane grow D2C revenue 210%?", a: "By refusing to compete on price and building the brand around the makers instead - traceability turned premium pricing into a story customers retell." },
      { q: "What made the pricing defensible?", a: "Every piece traces to a weaver, a village, and a technique. Provenance replaced negotiation." },
      { q: "How long did the engagement take?", a: "Six months, from identity through the designer-collaboration launch." },
    ],
  },
  "ledgerline": {
    overview:
      "LedgerLine was losing a feature war: fifty-feature grids made every accounting platform look identical, so buyers chose on price and churned. Zoolyum repositioned the product around one promise - 'Close your books by Thursday' - rebuilding the site, onboarding, and campaigns around it. Trial-to-paid conversion rose 88%.",
    obstacles: [
      { title: "Feature grids made everyone identical", how: "We replaced the grid with an interactive product story built around a single measurable promise." },
      { title: "Trials never reached first value", how: "Onboarding was redesigned to first value in 8 minutes, so trialists felt the promise before day one ended." },
      { title: "Paid spend bought the wrong buyers", how: "Demo-led performance campaigns targeted the promise-fit segment, cutting acquisition cost 52%." },
    ],
    toolbox: ["Design: Figma", "Build: Next.js", "Build: Tailwind CSS", "Growth: Google Ads", "Growth: Meta Ads Manager", "Growth: Mixpanel (funnel analytics)", "AI: Claude (onboarding copy testing)"],
    deliverables: ["Positioning and messaging architecture", "Website rebuild with interactive product story", "Onboarding flow to first value in 8 minutes", "Demo-led performance campaigns"],
    faqs: [
      { q: "How did LedgerLine lift trial-to-paid conversion 88%?", a: "By replacing feature-grid marketing with one measurable promise and redesigning onboarding so trialists reached first value in 8 minutes." },
      { q: "What was the positioning?", a: "The hour it gives back: 'Close your books by Thursday.' One promise across product story, site, and onboarding." },
      { q: "How long did the engagement take?", a: "Five months, covering positioning, the website rebuild, onboarding, and campaign launch." },
    ],
  },
  "ember-eats": {
    overview:
      "Ember & Eats entered the country's most crowded food-delivery market invisible by default. Zoolyum gave the kitchen a voice - 'Hunt Your Hunger' - with food films engineered for the first three seconds of a scroll. Launch month closed at 12,000+ orders in six weeks.",
    obstacles: [
      { title: "Invisible among thousands of listings", how: "A loud, ownable brand voice plus delivery-app store optimization made the kitchen findable and memorable." },
      { title: "Nobody stops scrolling for food photos", how: "A launch film plus 20 cutdowns engineered for the first three seconds, seeded through 12 Dhaka food creators." },
      { title: "Discount dependence", how: "Demand built on craving rather than coupons - discounting stopped three months in and demand held." },
    ],
    toolbox: ["Design: Adobe Illustrator", "Design: Figma (packaging)", "Content: Premiere Pro", "Content: After Effects", "Growth: Creator seeding (12 Dhaka food creators)", "Growth: Delivery-app store optimization", "AI: Midjourney (key-art explorations)"],
    deliverables: ["Brand identity and packaging system", "Launch film plus 20 social cutdowns", "Influencer seeding program", "Delivery-app store optimization"],
    faqs: [
      { q: "How did a new cloud kitchen hit 12,000+ orders in month one?", a: "A voice-led brand, scroll-stopping food films, and seeding through 12 Dhaka food creators - craving, not coupons." },
      { q: "Did you rely on discounts?", a: "Only at ignition. Discounting stopped three months in and demand held, which was the real result." },
      { q: "How fast was the launch?", a: "Six weeks from identity to launch-month operations." },
    ],
  },
  "verandah": {
    overview:
      "Verandah Resorts emptied every monsoon while OTA commissions ate the margin. Zoolyum made the rain the reason to come - 'The Verandah Season' - selling slow food, long reads, and rain on the tin roof direct. Off-season occupancy hit 92% in eight weeks.",
    obstacles: [
      { title: "Monsoon read as a reason to stay away", how: "The season was reframed as the resort's best product, with a film shot entirely on property proving it." },
      { title: "OTA commissions ate the margin", how: "A direct booking system with member pricing plus an editorial engine moved demand onto owned rails." },
      { title: "Nothing to say beyond nice rooms", how: "Three stories a week gave the resort a voice worth following long before booking season." },
    ],
    toolbox: ["Design: Figma", "Build: Next.js (direct booking)", "Content: Premiere Pro", "Content: Editorial engine (3 stories/week)", "Growth: Meta Ads Manager", "Growth: Email lifecycle", "AI: Claude (editorial drafting)"],
    deliverables: ["Seasonal brand platform and campaign concept", "Rain-season film shot on property", "Editorial content engine", "Direct booking system with member pricing"],
    faqs: [
      { q: "How did Verandah fill 92% occupancy off-season?", a: "By selling the monsoon itself - 'The Verandah Season' - through film, editorial, and direct booking instead of fighting the calendar." },
      { q: "How did you cut OTA dependence?", a: "Member pricing on a direct booking system gave guests a reason to book direct; the content engine gave them a reason to return." },
      { q: "How long did the engagement take?", a: "Eight weeks, built to land before the rains arrived." },
    ],
  },
  "urban-prowl": {
    overview:
      "Urban Prowl sold against developers with 20x budgets, and every listing looked identical. Zoolyum stopped selling square feet and sold the life those feet hold - 'Own Your Corner of the City' - across films, premium targeting, and a broker portal. Qualified leads rose 180% in one quarter.",
    obstacles: [
      { title: "Outspent 20-to-1 on every channel", how: "Premium targeting plus cinematic listing films made one project famous instead of many projects visible." },
      { title: "Listings that all looked identical", how: "Positioning and verbal identity gave the flagship a name buyers mention - inventory moved through story, not specs." },
      { title: "Brokers ignored boutique inventory", how: "A broker-first CRM funnel made Urban Prowl stock the easiest to sell, not just the nicest to show." },
    ],
    toolbox: ["Design: Figma", "Design: Adobe Illustrator", "Content: Premiere Pro (listing films)", "Growth: Meta Ads Manager", "Growth: Google Ads", "Growth: HubSpot-style broker CRM", "AI: Claude (ad-angle testing)"],
    deliverables: ["Positioning and verbal identity for the flagship", "Cinematic project film and photography direction", "Meta and Google performance engine", "Broker-first CRM funnel"],
    faqs: [
      { q: "How did a boutique developer win against giants?", a: "By refusing the spec war: one famous project, cinematic listings, and brokers equipped to sell it - 27 units in Q1." },
      { q: "What was the campaign platform?", a: "'Own Your Corner of the City' - selling the life the square feet hold, not the square feet." },
      { q: "How long did the engagement take?", a: "Three months, from positioning to the performance engine running." },
    ],
  },
  "canopy-commerce": {
    overview:
      "Canopy Commerce had great inventory and a store that leaked: 71% cart abandonment, brutal page-speed scores, zero recall. Zoolyum rebuilt around the mobile thumb - visual-first system, sub-2-second loads, two-step checkout - then gave campaigns somewhere worth landing. Conversion rose 96%.",
    obstacles: [
      { title: "71% of carts abandoned", how: "Checkout collapsed from five steps to two with saved payment rails; abandonment fell 58%." },
      { title: "Page speed killed paid traffic", how: "A Next.js storefront rebuild hit 1.4s largest contentful paint, so ad spend finally converted." },
      { title: "One-time buyers never returned", how: "An email-plus-SMS retention lifecycle turned first orders into repeat revenue." },
    ],
    toolbox: ["Design: Figma", "Build: Next.js", "Build: Tailwind CSS", "Build: Vercel (edge delivery)", "Growth: Meta Ads Manager", "Growth: Klaviyo-style email and SMS", "Growth: Google Analytics 4"],
    deliverables: ["UX audit and complete interface redesign", "Next.js storefront rebuild", "Two-step checkout with saved payments", "Retention lifecycle across email and SMS"],
    faqs: [
      { q: "How did Canopy lift conversion 96%?", a: "A full rebuild around mobile buying: visual-first system, 1.4s loads, two-step checkout - then retention to compound it." },
      { q: "What fixed the 71% cart abandonment?", a: "Fewer steps, saved payments, and speed. Abandonment fell 58% after checkout went from five steps to two." },
      { q: "How long did the rebuild take?", a: "Ten weeks - and the redesign paid for itself in seven." },
    ],
  },
};

/** Role dossiers for the careers page (v8.0). Drafted from the
 * open JOBS rows and the services behind them. Review strings,
 * timelines, and posting dates before publishing. */
export type JobDetail = {
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  success90: string;
};

export const JOB_DETAILS: Record<string, JobDetail> = {
  "Senior Brand Designer": {
    about:
      "You will own identity systems end to end - from the positioning readout to the crest, the guidelines, and the rollout kit. Your work faces the market, not a folder.",
    responsibilities: [
      "Lead identity systems from positioning readout to guidelines and rollout", "Rebuild and evolve marks, crests, and visual languages for the digital era", "Art-direct photography, packaging, and collateral with the design team", "Present work to clients and defend decisions with reasoning, not taste",
    ],
    requirements: [
      "A portfolio of identity systems that shipped - not concepts", "Fluency in Figma and Adobe Illustrator; print fundamentals intact", "Ability to write the one-paragraph rationale behind any mark you make", "Comfortable receiving blunt critique and returning sharper work",
    ],
    niceToHave: ["Motion sensibility (After Effects basics)", "Packaging production experience", "Bangla typography familiarity"],
    success90: "One identity system shipped to guidelines, presented to the client by you, and already surviving contact with the market.",
  },
  "Performance Marketing Executive": {
    about:
      "You will run the engines - Meta and Google - where every taka defends its ground with numbers. Brand thinking required; button-pushing is not the job.",
    responsibilities: [
      "Build and run Meta and Google performance engines across client accounts", "Write ad angles from positioning, then test them like hypotheses", "Own weekly reporting: spend, CAC, ROAS, and what changes next", "Feed winning angles back into brand and content teams",
    ],
    requirements: [
      "Hands-on Meta Ads Manager and Google Ads experience on real budgets", "Funnel math fluency: CAC, ROAS, CTR, conversion rate - and what moves each", "GA4 comfort; spreadsheets do not scare you", "Short, honest weekly write-ups - no vanity metrics",
    ],
    niceToHave: ["CRM experience (HubSpot or similar)", "Landing-page CRO basics", "Bangla ad-copy instincts"],
    success90: "One account where CAC is falling month over month and you can explain exactly why.",
  },
  "Motion Designer": {
    about:
      "You will give brands their physics - how they enter, settle, and move. From brand films to 3-second cutdowns, your work is the difference between seen and scrolled-past.",
    responsibilities: [
      "Design motion identities: speed, entrance energy, resting behavior", "Cut launch films and 20+ social cutdowns per campaign", "Animate interfaces, logo stings, and campaign systems", "Guard the 3-second rule: every piece earns the scroll-stop",
    ],
    requirements: [
      "A reel where brands move with intent - not template transitions", "After Effects and Premiere Pro fluency; sound-aware editing", "Ability to work from a positioning line, not just a storyboard", "Fast iteration without quality collapse under launch pressure",
    ],
    niceToHave: ["Cinema 4D or Blender basics", "Color grading sensibility", "On-set shoot experience"],
    success90: "One campaign motion system live - ident, cutdowns, and templates the team actually reuses.",
  },
  "Content Strategist (English/Bangla)": {
    about:
      "You will run editorial engines in two languages - three stories a week that people finish. Strategy first, then sentences; never content for content's sake.",
    responsibilities: [
      "Run quarterly content pillars, formats, and measurement for client accounts", "Write and edit long and short form in English and Bangla", "Turn positioning into repeatable story formats, not one-off posts", "Report what content moved the number - and kill what did not",
    ],
    requirements: [
      "Published bilingual work that proves range, not just fluency", "Editorial judgment: what deserves 800 words and what deserves eight", "Interview skills - founders rarely say the interesting thing first", "Deadline discipline across multiple accounts at once",
    ],
    niceToHave: ["SEO fundamentals", "Newsletter or editorial calendar ownership", "Basic video-script instincts"],
    success90: "One client editorial engine running at cadence, with read-through numbers you can point to.",
  },
};

export const HIRING_STEPS = [
  { step: "Application", detail: "We read every application ourselves - no ATS keyword filter. Expect a reply within three working days." },
  { step: "Conversation", detail: "A 30-minute call about what you have made and why it was the right call. No puzzles, no theatre." },
  { step: "Paid trial", detail: "A small real brief, scoped to a day, compensated at freelance rate. You meet the team you would join." },
  { step: "Offer", detail: "Decision within two weeks of your application. Offer letter states role, compensation, and start date plainly." },
] as const;

export const CAREERS_FAQS = [
  { q: "Do you hire freshers?", a: "Rarely into these roles - each one needs shipped work from day one. Internships are announced separately on this page when they open." },
  { q: "Is remote work possible?", a: "Three roles are studio-based in Mirpur 11, Dhaka with hybrid flexibility. The Content Strategist role is remote-or-hybrid by design." },
  { q: "How is compensation decided?", a: "Scoped to the role and the experience you bring - stated plainly in the offer letter. The quarterly results bonus applies to full-time roles." },
  { q: "How long does hiring take?", a: "Two weeks from application to decision: read, conversation, paid trial, offer. If we go quiet, nudge us - silence is a bug, not a process." },
  { q: "No role fits me. Should I still write?", a: "Yes - choose Speculative application in the form. Exceptional portfolios have created roles here before." },
] as const;
