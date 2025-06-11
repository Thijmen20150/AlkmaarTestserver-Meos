// ------------------- ACCOUNTS persistent -------------------
const users = JSON.parse(localStorage.getItem('meos_accounts') || "null") || [
  { username: "admin", password: "admin123", rol: "Admin" },
  { username: "pol", password: "pol123", rol: "Agent" }
];
function saveUsersDb() {
  localStorage.setItem('meos_accounts', JSON.stringify(users));
}

// ------------------- DATA persistent -------------------
function saveData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadData(key, fallback) {
  try { const val = localStorage.getItem(key); if (!val) return fallback; return JSON.parse(val); }
  catch { return fallback; }
}
let kentekens = loadData('meos_kentekens', {
  "AB-123-CD": { eigenaar: "Jan Jansen", merk: "Volkswagen", type: "Golf", status: "Geen bijzonderheden" },
  "XY-987-ZT": { eigenaar: "Piet Pietersen", merk: "BMW", type: "3 Serie", status: "Gestolen" }
});
let personen = loadData('meos_personen', {
  "jan jansen": { geboortedatum: "1990-01-01", strafblad: "Geen", openstaande_boetes: 0 },
  "piet pietersen": { geboortedatum: "1985-02-02", strafblad: "Diefstal (2022)", openstaande_boetes: 3 }
});
let meldingen = loadData('meos_meldingen', []);
let signaleringen = loadData('meos_signaleringen', []);
let boetes = loadData('meos_boetes', []);
let burgers = loadData('meos_burgers', [
  { naam: "Jan Jansen", geboortedatum: "1990-01-01" },
  { naam: "Piet Pietersen", geboortedatum: "1985-02-02" }
]);
let voertuigen = loadData('meos_voertuigen', [
  { kenteken: "AB-123-CD", eigenaar: "Jan Jansen", merk: "Volkswagen", type: "Golf" },
  { kenteken: "XY-987-ZT", eigenaar: "Piet Pietersen", merk: "BMW", type: "3 Serie" }
]);
let notities = loadData('meos_notities', []);
let gebruikers = loadData('meos_gebruikers', [
  { naam: "thijmen20150", rol: "Admin" },
  { naam: "agentje", rol: "Agent" }
]);

let ingelogdeGebruiker = null;

// ------------------- TOAST MELDINGEN -------------------
function showToast(bericht) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = bericht;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ------------------- LOGIN + SESSIE persistent -------------------
function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errorDiv = document.getElementById('login-error');
  if (!username || !password) {
    errorDiv.textContent = "Gebruikersnaam en wachtwoord invullen.";
    return;
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    errorDiv.textContent = "Ongeldige gebruikersnaam of wachtwoord.";
    return;
  }
  ingelogdeGebruiker = { naam: user.username, rol: user.rol };
  localStorage.setItem('meos_user', JSON.stringify(ingelogdeGebruiker));
  errorDiv.textContent = "";
  document.getElementById('login-screen').style.display = "none";
  document.getElementById('meos-app').style.display = "flex";
  buildMenu();
  showPage("dashboard");
  showUserInfo();
  showToast("Succesvol ingelogd!");
}

// ----------------- Password show/hide -----------------
function togglePassword(inputId, toggleId) {
  const inp = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (inp.type === "password") {
    inp.type = "text";
    toggle.classList.add("showing");
  } else {
    inp.type = "password";
    toggle.classList.remove("showing");
  }
}

// ------------------- MENU bouwen -------------------
function buildMenu() {
  const nav = document.getElementById('nav-menu');
  nav.innerHTML = "";
  let menu = [
    { id: "dashboard", label: "Dashboard" },
    { id: "kenteken", label: "Kentekencheck" },
    { id: "persoon", label: "Persoonscheck" },
    { id: "meldingen", label: "Meldingen" },
    { id: "signaleringen", label: "Signaleringen" },
    { id: "boetes", label: "Boetes" },
    { id: "burgers", label: "Burgers" },
    { id: "voertuigen", label: "Voertuigen" },
    { id: "notities", label: "Notities" }
  ];
  if (ingelogdeGebruiker && ingelogdeGebruiker.rol === "Admin") {
    menu.push({ id: "gebruikers", label: "Gebruikersbeheer" });
    menu.push({ id: "accounts", label: "Account aanmaken" });
  }
  menu.push({ id: "uitloggen", label: "Uitloggen" });
  menu.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.onclick = () => showPage(item.id);
    nav.appendChild(btn);
  });
}

