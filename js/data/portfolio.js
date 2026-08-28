/**
 * All portfolio copy lives here. Edit text freely; the animation code
 * reads from this file and never hard-codes content.
 */

export const portfolio = {
  name: "Shaurya",
  role: "Technology Creator & Builder",

  intro: {
    kicker: "THE DIGITAL HOME OF",
    statement: "I build software, AI systems, and hardware experiences.",
  },

  /** Narrative beats rendered over the journey. Order matches BEATS ids in config.js. */
  beats: {
    arrival: {
      label: "ARRIVAL",
      title: "Everything I make starts here, at a desk in a quiet house.",
      meta: ["NIGHT", "EXTERIOR"],
    },
    practice: {
      label: "PRACTICE",
      title: "Software, AI systems, and the hardware they run on.",
      meta: ["BUILD", "SHIP", "REPEAT"],
    },
    craft: {
      label: "CRAFT",
      title: "Python and TypeScript. Models and microcontrollers. Screens and circuits.",
      meta: ["SOFTWARE", "AI", "HARDWARE"],
    },
    work: {
      label: "SELECTED WORK",
      title: "The door is open. Come see what got built.",
      meta: ["2023", "2026"],
    },
    portal: {
      label: "THE PORTAL",
      title: "Enter my digital world.",
      meta: [],
    },
  },

  section2: {
    statement: {
      heading: "You made it inside.",
      body: "This is where the work lives: a running log of software, experiments with machine learning, and devices built by hand. Everything below was designed, broken, and fixed at the desk you just walked past.",
    },
    about: {
      heading: "About",
      lines: [
        { word: "Build", text: "Small tools, full applications, and the occasional device with wires coming out of it." },
        { word: "Learn", text: "Papers, datasheets, source code. Whatever explains how the thing actually works." },
        { word: "Experiment", text: "Every project starts as a question that a quick prototype tries to answer." },
        { word: "Ship", text: "Projects count when other people can use them. Finished beats perfect." },
      ],
    },
  },

  projects: [
    {
      name: "Sentinel",
      description: "Local-first security monitor that watches network traffic on a home lab and flags anomalies with an on-device model. No cloud, no data leaving the house.",
      technologies: ["Python", "scikit-learn", "ESP32"],
      status: "Shipping",
      year: "2026",
      role: "Design & engineering",
      url: "https://github.com/shaurya",
    },
    {
      name: "Ledgerline",
      description: "Personal finance ledger with double-entry bookkeeping behind a plain interface. Imports bank exports, keeps everything in one SQLite file.",
      technologies: ["TypeScript", "React", "Node.js"],
      status: "Live",
      year: "2025",
      role: "Design & engineering",
      url: "https://github.com/shaurya",
    },
    {
      name: "Hearth Display",
      description: "A wall-mounted e-ink dashboard built around an ESP32: weather, calendar, and transit times, running for months on a single charge.",
      technologies: ["ESP32", "C++", "Electronics"],
      status: "Prototype",
      year: "2025",
      role: "Hardware & firmware",
      url: "https://github.com/shaurya",
    },
    {
      name: "Fieldnotes",
      description: "A markdown notebook that syncs over the local network. Written to learn how conflict-free replicated data types behave under real edits.",
      technologies: ["TypeScript", "CRDTs", "Node.js"],
      status: "Experimental",
      year: "2024",
      role: "Design & engineering",
      url: "https://github.com/shaurya",
    },
  ],

  skills: [
    { group: "Programming", items: ["Python", "TypeScript", "JavaScript", "C++"] },
    { group: "AI / ML", items: ["NumPy", "scikit-learn", "PyTorch", "Model deployment"] },
    { group: "Web", items: ["React", "Next.js", "Node.js", "SQLite"] },
    { group: "Hardware", items: ["ESP32", "Microcontrollers", "Electronics", "Firmware"] },
  ],

  achievements: [
    { year: "2026", text: "Shipped Sentinel to a dozen home-lab users; it has been running untouched on my own network since." },
    { year: "2025", text: "Hearth Display survived six months on a single charge, three of them forgotten behind a bookshelf." },
    { year: "2025", text: "Finalist at a regional hackathon with a same-day build that routed delivery routes around flood water." },
    { year: "2024", text: "Taught a weekend workshop on microcontrollers; fifteen beginners left with a blinking board they soldered themselves." },
  ],

  goals: [
    "Take a hardware product from one-off prototype to a small production run.",
    "Train and deploy a model that runs entirely on a microcontroller.",
    "Write about the builds properly: the failures, not just the highlight reel.",
  ],

  contact: {
    heading: "Let's build something.",
    body: "The desk is warm and the ideas queue is long. If you have a project that mixes code and circuits, or just want to talk shop, write to me.",
    links: [
      { label: "Email", value: "hello@shaurya.dev", url: "mailto:hello@shaurya.dev" },
      { label: "GitHub", value: "github.com/shaurya", url: "https://github.com/shaurya" },
      { label: "LinkedIn", value: "linkedin.com/in/shaurya", url: "https://www.linkedin.com/in/shaurya" },
    ],
  },
};
