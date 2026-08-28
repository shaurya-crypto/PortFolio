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
    intro: {
      label: "",
      title: "I'M SHAURYA",
      meta: [],
    },
    dive: {
      label: "",
      title: "LET'S DIVE INSIDE MY WORLD",
      meta: [],
    },
    ready: {
      label: "",
      title: "ARE YOU READY ?? LET'S GO!!",
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
      name: "Stratum Studio",
      description: "An AI first IDE to code between multiples microcontrollers with AI. Mobile users often can't code on their microcontrollers don't worry, I have built for mobiles also",
      technologies: ["Python", "node.js", "ESP32", "Arduino", "Web-App"],
      status: "Beta",
      year: "2026",
      role: "Design & engineering",
      url: "https://github.com/shaurya-crypto/Stratumstudio",
      website: "http://stratum-studio.vercel.app",
    },
    {
      name: "Aanya AI",
      description: "Personal finance ledger with double-entry bookkeeping behind a plain interface. Imports bank exports, keeps everything in one SQLite file.",
      technologies: ["TypeScript", "React", "Node.js", "Python"],
      status: "Archived(may not work backend)",
      year: "2025",
      role: "AI & engineering",
      url: "https://github.com/shaurya-crypto/aanya-application",
      website: "https://aanyaai.dpdns.org/",
    },
    {
      name: "PicoGamepad",
      description: "Built an GamePad using Pi Pico W with dual mode Wifi & Bluetooth, I lack of gamepad's so I built my own",
      technologies: ["ESP32", "Electronics", "Pi Pico"],
      status: "Prototype/personal",
      year: "2025",
      role: "Hardware & firmware",
      url: "https://github.com/shaurya-crypto/PicoGamepad",
    },
    {
      name: "My PortFolio",
      description: "A markdown notebook that syncs over the local network. Written to learn how conflict-free replicated data types behave under real edits.",
      technologies: ["HTML", "TailwindCSS", "JS"],
      status: "Personal",
      year: "2026",
      role: "Design & engineering",
      url: "https://github.com/shaurya-crypto/portfolio",
      website: "https://shaurya-prabhakar.vercel.app",
    },
  ],

  skills: [
    { group: "Programming", items: ["Python", "JavaScript"] },
    { group: "AI / ML", items: ["NumPy", "scikit-learn(learning)", "PyTorch(learning)", "Model deployment(learning)"] },
    { group: "Web", items: ["React", "Node.js", "MongoDB"] },
    { group: "Hardware", items: ["ESP32", "Microcontrollers", "Electronics", "Firmware", "Pi Pico"] },
  ],

  achievements: [
    { year: "2026", text: "Shipped Sentinel to a dozen home-lab users; it has been running untouched on my own network since." },
    { year: "2025", text: "Hearth Display survived six months on a single charge, three of them forgotten behind a bookshelf." },
    { year: "2025", text: "Finalist at a regional hackathon with a same-day build that routed delivery routes around flood water." },
    { year: "2024", text: "Taught a weekend workshop on microcontrollers; fifteen beginners left with a blinking board they soldered themselves." },
  ],

  goals: [
    "Make StuChats a successful project and startup.",
    "Train and deploy a model that runs entirely on a microcontroller.",
    "Learn LLM's, AI agents, agentic AI, Gen AI, Neural Networks.",
    "Keep building projects, startups, turning ideas to reality.",
  ],

  contact: {
    heading: "Let's build something.",
    body: "Feel free to reach out. If you have a project that mixes code and circuits, or just want to talk, write to me.",
    links: [
      { label: "Email", value: "shauryaprabhakar097@gmail.com", url: "mailto:shauryprabhakar097@gmail.com" },
      { label: "GitHub", value: "github.com/shaurya-crypto", url: "https://github.com/shaurya-crypto" },
      { label: "LinkedIn", value: "linkedin.com/in/shaurya-prabhakar", url: "https://www.linkedin.com/in/shaurya-prabhakar" },
    ],
  },
};