// ------------------- UITLOGGEN en page wissel -------------------
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
  document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
  const navBtns = document.querySelectorAll('.sidebar button');
  navBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(page)) btn.classList.add('active');
  });
  if (page === "uitloggen") {
    setTimeout(() => {
      ingelogdeGebruiker = null;
      localStorage.removeItem('meos_user');
      document.getElementById('meos-app').style.display = "none";
      document.getElementById('login-screen').style.display = "flex";
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
      document.getElementById("login-error").textContent = "";
      document.getElementById('login-password').type = "password";
      document.getElementById('pw-toggle-login').classList.remove("showing");
      showToast("Uitgelogd!");
    }, 1200);
  }
  if (page === "dashboard") showUserInfo();
  if (page === "accounts") {
    renderAccountLijst();
    document.getElementById('account-aanmaak-bericht').textContent = "";
  }
  if (page === "persoon") {
    if (document.getElementById('naam-input')) {
      renderBurgerSuggesties();
    }
  }
}

// ------------------- SESSIE herstellen bij openen pagina -------------------
window.onload = function() {
  const saved = localStorage.getItem('meos_user');
  if (saved) {
    try {
      ingelogdeGebruiker = JSON.parse(saved);
      document.getElementById('login-screen').style.display = "none";
      document.getElementById('meos-app').style.display = "flex";
      buildMenu();
      showPage("dashboard");
      showUserInfo();
    } catch (e) {
      localStorage.removeItem('meos_user');
    }
  }
  renderAll();
};

// ------------------- INFO EN RENDERING FUNCTIES -------------------
function showUserInfo() {
  const infoDiv = document.getElementById("user-info");
  if (!ingelogdeGebruiker) return;
  infoDiv.innerHTML = `<b>Ingelogd als:</b> ${ingelogdeGebruiker.naam} (${ingelogdeGebruiker.rol})`;
}
function renderAll() {
  renderMeldingen();
  renderSignaleringen();
  renderBoetes();
  renderBurgers();
  renderVoertuigen();
  renderNotities();
  renderGebruikers();
}

// ------------------- Kentekencheck -------------------
function kentekenCheck() {
  const input = document.getElementById('kenteken-input').value.toUpperCase().trim();
  const resultDiv = document.getElementById('kenteken-result');
  if (kentekens[input]) {
    const k = kentekens[input];
    resultDiv.innerHTML = `<b>Kenteken:</b> ${input}<br>
      <b>Eigenaar:</b> ${k.eigenaar}<br>
      <b>Voertuig:</b> ${k.merk} ${k.type}<br>
      <b>Status:</b> ${k.status}`;
  } else {
    resultDiv.innerHTML = "Kenteken niet gevonden of geen gegevens.";
  }
}

