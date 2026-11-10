const KEYS = {
  signedIn: "scholarspace_signed_in",
  email: "scholarspace_email",
  projects: "scholarspace_projects",
  profile: "scholarspace_profile",
  activity: "scholarspace_activity"
};

const starterProjects = [
  { id: "starter-1", title: "The Solar System", subject: "Science", description: "A colorful guide to the planets, their moons, and what makes each one unique.", date: "Oct 24, 2026", symbol: "◉", cover: "purple-cover" },
  { id: "starter-2", title: "Shapes in Nature", subject: "Art & Design", description: "An illustrated collection exploring patterns, symmetry, and shapes found outdoors.", date: "Oct 18, 2026", symbol: "✿", cover: "orange-cover" },
  { id: "starter-3", title: "My First Website", subject: "Technology", description: "A simple website built with HTML and CSS to share my favorite books and ideas.", date: "Oct 12, 2026", symbol: "⌘", cover: "blue-cover" }
];

const coverStyles = ["purple-cover", "blue-cover", "orange-cover", "green-cover", "pink-cover"];
const subjectSymbols = { Science: "◉", Math: "∑", Technology: "⌘", "Art & Design": "✿", Writing: "✎", Other: "✦" };

const $ = (selector) => document.querySelector(selector);
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let projects = read(KEYS.projects, starterProjects);
let profile = read(KEYS.profile, {
  name: "Jordan Davis",
  role: "Curious student & creative thinker",
  bio: "I love exploring new ideas, building things, and learning how the world works."
});
let activities = read(KEYS.activity, [
  { icon: "✦", text: "Added <strong>The Solar System</strong> to your portfolio", time: "2 days ago" },
  { icon: "↗", text: "Reached a <strong>5 day learning streak</strong>", time: "4 days ago" },
  { icon: "✧", text: "Earned the <strong>Curiosity in action</strong> badge", time: "1 week ago" }
]);
let toastTimer;

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "JD";
}

function setPageTitle(title) {
  $("#breadcrumbPage").textContent = title;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderProjects(target, list) {
  if (!list.length) {
    target.innerHTML = `<div class="empty-state"><strong>Your next great idea starts here.</strong>Click “Add project” to share something you’ve made or learned.</div>`;
    return;
  }

  target.innerHTML = list.map(project => `
    <article class="project-card">
      <div class="project-cover ${project.cover}">
        <span class="cover-symbol">${project.symbol}</span>
      </div>
      <div class="project-content">
        <span class="project-subject">${project.subject}</span>
        <h3 title="${escapeHtml(project.title)}">${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-footer"><span>${escapeHtml(project.date)}</span><button data-delete="${project.id}" title="Remove project" aria-label="Remove ${escapeHtml(project.title)}">•••</button></div>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function renderActivity() {
  $("#activityList").innerHTML = activities.slice(0, 4).map(item => `
    <div class="activity-item"><span class="activity-dot">${item.icon}</span>
      <span class="activity-copy">${item.text}</span><span class="activity-time">${item.time}</span>
    </div>
  `).join("");
}

function render() {
  const firstName = profile.name.trim().split(/\s+/)[0] || "Student";
  $("#welcomeTitle").innerHTML = `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${escapeHtml(firstName)} <span class="wave">✦</span>`;
  $("#sidebarName").textContent = profile.name;
  $("#topAvatar").textContent = initials(profile.name);
  $("#profileAvatar").textContent = initials(profile.name);
  $("#profileName").value = profile.name;
  $("#profileRole").value = profile.role;
  $("#profileBio").value = profile.bio;
  $("#statProjects").textContent = projects.length;
  $("#projectCount").textContent = projects.length;
  $("#todayLabel").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
  renderProjects($("#projectGrid"), projects.slice(0, 3));
  renderProjects($("#allProjectGrid"), projects);
  renderActivity();
}

function openModal() {
  $("#projectModal").classList.remove("hidden");
  $("#projectTitle").focus();
}
function closeModal() {
  $("#projectModal").classList.add("hidden");
  $("#projectForm").reset();
}

function goTo(view) {
  const views = ["overview", "projects", "achievements", "profile"];
  views.forEach(name => {
    const section = $(`#${name}View`);
    if (section) section.classList.toggle("hidden", name !== view);
  });
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  setPageTitle(view.charAt(0).toUpperCase() + view.slice(1));
}

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#email").value.trim();
  if (!email || !$("#password").value) return;
  localStorage.setItem(KEYS.signedIn, "true");
  localStorage.setItem(KEYS.email, email);
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  render();
});

$("#logoutButton").addEventListener("click", () => {
  localStorage.removeItem(KEYS.signedIn);
  $("#app").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  showToast("You’ve signed out.");
});

$("#addProjectButton").addEventListener("click", openModal);
$("#sidebarAddProject").addEventListener("click", openModal);
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#tipAddButton").addEventListener("click", openModal);

$("#projectModal").addEventListener("click", event => {
  if (event.target === $("#projectModal")) closeModal();
});

$("#projectForm").addEventListener("submit", event => {
  event.preventDefault();
  const subject = $("#projectSubject").value;
  const project = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: $("#projectTitle").value.trim(),
    subject,
    description: $("#projectDescription").value.trim(),
    date: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
    symbol: subjectSymbols[subject] || "✦",
    cover: coverStyles[projects.length % coverStyles.length]
  };
  if (!project.title || !project.description) return;

  projects.unshift(project);
  activities.unshift({ icon: "✦", text: `Added <strong>${escapeHtml(project.title)}</strong> to your portfolio`, time: "Just now" });
  save(KEYS.projects, projects);
  save(KEYS.activity, activities);
  render();
  closeModal();
  showToast("Project added to your portfolio.");
});

document.querySelectorAll(".nav-link").forEach(button => button.addEventListener("click", () => goTo(button.dataset.view)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));

document.addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;
  const project = projects.find(item => item.id === deleteButton.dataset.delete);
  projects = projects.filter(item => item.id !== deleteButton.dataset.delete);
  save(KEYS.projects, projects);
  render();
  showToast(project ? `"${project.title}" removed.` : "Project removed.");
});

$("#profileForm").addEventListener("submit", event => {
  event.preventDefault();
  profile = {
    name: $("#profileName").value.trim() || "Student",
    role: $("#profileRole").value.trim(),
    bio: $("#profileBio").value.trim()
  };
  save(KEYS.profile, profile);
  render();
  showToast("Profile saved.");
});

$("#topAvatar").addEventListener("click", () => goTo("profile"));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

if (localStorage.getItem(KEYS.signedIn) === "true") {
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  render();
}