export function initMeteors(containerId, count = 20) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const meteor = document.createElement("span");
    meteor.className = "meteor";
    
    meteor.style.top = Math.floor(Math.random() * window.innerHeight * 0.8) + "px";
    meteor.style.left = Math.floor(Math.random() * window.innerWidth * 1.5) + "px";
    meteor.style.animationDelay = (Math.random() * 0.6 + 0.2) + "s";
    meteor.style.animationDuration = Math.floor(Math.random() * 8 + 2) + "s";
    
    container.appendChild(meteor);
  }
}