// ------------------- Persoonscheck + burgersuggesties -------------------
function persoonsCheck(naamOverride = null) {
  const input = naamOverride || document.getElementById('naam-input').value.trim();
  const naamKey = input.toLowerCase();
  const resultDiv = document.getElementById('persoon-result');
  if (personen[naamKey]) {
    const p = personen[naamKey];
    const persoonsBoetes = boetes.filter(b => b.naam.toLowerCase() === naamKey);
    let boeteHtml = persoonsBoetes.length === 0
      ? "<i>Geen boetes gevonden.</i>"
      : "<ul>" + persoonsBoetes.map(b =>
          `<li>€${b.bedrag} – ${b.reden} <span style="float:right">${b.tijd}</span></li>`
        ).join("") + "</ul>";
    resultDiv.innerHTML = `<b>Naam:</b> ${capitalize(input)}<br>
      <b>Geboortedatum:</b> ${p.geboortedatum}<br>
      <b>Strafblad:</b> ${p.strafblad}<br>
      <b>Openstaande boetes:</b> ${p.openstaande_boetes}
      <br><b>Uitgeschreven boetes:</b><br>${boeteHtml}`;
  } else {
    resultDiv.innerHTML = `
      Persoon niet gevonden of geen gegevens.<br>
      <button type="button" onclick="burgerToevoegenViaPersoon()">Voeg toe aan burgers</button>
    `;
  }
}
function burgerToevoegenViaPersoon() {
  const naam = capitalize(document.getElementById('naam-input').value.trim());
  if (!naam) return;
  const geboortedatum = prompt('Geboortedatum van ' + naam + ' (YYYY-MM-DD):', '2000-01-01');
  if (geboortedatum) {
    burgers.push({ naam, geboortedatum });
    personen[naam.toLowerCase()] = personen[naam.toLowerCase()] || {};
    personen[naam.toLowerCase()].geboortedatum = geboortedatum;
    saveData('meos_burgers', burgers);
    saveData('meos_personen', personen);
    renderBurgers();
    persoonsCheck(naam);
    renderBurgerSuggesties();
    showToast("Persoon toegevoegd!");
  }
}
// Suggesties tonen onder persoonscheck
function renderBurgerSuggesties() {
  const input = document.getElementById('naam-input').value.trim().toLowerCase();
  const ul = document.getElementById('burger-suggesties');
  ul.innerHTML = '';
  if (!burgers.length) return;
  burgers
    .filter(b => !input || b.naam.toLowerCase().includes(input))
    .forEach(b => {
      const li = document.createElement('li');
      li.style.cursor = "pointer";
      li.style.textDecoration = "underline";
      li.style.color = "#00ffd0";
      li.textContent = b.naam + (b.geboortedatum ? ` (${b.geboortedatum})` : '');
      li.onclick = () => {
        document.getElementById('naam-input').value = b.naam;
        persoonsCheck(b.naam);
      };
      ul.appendChild(li);
    });
}
document.addEventListener('DOMContentLoaded', () => {
  const naamInput = document.getElementById('naam-input');
  if (naamInput) {
    naamInput.addEventListener('input', renderBurgerSuggesties);
    renderBurgerSuggesties();
  }
});

// ------------------- Meldingen -------------------
function meldingToevoegen() {
  const titel = document.getElementById('melding-titel').value.trim();
  const omschrijving = document.getElementById('melding-omschrijving').value.trim();
  if (titel && omschrijving) {
    meldingen.unshift({ titel, omschrijving, tijd: new Date().toLocaleTimeString('nl-NL') });
    saveData('meos_meldingen', meldingen);
    renderMeldingen();
    document.getElementById('melding-titel').value = '';
    document.getElementById('melding-omschrijving').value = '';
    showToast("Melding toegevoegd!");
  }
}
function renderMeldingen() {
  const lijst = document.getElementById('melding-lijst');
  lijst.innerHTML = '';
  meldingen.forEach((m, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${m.titel}</b> <span style="float:right">${m.tijd}</span><br>${m.omschrijving}
      <button class="delete-btn" onclick="verwijderMelding(${idx})">X</button>`;
    lijst.appendChild(li);
  });
}
function verwijderMelding(idx) {
  meldingen.splice(idx, 1);
  saveData('meos_meldingen', meldingen);
  renderMeldingen();
  showToast("Melding verwijderd!");
}

// ------------------- Signaleringen -------------------
function signaleringToevoegen() {
  const type = document.getElementById('signa-type').value.trim();
  const info = document.getElementById('signa-info').value.trim();
  if (type && info) {
    signaleringen.unshift({ type, info, tijd: new Date().toLocaleTimeString('nl-NL') });
    saveData('meos_signaleringen', signaleringen);
    renderSignaleringen();
    document.getElementById('signa-type').value = '';
    document.getElementById('signa-info').value = '';
    showToast("Signalering toegevoegd!");
  }
}
function renderSignaleringen() {
  const lijst = document.getElementById('signalering-lijst');
  lijst.innerHTML = '';
  signaleringen.forEach((s, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${s.type}</b> - ${s.info} <span style="float:right">${s.tijd}</span>
      <button class="delete-btn" onclick="verwijderSignalering(${idx})">X</button>`;
    lijst.appendChild(li);
  });
}
function verwijderSignalering(idx) {
  signaleringen.splice(idx, 1);
  saveData('meos_signaleringen', signaleringen);
  renderSignaleringen();
  showToast("Signalering verwijderd!");
}

