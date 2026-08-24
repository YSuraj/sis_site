const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let zoom = 1;

function notify(message) {
  $("#toast-copy").textContent = message;
  $("#toast").hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => { $("#toast").hidden = true; }, 2400);
}

function validatePublicIPv4(value) {
  if (!value || value.includes("/") || value.includes(",") || /\s/.test(value)) return "Enter exactly one IPv4 address—no ranges or multiple targets.";
  const p = value.split(".");
  if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || Number(x) > 255) || p.map(Number).join(".") !== value) return "Enter a valid canonical IPv4 address.";
  const [a,b,c] = p.map(Number);
  const blocked = a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0 && [0,2].includes(c)) || (a === 198 && [18,19,51].includes(b)) || (a === 203 && b === 0 && c === 113);
  return blocked ? "Use a routable public IPv4 address; private and reserved targets are blocked." : "";
}

function renderNodes(ip) {
  const nodes = [
    { label:"NetScope", sub:"GitHub Pages", icon:"NS", x:20, y:50, status:"healthy" },
    { label:ip, sub:"Public target", icon:"IP", x:50, y:50, status:"warning" },
    { label:"HTTP", sub:"Port 80", icon:"80", x:78, y:30, status:"healthy" },
    { label:"HTTPS", sub:"Port 443", icon:"443", x:78, y:70, status:"healthy" }
  ];
  $("#nodes").innerHTML = nodes.map((n) => `<button class="map-node ${n.status}" style="left:${n.x}%;top:${n.y}%" aria-label="${n.label}"><span class="node-orbit"><i>${n.icon}</i></span><strong>${n.label}</strong><small>${n.sub}</small></button>`).join("") + `<span class="link" style="left:25%;top:50%;width:25%"></span><span class="link" style="left:55%;top:50%;width:25%;transform:rotate(-31deg)"></span><span class="link" style="left:55%;top:50%;width:25%;transform:rotate(31deg)"></span>`;
}

function renderResults(ip) {
  const seed = ip.split(".").reduce((sum, value) => sum + Number(value), 0);
  const rows = [{port:80,service:"HTTP",state:seed % 3 ? "open" : "filtered"},{port:443,service:"HTTPS",state:"open"},{port:22,service:"SSH",state:seed % 2 ? "filtered" : "open"},{port:8080,service:"HTTP alternate",state:"filtered"}];
  const open = rows.filter((row) => row.state === "open").length;
  const risk = open >= 3 ? 68 : 34;
  $("#ports-checked").textContent = rows.length;
  $("#open-count").textContent = open;
  $("#risk-status").textContent = risk > 50 ? "Review" : "Low";
  $("#risk-score").innerHTML = `${risk}<small>/100</small>`;
  $("#risk-meter").style.width = `${risk}%`;
  $("#results").className = "";
  $("#results").innerHTML = `<table class="result-table"><thead><tr><th>Port</th><th>Service</th><th>State</th><th>Source</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.port}</td><td>${row.service}</td><td class="port-${row.state}">${row.state}</td><td>Simulated</td></tr>`).join("")}</tbody></table>`;
}

function openModal() { $("#scan-modal").hidden = false; setTimeout(() => $("#scan-ip").focus(), 0); }
function closeModal() { $("#scan-modal").hidden = true; $("#scan-error").hidden = true; }

$("#open-scan").addEventListener("click", openModal);
$("#close-scan").addEventListener("click", closeModal);
$("#cancel-scan").addEventListener("click", closeModal);
$("#scan-modal").addEventListener("click", (event) => { if (event.target === event.currentTarget) closeModal(); });
$("#scan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const ip = $("#scan-ip").value.trim();
  const error = validatePublicIPv4(ip) || (!$("#authorized").checked ? "Confirm that you are authorized to assess this IP." : "");
  if (error) { $("#scan-error").textContent = `! ${error}`; $("#scan-error").hidden = false; return; }
  closeModal();
  $("#target-ip").textContent = ip; $("#target-copy").textContent = "Simulated assessment complete · no live traffic sent"; $("#target-state").textContent = "COMPLETE"; $("#target-state").classList.add("ready");
  $("#map-subtitle").textContent = `Single target · ${ip}`; $("#inspect-status").textContent = "ASSESSED"; $("#inspect-title").textContent = "Public IPv4"; $("#inspect-ip").textContent = ip;
  renderNodes(ip); renderResults(ip); notify(`Prototype assessment complete · ${ip}`);
});

$$('[data-target]').forEach((button) => button.addEventListener("click", () => { document.getElementById(button.dataset.target)?.scrollIntoView({behavior:"smooth"}); if (button.closest("nav")) { $$('nav button').forEach((item) => item.classList.remove("active")); button.classList.add("active"); } }));
$$('[data-view]').forEach((button) => button.addEventListener("click", () => { $$('[data-view]').forEach((item) => item.classList.remove("on")); button.classList.add("on"); $("#network-canvas").className = `network-canvas ${button.dataset.view}`; }));
$$('[data-zoom]').forEach((button) => button.addEventListener("click", () => { zoom = button.dataset.zoom === "in" ? Math.min(1.3, zoom + .1) : button.dataset.zoom === "out" ? Math.max(.8, zoom - .1) : 1; $("#map-layer").style.transform = `scale(${zoom})`; }));
$('[data-action="focus-search"]').addEventListener("click", () => $("#asset-search").focus());
$('[data-action="report"]').addEventListener("click", () => notify("Demo report prepared"));
$("#asset-search").addEventListener("input", (event) => { const query = event.target.value.toLowerCase(); $$(".map-node").forEach((node) => node.classList.toggle("dimmed", !node.textContent.toLowerCase().includes(query))); });
document.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#asset-search").focus(); } if (event.key === "Escape") closeModal(); });
renderNodes("Awaiting input");
