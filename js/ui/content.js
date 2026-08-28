/**
 * Section 2 renderer. Builds the digital-world content from the data
 * file into semantic HTML, so the copy stays editable in one place and
 * the DOM stays crawlable.
 */

import { portfolio } from "../data/portfolio.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function stagger(node, index) {
  node.classList.add("reveal");
  node.style.setProperty("--d", `${(index % 6) * 70}ms`);
  return node;
}

function renderWork(root) {
  const section = el("section", "panel", "");
  section.id = "work";
  const head = el("header", "panel-head");
  head.append(el("h2", "panel-title reveal", "Selected Work"));
  section.append(head);

  const list = el("ol", "work-list");
  for (const [index, project] of portfolio.projects.entries()) {
    const row = stagger(el("li", "work-row"), index);
    row.id = `work-${index + 1}`;

    const link = el(project.url ? "a" : "div", "work-link");
    if (project.url) {
      link.href = project.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.dataset.cursor = "VIEW";
    }

    const top = el("div", "work-top");
    top.append(el("span", "work-name", project.name));
    top.append(el("span", "work-year", project.year));
    const desc = el("p", "work-desc", project.description);
    const meta = el("div", "work-meta");
    meta.append(el("span", "work-tech", project.technologies.join(", ")));
    meta.append(el("span", "work-status", `${project.role}, ${project.status.toLowerCase()}`));
    link.append(top, desc, meta);
    row.append(link);
    list.append(row);
  }
  section.append(list);
  root.append(section);
}

function renderCapabilities(root) {
  const section = el("section", "panel", "");
  section.id = "capabilities";
  const head = el("header", "panel-head");
  head.append(el("h2", "panel-title", "Capabilities"));
  section.append(head);

  const grid = el("div", "cap-grid");
  for (const [index, group] of portfolio.skills.entries()) {
    const cell = stagger(el("div", "cap-cell"), index);
    cell.append(el("h3", "cap-group", group.group));
    const items = el("ul", "cap-items");
    for (const item of group.items) items.append(el("li", "", item));
    cell.append(items);
    grid.append(cell);
  }
  section.append(grid);
  root.append(section);
}

function renderEvidence(root) {
  const section = el("section", "panel", "");
  section.id = "evidence";
  const head = el("header", "panel-head");
  head.append(el("h2", "panel-title", "Evidence"));
  section.append(head);

  const list = el("ul", "evidence-list");
  for (const [index, item] of portfolio.achievements.entries()) {
    const row = stagger(el("li", "evidence-row"), index);
    row.append(el("span", "evidence-year", item.year));
    row.append(el("p", "evidence-text", item.text));
    list.append(row);
  }
  section.append(list);
  root.append(section);
}

function renderGoals(root) {
  const section = el("section", "panel", "");
  section.id = "goals";
  const head = el("header", "panel-head");
  head.append(el("h2", "panel-title", "Goals"));
  section.append(head);

  const list = el("ol", "goal-list");
  portfolio.goals.forEach((goal, index) => {
    list.append(stagger(el("li", "goal-row", goal), index));
  });
  section.append(list);
  root.append(section);
}

function renderAbout(root) {
  const section = el("section", "panel", "");
  section.id = "about";
  const head = el("header", "panel-head");
  head.append(el("h2", "panel-title", "About"));
  section.append(head);

  const stack = el("div", "about-stack");
  portfolio.section2.about.lines.forEach((line, index) => {
    const row = stagger(el("div", "about-row"), index);
    row.append(el("h3", "about-word", line.word));
    row.append(el("p", "about-text", line.text));
    stack.append(row);
  });
  section.append(stack);
  root.append(section);
}

function renderContact(root) {
  const section = el("section", "panel panel-contact", "");
  section.id = "contact";
  const inner = el("div", "contact-inner");
  inner.append(el("h2", "contact-heading", portfolio.contact.heading));
  inner.append(el("p", "contact-body", portfolio.contact.body));

  const links = el("ul", "contact-links");
  for (const link of portfolio.contact.links) {
    const a = el("a", "contact-link");
    a.href = link.url;
    if (link.url.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    a.dataset.cursor = "OPEN";
    a.append(el("span", "contact-label", link.label));
    a.append(el("span", "contact-value", link.value));
    const li = el("li", "", "");
    li.append(a);
    links.append(li);
  }
  inner.append(links);

  const foot = el("footer", "contact-foot");
  foot.append(el("span", "", `${portfolio.name}, 2026`));
  inner.append(foot);
  section.append(inner);
  root.append(section);
}

export function renderContent(root) {
  const statement = el("section", "statement", "");
  statement.id = "inside";
  const inner = stagger(el("div", "statement-inner"), 0);
  inner.append(el("p", "statement-kicker", portfolio.section2.statement.heading));
  inner.append(el("h2", "statement-text", portfolio.intro.statement));
  inner.append(el("p", "statement-body", portfolio.section2.statement.body));
  statement.append(inner);
  root.append(statement);

  renderWork(root);
  renderCapabilities(root);
  renderEvidence(root);
  renderGoals(root);
  renderAbout(root);
  renderContact(root);
}

export function renderBeats(root) {
  for (const [id, beat] of Object.entries(portfolio.beats)) {
    const beatEl = el("div", "beat", "");
    beatEl.dataset.beat = id;

    const inner = el("div", "beat-inner");
    if (id === "arrival") {
      inner.append(el("p", "beat-kicker", portfolio.intro.kicker));
      inner.append(el("p", "beat-name", portfolio.name));
      inner.append(el("p", "beat-role", portfolio.role));
      inner.append(el("p", "beat-line", portfolio.intro.statement));
    } else {
      inner.append(el("p", "beat-label", beat.label));
      inner.append(el("p", "beat-title", beat.title));
      if (beat.meta.length) {
        const meta = el("p", "beat-meta", beat.meta.join("  /  "));
        inner.append(meta);
      }
    }
    beatEl.append(inner);
    root.append(beatEl);
  }
}