// ------------------- Boetes -------------------
function boeteToevoegen() {
  const naam = document.getElementById('boete-naam').value.trim();
  const reden = document.getElementById('boete-reden').value.trim();
  const bedrag = parseInt(document.getElementById('boete-bedrag').value, 10);
  if (naam && reden && bedrag > 0) {
    boetes.unshift({ naam, reden, bedrag, tijd: new Date().toLocaleTimeString('nl-NL') });
    saveData('meos_boetes', boetes);
    renderBoetes();
    document.getElementById('boete-naam').value = '';
    document.getElementById('boete-reden').value = '';
    document.getElementById('boete-bedrag').value = '';
    showToast("Boete toegevoegd!");
  }
}
function renderBoetes() {
  const lijst = document.getElementById('boete-lijst');
  lijst.innerHTML = '';
  boetes.forEach((b, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${b.naam}</b> (€${b.bedrag}) - ${b.reden} <span style="float:right">${b.tijd}</span>
      <button class="delete-btn" onclick="verwijderBoete(${idx})">X</button>`;
    lijst.appendChild(li);
  });
}
function verwijderBoete(idx) {
  boetes.splice(idx, 1);
  saveData('meos_boetes', boetes);
  renderBoetes();
  showToast("Boete verwijderd!");
}

// ------------------- Burgers -------------------
function burgerToevoegen() {
  const naam = capitalize(document.getElementById('burger-naam').value.trim());
  const geboortedatum = document.getElementById('burger-geboorte').value;
  if (naam && geboortedatum) {
    const idx = burgers.findIndex(b => b.naam.toLowerCase() === naam.toLowerCase());
    if (idx >= 0) burgers[idx].geboortedatum = geboortedatum;
    else burgers.push({ naam, geboortedatum });
    personen[naam.toLowerCase()] = personen[naam.toLowerCase()] || {};
    personen[naam.toLowerCase()].geboortedatum = geboortedatum;
    saveData('meos_burgers', burgers);
    saveData('meos_personen', personen);
    renderBurgers();
    document.getElementById('burger-naam').value = '';
    document.getElementById('burger-geboorte').value = '';
    showToast("Persoon toegevoegd!");
  }
}
function renderBurgers(filter = "") {
  const lijst = document.getElementById('burger-lijst');
  lijst.innerHTML = '';
  burgers.filter(b => b.naam.toLowerCase().includes(filter.toLowerCase()))
    .forEach((b, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<b class="burger-link" onclick="toonBurgerDetails('${b.naam.replace(/'/g,"\\'")}')">${b.naam}</b> (${b.geboortedatum})
        <button class="delete-btn" onclick="verwijderBurger(${idx})">X</button>`;
      lijst.appendChild(li);
    });
}
function zoekBurgers() {
  const filter = document.getElementById('burger-zoek').value;
  renderBurgers(filter);
}
function verwijderBurger(idx) {
  delete personen[burgers[idx].naam.toLowerCase()];
  burgers.splice(idx, 1);
  saveData('meos_burgers', burgers);
  saveData('meos_personen', personen);
  renderBurgers(document.getElementById('burger-zoek').value);
  showToast("Persoon verwijderd!");
}
function toonBurgerDetails(naam) {
  const burger = burgers.find(b => b.naam === naam);
  const p = personen[naam.toLowerCase()];
  const persoonsBoetes = boetes.filter(b => b.naam.toLowerCase() === naam.toLowerCase());
  let boeteHtml = "";
  if (persoonsBoetes.length === 0) {
    boeteHtml = "<i>Geen boetes gevonden.</i>";
  } else {
    boeteHtml = "<ul>" + persoonsBoetes.map(b =>
      `<li>€${b.bedrag} – ${b.reden} <span style="float:right">${b.tijd}</span></li>`
    ).join("") + "</ul>";
  }
  document.getElementById('burger-modal-body').innerHTML = `
    <h2>${naam}</h2>
    <b>Geboortedatum:</b> ${burger?.geboortedatum || '-'}<br>
    <b>Strafblad:</b> ${p?.strafblad || 'Geen'}<br>
    <b>Openstaande boetes:</b> ${p?.openstaande_boetes || 0}<br>
    <b>Uitgeschreven boetes:</b><br>${boeteHtml}
  `;
  document.getElementById('burger-modal').style.display = 'block';
}
function closeBurgerModal() {
  document.getElementById('burger-modal').style.display = 'none';
}

// ------------------- Voertuigen -------------------
function voertuigToevoegen() {
  const kenteken = document.getElementById('voertuig-kenteken').value.toUpperCase().trim();
  const eigenaar = capitalize(document.getElementById('voertuig-eigenaar').value.trim());
  const merk = document.getElementById('voertuig-merk').value.trim();
  const type = document.getElementById('voertuig-type').value.trim();
  if (kenteken && eigenaar && merk && type) {
    const idx = voertuigen.findIndex(v => v.kenteken === kenteken);
    if (idx >= 0) voertuigen[idx] = { kenteken, eigenaar, merk, type };
    else voertuigen.push({ kenteken, eigenaar, merk, type });
    kentekens[kenteken] = { eigenaar, merk, type, status: "Geen bijzonderheden" };
    saveData('meos_voertuigen', voertuigen);
    saveData('meos_kentekens', kentekens);
    renderVoertuigen();
    document.getElementById('voertuig-kenteken').value = '';
    document.getElementById('voertuig-eigenaar').value = '';
    document.getElementById('voertuig-merk').value = '';
    document.getElementById('voertuig-type').value = '';
    showToast("Kenteken toegevoegd!");
  }
}
function renderVoertuigen(filter = "") {
  const lijst = document.getElementById('voertuig-lijst');
  lijst.innerHTML = '';
  voertuigen.filter(v =>
    v.kenteken.toLowerCase().includes(filter.toLowerCase()) ||
    v.eigenaar.toLowerCase().includes(filter.toLowerCase()))
    .forEach((v, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${v.kenteken}</b> - ${v.merk} ${v.type} (${v.eigenaar})
        <button class="delete-btn" onclick="verwijderVoertuig(${idx})">X</button>`;
      lijst.appendChild(li);
    });
}
function zoekVoertuigen() {
  const filter = document.getElementById('voertuig-zoek').value;
  renderVoertuigen(filter);
}
function verwijderVoertuig(idx) {
  delete kentekens[voertuigen[idx].kenteken];
  voertuigen.splice(idx, 1);
  saveData('meos_voertuigen', voertuigen);
  saveData('meos_kentekens', kentekens);
  renderVoertuigen(document.getElementById('voertuig-zoek').value);
  showToast("Kenteken verwijderd!");
}

// ------------------- Notities -------------------
function notitieToevoegen() {
  const onderwerp = document.getElementById('notitie-onderwerp').value.trim();
  const inhoud = document.getElementById('notitie-inhoud').value.trim();
  if (onderwerp && inhoud) {
    notities.unshift({ onderwerp, inhoud, tijd: new Date().toLocaleTimeString('nl-NL') });
    saveData('meos_notities', notities);
    renderNotities();
    document.getElementById('notitie-onderwerp').value = '';
    document.getElementById('notitie-inhoud').value = '';
    showToast("Notitie toegevoegd!");
  }
}
function renderNotities(filter = "") {
  const lijst = document.getElementById('notitie-lijst');
  lijst.innerHTML = '';
  notities.filter(n => n.onderwerp.toLowerCase().includes(filter.toLowerCase()))
    .forEach((n, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${n.onderwerp}</b> <span style="float:right">${n.tijd}</span><br>${n.inhoud}
        <button class="delete-btn" onclick="verwijderNotitie(${idx})">X</button>`;
      lijst.appendChild(li);
    });
}
function zoekNotities() {
  const filter = document.getElementById('notitie-zoek').value;
  renderNotities(filter);
}
function verwijderNotitie(idx) {
  notities.splice(idx, 1);
  saveData('meos_notities', notities);
  renderNotities(document.getElementById('notitie-zoek').value);
  showToast("Notitie verwijderd!");
}

// ------------------- Gebruikersbeheer -------------------
function gebruikerToevoegen() {
  const naam = document.getElementById('gebruiker-naam').value.trim();
  const rol = document.getElementById('gebruiker-rol').value;
  if (naam && rol) {
    const idx = gebruikers.findIndex(g => g.naam.toLowerCase() === naam.toLowerCase());
    if (idx >= 0) gebruikers[idx].rol = rol;
    else gebruikers.push({ naam, rol });
    saveData('meos_gebruikers', gebruikers);
    renderGebruikers();
    document.getElementById('gebruiker-naam').value = '';
    document.getElementById('gebruiker-rol').value = '';
    showToast("Gebruiker toegevoegd!");
  }
}
function renderGebruikers(filter = "") {
  const lijst = document.getElementById('gebruiker-lijst');
  lijst.innerHTML = '';
  gebruikers.filter(g =>
    g.naam.toLowerCase().includes(filter.toLowerCase()) ||
    g.rol.toLowerCase().includes(filter.toLowerCase()))
    .forEach((g, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${g.naam}</b> (${g.rol})
        <button class="delete-btn" onclick="verwijderGebruiker(${idx})">X</button>`;
      lijst.appendChild(li);
    });
}
function zoekGebruikers() {
  const filter = document.getElementById('gebruiker-zoek').value;
  renderGebruikers(filter);
}
function verwijderGebruiker(idx) {
  gebruikers.splice(idx, 1);
  saveData('meos_gebruikers', gebruikers);
  renderGebruikers(document.getElementById('gebruiker-zoek').value);
  showToast("Gebruiker verwijderd!");
}

// ------------------- Accountbeheer (admin) -------------------
function accountAanmaken() {
  const username = document.getElementById('account-username').value.trim();
  const password = document.getElementById('account-password').value.trim();
  const rol = document.getElementById('account-rol').value;
  const bericht = document.getElementById('account-aanmaak-bericht');
  if (!username || !password || !rol) {
    bericht.style.color = "#ff4444";
    bericht.textContent = "Vul alle velden in!";
    return;
  }
  if (users.find(u => u.username === username)) {
    bericht.style.color = "#ff4444";
    bericht.textContent = "Gebruikersnaam bestaat al.";
    return;
  }
  users.push({ username, password, rol });
  saveUsersDb();
  bericht.style.color = "#00ffd0";
  bericht.textContent = "Account aangemaakt!";
  document.getElementById('account-username').value = "";
  document.getElementById('account-password').value = "";
  document.getElementById('account-rol').value = "";
  document.getElementById('account-password').type = "password";
  document.getElementById('pw-toggle-account').classList.remove("showing");
  renderAccountLijst();
  showToast("Account aangemaakt!");
}
function renderAccountLijst() {
  const ul = document.getElementById('account-lijst');
  ul.innerHTML = '';
  users.forEach((u, idx) => {
    let self = (ingelogdeGebruiker && ingelogdeGebruiker.naam === u.username);
    let changeBtn = `<button class="change-btn" onclick="toonWachtwoordWijzigen(${idx})">Wachtwoord wijzigen</button>`;
    const li = document.createElement('li');
    li.innerHTML = 
      `<b>${u.username}</b>
       <span class="account-rol">(${u.rol})</span>
       ${self ? '<span class="account-self">(ingelogd)</span>' : ''}
       ${changeBtn}
       <button class="delete-btn" onclick="verwijderAccount(${idx})" ${self?'disabled title="Je kunt je eigen account niet verwijderen."':''}>X</button>`;
    ul.appendChild(li);
  });
}
function toonWachtwoordWijzigen(idx) {
  const gebruiker = users[idx];
  const nieuwWachtwoord = prompt(`Nieuw wachtwoord instellen voor "${gebruiker.username}":`);
  if (nieuwWachtwoord && nieuwWachtwoord.trim().length >= 3) {
    gebruiker.password = nieuwWachtwoord.trim();
    saveUsersDb();
    showToast(`Wachtwoord van "${gebruiker.username}" aangepast!`);
  } else if (nieuwWachtwoord !== null) {
    showToast("Wachtwoord niet gewijzigd (te kort of leeg).");
  }
}
function verwijderAccount(idx) {
  if (users[idx].username === ingelogdeGebruiker.naam) return;
  if (!confirm(`Account "${users[idx].username}" verwijderen?`)) return;
  users.splice(idx, 1);
  saveUsersDb();
  renderAccountLijst();
  showToast("Account verwijderd!");
}

// ------------------- Utils -------------------
function capitalize(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
window.onclick = function(event) {
  let modal = document.getElementById('burger-modal');
  if (event.target === modal) {
    closeBurgerModal();
  }
}