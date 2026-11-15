(function () {
"use strict";

/* =====================================================================
   DÉMO GRAND PUBLIC
   Aucun prénom n'est écrit dans le code : tout se règle à l'accueil,
   puis dans les réglages. Les données restent dans ce navigateur.
   ===================================================================== */
var CONFIG = {
  /* true : un bandeau « Démo » le rappelle. */
  demo: true,
  /* La ville proposée d'office, tant que rien n'est choisi. */
  lieuDefaut: "Paris"
};

/* Une clé propre à la démo : ses données ne croisent jamais celles d'une autre version. */
var KEY = "veilleuse.demo.v1";

/* La géolocalisation est bloquée dans les artefacts : on choisit sa ville dans une liste.
   Elle sert au lever et au coucher du soleil, et aux horaires des prières. Nom, latitude, longitude. */
var VILLES = [
  ["Aix-en-Provence", 43.5297, 5.4474], ["Ajaccio", 41.9192, 8.7386], ["Amiens", 49.8941, 2.2958], ["Angers", 47.4784, -0.5632],
  ["Annecy", 45.8992, 6.1294], ["Avignon", 43.9493, 4.8055], ["Bastia", 42.6977, 9.4509], ["Bayonne", 43.4929, -1.4748],
  ["Besançon", 47.2378, 6.0241], ["Bordeaux", 44.8378, -0.5792], ["Brest", 48.3904, -4.4861], ["Caen", 49.1829, -0.3707],
  ["Cayenne", 4.9224, -52.3135], ["Clermont-Ferrand", 45.7772, 3.0870], ["Dijon", 47.3220, 5.0415], ["Fort-de-France", 14.6161, -61.0588],
  ["Grenoble", 45.1885, 5.7245], ["La Rochelle", 46.1603, -1.1511], ["Le Havre", 49.4944, 0.1079], ["Le Mans", 48.0061, 0.1996],
  ["Lille", 50.6292, 3.0573], ["Limoges", 45.8336, 1.2611], ["Lyon", 45.7640, 4.8357], ["Mamoudzou", -12.7806, 45.2278],
  ["Marseille", 43.2965, 5.3698], ["Metz", 49.1193, 6.1757], ["Montpellier", 43.6108, 3.8767], ["Mulhouse", 47.7508, 7.3359],
  ["Nancy", 48.6921, 6.1844], ["Nantes", 47.2184, -1.5536], ["Nice", 43.7102, 7.2620], ["Nîmes", 43.8367, 4.3601],
  ["Orléans", 47.9029, 1.9093], ["Paris", 48.8566, 2.3522], ["Pau", 43.2951, -0.3708], ["Perpignan", 42.6887, 2.8948],
  ["Pointe-à-Pitre", 16.2411, -61.5331], ["Poitiers", 46.5802, 0.3404], ["Reims", 49.2583, 4.0317], ["Rennes", 48.1173, -1.6778],
  ["Rouen", 49.4432, 1.0993], ["Saint-Denis (La Réunion)", -20.8823, 55.4504], ["Saint-Étienne", 45.4397, 4.3872], ["Strasbourg", 48.5734, 7.7521],
  ["Toulon", 43.1242, 5.9280], ["Toulouse", 43.6047, 1.4442], ["Tours", 47.3941, 0.6848]
];

/* Les curseurs : chacun nomme un besoin, pas un diagnostic, et allume ou éteint des contenus.
   ic : le nom de son icône, dans la liste I plus bas. */
var BESOINS = [
  { k: "humeur", ic: "lune", nom: "Mon humeur et mon sommeil", d: "Deux lignes de plus dans la jauge, et leur évolution au fil des jours." },
  { k: "crise", ic: "plan", nom: "Mon plan de crise", d: "Écrit quand ça va, sous la main quand ça ne va pas." },
  { k: "traitement", ic: "traitement", nom: "Mon traitement et mes rappels", d: "Mes prises à cocher chaque jour, avec leur heure." },
  { k: "souvenir", ic: "memo", nom: "Me souvenir", d: "Mes pense-bêtes, et ce qu'il ne faut pas oublier aujourd'hui." },
  { k: "tete", ic: "vrac", nom: "Ma tête déborde", d: "Démarrer, trier, tenir cinq minutes : des aides pour les jours en vrac." },
  { k: "bebe", ic: "coeur", nom: "Mon bébé", d: "Le relais pour le bébé, les nuits, les repères après la naissance." },
  { k: "foi", ic: "flamme", nom: "Ma foi", d: "Quelques mots de réconfort, selon ta religion." }
];
/* Les raccourcis : une situation allume plusieurs curseurs d'un coup. Ils restent ajustables un par un. */
var RACCOURCIS = [
  { k: "parent", ic: "coeur", nom: "Je suis parent d'un bébé", set: ["bebe", "humeur"] },
  { k: "tdah", ic: "vrac", nom: "Ma tête déborde (TDAH)", set: ["tete", "souvenir"] }
];

var storageOK = true;

/* Ce qu'on peut déléguer : des exemples, modifiables.
   Les lignes « bébé » n'apparaissent que si ce curseur est actif. */
var MENU_BASE = [
  "Préparer à manger, et m'apporter une assiette",
  "Faire les courses, et voir ce qui manque",
  "Lancer une lessive, et l'étendre",
  "Ranger la cuisine",
  "S'occuper d'un papier (impôts, mutuelle, rendez-vous)",
  "Répondre aux messages à ma place",
  "M'accompagner à un rendez-vous",
  "Me laisser 20 minutes au calme, sans rien me demander",
  "Rester avec moi, sans rien faire de spécial",
  "Faire le point ensemble ce soir, 10 minutes"
];
var MENU_BEBE = [
  "Prendre {bebe} pendant que je dors",
  "Prendre {bebe} pendant que je me douche",
  "Prendre le relais au prochain réveil de la nuit",
  "Filtrer les visites"
];

var MSGS = [
  { k: "parler", label: "J'ai besoin de parler", txt: "Tu as 10 minutes pour moi ? Pas d'urgence, j'ai juste besoin de parler." },
  { k: "demarrer", label: "Je n'arrive pas à démarrer", txt: "Tu peux rester au téléphone avec moi pendant que je fais un truc ? Je n'arrive pas à m'y mettre." },
  { k: "deborde", label: "Ça déborde", txt: "Ça déborde un peu ici. Tu peux m'appeler dès que tu peux ?" },
  { k: "passer", label: "Tu peux passer ?", txt: "Tu pourrais passer à la maison ? Même une heure, ça m'aiderait." }
];

var DIMS = [
  { k: "e", label: "Énergie", hint: "le corps, le sommeil", levels: ["À plat", "Moyenne", "Bonne"] },
  { k: "t", label: "Tête", hint: "les idées, le bazar", levels: ["En vrac", "Ça tient", "Claire"] },
  { k: "r", label: "Relais", hint: "quelqu'un pour aider", levels: ["Personne", "Par moments", "Toute la journée"] }
];

var TYPES = {
  veilleuse: { nom: "Journée douce", max: 1,
    cadre: "Le minimum, et c'est tout. Si une chose en plus passe, tant mieux.",
    cote: ["Le ménage", "Répondre aux messages et aux appels", "Les visites", "Les papiers qui n'ont pas de date limite", "Cuisiner : du tout prêt ou une livraison, c'est très bien"] },
  normale: { nom: "Journée normale", max: 2,
    cadre: "Le minimum, puis deux choses qui te font avancer.",
    cote: ["Ce qui n'a pas de date limite", "Une partie du ménage", "Les visites dont tu n'as pas envie"] },
  elan: { nom: "Jour d'élan", max: 3,
    cadre: "Le minimum, puis trois choses au plus. Garde un peu d'énergie pour demain.",
    cote: ["L'idée de rattraper tout le retard d'un coup", "Dire oui à tout le monde"] }
};

/* Deux lignes de plus dans la jauge, si le curseur « humeur et sommeil » est actif.
   Elles ne changent pas le type de journée : elles se suivent dans « Mon évolution ». */
var DIMS_PLUS = [
  { k: "h", label: "Humeur", hint: "le moral", levels: ["Basse", "Moyenne", "Bonne"] },
  { k: "s", label: "Nuit", hint: "le sommeil", levels: ["Mauvaise", "Moyenne", "Bonne"] }
];

/* Respirer, guidée. Chaque exercice dit à quoi il sert.
   in : inspirer, in2 : inspirer encore un peu, hold : garder l'air, out : souffler, vide : pause poumons vides. */
var SOUFFLES = [
  { id: "soupir", nom: "Le soupir", pour: "Une minute, quand c'est trop", duree: 60, phases: [["in", 2], ["in2", 1], ["out", 6]],
    sert: "Pour relâcher la pression tout de suite. La double inspiration remplit bien les poumons, la longue expiration fait redescendre.",
    conseil: "Inspire par le nez, puis encore un petit peu, et souffle tout l'air longuement par la bouche." },
  { id: "long", nom: "Souffle long", pour: "Deux minutes, quand ça monte", duree: 120, phases: [["in", 3], ["out", 5]],
    sert: "Pour faire baisser la tension quand le stress ou l'énervement monte. Souffler plus longtemps qu'on inspire aide le corps à ralentir.",
    conseil: "Inspire par le nez, puis souffle lentement par la bouche, un peu plus longtemps que tu n'as inspiré." },
  { id: "carre", nom: "La respiration carrée", pour: "Deux minutes, pour se recentrer", duree: 128, phases: [["in", 4], ["hold", 4], ["out", 4], ["vide", 4]],
    sert: "Pour se recentrer quand la tête part dans tous les sens. Compter quatre temps à chaque étape occupe l'esprit et ramène l'attention.",
    conseil: "Quatre temps pour inspirer, quatre pour garder l'air, quatre pour souffler, quatre de pause. Si garder l'air te gêne, raccourcis." },
  { id: "coherence", nom: "Cohérence cardiaque", pour: "Cinq minutes, pour poser la journée", duree: 300, phases: [["in", 5], ["out", 5]],
    sert: "Pour apaiser le stress de fond et retrouver un rythme calme : six respirations par minute, régulières. Beaucoup la font le matin, le midi et le soir.",
    conseil: "{assise} si tu peux, les épaules relâchées. Inspire et souffle au même rythme, sans forcer." },
  { id: "sommeil", nom: "Le 4-7-8", pour: "Pour t'endormir ou te rendormir", duree: 76, phases: [["in", 4], ["hold", 7], ["out", 8]],
    sert: "Pour retrouver le sommeil, par exemple après un réveil la nuit. Garder l'air puis souffler très lentement calme le corps et occupe l'esprit.",
    conseil: "Inspire par le nez sur 4 temps, garde l'air sur 7, souffle par la bouche sur 8. Quatre fois suffisent. Si la tête te tourne, arrête." },
  { id: "bebe", bebe: true, nom: "Avec {bebeToi} contre toi", pour: "Trois minutes, à deux", duree: 180, phases: [["in", 4], ["out", 6]],
    sert: "Pour vous apaiser ensemble quand ton bébé s'agite dans tes bras. Ton calme et ta respiration lente peuvent l'aider à se calmer, et toi aussi.",
    conseil: "Garde ton bébé contre toi, berce doucement si tu veux. Respire lentement par le nez, sans forcer." }
];

/* Un moment de libre : des idées pour tout le monde, et d'autres seulement avec le curseur « bébé ». */
var IDEES = {
  organiser: {
    10: ["Écris les trois choses les plus importantes de demain.", "Fais la liste de courses de la semaine.", "Prends un rendez-vous que tu repousses.", "Réponds au message qui attend depuis des jours.", "Range un seul endroit : ton sac, ou ta table de nuit.", "Mets un rappel pour une échéance qui arrive."],
    30: ["Avance un papier : impôts, mutuelle, banque.", "Planifie la semaine : repas, rendez-vous, et qui fait quoi.", "Cuisine en double et congèle la moitié pour un jour plus dur.", "Trie une pile : courrier, papiers, vêtements.", "Passe l'appel que tu repousses."],
    60: ["Une démarche de bout en bout, sans t'arrêter au milieu : banque, inscription, dossier.", "Fais le point de la semaine avec un proche, puis avance sur ce que vous avez décidé.", "Prépare plusieurs repas d'avance pour les jours plus durs.", "Range une pièce entière."]
  },
  moi: {
    10: ["Mange quelque chose de bon, en prenant le temps de t'asseoir.", "Un grand verre d'eau, et cinq minutes dehors ou à la fenêtre.", "Écris à quelqu'un que tu aimes bien, juste pour prendre des nouvelles.", "Étire-toi deux minutes : épaules, dos, nuque."],
    30: ["Une douche, rien que pour toi.", "Sors marcher un peu.", "Lis, écoute un podcast ou regarde un épisode : un vrai moment à toi.", "Allonge-toi, le téléphone loin de toi."],
    60: ["Sors une heure, rien que pour toi.", "Une activité qui te ressemble, juste pour le plaisir.", "Une vraie sieste, porte fermée."]
  }
};
var IDEES_BEBE = {
  organiser: {
    10: ["Prends le rendez-vous qui attend : pédiatre, sage-femme, PMI.", "Range le sac à langer."],
    30: ["Avance un papier : CAF, mutuelle, congé parental.", "Trie les vêtements devenus trop petits."],
    60: ["Range le coin de ton bébé."]
  },
  moi: {
    10: [],
    30: [],
    60: ["Sors une heure sans {bebeToi}, si quelqu'un peut prendre le relais."]
  }
};

/* Ma foi : au choix. Les horaires de prière existent seulement pour l'islam.
   relire : les textes de cette religion sont des traductions simples, pas encore validées ; l'appli l'indique. */
var FOIS = {
  islam: { nom: "Islam", source: "Coran", relire: false,
    moment: "une prière, une sourate, ou juste respirer", nuit: "un dhikr à voix basse, ou une sourate que tu connais par cœur",
    video: "une récitation", phVideo: "Sourate Ar-Rahman, ma playlist calme…", phAide: "Une sourate, une douche chaude, ma playlist…",
    versets: [
      ["Allah n'impose à aucune âme une charge au-delà de sa capacité.", "2:286"],
      ["À côté de la difficulté, il y a une facilité.", "94:5"],
      ["C'est par le rappel d'Allah que les cœurs s'apaisent.", "13:28"],
      ["Je suis tout proche : Je réponds à l'appel de celui qui M'invoque.", "2:186"],
      ["Allah fera succéder la facilité à la difficulté.", "65:7"],
      ["Allah est avec ceux qui sont patients.", "2:153"]
    ] },
  christianisme: { nom: "Christianisme", source: "", relire: true,
    moment: "une prière, un psaume, ou juste respirer", nuit: "une prière à voix basse, ou un psaume que tu connais par cœur",
    video: "un chant", phVideo: "Un chant, un psaume, ma playlist calme…", phAide: "Une prière, une douche chaude, ma playlist…",
    versets: [
      ["Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", "Matthieu 11, 28"],
      ["À chaque jour suffit sa peine.", "Matthieu 6, 34"],
      ["En paix je me couche et je m'endors, car toi seul, Seigneur, tu me fais vivre en sécurité.", "Psaume 4"],
      ["Le Seigneur est proche de ceux qui ont le cœur brisé.", "Psaume 34"],
      ["Ne crains pas, car je suis avec toi.", "Isaïe 41, 10"],
      ["Déchargez-vous sur lui de tous vos soucis, car il prend soin de vous.", "1 Pierre 5, 7"]
    ] },
  judaisme: { nom: "Judaïsme", source: "", relire: true,
    moment: "une prière, un psaume, ou juste respirer", nuit: "une prière à voix basse, ou un psaume que tu connais par cœur",
    video: "un chant", phVideo: "Un chant, un psaume, ma playlist calme…", phAide: "Une prière, une douche chaude, ma playlist…",
    versets: [
      ["Décharge-toi de ton fardeau sur l'Éternel, et il te soutiendra.", "Psaumes 55, 23"],
      ["Le soir, les pleurs s'installent ; au matin, la joie revient.", "Psaumes 30, 6"],
      ["En paix je me couche et aussitôt je m'endors, car toi seul, Éternel, tu me fais demeurer en sécurité.", "Psaumes 4, 9"],
      ["L'Éternel est proche des cœurs brisés.", "Psaumes 34, 19"],
      ["Ne crains pas, car je suis avec toi.", "Isaïe 41, 10"],
      ["Je lève les yeux vers les montagnes : d'où me viendra le secours ? Mon secours vient de l'Éternel.", "Psaumes 121, 1-2"]
    ] }
};

/* Le plan pour les moments de crise : des rubriques à remplir soi-même, quand ça va. */
var PLAN = [
  { k: "signaux", titre: "Mes signaux", d: "Ce qui m'annonce que ça monte.", ph: "Je ne dors plus, je m'isole…" },
  { k: "seul", titre: "Ce que je peux faire par moi-même", d: "Ce qui m'a déjà aidé à faire redescendre.", ph: "Marcher, une douche, de la musique…" },
  { k: "lieux", titre: "Où aller, qui voir", d: "Des endroits et des personnes qui me changent les idées.", ph: "Le parc, le café d'en bas…" },
  { k: "soignants", titre: "Mes soignants", d: "Leur nom et leur numéro, pour ne pas avoir à chercher.", ph: "Dr Martin, 01 23 45 67 89" },
  { k: "raisons", titre: "Ce qui compte pour moi", d: "Ce à quoi je tiens. À relire quand tout paraît sombre.", ph: "Mes proches, mon chat, un projet…" }
];

/* ---------- Outils ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
function pad(n) { return String(n).padStart(2, "0"); }
/* La journée commence à 4 h : à 3 h du matin, on est encore dans la nuit d'hier. */
function dayKey(d) { var x = new Date((d ? d.getTime() : Date.now()) - 4 * 3600 * 1000); return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); }
function keyMinus(n) { return dayKey(new Date(Date.now() - n * 86400000)); }
function daysBetween(a, b) { return Math.round((Date.parse(b + "T12:00:00") - Date.parse(a + "T12:00:00")) / 86400000); }
function labelCourt(k) { return new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); }
function labelJour(k) { return new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" }); }
function heure(ts) { if (!ts || ts === true) return ""; var d = new Date(ts); return d.getHours() + " h " + pad(d.getMinutes()); }
function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
function moyenne(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
function melange(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
function byKey(list, k) { return list.filter(function (x) { return x.k === k; })[0]; }
function svg(p, s) { s = s || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }

var I = {
  reglages: svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', 24),
  guide: svg('<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="16.9" r=".8" fill="currentColor"/>', 24),
  retour: svg('<path d="M15 5l-7 7 7 7"/>', 22),
  chev: svg('<path d="M9 6l6 6-6 6"/>', 18),
  lever: svg('<path d="M3.5 19h17"/><path d="M7.5 19a4.5 4.5 0 0 1 9 0"/><path d="M12 10V3.5M9.5 6L12 3.5 14.5 6"/>', 16),
  coucher: svg('<path d="M3.5 19h17"/><path d="M7.5 19a4.5 4.5 0 0 1 9 0"/><path d="M12 3.5V10M9.5 7.5L12 10l2.5-2.5"/>', 16),
  soleilT: svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8V5M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6"/>', 24),
  luneT: svg('<path d="M19 14.8A7.6 7.6 0 0 1 9.2 5a7.6 7.6 0 1 0 9.8 9.8z"/>', 24),
  coucherT: svg('<path d="M3 18h18M7.5 18a4.5 4.5 0 0 1 9 0M12 9.5V7M6.3 12.3 4.9 10.9M17.7 12.3l1.4-1.4"/>', 24),
  lune: svg('<path d="M18.5 14.6A7.4 7.4 0 0 1 9.4 5.5a7.4 7.4 0 1 0 9.1 9.1z"/>'),
  jauge: svg('<circle cx="5" cy="12" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="19" cy="12" r="2.4" fill="currentColor"/>'),
  jourNuit: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>'),
  soin: svg('<path d="M12 20s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7 2.3c0 5.1-7 9.4-7 9.4z"/>'),
  liste: svg('<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.6" cy="7" r=".9"/><circle cx="4.6" cy="12" r=".9"/><circle cx="4.6" cy="17" r=".9"/>'),
  projets: svg('<path d="M5 21V4h11l-2 4 2 4H5"/>'),
  delegue: svg('<path d="M2.5 12.5h7M6.8 9.3l3.2 3.2-3.2 3.2"/><circle cx="16.4" cy="7.6" r="3.3"/><path d="M10.8 20.3c.5-3.7 2.7-5.8 5.6-5.8s5.1 2.1 5.6 5.8"/>'),
  journal: svg('<path d="M6 3.5h9l3 3v14H6z"/><path d="M9 10h6M9 14h4"/>'),
  evolution: svg('<path d="M4 19.5h16"/><path d="M5.5 15l4-4.5 3 3 5.5-6.5"/>'),
  coeur: svg('<path d="M12 20s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7 2.3c0 5.1-7 9.4-7 9.4z"/>'),
  deux: svg('<circle cx="9" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c0-3.2 2.5-5 5.5-5s5.5 1.8 5.5 5M15 19c0-2 1.2-3.6 4-3.6"/>'),
  pleure: svg('<path d="M3 10c2-2.6 4-2.6 6 0s4 2.6 6 0 4-2.6 6 0"/><path d="M3 15.5c2-2.6 4-2.6 6 0s4 2.6 6 0 4-2.6 6 0"/>'),
  demarrer: svg('<path d="M7 4.5l12 7.5-12 7.5z"/>'),
  vrac: svg('<path d="M4 7c4 0 4 10 8 10s4-10 8-10"/><path d="M4 17c4 0 4-10 8-10s4 10 8 10"/>'),
  nulle: svg('<path d="M7.5 18a4 4 0 0 1-.7-7.9A5.5 5.5 0 0 1 17.4 8.6a3.8 3.8 0 0 1 .3 7.6z"/>'),
  visites: svg('<path d="M4 20V9l8-5 8 5v11"/><path d="M10 20v-6h4v6"/>'),
  notes: svg('<path d="M6 3.5h9l3 3v14H6z"/><path d="M9 10h6M9 14h4"/>'),
  traitement: svg('<rect x="3" y="9" width="18" height="6.5" rx="3.25" transform="rotate(-35 12 12)"/><path d="M9.6 8.6l4.8 6.8"/>'),
  semaine: svg('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>'),
  pensees: svg('<path d="M7.5 18a4 4 0 0 1-.7-7.9A5.5 5.5 0 0 1 17.4 8.6a3.8 3.8 0 0 1 .3 7.6z"/><path d="M10 13.5h4"/>'),
  suivi: svg('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/><path d="M9 15l2 2 4-4"/>'),
  telephone: svg('<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>'),
  info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor"/>'),
  orbe: '<span class="dot" aria-hidden="true"></span>',
  star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>'),
  starOn: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/></svg>',
  x: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', 20),
  bouger: svg('<circle cx="13" cy="4.5" r="1.8"/><path d="M9 21l2.5-6 3 2.5V21"/><path d="M7 11.5l3-3.5 4 1 2.5 3.5"/><path d="M11.5 15l-1-5"/>'),
  play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l12 7-12 7z"/></svg>',
  plan: svg('<path d="M12 3.5l7 2.6v5.4c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6.1z"/><path d="M9.2 12.2l2 2 3.6-3.8"/>'),
  memo: svg('<path d="M9 3.5h6l-1 5 3 3.5H7l3-3.5z"/><path d="M12 12v8.5"/>'),
  minuteur: svg('<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.3 1.8M9.5 3.5h5"/>'),
  flamme: svg('<path d="M12 3.5c2.6 3 5 5.5 5 9.3a5 5 0 0 1-10 0c0-1.9.9-3.5 2-4.7.4 1.6 1.2 2.5 2.1 2.7-.6-2.5-.3-5 .9-7.3z"/>'),
  moi: svg('<circle cx="12" cy="8.5" r="3.4"/><path d="M5 20c.6-4 3.3-6 7-6s6.4 2 7 6"/>'),
  message: svg('<path d="M4 5.5h16v10H9.5L4 19.5z"/>'),
  crayon: svg('<path d="M5 19l1-4L16.5 4.5l3 3L9 18z"/><path d="M14.5 6.5l3 3"/>'),
  cadenas: svg('<rect x="5.5" y="10.5" width="13" height="9" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  respirer: svg('<path d="M4 9h9.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M4 13h13a3 3 0 1 1-3 3"/><path d="M4 17h5"/>')
};

/* ---------- Données : uniquement dans ce navigateur ---------- */
function freshMessages() { return MSGS.map(function (m) { return { id: uid(), k: m.k, label: m.label, txt: m.txt }; }); }
function freshMenu() {
  return MENU_BASE.map(function (t) { return { id: uid(), txt: t }; }).concat(MENU_BEBE.map(function (t) { return { id: uid(), txt: t, b: 1 }; }));
}
function freshBesoins() { var o = {}; BESOINS.forEach(function (b) { o[b.k] = false; }); return o; }
function freshPlan() { var o = {}; PLAN.forEach(function (s) { o[s.k] = []; }); return o; }
function freshState() {
  return {
    v: 1, onboarded: false,
    profil: { prenom: "", bebe: "", lieu: CONFIG.lieuDefaut, pause: 20, foi: "", prieres: false, angle: 12, theme: "auto", son: false, besoins: freshBesoins() },
    proches: [],
    menu: freshMenu(),
    videos: [],
    messages: freshMessages(),
    prises: [], plan: freshPlan(), affaires: [], retenir: [],
    imperatifs: [], taches: [], projets: [], jours: {}, notes: [], aide: [], vu: { present: "autre" }
  };
}
function load() {
  var f = freshState();
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return f;
    var s = JSON.parse(raw);
    var out = Object.assign(f, s);
    out.profil = Object.assign(freshState().profil, s.profil || {});
    out.profil.besoins = Object.assign(freshBesoins(), (s.profil && s.profil.besoins) || {});
    out.plan = Object.assign(freshPlan(), (s.plan && typeof s.plan === "object") ? s.plan : {});
    Object.keys(out.plan).forEach(function (k) { if (!Array.isArray(out.plan[k])) out.plan[k] = []; });
    out.vu = Object.assign({}, s.vu || {});
    ["menu", "taches", "projets", "notes", "aide", "videos", "imperatifs", "proches", "prises", "affaires", "retenir"].forEach(function (k) { if (!Array.isArray(out[k])) out[k] = []; });
    if (!Array.isArray(out.messages)) out.messages = freshMessages();
    if (!out.jours || typeof out.jours !== "object") out.jours = {};
    if (!out.vu.present) out.vu.present = "autre";
    return out;
  } catch (e) { storageOK = false; return f; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { storageOK = false; } }

var S = load();
(function prune() {
  var k = dayKey();
  /* Les jours où l'appli a été ouverte : une liste de dates, pour le retour sur la démo. Jamais envoyée sans un geste de la personne. */
  if (!Array.isArray(S.vu.ouvertures)) S.vu.ouvertures = [];
  if (S.vu.ouvertures.indexOf(k) < 0) { S.vu.ouvertures.push(k); S.vu.ouvertures = S.vu.ouvertures.slice(-120); }
  S.taches = S.taches.filter(function (t) { return !(t.done && t.doneDay && t.doneDay < k); });
  /* Un impératif ponctuel reste tant qu'il n'est pas fait ; une fois fait, il disparaît le lendemain. */
  S.imperatifs = S.imperatifs.filter(function (x) { return x.quotidien || !(x.doneDay && x.doneDay < k); });
  var cutoff = keyMinus(90);
  Object.keys(S.jours).forEach(function (kk) { if (kk < cutoff) delete S.jours[kk]; });
  save();
})();

/* ---------- Besoins, ville, prénoms et personnes ---------- */
function besoin(k) { return !!(S.profil.besoins && S.profil.besoins[k]); }
function dimsActives() { return besoin("humeur") ? DIMS.concat(DIMS_PLUS) : DIMS; }
function soufflesActifs() { return SOUFFLES.filter(function (x) { return !x.bebe || besoin("bebe"); }); }
function menuVisible() { return S.menu.filter(function (m) { return !m.b || besoin("bebe"); }); }
function foi() { return besoin("foi") && FOIS[S.profil.foi] ? FOIS[S.profil.foi] : null; }
function prieresActives() { return besoin("foi") && S.profil.foi === "islam" && !!S.profil.prieres; }
function villeProche(lat, lon) {
  var best = VILLES[0], bd = Infinity;
  VILLES.forEach(function (v) { var d = Math.pow(v[1] - lat, 2) + Math.pow((v[2] - lon) * Math.cos(lat * Math.PI / 180), 2); if (d < bd) { bd = d; best = v; } });
  return best;
}
/* Le lieu qui sert au soleil et aux prières : la position du téléphone si la personne l'a donnée, sinon sa ville dans la liste. */
function lieu() {
  var g = S.profil.geo;
  if (g && isFinite(g.lat) && isFinite(g.lon)) return { nom: "près de " + villeProche(g.lat, g.lon)[0], lat: g.lat, lon: g.lon, geo: true };
  var n = S.profil.lieu;
  var v = VILLES.filter(function (x) { return x[0] === n; })[0] || VILLES.filter(function (x) { return x[0] === CONFIG.lieuDefaut; })[0] || VILLES[0];
  return { nom: v[0], lat: v[1], lon: v[2] };
}
/* Demander la position : une seule fois, gardée dans le téléphone. Rien ne part sur un serveur. */
function demanderPosition(el) {
  if (!navigator.geolocation) { toast("Ton appareil ne donne pas sa position ici. Choisis ta ville dans la liste."); return; }
  if (el) { el.disabled = true; el.textContent = T("Je cherche ta position…"); }
  navigator.geolocation.getCurrentPosition(function (p) {
    S.profil.geo = { lat: Math.round(p.coords.latitude * 1000) / 1000, lon: Math.round(p.coords.longitude * 1000) / 1000, ts: Date.now() };
    save(); appliquerTheme(); render(); toast("Position trouvée : " + lieu().nom);
  }, function () {
    if (el) { el.disabled = false; el.textContent = T("Utiliser ma position"); }
    toast("Pas de position pour l'instant. Choisis ta ville dans la liste.");
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 6 * 3600000 });
}
/* Le prénom du bébé n'existe que si le curseur « bébé » est actif. Sans prénom : « le bébé » dans un message
   pour quelqu'un d'autre, « ton bébé » quand l'appli s'adresse à la personne. */
function prenomBebe() { return besoin("bebe") ? (S.profil.bebe || "").trim() : ""; }
function nBebe() { return prenomBebe() || "le bébé"; }
function nBebeToi() { return prenomBebe() || "ton bébé"; }
function de(n) { return (/^[aeiouhàâäéèêëîïôöùûü]/i.test(n) ? "d'" : "de ") + n; }
function deBebe() { var n = prenomBebe(); return n ? de(n) : "du bébé"; }
function deBebeToi() { var n = prenomBebe(); return n ? de(n) : "de ton bébé"; }
function fill(t) { return String(t).replace(/\{bebe\}/g, nBebe()).replace(/\{bebeToi\}/g, nBebeToi()).replace(/\{assise\}/g, acc("En position assise", "Assise", "Assis")); }
/* Comment on te parle : « sans genre » par défaut (le texte neutre), ou au féminin, ou au masculin.
   acc(neutre, féminin, masculin) rend la forme choisie. À utiliser seulement là où le neutre est lourd. */
var ACCORDS = [["", "Sans genre"], ["f", "Au féminin"], ["m", "Au masculin"]];
function acc(n, f, m) { var a = S.profil.accord; return a === "f" ? f : a === "m" ? m : n; }
function accordChoix() {
  return '<div class="field">Comment on te parle<div class="seg" role="group" aria-label="Comment on te parle">' +
    ACCORDS.map(function (o) { return '<button type="button" data-action="accord" data-v="' + o[0] + '" aria-pressed="' + ((S.profil.accord || "") === o[0]) + '">' + o[1] + "</button>"; }).join("") +
    '</div><p class="fine" style="font-weight:300">Sans genre, les textes restent au neutre. Au féminin ou au masculin, l\'appli accorde les mots quand le neutre est lourd.</p></div>';
}
function nomProche(p) { return (p.nom || "").trim() || "Quelqu'un"; }
/* Un message prêt par sa clé ; s'il a été retiré, on reprend l'exemple de départ. */
function msgTxt(k) {
  var m = S.messages.filter(function (x) { return x.k === k && (x.txt || "").trim(); })[0] || MSGS.filter(function (x) { return x.k === k; })[0];
  return m.txt;
}
function presentId() {
  var id = S.vu.present;
  var p = byId(S.proches, id);
  if (id === "autre") return id;
  if (p && p.passer) return id;
  var first = S.proches.filter(function (x) { return x.passer; })[0];
  return first ? first.id : "autre";
}
function nPresent() { var id = presentId(); return id === "autre" ? "" : nomProche(byId(S.proches, id)); }
function telPresent() { var id = presentId(); return id === "autre" ? "" : byId(S.proches, id).tel; }

function normTel(tel) {
  if (!tel) return "";
  var d = String(tel).replace(/[^\d+]/g, "");
  if (d.charAt(0) === "+") d = d.slice(1);
  else if (d.slice(0, 2) === "00") d = d.slice(2);
  else if (d.charAt(0) === "0" && d.length === 10) d = "33" + d.slice(1);
  return d.replace(/\D/g, "");
}
function waLink(tel, text) { var n = normTel(tel), t = encodeURIComponent(text || ""); return n ? "https://wa.me/" + n + "?text=" + t : "https://wa.me/?text=" + t; }

/* ---------- Le soleil : jour et nuit au lever et au coucher ---------- */
function soleil(date) {
  var L0 = lieu(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
  var rad = Math.PI / 180, N = Math.round((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 86400000), lngHour = L0.lon / 15;
  function calc(lever) {
    var t = N + ((lever ? 6 : 18) - lngHour) / 24;
    var M = 0.9856 * t - 3.289;
    var L = M + 1.916 * Math.sin(M * rad) + 0.020 * Math.sin(2 * M * rad) + 282.634; L = ((L % 360) + 360) % 360;
    var RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = ((RA % 360) + 360) % 360;
    RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
    var sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
    var cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(L0.lat * rad)) / (cosDec * Math.cos(L0.lat * rad));
    if (cosH > 1 || cosH < -1) return null;
    var H = (lever ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
    var T = H + RA - 0.06571 * t - 6.622;
    var UT = ((T - lngHour) % 24 + 24) % 24;
    /* Arrondi à la minute la plus proche, comme les éphémérides publiées. */
    return new Date(Math.round((Date.UTC(y, m, d) + UT * 3600000) / 60000) * 60000);
  }
  return { lever: calc(true), coucher: calc(false) };
}
/* Trois heures : le jour, l'entre-deux (45 minutes avant et après le lever et le coucher du soleil), la nuit. */
function etatSoleil() {
  var now = Date.now(), s = soleil(new Date());
  if (!s.lever || !s.coucher) return { nuit: false, moment: null, heure: "jour", s: s };
  var l = s.lever.getTime(), c = s.coucher.getTime(), w = 45 * 60000;
  var moment = Math.abs(now - l) <= w ? "aube" : Math.abs(now - c) <= w ? "crepuscule" : null, nuit = now < l || now > c;
  return { nuit: nuit, moment: moment, heure: moment ? "entre-deux" : nuit ? "nuit" : "jour", s: s };
}
/* Le prochain lever ou coucher du soleil : c'est là que le rythme du soleil reprend, après un changement à la main. */
function prochainSoleil() {
  var now = Date.now(), out = [];
  [0, 1].forEach(function (j) { var s = soleil(new Date(now + j * 86400000)); if (s.lever) out.push(s.lever.getTime()); if (s.coucher) out.push(s.coucher.getTime()); });
  out = out.filter(function (t) { return t > now; }).sort(function (a, b) { return a - b; });
  return out[0] || now + 12 * 3600000;
}
function appliquerTheme() {
  var e = etatSoleil(), mode = S.profil.theme || "auto", tmp = S.vu.themeTemp;
  if (tmp && !(Date.now() < tmp.jusqua)) { delete S.vu.themeTemp; tmp = null; save(); }
  /* L'heure affichée : un choix à la main donne le jour ou la nuit ; sinon le soleil, avec l'entre-deux. */
  var heure = mode === "nuit" ? "nuit" : mode === "jour" ? "jour" : tmp ? tmp.mode : e.heure;
  /* Pour regarder l'appli à une autre heure sans attendre : ajouter ?heure=jour, ?heure=entre-deux ou ?heure=nuit à l'adresse. */
  var force = (location.search.match(/[?&]heure=(jour|entre-deux|nuit)/) || [])[1]; if (force) heure = force;
  var nuit = heure !== "jour";
  var root = document.documentElement, avant = root.getAttribute("data-heure");
  root.setAttribute("data-veille", nuit ? "nuit" : "jour");
  root.setAttribute("data-heure", heure);
  if (mode === "auto" && !tmp && e.moment) root.setAttribute("data-moment", e.moment); else root.removeAttribute("data-moment");
  var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", { jour: "#C9955A", "entre-deux": "#7A3A16", nuit: "#120C09" }[heure]);
  var b = document.querySelector(".theme-btn"); if (b) b.setAttribute("aria-label", labelTheme(nuit));
  if (avant !== heure) appliquerDecor();
  var mot = $("#sun"); if (mot) mot.textContent = phraseSoleil();
  return e;
}
function labelTheme(nuit) { return nuit ? "Mode nuit. Toucher pour passer en mode jour" : "Mode jour. Toucher pour passer en mode nuit"; }
/* Le mot sous l'heure, sur l'accueil. */
function phraseSoleil() {
  var h = document.documentElement.getAttribute("data-heure"), m = document.documentElement.getAttribute("data-moment");
  if (h === "entre-deux") return m === "aube" ? "le jour se lève" : "le soleil se couche";
  return h === "nuit" ? "la nuit est tombée" : "le jour est levé";
}

/* ---------- Le décor : une vraie photo de lieu derrière le verre ----------
   Chaque page a son lieu, à trois heures. Les images sont dans decors/ : lieu-heure-largeur.avif, et un JPEG de secours en 1080. */
var LIEUX = {
  aujourdhui: "chemin", minimum: "chemin", liste: "chemin", projets: "chemin", journal: "chemin", evolution: "chemin", memo: "chemin", reglages: "chemin", reg: "chemin", guide: "chemin",
  relais: "lac", "pour-eux": "lac", preparer: "lac", nuit: "lac", contact: "lac",
  maintenant: "roche", sos: "roche", plan: "roche",
  respirer: "grand-desert",
  reperes: "pierre", rep: "pierre"
};
var LIEU_OUVERTURE = "herbes";
/* Les lueurs des boules : gauche, haut et largeur, en pourcentage de la photo. Sur le chemin, sept boules ; ailleurs, une seule (et son reflet sur le lac). */
var LUEURS = {
  chemin: [[71.6, 91.3, 33.3], [48.7, 90.3, 26.9], [42.0, 80.9, 16.4], [32.9, 77.9, 11.3], [26.8, 76.4, 8.9], [34.6, 73.6, 8.9]],
  lac: [[72, 76, 34], [72, 89, 24]],
  roche: [[64, 87, 36]],
  pierre: [[72, 80, 34]],
  "grand-desert": [[72, 80, 14]],
  herbes: [[62, 85, 34]]
};
var decorsPrecharges = {};
/* Une fois la première photo posée, on charge d'avance les autres lieux à la même heure : changer d'onglet ne fait pas attendre. */
function prechargerDecors(heure, ok) {
  if (decorsPrecharges[heure]) return;
  decorsPrecharges[heure] = true;
  setTimeout(function () {
    ["chemin", "lac", "roche", "pierre", "grand-desert", "herbes"].forEach(function (l) { var im = new Image(); im.src = "decors/" + l + "-" + heure + "-" + (ok ? largeurDecor() + ".avif" : "1080.jpg"); });
  }, 1500);
}
var avifOK = null;
function testeAvif() {
  return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im.width > 0); }; im.onerror = function () { res(false); }; im.src = "decors/test.avif"; });
}
function largeurDecor() { var w = Math.min(window.innerWidth, 440) * (window.devicePixelRatio || 1); return w <= 720 ? 720 : w <= 1080 ? 1080 : 1440; }
function appliquerDecor() {
  var d = $("#decor"), lieu = document.body.getAttribute("data-lieu");
  if (!d || !lieu) return;
  var heure = document.documentElement.getAttribute("data-heure") || "entre-deux", cle = lieu + "-" + heure;
  if (d.getAttribute("data-cle") === cle) return;
  d.setAttribute("data-cle", cle);
  var photo = d.querySelector(".photo");
  photo.innerHTML = (LUEURS[lieu] || []).map(function (l, i) { return '<i class="lueur" style="left:' + l[0] + "%;top:" + l[1] + "%;width:" + l[2] + "%;animation-delay:" + (-i * 1.05).toFixed(2) + 's"></i>'; }).join("");
  function pose(ok) {
    var src = "decors/" + cle + "-" + (ok ? largeurDecor() + ".avif" : "1080.jpg"), im = new Image();
    im.onload = function () {
      if (d.getAttribute("data-cle") !== cle) return;
      /* La nouvelle photo arrive en fondu : invisible, puis la transition la révèle. */
      photo.classList.add("arrive");
      photo.style.backgroundImage = 'url("' + src + '")';
      d.querySelector(".sol").style.backgroundImage = d.querySelector(".ciel").style.backgroundImage = 'url("' + src + '")';
      void photo.offsetWidth; photo.classList.remove("arrive");
      prechargerDecors(heure, ok);
    };
    im.src = src;
  }
  if (avifOK === null) testeAvif().then(function (ok) { avifOK = ok; pose(ok); }); else pose(avifOK);
}
function nuitAffichee() { return document.documentElement.getAttribute("data-veille") === "nuit"; }
function ligneSoleil() {
  var s = soleil(new Date()), now = Date.now();
  if (!s.lever || !s.coucher) return "";
  if (now < s.lever.getTime()) return { ic: I.lever, t: "Lever du soleil à " + heure(s.lever) };
  if (now < s.coucher.getTime()) return { ic: I.coucher, t: "Coucher du soleil à " + heure(s.coucher) };
  return { ic: I.lever, t: "Lever du soleil demain à " + heure(soleil(new Date(now + 86400000)).lever) };
}

/* ---------- Horaires des prières (option) ----------
   Calcul astronomique classique. Avec 12°, il retombe à la minute près sur les calendriers publiés (méthode Musulmans de France). La ville est celle des réglages. */
var PRIERES = [["fajr", "Fajr"], ["dohr", "Dohr"], ["asr", "Asr"], ["maghreb", "Maghreb"], ["icha", "Icha"]];
function prieresDu(date) {
  var L1 = lieu(), lat = L1.lat, lon = L1.lon, ang = S.profil.angle || 12, rad = Math.PI / 180;
  var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  function fixA(a) { a = a - 360 * Math.floor(a / 360); return a < 0 ? a + 360 : a; }
  function fixH(h) { h = h - 24 * Math.floor(h / 24); return h < 0 ? h + 24 : h; }
  var Y = y, M = m; if (M <= 2) { Y -= 1; M += 12; }
  var A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
  var jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - lon / (15 * 24);
  function sol(t) {
    var D = jd + t - 2451545.0, g = fixA(357.529 + 0.98560028 * D), q = fixA(280.459 + 0.98564736 * D);
    var L = fixA(q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad)), e = 23.439 - 0.00000036 * D;
    var RA = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) / rad / 15;
    return { decl: Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) / rad, eqt: q / 15 - fixH(RA) };
  }
  function midi(t) { return fixH(12 - sol(t).eqt); }
  function angle(a, t, avant) {
    var dc = sol(t).decl, x = (-Math.sin(a * rad) - Math.sin(dc * rad) * Math.sin(lat * rad)) / (Math.cos(dc * rad) * Math.cos(lat * rad));
    if (x > 1 || x < -1) return NaN;
    var h = Math.acos(x) / rad / 15; return midi(t) + (avant ? -h : h);
  }
  function asr(t) { var dc = sol(t).decl; return angle(-Math.atan(1 / (1 + Math.tan(Math.abs(lat - dc) * rad))) / rad, t, false); }
  var r = { fajr: angle(ang, 5 / 24, true), lever: angle(0.833, 6 / 24, true), dohr: midi(12 / 24), asr: asr(13 / 24), maghreb: angle(0.833, 18 / 24, false), icha: angle(ang, 18 / 24, false) };
  /* Si le soleil ne descend jamais assez bas (nuits d'été), on prend le milieu de la nuit. */
  var nuit = 24 - (r.maghreb - r.lever);
  if (isNaN(r.fajr)) r.fajr = r.lever - nuit / 2;
  if (isNaN(r.icha)) r.icha = r.maghreb + nuit / 2;
  var base = Date.UTC(y, m - 1, d), out = {};
  Object.keys(r).forEach(function (k) { out[k] = new Date(Math.round((base + (r[k] - lon / 15) * 3600000) / 60000) * 60000); });
  return out;
}
function hhmm(dt) { return pad(dt.getHours()) + ":" + pad(dt.getMinutes()); }
function prieresHTML() {
  var now = new Date(), p = prieresDu(now), next = null, demain = false;
  PRIERES.forEach(function (x) { if (!next && p[x[0]].getTime() > now.getTime()) next = x[0]; });
  /* Après Icha, on montre directement les horaires de demain : la grille et « Prochaine » parlent du même jour. */
  if (!next) { demain = true; next = "fajr"; p = prieresDu(new Date(now.getTime() + 86400000)); }
  var nom = PRIERES.filter(function (x) { return x[0] === next; })[0][1];
  return '<div class="pr-tete"><b>' + (demain ? "Prières de demain" : "Prières du jour") + '</b><span class="fine">À ' + esc(lieu().nom) + ". Prochaine : " + nom + " à " + heure(p[next]) + "</span></div>" +
    '<div class="pr-grille">' + PRIERES.map(function (x) {
      var t = p[x[0]], cls = x[0] === next ? " next" : !demain && t.getTime() <= now.getTime() ? " passe" : "";
      return '<div class="pr' + cls + '"><span>' + x[1] + "</span><b>" + t.getHours() + "\u202fh\u202f" + pad(t.getMinutes()) + "</b></div>";
    }).join("") + "</div>";
}
function prieresToggle() {
  return sw("prieres", "", !!S.profil.prieres, "Afficher les horaires des prières", "Sur l'accueil, calculés pour " + lieu().nom, "", true);
}

/* ---------- Jauge et journée ---------- */
function today() { var k = dayKey(); if (!S.jours[k]) S.jours[k] = { min: {}, confie: [] }; return S.jours[k]; }
function hasGauge(d) { return !!(d && d.e && d.t && d.r); }
function typeDe(d) {
  var lows = [d.e, d.t, d.r].filter(function (x) { return x === 1; }).length;
  if (lows >= 2) return "veilleuse";
  if (d.e === 3 && d.t === 3 && d.r >= 2) return "elan";
  return "normale";
}
function notesDuJour(d) {
  var n = [];
  if (d.e === 1) n.push(besoin("bebe") ? "Première sieste " + deBebeToi() + " : pour toi. Dors, ou allonge-toi." : "Dès que tu peux : allonge-toi, même vingt minutes. Le repos passe avant le reste.");
  if (d.t === 1) n.push("Une seule chose à la fois. Tout ce qui te passe par la tête va dans ta liste.");
  if (d.r === 1) n.push("Pas de relais aujourd'hui : prépare ton coin (eau, en-cas, chargeur" + (besoin("bebe") ? ", couches à portée de main" : "") + ") et prévois un appel dans la journée.");
  if (d.r === 3) n.push("Quelqu'un est là toute la journée : délègue une ou deux choses dès maintenant.");
  if (typeDe(d) === "elan") n.push("Un jour d'élan sert d'abord à toi. Le retard peut attendre.");
  return n;
}
/* Les heures des prises : « 08:30 » devient « 8 h 30 ». La journée commence à 4 h, comme partout dans l'appli. */
function heureTxt(hm) { var m = /^(\d{1,2}):(\d{2})$/.exec(hm || ""); return m ? (+m[1]) + " h" + (m[2] === "00" ? "" : " " + m[2]) : ""; }
function minutesJour(hm) { var m = /^(\d{1,2}):(\d{2})$/.exec(hm || ""); return m ? ((+m[1] * 60 + +m[2]) - 240 + 1440) % 1440 : -1; }
/* Le minimum : ce qui doit vraiment être fait aujourd'hui, quoi qu'il arrive. On ne coche que ses prises (si le curseur
   « traitement » est actif) et ses impératifs (tous les jours, ou juste aujourd'hui) ; « Prendre soin de moi » se donne
   en cartes de conseil, sans case à cocher. */
function baseMinimum() {
  if (!besoin("traitement")) return [];
  return S.prises.slice().sort(function (a, b) { return minutesJour(a.heure) - minutesJour(b.heure); })
    .map(function (p) { return { k: "prise-" + p.id, t: (p.nom || "").trim() || "Mon traitement", heure: p.heure || "" }; });
}
function minimumDuJour() {
  var d = S.jours[dayKey()] || {}, m = d.min || {};
  var out = baseMinimum().map(function (it) { return { id: it.k, t: it.t, fait: m[it.k], prise: true, heure: it.heure }; });
  S.imperatifs.filter(function (x) { return x.quotidien; }).forEach(function (x) { out.push({ id: x.id, t: x.txt, fait: m[x.id], perso: true }); });
  S.imperatifs.filter(function (x) { return !x.quotidien; }).forEach(function (x) { out.push({ id: x.id, t: x.txt, fait: x.doneTs, perso: true, ponctuel: true, depuis: x.created }); });
  return out;
}
/* Le rappel : une prise dont l'heure est passée et qui n'est pas cochée. Il s'affiche sur l'accueil, à l'ouverture. */
function prisesEnRetard() {
  var now = new Date(), nowM = minutesJour(pad(now.getHours()) + ":" + pad(now.getMinutes()));
  return minimumDuJour().filter(function (x) { return x.prise && !x.fait && x.heure && minutesJour(x.heure) >= 0 && minutesJour(x.heure) <= nowM; });
}
function prioritesDuJour() { var k = dayKey(); return S.taches.filter(function (t) { return t.today === k; }); }
function confiesDuJour() {
  var d = S.jours[dayKey()];
  return ((d && d.confie) || []).map(function (id) { return byId(S.menu, id); }).filter(function (m) { return m && (!m.b || besoin("bebe")); });
}
function checksDu(d) { return d && d.checks && d.checks.length ? d.checks : (hasGauge(d) ? [{ ts: null, e: d.e, t: d.t, r: d.r, h: d.h || 0, s: d.s || 0 }] : []); }
function dernierTs(d) { var c = d && d.checks; return c && c.length ? c[c.length - 1].ts : null; }
function bilan14() {
  var n = 0, v = 0;
  for (var i = 0; i < 14; i++) { var d = S.jours[keyMinus(i)]; if (hasGauge(d)) { n++; if (typeDe(d) === "veilleuse") v++; } }
  return { n: n, v: v };
}
/* Un texte de réconfort, selon la religion choisie. i : la place du texte dans la liste. */
function verset(i) {
  var f = foi(); if (!f) return "";
  var v = f.versets[i % f.versets.length];
  return '<p class="verset">« ' + v[0] + " »<span>" + (f.source ? f.source + ", " : "") + v[1] + "</span>" + (f.relire ? '<em class="tag">Traduction à faire relire</em>' : "") + "</p>";
}
function versetDuJour() { var k = dayKey(); return Math.round((Date.parse(k + "T12:00:00") - Date.parse(k.slice(0, 4) + "-01-01T12:00:00")) / 86400000); }

/* ---------- Un moment de libre ---------- */
var creneauMin = 0, creneauMode = "avancer", creneauListe = [], creneauIdx = 0;
function pool(mode, min) {
  var tiers = min >= 60 ? [60, 30, 10] : min >= 30 ? [30, 10] : [10], out = [];
  tiers.forEach(function (t) { out = out.concat(IDEES[mode][t]); if (besoin("bebe")) out = out.concat(IDEES_BEBE[mode][t]); });
  return out;
}
function modeParDefaut() {
  var d = S.jours[dayKey()] || {};
  if (d.e === 1) return "moi";
  var aFaire = prioritesDuJour().some(function (t) { return !t.done; }) || S.projets.some(function (p) { return (p.etape || "").trim(); });
  return aFaire ? "avancer" : "organiser";
}
function ideesPour(mode, min) {
  var d = S.jours[dayKey()] || {}, out = [], vu = {}, f = foi();
  function add(x) { if (!vu[x.t]) { vu[x.t] = 1; out.push(x); } }
  if (mode === "avancer") {
    minimumDuJour().filter(function (x) { return !x.fait; }).forEach(function (x) { add({ t: x.t, p: "Dans ton minimum du jour." }); });
    prioritesDuJour().filter(function (t) { return !t.done; }).forEach(function (t) { add({ t: (min >= 30 ? "Avance sur : " : "Juste la première étape de : ") + t.txt, p: "Une de tes priorités du jour." }); });
    S.projets.filter(function (p) { return (p.etape || "").trim(); }).forEach(function (p) { add({ t: p.etape.trim(), p: "Prochaine étape pour « " + (p.titre || "ton projet") + " ».", projet: p.id }); });
    S.taches.filter(function (t) { return !t.done && t.today !== dayKey(); }).slice(0, 6).forEach(function (t) { add({ t: (min >= 30 ? "Avance sur : " : "Commence : ") + t.txt, p: "Dans ta liste." }); });
    if (!out.length) add({ t: "Choisis un projet qui compte pour toi, et note sa toute première étape.", p: "Ça se passe dans « Mes projets ».", lien: "projets" });
  } else if (mode === "organiser") {
    melange(pool("organiser", min)).forEach(function (x) { add({ t: fill(x), p: "" }); });
  } else {
    if (d.e === 1) add(min >= 30 ? { t: "Dors, ou allonge-toi, le téléphone loin de toi.", p: "Ton énergie est à plat : c'est ce qui rechargera le plus." } : { t: "Allonge-toi et ferme les yeux.", p: "Même dix minutes comptent." });
    if (f) add({ t: "Un moment de calme qui te ressemble : " + f.moment + ".", p: "" });
    var extras = [min >= 30
      ? { t: "Cinq minutes de cohérence cardiaque, puis le reste du temps pour toi.", p: "Suis la lumière : elle te guide.", souffle: "coherence" }
      : { t: "Respire deux minutes avec Ma veilleuse.", p: "Suis la lumière : elle te guide.", souffle: "long" }];
    if (S.videos.length) { var v = S.videos[Math.floor(Math.random() * S.videos.length)]; extras.push({ t: "Mets une de tes vidéos : « " + titreVideo(v) + " »", p: "", video: v.id }); }
    var sombre = etatSoleil().nuit;
    melange(pool("moi", min).filter(function (x) { return !(sombre && /^Sors /.test(x)); }).map(function (x) { return { t: fill(x), p: "" }; }).concat(extras)).forEach(add);
  }
  return out;
}

/* ---------- Navigation ---------- */
var ROUTES = {
  "aujourdhui": { tab: "aujourdhui", depth: 0 },
  "minimum": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "liste": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "projets": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "journal": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "evolution": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "reglages": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "guide": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "memo": { tab: "aujourdhui", depth: 1, back: "aujourdhui", backLabel: "Aujourd'hui" },
  "relais": { tab: "relais", depth: 0 },
  "pour-eux": { tab: "relais", depth: 1, back: "relais", backLabel: "Relais" },
  "preparer": { tab: "relais", depth: 1, back: "relais", backLabel: "Relais" },
  "nuit": { tab: "relais", depth: 1, back: "relais", backLabel: "Relais" },
  "contact": { tab: "relais", depth: 1, back: "relais", backLabel: "Relais" },
  "maintenant": { tab: "maintenant", depth: 0 },
  "sos": { tab: "maintenant", depth: 1, back: "maintenant", backLabel: "Là, maintenant" },
  "respirer": { tab: "maintenant", depth: 1, back: "maintenant", backLabel: "Là, maintenant" },
  "plan": { tab: "maintenant", depth: 1, back: "maintenant", backLabel: "Là, maintenant" },
  "reperes": { tab: "reperes", depth: 0 },
  "rep": { tab: "reperes", depth: 1, back: "reperes", backLabel: "Repères" },
  "reg": { tab: "aujourdhui", depth: 2, back: "reglages", backLabel: "Réglages" }
};
function route() {
  var h = (location.hash || "").replace("#", "");
  var m = h.match(/^(contact|sos|rep|reg)-([a-z0-9]+)$/);
  if (m) return { name: m[1], arg: m[2], def: ROUTES[m[1]] };
  if (ROUTES[h] && ["contact", "sos", "rep", "reg"].indexOf(h) < 0) return { name: h, arg: null, def: ROUTES[h] };
  return { name: "aujourdhui", arg: null, def: ROUTES.aujourdhui };
}
function subHead(r, title, lead) {
  return '<header class="subhead"><a class="backbtn" href="#' + r.def.back + '">' + I.retour + esc(r.def.backLabel) + "</a></header>" +
    '<div class="head"><h1 class="title">' + title + "</h1>" + (lead ? '<p class="lead">' + lead + "</p>" : "") + "</div>";
}
function rootHead(title, lead) { return '<div class="head"><h1 class="title big">' + title + "</h1>" + (lead ? '<p class="lead">' + lead + "</p>" : "") + "</div>"; }
function cell(href, icon, titre, sous, extra) {
  return '<a class="cell" href="#' + href + '">' + (icon ? '<span class="ic">' + icon + "</span>" : "") +
    '<span class="ct"><span>' + titre + "</span>" + (sous ? "<small>" + sous + "</small>" : "") + "</span>" + (extra || "") + '<span class="chev">' + I.chev + "</span></a>";
}

/* ---------- Bienvenue : le prénom, la ville, les besoins, les proches ---------- */
var welcomeStep = 0, revoir = false, sensEtape = "";
function field(k, label, type, ph) {
  return '<label class="field" for="p-' + k + '">' + esc(label) + '<input id="p-' + k + '" type="' + type + '" autocomplete="off" data-profil="' + k + '" value="' + esc(S.profil[k] || "") + '" placeholder="' + esc(ph) + '"></label>';
}
function villeSelect() {
  var L0 = lieu();
  if (L0.geo) {
    return '<div class="field">Ta position<div class="row"><span class="btn left" style="flex:1 1 auto;cursor:default">' + I.lever + " " + esc(cap(L0.nom)) + '</span><button type="button" class="btn" data-action="geo-off">Choisir une ville</button></div></div>';
  }
  var cur = S.profil.lieu, dansListe = VILLES.some(function (v) { return v[0] === cur; });
  return '<label class="field" for="p-lieu">Ta ville<select id="p-lieu" data-profil="lieu">' +
    VILLES.map(function (v) { return '<option value="' + esc(v[0]) + '"' + (v[0] === (dansListe ? cur : CONFIG.lieuDefaut) ? " selected" : "") + ">" + esc(v[0]) + "</option>"; }).join("") + "</select></label>" +
    (navigator.geolocation ? '<button type="button" class="btn" data-action="geo-on">Utiliser ma position</button>' : "");
}
/* Un curseur : allumé ou éteint. action : ce qu'il déclenche ; attrs : ses repères ; seul : hors d'une liste. */
function sw(action, attrs, on, titre, sous, icone, seul) {
  return '<button type="button" class="sw' + (seul ? " seul" : "") + '" role="switch" data-action="' + action + '"' + (attrs || "") + ' aria-checked="' + !!on + '">' +
    (icone ? '<span class="ic" aria-hidden="true">' + icone + "</span>" : "") +
    '<span class="ct"><span>' + esc(titre) + "</span>" + (sous ? "<small>" + esc(sous) + "</small>" : "") + '</span><span class="track" aria-hidden="true"><span class="knob"></span></span></button>';
}
function prieresReglage() {
  return prieresToggle() +
    (S.profil.prieres ? '<div class="seg" role="group" aria-label="Calcul des horaires">' + [12, 15, 18].map(function (a) { return '<button type="button" data-action="angle" data-v="' + a + '" aria-pressed="' + ((S.profil.angle || 12) === a) + '">' + a + "°</button>"; }).join("") + "</div>" +
      '<p class="fine">Selon le calcul, Fajr et Icha peuvent varier d\'une demi-heure. 12° est le plus courant en France (Musulmans de France) ; d\'autres mosquées utilisent 15° ou 18°. Choisis celui de ta mosquée.</p>' : "");
}
function foiChoix() {
  var cur = S.profil.foi, f = FOIS[cur];
  var chips = [["islam", "Islam"], ["christianisme", "Christianisme"], ["judaisme", "Judaïsme"]].map(function (o) {
    return '<button type="button" class="chip" data-action="foi" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>";
  }).join("");
  return '<span class="field" id="foi-lab">Ma religion</span><div class="chips" role="group" aria-labelledby="foi-lab">' + chips + "</div>" +
    (f ? '<p class="fine">Un texte par jour sur l\'accueil, et quelques mots ici et là.</p>' : '<p class="fine">Choisis ta religion : un texte par jour t\'attendra sur l\'accueil.</p>') +
    (f && f.relire ? '<p class="fine warn">Pour cette religion, les textes sont des traductions simples, pas encore relues par une personne compétente. Ils portent la mention « à faire relire ».</p>' : "") +
    (cur === "islam" ? prieresReglage() : "");
}
/* Les heures proposées pour une prise : de demi-heure en demi-heure. */
function heuresOptions(cur) {
  var out = '<option value=""' + (cur ? "" : " selected") + ">Heure</option>";
  for (var h = 0; h < 24; h++) for (var m = 0; m < 60; m += 30) { var v = pad(h) + ":" + pad(m); out += '<option value="' + v + '"' + (v === cur ? " selected" : "") + ">" + heureTxt(v) + "</option>"; }
  if (cur && !/^\d\d:(00|30)$/.test(cur)) out += '<option value="' + esc(cur) + '" selected>' + heureTxt(cur) + "</option>";
  return out;
}
function prisesEditeur() {
  return '<div class="stack">' + S.prises.map(function (p) {
    return '<div class="edit-row"><label class="sr-only" for="pn-' + p.id + '">Nom de la prise</label><input id="pn-' + p.id + '" type="text" autocomplete="off" data-prise="' + p.id + '" data-f="nom" value="' + esc(p.nom || "") + '" placeholder="Mon traitement">' +
      '<label class="sr-only" for="ph-' + p.id + '">Heure de la prise</label><select class="heure-in" id="ph-' + p.id + '" data-prise="' + p.id + '" data-f="heure">' + heuresOptions(p.heure || "") + "</select>" +
      '<button type="button" class="mini-btn" data-action="prise-del" data-id="' + p.id + '" aria-label="Retirer cette prise">' + I.x + "</button></div>";
  }).join("") + "</div>" +
    '<button class="btn" data-action="prise-add">Ajouter une prise</button>' +
    '<p class="fine">Ma veilleuse ne sonne pas : une fois l\'heure passée, le rappel s\'affiche sur l\'accueil quand tu l\'ouvres. Garde aussi l\'alarme de ton téléphone. Pour les doses et les horaires, c\'est ton ordonnance qui fait foi.</p>';
}
/* Ce qu'un curseur demande en plus : il s'ouvre juste en dessous de lui. */
function panneau(k) {
  if (k === "bebe") return field("bebe", "Son prénom (facultatif)", "text", "") + '<p class="fine">Il apparaîtra dans les messages et sur les écrans à montrer.</p>';
  if (k === "traitement") return '<p class="fine">Un nom, une heure. Elles se cochent chaque jour dans « Le minimum ».</p>' + prisesEditeur();
  if (k === "foi") return foiChoix();
  return "";
}
function raccHTML(r) {
  var on = r.set.every(function (k) { return besoin(k); });
  return '<button type="button" class="racc" data-action="raccourci" data-k="' + r.k + '" aria-pressed="' + on + '"><span class="ic" aria-hidden="true">' + I[r.ic] + "</span>" +
    '<span class="ct"><span>' + esc(r.nom) + "</span><small>Allume : " + esc(r.set.map(function (k) { return byKey(BESOINS, k).nom; }).join(", ")) + "</small></span>" +
    '<span class="etat">' + (on ? "Allumé" : "Allumer") + "</span></button>";
}
/* Les besoins : deux raccourcis, puis les curseurs un par un. Sert à l'accueil et dans les réglages. */
function besoinsHTML() {
  return '<p class="group-label">Un raccourci, si une situation te ressemble</p><div class="stack">' + RACCOURCIS.map(raccHTML).join("") + "</div>" +
    '<p class="group-label">Tous les besoins, un par un</p><div class="sw-list">' + BESOINS.map(function (b) {
      var on = besoin(b.k), plus = panneau(b.k);
      return '<div class="sw-item' + (on ? " on" : "") + '" data-item="' + b.k + '">' + sw("besoin", ' data-k="' + b.k + '"', on, b.nom, b.d, I[b.ic]) +
        (plus ? '<div class="sw-plus"><div><div class="dedans" data-panneau="' + b.k + '">' + plus + "</div></div></div>" : "") + "</div>";
    }).join("") + "</div>";
}
/* Met l'écran des besoins à jour sans le reconstruire : les curseurs glissent, les panneaux s'ouvrent. */
function majBesoins(k) {
  document.querySelectorAll(".sw-item[data-item]").forEach(function (it) {
    var on = besoin(it.getAttribute("data-item")), b = it.querySelector(".sw");
    it.classList.toggle("on", on); if (b) b.setAttribute("aria-checked", String(on));
  });
  if (k) { var p = document.querySelector('[data-panneau="' + k + '"]'); if (p) { p.innerHTML = panneau(k); typo(p); } }
  document.querySelectorAll(".racc[data-k]").forEach(function (el) {
    var r = byKey(RACCOURCIS, el.getAttribute("data-k")), on = r.set.every(function (x) { return besoin(x); });
    el.setAttribute("aria-pressed", String(on)); var e = el.querySelector(".etat"); if (e) e.textContent = on ? "Allumé" : "Allumer";
  });
}
function surBesoins() { return !!document.querySelector("[data-panneau]"); }
function prochesEditeur() {
  return (S.proches.length ? "" : '<p class="fine">Personne pour l\'instant.</p>') + S.proches.map(function (x) {
    return '<div class="projet">' +
      '<label class="field" for="n-' + x.id + '">Prénom<input id="n-' + x.id + '" type="text" autocomplete="off" data-proche="' + x.id + '" data-f="nom" value="' + esc(x.nom) + '"></label>' +
      '<label class="field" for="t-' + x.id + '">Numéro (facultatif)<input id="t-' + x.id + '" type="tel" inputmode="tel" autocomplete="off" data-proche="' + x.id + '" data-f="tel" value="' + esc(x.tel) + '" placeholder="06 12 34 56 78"></label>' +
      sw("proche-passer", ' data-id="' + x.id + '"', !!x.passer, "Peut être là en personne", "Son prénom sera proposé dans « Qui est là ? »", "", true) +
      '<button type="button" class="link" data-action="proche-del" data-id="' + x.id + '" style="align-self:flex-start">Retirer cette personne</button></div>';
  }).join("") + '<button class="btn" data-action="proche-add">Ajouter une personne</button>';
}
/* Trois étapes, trois petites lumières. */
function pas(n) {
  return '<p class="pas">' + [1, 2, 3].map(function (i) { return "<i" + (i <= n ? ' class="on"' : "") + ' aria-hidden="true"></i>'; }).join("") + "<span>Étape " + n + " sur 3</span></p>";
}
function etapeTete(n, titre, lead) {
  return '<div class="head">' + pas(n) + '<h1 class="title">' + titre + '</h1><p class="lead">' + lead + "</p></div>";
}
function etapePied(suite, retour, label) {
  return (suite === "fin" ? '<button class="btn primary big" data-action="bienvenue-fin">' + label + "</button>" : '<button class="btn primary big" data-action="bienvenue-etape" data-v="' + suite + '">' + label + "</button>") +
    '<button class="link center" data-action="bienvenue-etape" data-v="' + retour + '">Retour</button>';
}
var premiereLumiere = true;
function scrBienvenue() {
  if (welcomeStep === 2) {
    return '<section class="welcome">' + etapeTete(1, "Faisons connaissance", "Juste de quoi te dire bonjour, et caler le jour et la nuit sur ta ville.") +
      field("prenom", "Ton prénom", "text", "") + accordChoix() + villeSelect() +
      '<p class="fine">Ta ville sert au lever et au coucher du soleil. Si elle n\'est pas dans la liste, prends la plus proche.</p>' +
      etapePied(3, 1, "Continuer") + "</section>";
  }
  if (welcomeStep === 3) {
    return '<section class="welcome">' + etapeTete(2, "De quoi as-tu besoin ?", "Allume ce qui te sert, laisse le reste éteint. Tu pourras changer d'avis à tout moment, dans les réglages.") +
      besoinsHTML() + etapePied(4, 2, "Continuer") + "</section>";
  }
  if (welcomeStep === 4) {
    return '<section class="welcome">' + etapeTete(3, "Tes proches", "Les personnes à qui tu peux demander un coup de main. Avec leur numéro, les messages prêts partent directement vers elles sur WhatsApp.") +
      prochesEditeur() +
      '<p class="fine">Tu peux passer cette étape, et y revenir dans les réglages.</p>' +
      etapePied("fin", 3, "C'est parti") + "</section>";
  }
  var premier = premiereLumiere && !revoir; premiereLumiere = false;
  return '<section class="welcome' + (premier ? " premier" : "") + '">' +
    '<span class="orb" aria-hidden="true"><i class="onde"></i><i class="onde o2"></i></span>' +
    '<div class="head"><h1 class="title big">Ma veilleuse</h1><p class="lead">La petite lumière qui reste allumée, là dès que tu en as besoin, le jour comme la nuit.</p></div>' +
    '<div class="mot"><p>Pour les jours où tout pèse un peu plus : une jauge pour savoir quelle journée t\'attend, des mots prêts pour demander de l\'aide, une lumière pour respirer.</p>' +
    "<p>Tu la règles selon ce dont tu as besoin. Prends ce qui te sert, laisse le reste.</p></div>" +
    (revoir ? '<button class="btn primary big" data-action="revoir-fermer">Fermer</button>' : '<button class="btn primary big" data-action="bienvenue-suite">Commencer</button>') +
    '<p class="fine"><span class="demo-tag">Démo</span> Une version de démonstration : essaie-la quelques jours, puis dis ce qui marche et ce qui manque.</p>' +
    '<p class="fine">Tout ce que tu notes ici reste dans ton téléphone : pas de compte, pas de serveur. Ma veilleuse ne remplace pas un soignant.</p>' +
    "</section>";
}

/* ---------- Aujourd'hui ---------- */
var J = null, editJauge = false, justLit = false;
function jaugeRow(dim) {
  var v = J[dim.k] || 0;
  var btns = dim.levels.map(function (w, i) {
    var n = i + 1, on = v && n <= v;
    return '<button type="button" class="jo" data-action="jauge" data-k="' + dim.k + '" data-v="' + n + '" aria-pressed="' + (v === n) + '" aria-label="' + esc(dim.label + " : " + w) + '">' +
      '<span class="jp' + (on ? " on" : "") + '"></span><span class="jw">' + esc(w) + "</span></button>";
  }).join("");
  return '<div class="jr" data-jr="' + dim.k + '" role="group" aria-labelledby="jl-' + dim.k + '"><span class="jl"><b id="jl-' + dim.k + '">' + dim.label + "</b><small>" + esc(dim.hint) + '</small></span><div class="jd">' + btns + "</div></div>";
}
/* Une ligne de la jauge se rallume sur place : les lumières s'allument jusqu'au niveau choisi. */
function paintRow(k) {
  var v = J[k] || 0;
  document.querySelectorAll('.jo[data-k="' + k + '"]').forEach(function (b) {
    var n = +b.getAttribute("data-v");
    b.setAttribute("aria-pressed", String(v === n));
    b.querySelector(".jp").classList.toggle("on", !!(v && n <= v));
  });
  var row = document.querySelector('.jr[data-jr="' + k + '"]'); if (row) row.classList.remove("manque");
}
/* L'anneau d'avancement du minimum : part entre 0 et 1. */
function anneau(part) {
  var c = 2 * Math.PI * 15;
  return '<svg class="anneau" viewBox="0 0 38 38" aria-hidden="true"><circle class="piste" cx="19" cy="19" r="15"/><circle class="fait" cx="19" cy="19" r="15" stroke-linecap="round" stroke-dasharray="' + (c * Math.max(0, Math.min(1, part))).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 19 19)"/></svg>';
}
/* La carte de la journée, à remplir : la jauge dans le verre. */
function carteJauge(d) {
  if (!J) J = hasGauge(d) ? { e: d.e, t: d.t, r: d.r, h: d.h || 0, s: d.s || 0 } : { e: 0, t: 0, r: 0, h: 0, s: 0 };
  return '<section class="verre journee" aria-label="Ta jauge du jour"><div class="pan"><p class="sur"><i></i>Ta jauge du jour</p><h2>Comment ça va ?</h2><p class="mot">Dix secondes, d\'une main. Tu peux la refaire quand ça change dans la journée.</p>' +
    '<div class="jauge">' + DIMS.map(jaugeRow).join("") + "</div>" +
    (besoin("humeur") ? '<p class="mot">Et si tu veux, deux lignes de plus. Elles ne changent pas ta journée : tu les retrouves dans « Mon évolution ».</p><div class="jauge">' + DIMS_PLUS.map(jaugeRow).join("") + "</div>" : "") +
    '<p class="err" id="jerr" role="alert"></p>' +
    '<button class="btn primary big" data-action="voir-journee">Voir ma journée</button>' +
    (editJauge ? '<button class="link center" data-action="annuler-jauge">Garder ma jauge</button>' : "") + "</div></section>";
}
/* La carte de la journée, une fois la jauge faite : son nom, son cadre, et la capsule des perles. */
function carteJournee(d) {
  var ty = typeDe(d), T0 = TYPES[ty], ts = dernierTs(d), nd = notesDuJour(d), n = 0;
  var cols = dimsActives().filter(function (dim) { return d[dim.k]; }).map(function (dim) {
    var v = d[dim.k];
    return "<span><small>" + dim.label + '</small><b class="perles" aria-label="' + esc(dim.levels[v - 1]) + '">' +
      [1, 2, 3].map(function (x) { return x <= v ? '<i class="on" style="--i:' + (n++) + '"></i>' : "<i></i>"; }).join("") + "</b></span>";
  }).join("");
  var html = '<section class="verre journee' + (justLit ? " lit" : "") + '" aria-label="Ta journée"><div class="pan"><p class="sur"><i></i>' + (ts ? "Ta jauge de " + heure(ts) : "Ta journée") + "</p>" +
    "<h2>" + T0.nom + '</h2><p class="mot">' + T0.cadre + "</p>" +
    (nd.length ? '<ul class="notes">' + nd.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
    '<div class="liens"><button class="link" data-action="refaire-jauge">Refaire ma jauge</button><button class="link" data-action="de-cote">À mettre de côté</button></div></div>' +
    '<button type="button" class="noir capsule" data-action="refaire-jauge" aria-label="Ta jauge. Toucher pour la refaire">' + cols + "</button></section>";
  justLit = false;
  return html;
}
var ideeNeuve = false;
function momentCard() {
  var durees = [10, 30, 60].map(function (m) {
    return '<button class="duree" data-action="creneau-go" data-min="' + m + '" aria-pressed="' + (creneauMin === m) + '"><b>' + (m === 60 ? "1 h" : m) + "</b><span>" + (m === 60 ? "et plus" : "minutes") + "</span></button>";
  }).join("");
  var corps = "";
  if (creneauMin && creneauListe.length) {
    var it = creneauListe[creneauIdx % creneauListe.length];
    var modes = [["avancer", "Avancer"], ["organiser", "M'organiser"], ["moi", "Pour moi"]];
    corps = '<div class="seg" role="group" aria-label="Ce que tu veux en faire">' + modes.map(function (m) { return '<button type="button" data-action="creneau-mode" data-v="' + m[0] + '" aria-pressed="' + (creneauMode === m[0]) + '">' + m[1] + "</button>"; }).join("") + "</div>" +
      '<div class="idee-bloc' + (ideeNeuve ? " neuf" : "") + '"><p class="idee">' + esc(it.t) + "</p>" + (it.p ? '<p class="fine">' + esc(it.p) + "</p>" : "") +
      '<p class="fine">Il est ' + heure(Date.now()) + " : " + { 10: "dix minutes", 30: "une demi-heure", 60: "une heure ou plus" }[creneauMin] + " devant toi, à ton rythme.</p></div>" +
      (it.projet ? '<button class="btn" data-action="etape-faite" data-id="' + it.projet + '">Étape faite</button>' : "") +
      (it.lien ? '<a class="btn" href="#' + it.lien + '">Ouvrir mes projets</a>' : "") +
      (it.souffle ? '<button class="btn" data-action="souffle-go" data-id="' + it.souffle + '">Respirer maintenant</button>' : "") +
      (it.video && byId(S.videos, it.video) ? '<a class="btn" href="' + esc(byId(S.videos, it.video).url) + '">Ouvrir la vidéo</a>' : "") +
      '<div class="row"><button class="btn" data-action="creneau-autre">Une autre idée</button><button class="btn primary" data-action="creneau-fini">C\'est parti</button></div>';
  }
  ideeNeuve = false;
  return '<section class="moment" id="moment"><div class="head"><h2>Un moment de libre ?</h2><p class="fine">' +
    (creneauMin ? "Choisis ce que tu veux en faire. Une seule idée à la fois." : "Touche le temps que tu as devant toi : Ma veilleuse te propose quoi en faire.") + "</p></div>" +
    '<div class="durees">' + durees + "</div>" + corps + "</section>";
}
function tile(href, icon, titre, st) { return '<a class="tile" href="#' + href + '"><span class="ic">' + icon + "</span><b>" + titre + '</b><span class="st">' + st + "</span></a>"; }
/* À ne pas oublier aujourd'hui : avec le curseur « Me souvenir », ce qui reste à faire s'affiche en clair sur l'accueil. */
function aNePasOublier() {
  var items = [];
  minimumDuJour().filter(function (x) { return !x.fait; }).forEach(function (x) { items.push(x.t + (x.heure ? ", à " + heureTxt(x.heure) : "")); });
  prioritesDuJour().filter(function (t) { return !t.done; }).forEach(function (t) { items.push(t.txt); });
  return '<section class="card" aria-label="À ne pas oublier aujourd\'hui"><div class="card-tete"><h2>À ne pas oublier</h2><a class="link" href="#memo">Mes pense-bêtes</a></div>' +
    (items.length ? '<ul class="plain">' + items.slice(0, 6).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
      : '<p class="fine">Rien de noté pour aujourd\'hui. Ce que tu mets dans « Le minimum » ou dans tes priorités s\'affichera ici.</p>') + "</section>";
}
function rappelPrises() {
  var retard = prisesEnRetard();
  if (!retard.length) return "";
  return '<section class="nudge" aria-label="Rappel"><p><b>C\'est l\'heure.</b> ' + retard.map(function (x) { return esc(x.t) + ", prévu à " + heureTxt(x.heure); }).join(" ; ") + ".</p>" +
    '<div class="row">' + retard.map(function (x) { return '<button class="btn primary" data-action="min" data-k="' + x.id + '">' + (retard.length > 1 ? esc(x.t) + " : fait" : "C'est fait") + "</button>"; }).join("") +
    '<a class="btn" href="#minimum">Voir le minimum</a></div></section>';
}
function scrAujourdhui() {
  var k = dayKey(), d = S.jours[k], done = hasGauge(d) && !editJauge;
  var now = new Date(), h = now.getHours();
  var dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  var nom = (S.profil.prenom || "").trim();
  var dd = d || {};
  var mins = minimumDuJour(), faits = mins.filter(function (x) { return x.fait; }).length;
  var max = done ? TYPES[typeDe(d)].max : 2;
  var prio = prioritesDuJour().length, nListe = S.taches.filter(function (t) { return !t.done; }).length;
  var proj = S.projets.filter(function (p) { return (p.titre || "").trim(); });
  var etape = proj.filter(function (p) { return (p.etape || "").trim(); })[0];
  var nConf = confiesDuJour().length, who = nPresent();
  var nMemo = S.affaires.length + S.retenir.length;
  var minimumSt = !mins.length ? "Tes impératifs du jour" : faits === mins.length ? "Tout est fait" : faits + " sur " + mins.length;
  var tiles =
    tile("liste", I.liste, "Ma liste", (done ? (prio ? prio + " priorité" + (prio > 1 ? "s" : "") + " sur " + max : max === 1 ? "Une priorité au plus aujourd'hui" : "Jusqu'à " + max + " priorités aujourd'hui") + "<br>" : "") + (nListe ? nListe + (nListe > 1 ? " choses notées" : " chose notée") : "Vide ta tête ici")) +
    tile("projets", I.projets, "Mes projets", proj.length ? (etape ? "Prochaine étape : " + esc(etape.etape) : proj.length + " projet" + (proj.length > 1 ? "s" : "")) : "Ce que tu veux faire avancer dans ta vie") +
    tile("relais", I.delegue, "Je délègue", nConf ? (who ? "À " + esc(who) + " : " : "") + nConf + (nConf > 1 ? " choses" : " chose") : "Rien de choisi pour l'instant") +
    tile("journal", I.journal, "Mon journal", (dd.mot || "").trim() ? "Écrit à " + heure(dd.motTs) : "Un mot sur aujourd'hui ?") +
    tile("evolution", I.evolution, "Mon évolution", "Ta journée, ta semaine, ton mois") +
    (besoin("souvenir") ? tile("memo", I.memo, "Mes pense-bêtes", nMemo ? nMemo + (nMemo > 1 ? " choses notées" : " chose notée") : "Où sont tes affaires, ce qu'il faut retenir") : "");
  /* Le premier écran : le salut dans le ciel, la journée et deux tuiles sur les dunes, le chemin de lumières en dessous. Le reste vient en faisant défiler. */
  return '<div class="ecran-un">' +
    '<header class="haut"><span class="marque"><i aria-hidden="true"></i>Ma veilleuse</span><span class="outils">' +
    '<button type="button" class="rond theme-btn" data-action="theme-bascule" aria-label="' + labelTheme(nuitAffichee()) + '"><span class="ic-soleil">' + I.soleilT + '</span><span class="ic-soir">' + I.coucherT + '</span><span class="ic-lune">' + I.luneT + "</span></button>" +
    '<a class="rond" href="#reglages" aria-label="Réglages">' + I.reglages + "</a></span></header>" +
    '<section class="salut"><p class="heure"><b id="clock">' + heure(Date.now()) + '</b><span id="sun">' + phraseSoleil() + "</span></p>" +
    "<h1>" + (h >= 18 || h < 4 ? "Bonsoir" : "Bonjour") + (nom ? ", " + esc(nom) : "") + '</h1><p class="date">' + esc(cap(dateStr)) + "</p></section>" +
    rappelPrises() +
    (done ? carteJournee(d) : carteJauge(d)) +
    '<div class="duo"><a class="verre tuile" href="#minimum"><span class="pan"><span><b>Le minimum</b><small>' + minimumSt + "</small></span>" + anneau(mins.length ? faits / mins.length : 0) + "</span></a>" +
    '<a class="verre tuile" href="#respirer"><span class="pan"><span><b>Respirer</b><small>Une lumière te guide</small></span><i class="bille" aria-hidden="true"></i></span></a></div>' +
    '<div class="vide"></div></div>' +
    (!S.vu.guideVu ? '<section class="nudge"><p><b>Première visite ?</b> Le guide te montre où trouver quoi, et comment mettre Ma veilleuse sur ton écran d\'accueil.</p><div class="row"><a class="btn" href="#guide">Voir le guide</a><button class="btn" data-action="guide-plus-tard">Plus tard</button></div></section>' : "") +
    (besoin("souvenir") ? aNePasOublier() : "") +
    verset(versetDuJour()) +
    (prieresActives() ? '<section class="prieres" id="prieres" aria-label="Horaires des prières">' + prieresHTML() + "</section>" : "") +
    momentCard() +
    '<section class="tiles" aria-label="Tes outils">' + tiles + "</section>" +
    (CONFIG.demo ? '<p class="fine"><span class="demo-tag">Démo</span> Tu testes une version de démonstration. <a class="link" href="#reg-retour">Dire ce qui marche, ce qui manque</a></p>' : "");
}

var impMode = "jour", editDelegue = false, editMessages = false;
function delegueEditeur() {
  return '<div class="stack">' + menuVisible().map(function (m) {
    return '<div class="edit-row"><label class="sr-only" for="dm-' + m.id + '">Une chose à déléguer</label><input id="dm-' + m.id + '" type="text" autocomplete="off" data-menu="' + m.id + '" value="' + esc(fill(m.txt)) + '">' +
      '<button type="button" class="mini-btn" data-action="menu-del" data-id="' + m.id + '" aria-label="' + esc("Retirer : " + fill(m.txt)) + '">' + I.x + "</button></div>";
  }).join("") + "</div>" +
    '<form class="add" data-form="menu"><label class="sr-only" for="menu-in">Une chose à déléguer</label><input id="menu-in" type="text" placeholder="Une chose à déléguer" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form>' +
    '<button class="link" data-action="menu-reset" style="align-self:flex-start">Remettre les exemples de départ</button>';
}
function messagesEditeur() {
  return S.messages.map(function (m) {
    return '<div class="projet">' +
      '<label class="field" for="ml-' + m.id + '">Le bouton<input id="ml-' + m.id + '" type="text" autocomplete="off" data-msg="' + m.id + '" data-f="label" value="' + esc(m.label) + '" placeholder="J\'ai besoin de…"></label>' +
      '<label class="field" for="mt-' + m.id + '">Le message envoyé<textarea id="mt-' + m.id + '" rows="3" data-msg="' + m.id + '" data-f="txt" placeholder="Le texte qui part sur WhatsApp">' + esc(m.txt) + "</textarea></label>" +
      (m.k === "passer" ? '<p class="fine">Proposé seulement aux personnes qui peuvent être là en personne.</p>' : "") +
      '<button class="btn danger" data-action="msg-del" data-id="' + m.id + '" style="align-self:flex-start">Retirer ce message</button></div>';
  }).join("") +
    '<button class="btn" data-action="msg-add">Ajouter un message</button>' +
    '<button class="link" data-action="msg-reset" style="align-self:flex-start">Remettre les exemples de départ</button>';
}
function checkRow(it) {
  var k = dayKey(), h = heure(it.fait);
  var depuis = it.ponctuel && !it.fait && it.depuis && it.depuis < k ? "<small>" + (daysBetween(it.depuis, k) === 1 ? "Depuis hier" : "Depuis " + labelJour(it.depuis)) + "</small>" : "";
  var prevu = it.prise && it.heure ? "<small>Prévu à " + heureTxt(it.heure) + "</small>" : "";
  var btn = '<button type="button" class="check" data-action="min" data-k="' + it.id + '" aria-pressed="' + !!it.fait + '"><span class="box" aria-hidden="true"></span><span class="lab">' + esc(it.t) + depuis + prevu + "</span>" + (h ? '<span class="quand">à ' + h + "</span>" : "") + "</button>";
  if (!it.perso) return btn;
  return '<div class="check-row">' + btn + '<button type="button" class="mini-btn" data-action="imp-del" data-id="' + it.id + '" aria-label="' + esc("Retirer : " + it.t) + '">' + I.x + "</button></div>";
}
function conseilsSoin() {
  var c = [
    { ic: I.soin, t: "Prendre soin de mon corps", d: "Un vrai repas, en prenant le temps de t'asseoir. De l'eau à portée de main. Une douche dès que tu peux : ce sont des bases, pas des luxes." },
    { ic: I.bouger, t: "Bouger un peu", d: "Dix minutes suffisent : quelques étirements, une marche dehors, un peu de yoga doux." + (besoin("bebe") ? " Après une naissance, attends le feu vert de ta sage-femme ou de ton médecin avant un sport plus intense." : ""), a: [["Mes vidéos", "maintenant", "videos"]] },
    { ic: I.respirer, t: "Respirer, méditer", d: "Quelques minutes rien que pour toi : une respiration guidée, ou une méditation que tu aimes.", a: [["Respirer", "respirer"], ["Mes vidéos", "maintenant", "videos"]] },
    { ic: I.lever, t: "Prendre l'air", d: "Même cinq minutes à la fenêtre ou sur le pas de la porte. La lumière du jour aide aussi à mieux dormir la nuit." }
  ];
  if (besoin("humeur")) c.push({ ic: I.lune, t: "Protéger mon sommeil", d: "Des heures de coucher et de lever à peu près régulières, la lumière du jour le matin, les écrans loin du lit. Si tes nuits restent mauvaises plusieurs semaines, parles-en à ton médecin.", a: [["Respirer pour m'endormir", "respirer"]] });
  c.push({ ic: I.deux, t: "Parler à quelqu'un", d: "Même cinq minutes : un appel, un message vocal, un café. Ça remet de l'air dans la tête.", a: [["Mes relais", "relais"]] });
  return c;
}
function scrMinimum(r) {
  var all = minimumDuJour();
  var prises = all.filter(function (x) { return x.prise; });
  var quot = all.filter(function (x) { return !x.ponctuel && !x.prise; }), ponc = all.filter(function (x) { return x.ponctuel; });
  var modes = [["jour", "Pour aujourd'hui"], ["tous", "Tous les jours"]];
  var cartes = conseilsSoin().map(function (c) {
    return '<div class="conseil"><span class="ic">' + c.ic + '</span><div class="ct"><b>' + esc(c.t) + "</b><p>" + esc(c.d) + "</p>" +
      (c.a ? '<div class="conseil-liens">' + c.a.map(function (x) { return '<button class="link" data-action="go" data-h="' + x[1] + '"' + (x[2] ? ' data-ancre="' + x[2] + '"' : "") + ">" + x[0] + "</button>"; }).join("") + "</div>" : "") + "</div></div>";
  }).join("");
  return subHead(r, "Le minimum", "Ce qui doit vraiment être fait aujourd'hui, quoi qu'il arrive. Coche quand c'est fait : l'heure s'affiche.") +
    (prises.length ? '<p class="group-label">Mon traitement</p><div class="checks">' + prises.map(checkRow).join("") + "</div>" : "") +
    (quot.length ? '<p class="group-label">Tous les jours</p><div class="checks">' + quot.map(checkRow).join("") + "</div>" : "") +
    (ponc.length ? '<p class="group-label">Aujourd\'hui</p><div class="checks">' + ponc.map(checkRow).join("") + "</div>" : "") +
    (!all.length ? '<p class="fine">Rien à cocher pour l\'instant. Ajoute seulement ce qui doit vraiment être fait : un médicament, un rendez-vous, un papier urgent.</p>' : "") +
    '<section class="card"><h2>Ajouter un impératif</h2>' +
    '<div class="seg" role="group" aria-label="Pour quand">' + modes.map(function (o) { return '<button type="button" data-action="imp-mode" data-v="' + o[0] + '" aria-pressed="' + (impMode === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>" +
    '<form class="add" data-form="imperatif"><label class="sr-only" for="imp-in">Un impératif</label><input id="imp-in" type="text" placeholder="' + esc(impPlaceholder()) + '" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form>' +
    '<p class="fine">Un impératif du jour reste là tant qu\'il n\'est pas fait. Le reste va dans ta liste.</p></section>' +
    (besoin("traitement") ? '<section class="card" id="prises"><h2>Mes prises</h2><p class="fine">Un nom, une heure. Elles se cochent ici, chaque jour.</p>' + prisesEditeur() + "</section>" : "") +
    '<div class="head"><h2>Prendre soin de moi</h2><p class="fine">Des idées, pas des cases à cocher. Prends celle qui te fait du bien aujourd\'hui.</p></div>' +
    '<div class="conseils">' + cartes + "</div>" +
    verset(0);
}
function impPlaceholder() {
  if (impMode === "tous") return besoin("bebe") ? "Vitamine D " + deBebe() + "…" : "Sortir prendre l'air…";
  return besoin("bebe") ? "Rendez-vous PMI à 10 h…" : "Rendez-vous à 10 h…";
}

function taskRow(t, compact) {
  var star = t.today === dayKey();
  var h = '<li class="task' + (t.done ? " done" : "") + '">' +
    '<button type="button" class="mini-btn" data-action="tache-done" data-id="' + t.id + '" aria-pressed="' + !!t.done + '" aria-label="' + esc((t.done ? "Pas encore faite : " : "C'est fait : ") + t.txt) + '"><span class="box" aria-hidden="true"></span></button>' +
    '<span class="tt">' + esc(t.txt) + "</span>" + (t.done && t.doneTs ? '<span class="quand">fait à ' + heure(t.doneTs) + "</span>" : "");
  if (!compact) {
    h += '<button type="button" class="mini-btn" data-action="tache-star" data-id="' + t.id + '" aria-pressed="' + star + '" aria-label="' + esc((star ? "Retirer des priorités : " : "Priorité du jour : ") + t.txt) + '">' + (star ? I.starOn : I.star) + "</button>" +
      '<button type="button" class="mini-btn" data-action="tache-del" data-id="' + t.id + '" aria-label="' + esc("Supprimer : " + t.txt) + '">' + I.x + "</button>";
  }
  return h + "</li>";
}
function scrListe(r) {
  var k = dayKey(), d = S.jours[k], max = hasGauge(d) ? TYPES[typeDe(d)].max : 2;
  var pr = prioritesDuJour();
  var list = S.taches.slice().sort(function (a, b) { return (a.done - b.done) || ((b.today === k) - (a.today === k)) || (a.created - b.created); });
  var mots = { 1: "une chose", 2: "deux choses", 3: "trois choses" };
  return subHead(r, "Ma liste", "Vide ta tête ici. L'étoile met une chose dans tes priorités du jour.") +
    '<section class="card"><h2>Mes priorités <span class="fine">' + pr.length + " sur " + max + "</span></h2>" +
    (pr.length ? '<ul class="tasks">' + pr.map(function (t) { return taskRow(t, true); }).join("") + "</ul>"
      : '<p class="fine">' + (max === 1 ? "Rien de prévu en plus ? C'est très bien aussi." : "Choisis jusqu'à " + mots[max] + " dans ta liste, avec l'étoile.") + "</p>") +
    (pr.length > max ? '<p class="fine warn">Ça fait plus que prévu pour aujourd\'hui. Tu peux, mais tu peux aussi en garder pour demain.</p>' : "") + "</section>" +
    '<form class="add" data-form="tache"><label class="sr-only" for="tache-in">Une chose à ne pas oublier</label><input id="tache-in" type="text" placeholder="' + (besoin("bebe") ? "Rappeler la CAF, des couches…" : "Rappeler la banque, du pain…") + '" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form>' +
    (list.length ? '<ul class="tasks">' + list.map(function (t) { return taskRow(t, false); }).join("") + "</ul>" : "");
}

function scrProjets(r) {
  var cards = S.projets.map(function (p) {
    return '<div class="projet">' +
      '<label class="sr-only" for="pt-' + p.id + '">Nom du projet</label><input class="titre" id="pt-' + p.id + '" type="text" autocomplete="off" data-projet="' + p.id + '" data-f="titre" value="' + esc(p.titre) + '" placeholder="Nom du projet">' +
      '<label class="field" for="pe-' + p.id + '">Prochaine étape, toute petite<input id="pe-' + p.id + '" type="text" autocomplete="off" data-projet="' + p.id + '" data-f="etape" value="' + esc(p.etape || "") + '" placeholder="Chercher un cours près de chez moi"></label>' +
      '<div class="row"><button class="btn" data-action="etape-faite" data-id="' + p.id + '"' + ((p.etape || "").trim() ? "" : " disabled") + '>Étape faite</button><button class="btn danger" data-action="projet-del" data-id="' + p.id + '">Retirer</button></div></div>';
  }).join("");
  return subHead(r, "Mes projets", "Ce que tu veux faire avancer dans ta vie, à ton rythme. Une seule prochaine étape par projet, toute petite.") +
    cards +
    '<form class="add" data-form="projet"><label class="sr-only" for="projet-in">Un nouveau projet</label><input id="projet-in" type="text" placeholder="Reprendre le sport, un projet perso…" autocomplete="off"><button class="btn" type="submit">Ajouter</button></form>' +
    '<p class="fine">Quand tu as un moment de libre, « Avancer » te propose ces étapes.</p>';
}

function scrJournal(r) {
  var k = dayKey(), d = S.jours[k] || {};
  var past = Object.keys(S.jours).filter(function (kk) { return kk < k && S.jours[kk].mot && S.jours[kk].mot.trim(); }).sort().reverse().slice(0, 30);
  return subHead(r, "Mon journal", "Un mot sur aujourd'hui, si tu veux. Rien que pour toi.") +
    '<label class="sr-only" for="mot">Un mot sur aujourd\'hui</label><textarea id="mot" rows="6" placeholder="Ce qui s\'est passé, ce que tu ressens, ce qui t\'a fait du bien…">' + esc(d.mot || "") + "</textarea>" +
    '<p class="fine" id="mot-etat">' + (d.motTs ? "Enregistré à " + heure(d.motTs) + "." : "Ça s'enregistre tout seul, au fil de ce que tu écris.") + "</p>" +
    (past.length ? '<section class="card"><h2>Les jours d\'avant</h2><ul class="journal">' + past.map(function (kk) { var j = S.jours[kk]; return '<li><span class="nd">' + esc(cap(labelJour(kk))) + (j.motTs ? ", " + heure(j.motTs) : "") + "</span><p>" + esc(j.mot) + "</p></li>"; }).join("") + "</ul></section>" : "");
}

/* ---------- Mon évolution ---------- */
var DIM_MOTS = {
  e: { niv: ["souvent à plat", "plutôt moyenne", "plutôt bonne"], plus: "un peu plus d'énergie", moins: "un peu moins d'énergie" },
  t: { niv: ["souvent en vrac", "ça tient, en général", "plutôt claire"], plus: "la tête un peu plus claire", moins: "la tête un peu plus en vrac" },
  r: { niv: ["souvent sans relais", "du relais par moments", "du relais presque tout le temps"], plus: "plus de relais", moins: "moins de relais" },
  h: { niv: ["souvent basse", "plutôt moyenne", "plutôt bonne"], plus: "une humeur un peu meilleure", moins: "une humeur un peu plus basse" },
  s: { niv: ["des nuits souvent mauvaises", "des nuits moyennes", "des nuits plutôt bonnes"], plus: "des nuits un peu meilleures", moins: "des nuits un peu moins bonnes" }
};
var LEGENDE = "Petite lumière : journée douce. Moyenne : journée normale. Grande : élan. Cercle vide : pas de jauge.";
var evoPeriode = "7j";
function valeurJour(kk, k) { var c = checksDu(S.jours[kk]).map(function (x) { return x[k] || 0; }).filter(Boolean); return c.length ? moyenne(c) : 0; }
function niveauMot(dim, v) { return dim.levels[Math.min(3, Math.max(1, Math.round(v))) - 1]; }
function barres(vals, labels, titres) {
  var n = vals.length, H = 34;
  return '<div class="bars" style="grid-template-columns:repeat(' + n + ',1fr)">' + vals.map(function (v, i) {
    return '<span class="bar' + (v ? "" : " b0") + '"' + (v ? ' style="height:' + Math.round(v / 3 * H) + "px;--i:" + i + '"' : "") + ' title="' + esc(titres[i]) + '"></span>';
  }).join("") + "</div>" +
    (labels ? '<div class="bar-labels" style="grid-template-columns:repeat(' + n + ',1fr)" aria-hidden="true">' + labels.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("") + "</div>" : "");
}
function resumeVals(dim, vals, prevVals, mots) {
  var last = vals.filter(Boolean), prev = prevVals.filter(Boolean), W = DIM_MOTS[dim.k];
  if (last.length < 2) return "Pas assez de jauges pour en dire quelque chose.";
  var m = moyenne(last), txt = mots.quand + " : " + W.niv[m < 1.67 ? 0 : m < 2.34 ? 1 : 2] + ".";
  if (prev.length >= 2) {
    var dlt = m - moyenne(prev);
    txt += dlt > 0.3 ? " " + cap(W.plus) + " " + mots.avant + "." : dlt < -0.3 ? " " + cap(W.moins) + " " + mots.avant + "." : " " + mots.pareil;
  }
  return txt;
}
function resumeJour(dim, cks) {
  if (cks.length < 2) return "Une seule jauge pour l'instant : " + dim.levels[cks[0][dim.k] - 1].toLowerCase() + ".";
  var dlt = cks[cks.length - 1][dim.k] - cks[0][dim.k];
  return "Depuis ta première jauge du jour : " + (dlt > 0 ? DIM_MOTS[dim.k].plus : dlt < 0 ? DIM_MOTS[dim.k].moins : "pas de changement") + ".";
}
function celluleJour(kk) {
  var d = S.jours[kk], ty = hasGauge(d) ? typeDe(d) : null;
  return '<span class="cal-cell' + (ty ? " plein" : "") + (kk === dayKey() ? " today" : "") + '" title="' + esc(labelJour(kk) + " : " + (ty ? TYPES[ty].nom.toLowerCase() : "pas de jauge")) + '">' + (ty ? '<i class="lv lv-' + ty + '"></i>' : "") + "</span>";
}
function compteur(keys, quand) {
  var c = { veilleuse: 0, normale: 0, elan: 0, vide: 0 };
  keys.forEach(function (kk) { var d = S.jours[kk]; c[hasGauge(d) ? typeDe(d) : "vide"]++; });
  var parts = [];
  if (c.veilleuse) parts.push(c.veilleuse + (c.veilleuse > 1 ? " journées douces" : " journée douce"));
  if (c.normale) parts.push(c.normale + (c.normale > 1 ? " journées normales" : " journée normale"));
  if (c.elan) parts.push(c.elan + (c.elan > 1 ? " jours d'élan" : " jour d'élan"));
  if (!parts.length) return "<p>Pas encore de jauge sur cette période.</p>";
  return "<p>" + esc(quand + " : " + parts.join(", ") + "." + (c.vide ? " Et " + c.vide + (c.vide > 1 ? " jours" : " jour") + " sans jauge, c'est très bien aussi." : "")) + "</p>";
}
function noticeHTML() {
  /* Seulement avec le curseur « humeur et sommeil ». Un simple décompte : l'appli n'en tire aucune conclusion. */
  if (!besoin("humeur")) return "";
  var b = bilan14();
  if (!(b.n >= 8 && b.v / b.n >= 0.7 && !(S.vu.notice && daysBetween(S.vu.notice, dayKey()) < 7))) return "";
  return '<div class="notice"><p>Ces deux dernières semaines, ta jauge a souvent été basse (' + b.v + " jours sur " + b.n + "). Ma veilleuse n'en tire aucune conclusion : c'est une information utile à partager avec ton médecin" + (besoin("bebe") ? " ou ta sage-femme" : "") + ".</p>" +
    '<div class="row"><button class="btn" data-action="notice-note">L\'ajouter à « À dire au médecin »</button><button class="btn" data-action="notice-ok">OK</button></div></div>';
}
function tableJours(keys) {
  var dims = dimsActives();
  var rows = keys.slice().reverse().map(function (kk) {
    var d = S.jours[kk];
    if (!hasGauge(d)) return "<tr><td>" + esc(labelJour(kk)) + '</td><td colspan="' + dims.length + '" class="muted">pas de jauge</td></tr>';
    return "<tr><td>" + esc(labelJour(kk)) + "</td>" + dims.map(function (dm) { var v = valeurJour(kk, dm.k); return "<td>" + (v ? esc(niveauMot(dm, v)) : '<span class="muted">–</span>') + "</td>"; }).join("") + "</tr>";
  }).join("");
  return '<details class="past"><summary>Voir jour par jour</summary><div class="table-wrap"><table class="jours"><thead><tr><th>Jour</th>' + dims.map(function (dm) { return "<th>" + dm.label + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div></details>";
}
function lignesPeriode(keys, prevKeys, labels, mots) {
  return dimsActives().map(function (dim) {
    var v = keys.map(function (kk) { return valeurJour(kk, dim.k); });
    var pv = prevKeys.map(function (kk) { return valeurJour(kk, dim.k); });
    var titres = keys.map(function (kk, i) { return labelJour(kk) + " : " + (v[i] ? niveauMot(dim, v[i]) : "pas de jauge"); });
    return '<div class="dim"><span class="dim-name">' + dim.label + "</span>" + barres(v, labels, titres) + '<p class="fine">' + esc(resumeVals(dim, v, pv, mots)) + "</p></div>";
  }).join("");
}
function joursEntre(debut, fin) { var out = []; for (var i = debut; i >= fin; i--) out.push(keyMinus(i)); return out; }
function evoJour() {
  var cks = checksDu(S.jours[dayKey()]);
  if (!cks.length) return '<section class="card"><p>Pas encore de jauge aujourd\'hui.</p><a class="btn primary" href="#aujourdhui">Faire ma jauge</a></section>';
  var labels = cks.map(function (c) { return c.ts ? heure(c.ts).replace(" h ", "h") : "–"; });
  var lignes = dimsActives().map(function (dim) {
    var vals = cks.map(function (c) { return c[dim.k] || 0; });
    if (!vals.some(Boolean)) return "";
    var titres = cks.map(function (c, i) { return labels[i] + " : " + (c[dim.k] ? dim.levels[c[dim.k] - 1] : "pas noté"); });
    return '<div class="dim"><span class="dim-name">' + dim.label + "</span>" + barres(vals, labels, titres) + '<p class="fine">' + esc(resumeJour(dim, cks.filter(function (c) { return c[dim.k]; }))) + "</p></div>";
  }).join("");
  return '<section class="card"><h2>Ta journée</h2><p class="fine">' + (cks.length > 1 ? cks.length + " jauges aujourd'hui. Chaque barre, c'est une jauge, à son heure." : "Une seule jauge aujourd'hui. Refais-la quand ça change, pour voir comment ta journée bouge.") + "</p>" +
    lignes + '<button class="btn" data-action="refaire-jauge-evo">Refaire ma jauge maintenant</button></section>';
}
function evoSept() {
  var keys = joursEntre(6, 0), prev = joursEntre(13, 7);
  var labels = keys.map(function (kk) { return new Date(kk + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "narrow" }).toUpperCase(); });
  var head = labels.map(function (l) { return '<span class="cal-head" aria-hidden="true">' + esc(l) + "</span>"; }).join("");
  return '<section class="card"><h2>Sept jours</h2><div class="cal">' + head + keys.map(celluleJour).join("") + "</div>" +
    '<p class="fine">' + LEGENDE + "</p>" + compteur(keys, "Ces sept jours") + noticeHTML() + "</section>" +
    '<section class="card"><h2>Ligne par ligne</h2><p class="fine">Plus la barre est haute, plus il y avait d\'énergie, de clarté ou de relais. Chaque barre, c\'est la moyenne de la journée.</p>' +
    lignesPeriode(keys, prev, labels, { quand: "Ces sept jours", avant: "que la semaine d'avant", pareil: "Comme la semaine d'avant." }) + tableJours(keys) + "</section>";
}
function evoQuatre() {
  var k = dayKey(), t0 = new Date(k + "T12:00:00"), dow = (t0.getDay() + 6) % 7;
  var start = t0.getTime() - (dow + 21) * 86400000, cells = "";
  for (var i = 0; i < 28; i++) {
    var dt = new Date(start + i * 86400000);
    var kk = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
    cells += kk > k ? '<span class="cal-cell futur"></span>' : celluleJour(kk);
  }
  var head = ["L", "M", "M", "J", "V", "S", "D"].map(function (x) { return '<span class="cal-head" aria-hidden="true">' + x + "</span>"; }).join("");
  var keys = joursEntre(27, 0), prev = joursEntre(55, 28);
  return '<section class="card"><h2>Quatre semaines</h2><div class="cal">' + head + cells + "</div>" +
    '<p class="fine">' + LEGENDE + "</p>" + compteur(keys, "Ces quatre semaines") + noticeHTML() + "</section>" +
    '<section class="card"><h2>Ligne par ligne</h2><p class="fine">Plus la barre est haute, plus il y avait d\'énergie, de clarté ou de relais. Chaque barre, c\'est la moyenne de la journée.</p>' +
    lignesPeriode(keys, prev, null, { quand: "Ces quatre semaines", avant: "que les quatre semaines d'avant", pareil: "Comme les quatre semaines d'avant." }) +
    '<div class="axis" aria-hidden="true"><span>il y a quatre semaines</span><span>aujourd\'hui</span></div>' + tableJours(keys) + "</section>";
}
function scrEvolution(r) {
  var periodes = [["jour", "Aujourd'hui"], ["7j", "7 jours"], ["4s", "4 semaines"]];
  return subHead(r, "Mon évolution", "Rien que pour toi, quand tu en as envie.") +
    '<div class="seg" role="group" aria-label="Période">' + periodes.map(function (p) { return '<button type="button" data-action="evo" data-v="' + p[0] + '" aria-pressed="' + (evoPeriode === p[0]) + '">' + p[1] + "</button>"; }).join("") + "</div>" +
    (evoPeriode === "jour" ? evoJour() : evoPeriode === "4s" ? evoQuatre() : evoSept()) +
    '<a class="btn" href="#journal">Relire mon journal</a>';
}

/* ---------- Relais ---------- */
function pauseBebe() { return besoin("bebe") && S.vu.pauseMode === "bebe"; }
function besoinCard() {
  var who = nPresent(), sel = confiesDuJour(), N = S.profil.pause, contenu, seg = "";
  if (!sel.length) {
    contenu = '<p class="display">Une pause, maintenant</p><small>' + (who ? esc(who) : "Quelqu'un") + (pauseBebe() ? " prend " + esc(nBebeToi()) + " " : " prend le relais ") + N + " minutes, sans que tu aies à expliquer.</small>";
    if (besoin("bebe")) {
      seg = '<div class="seg" role="group" aria-label="Ta pause">' + [["moi", "Une pause pour moi"], ["bebe", "Qu'on prenne " + nBebe()]].map(function (o) {
        return '<button type="button" data-action="pause-mode" data-v="' + o[0] + '" aria-pressed="' + ((pauseBebe() ? "bebe" : "moi") === o[0]) + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
    }
  } else if (sel.length === 1) {
    contenu = '<p class="display petit">' + esc(fill(sel[0].txt)) + "</p><small>C'est ce que tu as choisi juste en dessous.</small>";
  } else {
    contenu = '<p class="display petit">Ce qui m\'aiderait</p><ul>' + sel.map(function (m) { return "<li>" + esc(fill(m.txt)) + "</li>"; }).join("") + "</ul>";
  }
  /* Les deux boutons disent à qui : « Montrer à Sam », « Envoyer à Sam ». Sans prénom, ils disent ce qu'ils font. */
  return '<section class="besoin"><span class="orb" aria-hidden="true"></span><div>' + contenu + "</div></section>" + seg +
    '<div class="stack"><button class="btn primary big" data-action="montrer-confie">' + (who ? "Montrer à " + esc(who) : "Montrer l'écran") + '</button><button class="btn big" data-action="envoyer-confie">' + (who ? "Envoyer à " + esc(who) : "Envoyer un message") + "</button></div>";
}
function scrRelais() {
  var d = today(), sel = d.confie || [], cur = presentId();
  var opts = S.proches.filter(function (p) { return p.passer; }).map(function (p) { return { id: p.id, nom: nomProche(p) }; });
  var qui = "";
  if (opts.length) {
    opts.push({ id: "autre", nom: "Quelqu'un d'autre" });
    /* Jusqu'à trois choix, un bandeau ; au-delà, des pastilles qui passent à la ligne. */
    qui = '<p class="group-label" id="qui-lab">Qui est là ?</p>' + (opts.length <= 3
      ? '<div class="seg" role="group" aria-labelledby="qui-lab">' + opts.map(function (o) { return '<button type="button" data-action="present" data-id="' + o.id + '" aria-pressed="' + (cur === o.id) + '">' + esc(o.nom) + "</button>"; }).join("") + "</div>"
      : '<div class="chips" role="group" aria-labelledby="qui-lab">' + opts.map(function (o) { return '<button type="button" class="chip" data-action="present" data-id="' + o.id + '" aria-pressed="' + (cur === o.id) + '">' + esc(o.nom) + "</button>"; }).join("") + "</div>");
  }
  var chips = menuVisible().map(function (m) { return '<button type="button" class="chip" data-action="confie" data-id="' + m.id + '" aria-pressed="' + (sel.indexOf(m.id) >= 0) + '">' + esc(fill(m.txt)) + "</button>"; }).join("");
  var proches = S.proches.map(function (p) {
    return '<a class="cell" href="#contact-' + p.id + '"><span class="avatar" aria-hidden="true">' + esc(nomProche(p).charAt(0)) + '</span><span class="ct"><span>' + esc(nomProche(p)) + "</span><small>Des messages prêts à envoyer</small></span>" + '<span class="chev">' + I.chev + "</span></a>";
  }).join("");
  return rootHead("Relais", "Demander de l'aide sans chercher les mots.") +
    qui +
    besoinCard() +
    '<section class="card" id="delegue"><div class="card-tete"><h2>Je délègue</h2><button class="link" data-action="delegue-edit">' + (editDelegue ? "Terminé" : "Modifier la liste") + "</button></div>" +
    (editDelegue
      ? '<p class="fine">Change le texte directement, retire ce qui ne te sert pas, ajoute ce dont tu as besoin.</p>' + delegueEditeur()
      : '<p class="fine">Touche ce qui t\'aiderait : ça s\'affiche dans la carte du haut, et ça reste choisi pour la journée. Ce sont des exemples, que tu peux changer avec « Modifier la liste ».</p><div class="chips">' + chips + "</div>") + "</section>" +
    '<p class="group-label">Tes relais</p><div class="group">' + proches +
    (S.proches.length ? "" : cell("reg-proches", I.deux, "Ajouter mes proches", "Leur prénom, et leur numéro si tu veux")) +
    cell("nuit", I.lune, "Quand tes proches ne sont pas dispos", "Des personnes répondent à toute heure") + "</div>" +
    '<p class="group-label">Avec tes proches</p><div class="group">' + cell("pour-eux", I.coeur, "Pour mes proches", "Ce que je vis, et comment être là") + cell("preparer", I.deux, "À préparer ensemble, une fois", "Le menu d'aide et l'écran Pause") + "</div>";
}
function scrContact(r) {
  var p = byId(S.proches, r.arg);
  if (!p) return subHead(r, "Introuvable", "Cette personne n'est plus dans tes relais.");
  var msgs = S.messages.filter(function (m) { return (m.txt || "").trim() && (m.k !== "passer" || p.passer); });
  var btns = msgs.map(function (m) { return '<a class="btn left big" href="' + waLink(p.tel, m.txt) + '">' + I.orbe + esc((m.label || "").trim() || m.txt.slice(0, 40)) + "</a>"; }).join("");
  return subHead(r, esc(nomProche(p)), "Un message prêt, qui s'ouvre dans WhatsApp.") +
    (editMessages
      ? '<div class="card-tete"><h2>Mes messages prêts</h2><button class="link" data-action="messages-edit">Terminé</button></div><p class="fine">Change les mots pour qu\'ils te ressemblent, retire ceux qui ne te servent pas, ajoute les tiens. Ils servent pour toutes tes personnes.</p>' + messagesEditeur()
      : '<div class="stack">' + (btns || '<p class="fine">Pas de message prêt pour l\'instant.</p>') + "</div>" +
        '<p class="fine">Ce sont des exemples : tu peux changer leurs mots, les retirer ou en ajouter. <button class="link" data-action="messages-edit">Modifier les messages</button></p>') +
    (p.tel ? '<p class="fine">Pour appeler : <a href="tel:+' + normTel(p.tel) + '">' + esc(p.tel) + "</a></p>" : '<p class="fine">Sans numéro, WhatsApp te laisse choisir le contact. Tu peux l\'ajouter dans les <a href="#reg-proches">réglages</a>.</p>');
}
function scrNuit(r) {
  return subHead(r, "Quand tes proches ne sont pas dispos", "Tes proches sont là, mais pas toujours disponibles, et c'est normal. Ces personnes-là répondent à toute heure, le jour comme la nuit.") +
    '<ul class="nums">' +
    '<li><a class="n" href="tel:0972394050">09 72 39 40 50</a><span class="d">SOS Amitié : quelqu\'un à qui parler, jour et nuit, gratuit et anonyme</span></li>' +
    '<li><a class="n" href="tel:3114">3114</a><span class="d">Si ça va vraiment mal, jour et nuit, gratuit</span></li>' +
    '<li><a class="n" href="tel:116117">116 117</a><span class="d">Une question médicale le soir ou le week-end : le médecin de garde. Si ce numéro ne répond pas chez toi, appelle le 15.</span></li>' +
    '<li><a class="n" href="tel:15">15</a><span class="d">Une urgence, pour toi' + (besoin("bebe") ? " ou pour " + esc(nBebeToi()) : "") + "</span></li></ul>" +
    '<p class="fine">Ces numéros sont ceux de la France.</p>' +
    verset(3);
}
/* Une page à faire lire à la personne qui aide. Elle est écrite à la première personne, et se compose selon les curseurs actifs. */
function scrPourEux(r) {
  var vis = [];
  if (besoin("tete")) {
    vis.push("Ma tête doit fournir plus d'efforts que d'autres pour s'organiser, se souvenir, démarrer une tâche ou filtrer le bruit. C'est le cas, par exemple, avec un TDAH.");
    vis.push("Quand j'oublie, que je m'agace ou que je me fige, ce n'est ni de la mauvaise volonté, ni contre toi. C'est la fatigue et le trop-plein qui débordent.");
  }
  if (besoin("bebe")) vis.push("Avec un bébé et des nuits coupées, tout pèse plus lourd : la fatigue, les oublis, les émotions.");
  if (besoin("humeur")) vis.push("Mon humeur et mon sommeil bougent en ce moment. Certains jours, le minimum me demande déjà beaucoup.");
  if (!vis.length) vis.push("Il y a des jours où tout pèse plus lourd : la fatigue, la charge, les émotions. Ces jours-là, le minimum me demande déjà beaucoup.");
  vis.push("Demander de l'aide me coûte : trouver les mots, choisir le moment, oser. Cette appli m'aide à le faire.");
  var aide = [
    "Une proposition précise plutôt que « tu veux que je fasse quoi ? ». Ce que je délègue, dans Relais, peut servir.",
    "Prendre les choses en entier : les courses, mais aussi savoir ce qui manque.",
    "Protéger mon sommeil : quelques heures d'affilée, c'est précieux.",
    "Quand je te montre l'écran Pause, prendre le relais sans poser de questions. Je reviens vite, et ça m'aide à tenir.",
    "Un rappel gentil plutôt qu'un reproche. Et me dire ce que je fais bien : je l'entends rarement en ce moment."
  ];
  if (besoin("crise")) aide.push("J'ai écrit un plan pour les moments de crise. Si je te le montre, on le suit ensemble, sans en débattre sur le moment.");
  return subHead(r, "Pour mes proches", "Une page à faire lire à la personne qui t'aide : ce que tu vis, et comment être là. À lire tranquillement, ensemble si vous voulez.") +
    '<section class="card prose"><h2>Ce que je vis</h2>' + vis.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>" +
    '<section class="card prose"><h2>Ce qui m\'aide</h2><ul class="plain">' + aide.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></section>" +
    '<section class="card prose"><h2>Et toi</h2><p>Toi aussi, tu portes beaucoup. Tu as le droit de fatiguer, et d\'en parler.' +
    (besoin("bebe") ? " Allô Parents Bébé écoute tous les parents : 0 800 00 3456, en semaine." : " SOS Amitié écoute aussi les proches, jour et nuit : 09 72 39 40 50.") + "</p></section>" +
    '<p class="fine">Si un jour tu t\'inquiètes pour moi, l\'onglet Repères dit quand appeler et qui.</p>';
}
function scrPreparer(r) {
  return subHead(r, "À préparer ensemble, une fois", "Au calme, avec la personne qui t'aide le plus. Ensuite, plus besoin de chercher les mots.") +
    '<ol class="points">' +
    '<li><b>Choisissez ce que tu peux déléguer.</b> Gardez ce qui vous parle, ajoutez ce qui manque, dans les <a href="#reg-deleguer">réglages</a>.</li>' +
    "<li><b>Mettez-vous d'accord sur l'écran Pause.</b> Lisez ensemble : « Quand je te montre l'écran Pause, tu prends le relais tout de suite, sans poser de questions. Je reviens dans " + S.profil.pause + " minutes. Si je ne reviens pas, tu viens voir comment je vais. On en parle après, seulement si j'en ai envie. »</li>" +
    '<li><b>Lisez la page ensemble :</b> <a href="#pour-eux">Pour mes proches</a>.</li></ol>';
}

/* ---------- Là, maintenant ---------- */
function boutonsProches(k, prefixe) {
  return S.proches.map(function (p) { return '<a class="btn" href="' + waLink(p.tel, msgTxt(k)) + '">' + prefixe + " " + esc(nomProche(p)) + "</a>"; }).join("");
}
/* Les cartes des moments difficiles. Trois valent pour tout le monde ; les autres dépendent des curseurs. */
function SOS() {
  var b = esc(nBebeToi()), p = nPresent(), f = foi(), cartes = [];
  if (besoin("tete")) {
    cartes.push({ id: "demarrer", icon: I.demarrer, titre: "Je n'arrive pas à démarrer", html:
      "<p>Choisis la plus petite action possible. Pas « faire la lessive » : prendre le panier. Juste ça.</p>" +
      "<p>Lance cinq minutes. Quand la lumière s'éteint, tu as le droit d'arrêter.</p>" +
      '<button class="btn primary big" data-action="minuteur" data-min="5">Juste 5 minutes</button>' +
      "<p>Quelqu'un à côté de toi, même au téléphone, ça débloque souvent.</p>" +
      "<p>Et fais-le mal. Mal fait, c'est fait.</p>" +
      (S.proches.length ? '<div class="row">' + boutonsProches("demarrer", "Demander à") + "</div>" : "") });
    cartes.push({ id: "vrac", icon: I.vrac, titre: "Tout se mélange dans ma tête", html:
      "<p>Vide tout dans ta liste, sans trier, sans chercher l'ordre.</p>" +
      "<p>Puis choisis une seule chose. Une seule.</p>" +
      "<p>Le reste n'est pas oublié : il est écrit.</p>" +
      '<button class="btn primary" data-action="go" data-h="liste">Ouvrir ma liste</button>' });
  }
  cartes.push({ id: "bout", icon: I.pleure, titre: "Je suis à bout", html:
    "<p>Pose ce que tu fais. Là, tout de suite, rien ne presse plus que toi.</p>" +
    "<p>Un coin calme, un verre d'eau, et une minute à respirer avec la lumière.</p>" +
    '<button class="btn primary big" data-action="souffle-go" data-id="soupir">Respirer avec moi, une minute</button>' +
    "<p>Puis dis-le à quelqu'un. Pas besoin d'expliquer : le message est prêt.</p>" +
    '<div class="row"><button class="btn" data-action="pause">Montrer l\'écran Pause</button>' + boutonsProches("deborde", "Écrire à") + "</div>" +
    "<p>Personne de disponible ? SOS Amitié répond jour et nuit : 09 72 39 40 50. Si ça va vraiment mal : le 3114.</p>" +
    (besoin("crise") ? '<button class="btn" data-action="go" data-h="plan">Ouvrir mon plan de crise</button>' : "") });
  cartes.push({ id: "nuit", icon: I.lune, titre: "Il est 3 h et je tourne en rond", html:
    "<p>La nuit grossit tout. Ce qui t'inquiète n'aura pas la même taille demain matin.</p>" +
    "<p>Vide ta tête dans ton journal, ou note ta question dans « À dire au médecin ». Puis pose le téléphone : ce sera encore là demain.</p>" +
    "<p>Lumière douce, un verre d'eau. Puis respire avec Ma veilleuse : tu n'as qu'à suivre la lumière.</p>" +
    '<button class="btn primary big" data-action="souffle-go" data-id="sommeil">Respirer pour me rendormir</button>' +
    (f ? "<p>Si ça t'apaise : " + f.nuit + ".</p>" + verset(2) : "") +
    "<p>Besoin de parler à quelqu'un, là, maintenant ? SOS Amitié répond jour et nuit : 09 72 39 40 50. Si ça va vraiment mal : le 3114.</p>" +
    "<p>Une question médicale le soir ou le week-end : le médecin de garde au 116 117. " + (besoin("bebe") ? "Si tu penses que " + b + " a un problème de santé sérieux, n'attends pas : appelle le 15." : "Si c'est urgent, n'attends pas : appelle le 15.") + "</p>" +
    '<div class="row"><button class="btn" data-action="go" data-h="journal">Écrire dans mon journal</button><button class="btn" data-action="go" data-h="rep-notes">Noter pour le médecin</button></div>' });
  cartes.push({ id: "rater", icon: I.nulle, titre: "J'ai l'impression de tout rater", html:
    "<p>Sépare ce qui s'est passé de ce que tu en conclus. « J'ai oublié le rendez-vous », c'est un fait. « " + (besoin("bebe") ? "Je suis un mauvais parent" : "Je rate tout") + " », c'est une conclusion, et c'est souvent la fatigue qui la tire.</p>" +
    "<p>Regarde « Le minimum » : ce qui est coché compte.</p>" +
    "<p>Si cette pensée ne te lâche pas depuis des jours, parles-en à ton médecin" + (besoin("bebe") ? " ou à ta sage-femme" : "") + ". Tu n'as pas à la porter sans aide.</p>" +
    verset(1) });
  if (besoin("bebe")) {
    cartes.push({ id: "visites", icon: I.visites, titre: "Trop de visites, trop de conseils", html:
      "<p>Tu peux dire : « Merci, on a trouvé notre façon de faire. »</p>" +
      "<p>Tu peux dire : « Pas cette semaine. On vous fait signe. »</p>" +
      "<p>" + (p ? esc(p) + " peut" : "Quelqu'un peut") + " servir de filtre : répondre aux messages et organiser les visites à ta place.</p>" +
      "<p>Et ceux qui viennent peuvent aider : un plat, une lessive, une heure avec " + b + " pendant que tu dors.</p>" });
    cartes.push({ id: "bebe", icon: I.coeur, titre: "Avec " + nBebeToi(), html:
      "<h2>Si tu es à bout</h2>" +
      "<p>Si ton bébé a mangé et que sa couche est propre : pose-le sur le dos dans son lit, sors de la pièce, et respire. Tu as le droit.</p>" +
      "<p>Mieux vaut quelques minutes de pleurs en sécurité dans son lit que de rester à bout avec ton bébé dans les bras. Même à bout, on ne secoue jamais un bébé : c'est pour ça qu'on le pose et qu'on sort.</p>" +
      '<button class="btn primary big" data-action="souffle-go" data-id="soupir">Respirer avec moi, une minute</button>' +
      '<div class="row"><button class="btn" data-action="pause">Montrer l\'écran Pause</button>' + boutonsProches("deborde", "Écrire à") + "</div>" +
      "<h2>Pour l'apaiser</h2>" +
      "<p>Garder ton bébé contre toi, bercer doucement, parler bas, changer de pièce ou sortir prendre l'air. Des bouchons d'oreilles qui atténuent le son peuvent t'aider à tenir.</p>" +
      '<button class="btn" data-action="souffle-go" data-id="bebe">Respirer avec mon bébé contre moi</button>' +
      "<h2>Une inquiétude pour sa santé</h2>" +
      "<p>En semaine, Allô Parents Bébé écoute et conseille au 0 800 00 3456. Le soir et le week-end, le médecin de garde répond au 116 117. Si tu penses que c'est sérieux, n'attends pas : appelle le 15.</p>" });
  }
  return cartes;
}
function planRempli() { return PLAN.reduce(function (n, s) { return n + S.plan[s.k].length; }, 0); }
function scrMaintenant() {
  var f = foi();
  var aide = S.aide.length
    ? '<ul class="tasks">' + S.aide.map(function (a) { return '<li class="task"><span class="tt">' + esc(a.txt) + '</span><button type="button" class="mini-btn" data-action="aide-del" data-id="' + a.id + '" aria-label="' + esc("Retirer : " + a.txt) + '">' + I.x + "</button></li>"; }).join("") + "</ul>"
    : '<p class="fine">Quand ça va, note ici ce qui t\'aide quand ça ne va pas. Ta liste passera avant la nôtre.</p>';
  var tiles = SOS().map(function (c) { return '<a class="tile" href="#sos-' + c.id + '"><span class="ic">' + c.icon + "</span><b>" + esc(c.titre) + "</b></a>"; }).join("");
  var n = planRempli();
  return rootHead("Là, maintenant", "Choisis ce qui ressemble à ce moment.") +
    (besoin("crise") ? '<div class="group">' + cell("plan", I.plan, "Mon plan de crise", n ? "Écrit par toi, pour ce genre de moment" : "À remplir quand ça va") + "</div>" : "") +
    '<section class="souffle-carte"><div class="hero-top"><span class="orb" aria-hidden="true"></span><div><p class="display">Respirer avec moi</p><p class="fine">Deux minutes, guidées. Tu n\'as qu\'à suivre la lumière.</p></div></div>' +
    '<button class="btn primary big" data-action="souffle-go" data-id="long">Commencer</button><a class="link center" href="#respirer">Les autres exercices</a></section>' +
    (besoin("tete") ? '<button class="btn big left" data-action="minuteur" data-min="5">' + I.minuteur + "Juste 5 minutes, pour démarrer</button>" : "") +
    '<section class="tiles">' + tiles + "</section>" +
    '<section class="card" id="videos"><h2>Mes vidéos</h2><p class="fine">Tes vidéos YouTube préférées, à portée de main : ' + (f ? f.video + ", " : "") + "de la musique, ce qui t'apaise ou te fait rire.</p>" + videosHTML() +
    '<form class="add-video" data-form="video"><label class="field" for="video-url">Le lien<input id="video-url" type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://youtu.be/…"></label>' +
    '<label class="field" for="video-titre">Un nom pour t\'y retrouver<input id="video-titre" type="text" autocomplete="off" placeholder="' + esc(f ? f.phVideo : "Ma playlist calme…") + '"></label>' +
    '<p class="err" id="video-err" role="alert"></p><button class="btn" type="submit">Ajouter la vidéo</button></form>' +
    '<p class="fine">Dans YouTube : touche « Partager », puis « Copier le lien », et colle-le ici.</p></section>' +
    '<section class="card"><h2>Ce qui m\'aide, moi</h2>' + aide +
    '<form class="add" data-form="aide"><label class="sr-only" for="aide-in">Ce qui m\'aide</label><input id="aide-in" type="text" placeholder="' + esc(f ? f.phAide : "Une douche chaude, ma playlist…") + '" autocomplete="off"><button class="btn" type="submit">Ajouter</button></form></section>';
}

/* ---------- Mon plan de crise (curseur) ----------
   Des rubriques que la personne remplit elle-même, quand ça va. L'appli ne détecte rien et ne conclut rien. */
function appelsUrgence() {
  return '<div class="calls"><a class="call" href="tel:15"><b>15</b><span>Urgence<br>médicale</span></a><a class="call" href="tel:3114"><b>3114</b><span>Idées noires, jour et nuit</span></a><a class="call" href="tel:112"><b>112</b><span>Depuis tout téléphone</span></a></div>';
}
function planSection(sec, extra) {
  var items = S.plan[sec.k];
  return '<section class="card"><h2>' + sec.titre + '</h2><p class="fine">' + sec.d + "</p>" +
    (items.length ? '<ul class="tasks">' + items.map(function (a) { return '<li class="task"><span class="tt">' + esc(a.txt) + '</span><button type="button" class="mini-btn" data-action="plan-del" data-k="' + sec.k + '" data-id="' + a.id + '" aria-label="' + esc("Retirer : " + a.txt) + '">' + I.x + "</button></li>"; }).join("") + "</ul>" : "") +
    (extra || "") +
    '<form class="add" data-form="plan" data-k="' + sec.k + '"><label class="sr-only" for="plan-' + sec.k + '">' + sec.titre + '</label><input id="plan-' + sec.k + '" type="text" placeholder="' + esc(sec.ph) + '" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form></section>';
}
function scrPlan(r) {
  var P = {}; PLAN.forEach(function (s) { P[s.k] = s; });
  var proches = S.proches.length
    ? '<div class="stack">' + S.proches.map(function (p) {
        return '<a class="btn left" href="' + waLink(p.tel, msgTxt("deborde")) + '">' + I.orbe + "Écrire à " + esc(nomProche(p)) + "</a>" +
          (p.tel ? '<p class="fine">Ou l\'appeler : <a href="tel:+' + normTel(p.tel) + '">' + esc(p.tel) + "</a></p>" : "");
      }).join("") + "</div>"
    : '<p class="fine">Ajoute tes proches dans les <a href="#reg-proches">réglages</a> : ils apparaîtront ici.</p>';
  return subHead(r, "Mon plan de crise", "Écrit quand ça va, pour les moments où ça ne va pas. Le mieux : le remplir avec un soignant ou un proche.") +
    '<section class="urgence"><h2>En danger, maintenant ?</h2>' + appelsUrgence() + '<p class="fine">Le 3114 répond jour et nuit, gratuitement. Tes proches peuvent l\'appeler aussi.</p></section>' +
    planSection(P.signaux) +
    planSection(P.seul, '<button class="btn" data-action="souffle-go" data-id="long">Respirer avec moi, deux minutes</button>') +
    planSection(P.lieux) +
    '<section class="card"><h2>À qui demander de l\'aide</h2><p class="fine">Un message prêt s\'ouvre dans WhatsApp. Pas besoin d\'expliquer.</p>' + proches + "</section>" +
    planSection(P.soignants) +
    planSection(P.raisons) +
    '<button class="btn" data-action="plan-copy">Copier mon plan</button>' +
    '<p class="fine">Tu peux le copier pour le montrer à ton médecin ou à un proche. Ma veilleuse ne remplace pas un soignant : elle garde ton plan sous la main, c\'est tout.</p>';
}
function planText() {
  var out = ["Mon plan de crise (" + labelCourt(dayKey()) + ")"];
  PLAN.forEach(function (s) { out.push("", s.titre + " :"); S.plan[s.k].forEach(function (a) { out.push("- " + a.txt); }); });
  out.push("", "À qui demander de l'aide :"); S.proches.forEach(function (p) { out.push("- " + nomProche(p) + (p.tel ? " : " + p.tel : "")); });
  out.push("", "Si ça ne suffit pas : le 3114 (jour et nuit), le 15, le 112.");
  return out.join("\n");
}

/* ---------- Mes pense-bêtes (curseur « Me souvenir ») ---------- */
function scrMemo(r) {
  function liste(k) {
    var items = S[k];
    return items.length ? '<ul class="tasks">' + items.map(function (a) {
      return '<li class="task"><span class="tt">' + (a.date ? '<span class="nd">' + esc(labelCourt(a.date)) + "</span>" : "") + esc(a.txt) + '</span><button type="button" class="mini-btn" data-action="memo-del" data-k="' + k + '" data-id="' + a.id + '" aria-label="' + esc("Retirer : " + a.txt) + '">' + I.x + "</button></li>";
    }).join("") + "</ul>" : "";
  }
  function ajout(kind, ph, label) {
    return '<form class="add" data-form="' + kind + '"><label class="sr-only" for="' + kind + '-in">' + label + '</label><input id="' + kind + '-in" type="text" placeholder="' + esc(ph) + '" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form>';
  }
  return subHead(r, "Mes pense-bêtes", "Ce que ta tête n'a pas à porter. Écris-le une fois, retrouve-le ici.") +
    '<section class="card"><h2>Où sont mes affaires</h2><p class="fine">Une chose, un endroit. Toujours le même, si possible.</p>' + liste("affaires") + ajout("affaire", "Clés : le crochet de l'entrée", "Une chose et son endroit") + "</section>" +
    '<section class="card"><h2>À retenir</h2><p class="fine">Une info qu\'on t\'a donnée, une idée, une chose à dire à quelqu\'un. La date s\'ajoute toute seule.</p>' + liste("retenir") + ajout("retenir", "Le plombier passe jeudi matin", "Une chose à retenir") + "</section>" +
    '<p class="fine warn">N\'écris ici ni mot de passe, ni code de carte : ce navigateur n\'est pas un coffre.</p>';
}
/* ---------- Mes vidéos ---------- */
function titreVideo(v) { return (v.titre || "").trim() || "Ma vidéo"; }
function ytId(url) { var m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/))([\w-]{11})/); return m ? m[1] : ""; }
function hoteLien(url) { try { return new URL(url).hostname.replace(/^(www|m)\./, ""); } catch (e) { return ""; } }
function normUrl(s) {
  s = String(s || "").trim(); if (!s) return "";
  /* Un lien partagé peut arriver avec du texte autour : on garde le premier lien. */
  var m = s.match(/https?:\/\/\S+/i);
  if (m) s = m[0]; else if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) s = "https://" + s; else return "";
  try { var x = new URL(s); return /^https?:$/.test(x.protocol) && x.hostname.indexOf(".") > 0 ? x.href : ""; } catch (e) { return ""; }
}
function videosHTML() {
  if (!S.videos.length) return '<p class="fine">Pas encore de vidéo. Ajoute celles qui te font du bien : tu les retrouveras ici, et dans les idées « Pour moi ».</p>';
  return '<ul class="videos">' + S.videos.map(function (v) {
    var id = ytId(v.url);
    return '<li class="video"><a href="' + esc(v.url) + '"><span class="vth">' + (id ? '<img class="vimg" src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer">' : "") + '<span class="play">' + I.play + "</span></span>" +
      '<span class="vt"><span>' + esc(titreVideo(v)) + "</span><small>" + esc(id ? "YouTube" : hoteLien(v.url) || "Lien") + "</small></span></a>" +
      '<button type="button" class="mini-btn" data-action="video-del" data-id="' + v.id + '" aria-label="' + esc("Retirer : " + titreVideo(v)) + '">' + I.x + "</button></li>";
  }).join("") + "</ul>";
}
function ajouterVideo() {
  var u = $("#video-url"), t = $("#video-titre"), er = $("#video-err"), url = normUrl(u && u.value);
  if (!url) { if (er) er.textContent = "Ce lien ne semble pas complet. Dans YouTube : « Partager », puis « Copier le lien »."; return; }
  S.videos.push({ id: uid(), titre: ((t && t.value) || "").trim(), url: url });
  save(); render(); toast("Vidéo ajoutée");
  var c = $("#videos"); if (c) c.scrollIntoView({ block: "start" });
}

/* ---------- Respirer, guidée ---------- */
function scrRespirer(r) {
  var dern = S.vu.dernierSouffle, quand = dern && dayKey(new Date(dern)) === dayKey() ? '<p class="fine">Dernière fois aujourd\'hui, à ' + heure(dern) + ".</p>" : "";
  return subHead(r, "Respirer", "Choisis selon le moment. La lumière grandit quand tu inspires, et se retire quand tu souffles. Il n'y a rien à réussir.") +
    '<div class="exos">' + soufflesActifs().map(function (x, i) {
      return '<section class="exo"><div class="exo-tete"><h2>' + esc(fill(x.nom)) + '</h2><span class="duree-tag">' + Math.max(1, Math.round(x.duree / 60)) + " min</span></div>" +
        '<p class="fine">' + esc(x.pour) + "</p>" +
        '<p><span class="exo-lab">À quoi ça sert</span>' + esc(x.sert) + "</p>" +
        '<p class="fine"><span class="exo-lab">Comment</span>' + esc(fill(x.conseil)) + "</p>" +
        '<button class="btn' + (i === 0 ? " primary" : "") + '" data-action="souffle-go" data-id="' + x.id + '">Commencer</button></section>';
    }).join("") + "</div>" +
    sw("son", "", !!S.profil.son, "Un son doux à chaque changement", "Pour pouvoir fermer les yeux", "", true) +
    quand + '<p class="fine">Si la tête te tourne, arrête et reprends ta respiration normale.</p>';
}
var SF = null, AC = null, wake = null;
var MOTS_SOUFFLE = { "in": "Inspire", "in2": "Encore un peu", "hold": "Garde l'air", "out": "Souffle", "vide": "Pause" };
function bip(f) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    var t = AC.currentTime;
    [[f, 0.14, 1.8], [f * 2, 0.03, 0.9]].forEach(function (p) {
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(p[0], t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p[1], t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + p[2] + 0.1);
    });
  } catch (e) {}
}
function reveilSon() { if (S.profil.son) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {} } }
/* La lumière de la respiration : trois halos, un anneau, la sphère.
   L'anneau est la mesure : il se remplit quand on inspire, se vide quand on souffle. */
function lumiereHTML(prefixe) {
  return '<div class="sf-zone" aria-hidden="true"><i class="sf-halo h3 essentiel"></i><i class="sf-halo h2 essentiel"></i><i class="sf-halo h1 essentiel"></i>' +
    '<svg class="sf-ring" viewBox="0 0 120 120"><circle class="sf-ring-bg" cx="60" cy="60" r="58"/><circle class="sf-ring-fg essentiel" id="' + prefixe + '-arc" cx="60" cy="60" r="58" pathLength="100"/></svg>' +
    '<div class="sf-orbe essentiel" id="' + prefixe + '-cercle"><i class="sf-eclat essentiel"></i></div></div>';
}
/* Ouvre ou referme la lumière. plein : de 0 (poumons vides) à 1 (poumons pleins). duree : en secondes.
   Les halos partent un peu après la sphère, l'un après l'autre : la lumière se propage. */
function poseLumiere(zone, plein, duree, lineaire) {
  if (!zone) return;
  var ease = duree + "s " + (lineaire ? "linear" : "cubic-bezier(.42,0,.58,1)");
  var orbe = zone.querySelector(".sf-orbe"), eclat = zone.querySelector(".sf-eclat");
  if (orbe) { orbe.style.transition = "transform " + ease; orbe.style.transform = "scale(" + (0.5 + 0.5 * plein).toFixed(3) + ")"; }
  if (eclat) { eclat.style.transition = "opacity " + ease; eclat.style.opacity = (0.1 + 0.8 * plein).toFixed(2); }
  [[".h1", 1.2, 0], [".h2", 1.5, 0.09], [".h3", 1.84, 0.18]].forEach(function (h) {
    var el = zone.querySelector(h[0]); if (!el) return;
    var retard = duree > 1 ? " " + h[2] + "s" : "";
    el.style.transition = "transform " + ease + retard + ", opacity " + ease + retard;
    el.style.transform = "scale(" + (0.55 + (h[1] - 0.55) * plein).toFixed(3) + ")";
    el.style.opacity = (0.3 + 0.7 * plein).toFixed(2);
  });
}
function poseAnneau(arc, plein, duree) {
  if (!arc) return;
  arc.style.transition = "stroke-dashoffset " + duree + "s linear";
  arc.style.strokeDashoffset = String(100 - 100 * plein);
}
function startSouffle(id) {
  var ex = byId(SOUFFLES, id) || SOUFFLES[0];
  arreterSouffle(); arreterMinuteur(); closeSheet();
  reveilSon();
  var cycle = ex.phases.reduce(function (s, p) { return s + p[1]; }, 0) * 1000;
  SF = { ex: ex, debut: Date.now() + 3000, cycle: cycle, n: Math.max(1, Math.round(ex.duree * 1000 / cycle)), cle: "" };
  openShow('<div class="sf"><div class="sf-top"><p class="sf-nom">' + esc(fill(ex.nom)) + '</p><p class="sf-reste" id="sf-reste"></p></div>' +
    lumiereHTML("sf") +
    '<p class="sf-mot" id="sf-mot" aria-live="polite">Installe-toi</p><p class="sf-compte" id="sf-compte" aria-hidden="true"></p>' +
    '<p class="sf-conseil" id="sf-conseil">' + esc(fill(ex.conseil)) + "</p></div>",
    '<button class="btn big" data-action="souffle-stop">Arrêter</button><button class="link center" data-action="son-live">' + (S.profil.son ? "Couper le son" : "Avec un son doux") + "</button>");
  tickSouffle();
  SF.timer = setInterval(tickSouffle, 100);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (w) { wake = w; }, function () {}); } catch (e) {}
}
function tickSouffle() {
  if (!SF) return;
  var now = Date.now(), mot = $("#sf-mot"), compte = $("#sf-compte"), reste = $("#sf-reste"), c = $("#sf-cercle");
  if (!mot || !c) { arreterSouffle(); return; }
  if (now < SF.debut) { compte.textContent = String(Math.ceil((SF.debut - now) / 1000)); reste.textContent = "On commence dans un instant"; return; }
  var el = now - SF.debut, k = Math.floor(el / SF.cycle);
  if (k >= SF.n) { finSouffle(); return; }
  var ph = SF.ex.phases, dans = el - k * SF.cycle, acc = 0, i = 0;
  for (; i < ph.length - 1; i++) { if (dans < acc + ph[i][1] * 1000) break; acc += ph[i][1] * 1000; }
  var cle = k + ":" + i;
  if (cle !== SF.cle) {
    SF.cle = cle;
    var type = ph[i][0], zone = c.parentNode, aIn2 = ph.some(function (x) { return x[0] === "in2"; });
    mot.textContent = T(MOTS_SOUFFLE[type]);
    mot.classList.remove("change"); void mot.offsetWidth; mot.classList.add("change");
    /* Garder l'air ou faire une pause : la lumière reste où elle est, l'anneau veille. */
    var tenu = type === "hold" || type === "vide";
    zone.classList.toggle("tient", tenu);
    if (!tenu) {
      var plein = type === "out" ? 0 : (type === "in" && aIn2 ? 0.8 : 1);
      poseLumiere(zone, plein, ph[i][1]);
      poseAnneau($("#sf-arc"), plein, ph[i][1]);
    }
    if (S.profil.son) bip({ "in": 440, "in2": 495, "hold": 392, "out": 330, "vide": 294 }[type]);
  }
  compte.textContent = String(Math.ceil((acc + ph[i][1] * 1000 - dans) / 1000));
  var r = Math.ceil((SF.n * SF.cycle - el) / 1000);
  reste.textContent = T(r >= 60 ? "Encore " + Math.floor(r / 60) + " min " + pad(r % 60) : "Encore " + r + " s");
}
function finSouffle() {
  var ex = SF.ex;
  arreterSouffle();
  S.vu.dernierSouffle = Date.now(); save();
  var c = $("#sf-cercle"), zone = c && c.parentNode;
  if (zone) { zone.classList.remove("tient"); poseLumiere(zone, 0.42, 3); poseAnneau($("#sf-arc"), 1, 1.4); }
  var mot = $("#sf-mot"), compte = $("#sf-compte"), reste = $("#sf-reste"), cons = $("#sf-conseil");
  if (mot) { mot.textContent = T("C'est fini"); mot.classList.remove("change"); void mot.offsetWidth; mot.classList.add("change"); }
  if (compte) compte.textContent = "";
  if (reste) reste.textContent = T("Terminé à " + heure(Date.now()));
  if (cons) cons.textContent = "Reste encore un instant comme ça, avant de reprendre.";
  $("#show-actions").innerHTML = '<button class="btn primary big" data-action="close-show">Fermer</button><button class="link center" data-action="souffle-go" data-id="' + ex.id + '">Encore une fois</button>';
}
function arreterSouffle() {
  if (SF && SF.timer) clearInterval(SF.timer);
  SF = null;
  try { if (wake) wake.release(); } catch (e) {}
  wake = null;
}

/* ---------- Juste 5 minutes (curseur « Ma tête déborde ») ----------
   Un minuteur court pour démarrer. La même lumière, pleine au départ, qui se retire lentement. */
var MT = null;
function startMinuteur(min) {
  min = min || 5;
  arreterSouffle(); arreterMinuteur(); closeSheet();
  reveilSon();
  MT = { fin: Date.now() + min * 60000, min: min };
  openShow('<div class="sf"><div class="sf-top"><p class="sf-nom">Juste ' + min + ' minutes</p><p class="sf-reste">Une seule chose, la plus petite possible.</p></div>' +
    lumiereHTML("mt") +
    '<p class="sf-mot" id="mt-mot">' + min + ":00</p>" +
    '<p class="sf-conseil" id="mt-conseil">Quand l\'anneau s\'est vidé, tu as le droit d\'arrêter. Mal fait, c\'est fait.</p></div>',
    '<button class="btn big" data-action="close-show">Arrêter</button>');
  var c = $("#mt-cercle"), zone = c && c.parentNode, arc = $("#mt-arc");
  if (zone) {
    poseLumiere(zone, 1, 0); poseAnneau(arc, 1, 0);
    void zone.offsetWidth;
    poseLumiere(zone, 0, min * 60, true); poseAnneau(arc, 0, min * 60);
  }
  tickMinuteur();
  if (MT) MT.timer = setInterval(tickMinuteur, 250);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (w) { wake = w; }, function () {}); } catch (e) {}
}
function tickMinuteur() {
  if (!MT) return;
  var mot = $("#mt-mot");
  if (!mot) { arreterMinuteur(); return; }
  var r = Math.max(0, MT.fin - Date.now()), s = Math.ceil(r / 1000);
  mot.textContent = Math.floor(s / 60) + ":" + pad(s % 60);
  if (r <= 0) finMinuteur();
}
function finMinuteur() {
  var min = MT.min;
  arreterMinuteur();
  if (S.profil.son) bip(440);
  var mot = $("#mt-mot"), cons = $("#mt-conseil");
  if (mot) { mot.textContent = T("C'est fait"); mot.classList.remove("change"); void mot.offsetWidth; mot.classList.add("change"); }
  if (cons) cons.textContent = T("Tu peux t'arrêter là, ou repartir pour " + min + " minutes.");
  $("#show-actions").innerHTML = '<button class="btn primary big" data-action="close-show">J\'arrête là</button><button class="link center" data-action="minuteur" data-min="' + min + '">Encore ' + min + " minutes</button>";
  typo($("#show-actions"));
}
function arreterMinuteur() {
  if (MT && MT.timer) clearInterval(MT.timer);
  MT = null;
  try { if (wake) wake.release(); } catch (e) {}
  wake = null;
}

function scrSOS(r) {
  var c = SOS().filter(function (x) { return x.id === r.arg; })[0];
  if (!c) return subHead(r, "Introuvable", "");
  return subHead(r, esc(c.titre), "") + '<section class="prose">' + c.html + "</section>";
}

/* ---------- Repères ----------
   Les numéros et les urgences restent visibles quels que soient les curseurs. Le reste se compose selon les besoins. */
function REP() {
  var b = esc(nBebeToi()), bebe = besoin("bebe");
  var notes = S.notes.length
    ? '<ul class="tasks">' + S.notes.map(function (n) { return '<li class="task"><span class="tt"><span class="nd">' + esc(labelCourt(n.date)) + (n.ts ? ", " + heure(n.ts) : "") + "</span>" + esc(n.txt) + '</span><button type="button" class="mini-btn" data-action="note-del" data-id="' + n.id + '" aria-label="' + esc("Retirer : " + n.txt) + '">' + I.x + "</button></li>"; }).join("") + "</ul>" +
      '<button class="btn" data-action="notes-copy">Copier la liste</button>' : "";
  return {
    urgence: { titre: "Quand appeler tout de suite", icon: I.telephone, sous: "Le 15, le 112, le 3114", html:
      '<section class="urgence"><h2>Appelle le 15</h2><ul class="plain">' +
      "<li>Si tu as peur de te faire du mal" + (bebe ? ", ou de faire du mal à " + b : "") + ".</li>" +
      "<li>Si tu vois ou entends des choses que les autres ne voient pas, si tes idées deviennent étranges ou s'emballent, ou si tu ne dors plus du tout, même quand tu pourrais. C'est rare, et plus c'est vu tôt, mieux c'est pris en charge.</li>" +
      '</ul><p class="fine">Le 112 marche aussi, depuis n\'importe quel téléphone.</p></section>' +
      '<section class="card prose"><h2>Le 3114, jour et nuit</h2><p>Si des idées noires prennent de la place, tu peux parler à quelqu\'un de formé, gratuitement, à toute heure. Tes proches peuvent appeler aussi s\'ils s\'inquiètent pour toi.</p></section>' },
    notes: { titre: "À dire au médecin", icon: I.notes, sous: S.notes.length ? S.notes.length + (S.notes.length > 1 ? " notes" : " note") : "Note au fil des jours", badge: S.notes.length, html:
      '<p class="fine">Note au fil des jours : la date et l\'heure s\'ajoutent toutes seules. Au rendez-vous, montre la liste.</p>' +
      '<form class="add" data-form="note"><label class="sr-only" for="note-in">Une note pour le médecin</label><input id="note-in" type="text" placeholder="Vertiges le matin depuis 3 jours…" autocomplete="off"><button class="btn" type="submit">Ajouter</button></form>' + notes },
    traitement: { titre: "Ton traitement", icon: I.traitement, sous: "S'il te pose souci", html:
      '<ul class="plain">' +
      "<li>S'il te pose souci, ne l'arrête pas d'un coup, et ne change pas la dose de toi-même : parles-en d'abord à ton médecin. Un arrêt brutal peut provoquer des symptômes d'arrêt, et faire revenir ce que le traitement soignait.</li>" +
      "<li>Un traitement qui gêne, ça s'ajuste : la dose, l'heure de prise, ou le médicament. C'est le rôle de ton médecin.</li>" +
      "<li>Une question sur un effet ? Ton pharmacien peut aussi te répondre.</li>" +
      (besoin("tete") ? "<li>Si tu as un TDAH, parles-en aussi. Irritabilité, culpabilité, impression de ne pas être à la hauteur : certains signes se ressemblent, et ton médecin a besoin du tableau complet.</li>" : "") + "</ul>" +
      '<button class="btn" data-action="go" data-h="rep-notes">Noter ce qui me gêne</button>' },
    semaine: { titre: "En parler dans la semaine", icon: I.semaine, sous: "Les signes à ne pas garder pour toi", html:
      '<p class="fine">À ton médecin, ton psychiatre' + (bebe ? " ou ta sage-femme" : "") + '.</p><ul class="plain">' +
      "<li>De la tristesse, du vide, de l'anxiété ou une tension presque tous les jours, depuis plus de deux semaines.</li>" +
      "<li>Tu n'arrives plus à dormir, même quand " + (bebe ? b + " dort" : "tu en as l'occasion") + ".</li>" +
      "<li>Plus rien ne te fait envie, ou la culpabilité ne te lâche plus.</li>" +
      "<li>Des pensées qui te font peur reviennent souvent.</li>" +
      (besoin("traitement") ? "<li>Ton traitement te gêne.</li>" : "") + "</ul>" +
      "<p>Ce sont des informations utiles pour un soignant. Le plus tôt est le mieux.</p>" +
      '<p class="fine">Parler à un psychologue : avec « Mon soutien psy », jusqu\'à 12 séances par an chez un psychologue partenaire sont remboursées par l\'Assurance maladie et ta complémentaire. Les conditions et l\'annuaire sont sur <a href="https://www.ameli.fr/">ameli.fr</a>.</p>' },
    pensees: { titre: "Les pensées qui font peur", icon: I.pensees, sous: "Très fréquentes chez les jeunes parents", html:
      "<p>Beaucoup de jeunes parents ont des pensées effrayantes qui surgissent sans prévenir : faire tomber leur bébé, qu'il lui arrive quelque chose. Elles font peur justement parce qu'elles ne te ressemblent pas. Elles ne veulent pas dire que tu vas le faire.</p>" +
      "<p>Si elles reviennent souvent ou t'épuisent, parles-en à un soignant : tu n'as pas à rester avec.</p>" +
      '<p class="fine">Si tu as peur de passer à l\'acte, c\'est différent : appelle le 15.</p>' },
    suivi: { titre: "Le suivi après la naissance", icon: I.suivi, sous: "Entretien postnatal, PMI", html:
      '<ul class="plain">' +
      "<li>Si tu as accouché : <b>l'entretien postnatal précoce</b>, entre la 4e et la 8e semaine après la naissance, avec une sage-femme ou un médecin. Un moment pour parler de comment tu vas, toi. Il fait partie du suivi prévu après chaque naissance.</li>" +
      "<li>Un <b>deuxième entretien</b> peut être proposé entre la 10e et la 14e semaine. Tu peux le demander.</li>" +
      "<li><b>La PMI</b> de ton secteur, pour les deux parents : des puéricultrices, des consultations gratuites, et des visites à domicile possibles.</li></ul>" },
    numeros: { titre: "Tous les numéros", icon: I.telephone, sous: "Urgences, écoute, médecin et pharmacie de garde", html:
      '<ul class="nums">' +
      '<li><a class="n" href="tel:15">15</a><span class="d">Urgence médicale, le SAMU</span></li>' +
      '<li><a class="n" href="tel:112">112</a><span class="d">Urgences, depuis n\'importe quel téléphone</span></li>' +
      '<li><a class="n" href="tel:3114">3114</a><span class="d">Prévention du suicide. Jour et nuit, gratuit, pour toi ou pour un proche inquiet</span></li>' +
      '<li><a class="n" href="tel:0972394050">09 72 39 40 50</a><span class="d">SOS Amitié. Pour parler à quelqu\'un, jour et nuit, gratuit et anonyme</span></li>' +
      '<li><a class="n" href="tel:116117">116 117</a><span class="d">Médecin de garde : le soir, le week-end et les jours fériés. Gratuit. Ce numéro n\'est pas en service partout : s\'il ne répond pas chez toi, appelle le 15.</span></li>' +
      '<li><a class="n small" href="https://www.3237.fr/">3237.fr</a><span class="d">Pharmacie de garde. Le site est gratuit, le numéro 32 37 est payant.</span></li>' +
      (bebe ? '<li><a class="n" href="tel:0800003456">0 800 00 3456</a><span class="d">Allô Parents Bébé. Écoute des parents, de la grossesse aux 3 ans de l\'enfant : du lundi au vendredi, en journée, gratuit</span></li>' +
        '<li><a class="n small" href="https://www.maman-blues.fr/">maman-blues.fr</a><span class="d">Une association de mamans passées par là : un forum, et des relais près de chez toi</span></li>' : "") + "</ul>" +
      '<p class="fine">Ces numéros sont ceux de la France.</p>' },
    tdah: { titre: "Quand la tête déborde", icon: I.info, sous: "Ce que tu vis a une explication", html:
      "<p>Avec un TDAH, le cerveau doit fournir plus d'efforts pour s'organiser, se souvenir, démarrer une tâche ou filtrer le bruit. La fatigue et le stress amplifient tout : les oublis, les débordements, les émotions.</p>" +
      (bebe ? "<p>Après une naissance, le manque de sommeil et la chute des hormones peuvent rendre tout cela encore plus fort.</p>" : "") +
      "<p>Ce n'est ni de la paresse, ni un manque de volonté. Ce que tu vis a une explication, et ça se prend en compte dans tes soins.</p>" +
      '<p class="fine">Tu te reconnais sans avoir de diagnostic ? Parles-en à ton médecin. Ma veilleuse ne pose aucun diagnostic.</p>' }
  };
}
function scrReperes() {
  var R = REP(), ordre = ["notes"];
  if (besoin("traitement")) ordre.push("traitement");
  ordre.push("semaine");
  if (besoin("bebe")) ordre.push("pensees", "suivi");
  ordre.push("numeros");
  if (besoin("tete")) ordre.push("tdah");
  return rootHead("Repères", "Quand en parler, et à qui.") +
    '<section class="urgence"><h2>Une urgence ?</h2>' + appelsUrgence() +
    '<a class="link" href="#rep-urgence">Quand appeler tout de suite</a></section>' +
    '<div class="group">' + (besoin("crise") ? cell("plan", I.plan, "Mon plan de crise", planRempli() ? "Écrit par toi, pour les moments difficiles" : "À remplir quand ça va") : "") +
    ordre.map(function (k) { var x = R[k]; return cell("rep-" + k, x.icon, x.titre, x.sous, x.badge ? '<span class="badge">' + x.badge + "</span>" : ""); }).join("") + "</div>" +
    '<p class="fine">Ma veilleuse ne remplace pas un soignant. Elle t\'aide à t\'organiser et à savoir qui appeler.</p>';
}
function scrRep(r) {
  var x = REP()[r.arg];
  if (!x) return subHead(r, "Introuvable", "");
  return subHead(r, esc(x.titre), "") + '<section class="prose">' + x.html + "</section>";
}

/* ---------- Le guide ---------- */
function scrGuide(r) {
  function e(icon, titre, txt, lien, label) {
    return '<div class="etape"><span class="ic">' + icon + '</span><div class="ct"><b>' + titre + "</b><p>" + txt + "</p>" + (lien ? '<button class="link" data-action="go" data-h="' + lien + '" style="align-self:flex-start">' + label + "</button>" : "") + "</div></div>";
  }
  return subHead(r, "Le guide", "Où trouver quoi, en une minute.") +
    '<div class="guide">' +
    '<section class="card"><h2>Mets Ma veilleuse sur ton écran d\'accueil</h2><p class="fine">Elle s\'ouvrira d\'un toucher, comme une appli. À faire une seule fois, dès le début.</p>' +
    '<p><span class="exo-lab">Sur iPhone</span>Ouvre le lien dans Safari, touche le bouton Partager (le carré avec une flèche), puis « Sur l\'écran d\'accueil ». Tu peux l\'appeler « Ma veilleuse ».</p>' +
    '<p><span class="exo-lab">Sur Android</span>Ouvre le lien dans Chrome, touche le menu (les trois points en haut), puis « Ajouter à l\'écran d\'accueil ».</p>' +
    '<p class="fine warn">Ensuite, ouvre toujours Ma veilleuse depuis cette icône : c\'est là que tes notes t\'attendent.</p></section>' +
    e(I.jauge, "Ta jauge du jour", "En haut de l'accueil : énergie, tête, relais. Dix secondes. Tu peux la refaire quand ça change, l'heure est notée.", "aujourdhui", "Aller à l'accueil") +
    e('<span class="dot" aria-hidden="true"></span>', "La lumière, en bas au centre", "Elle respire doucement, sur tous les écrans. Touche-la dès que tu as besoin d'aide : une pause, respirer, un coup de main, tes proches, les numéros d'urgence.", null) +
    e(I.projets, "Un moment de libre ?", "Sur l'accueil : touche 10 minutes, 30 minutes ou 1 h. Choisis Avancer, M'organiser ou Pour moi, et une idée s'affiche.", null) +
    e(I.liste, "Tes tuiles", "Le minimum, Ma liste, Mes projets, Je délègue, Mon journal, Mon évolution. Chaque tuile ouvre son écran ; la flèche en haut à gauche te ramène.", null) +
    e(I.delegue, "Relais", "Dis qui est là et ce que tu délègues. « Montrer » affiche un grand écran à lui tendre, « Envoyer » prépare le message WhatsApp.", "relais", "Ouvrir Relais") +
    e(I.respirer, "Là, maintenant", "Respirer avec une lumière qui te guide, des cartes pour les moments difficiles, tes vidéos préférées, et ta liste de ce qui t'aide, toi.", "maintenant", "Ouvrir Là, maintenant") +
    e(I.info, "Repères", "Quand en parler, à qui, tous les numéros, et ta liste « À dire au médecin ».", "reperes", "Ouvrir Repères") +
    e(I.reglages, "Ce dont tu as besoin", "Dans les réglages : des curseurs à allumer ou à éteindre. Chacun ajoute ou retire des contenus, et deux raccourcis en allument plusieurs d'un coup. Éteindre un curseur n'efface rien.", "reg-besoins", "Voir les curseurs") +
    e(I.jourNuit, "Jour et nuit", "Ma veilleuse passe en mode nuit au coucher du soleil, et en mode jour au lever. Le petit soleil (ou la petite lune) en haut de l'accueil change de mode quand tu veux.", null) +
    "</div>" +
    '<p class="fine">Tout ce que tu notes reste dans ton téléphone. Personne d\'autre ne le voit.</p>';
}

/* ---------- Réglages : un sommaire, puis un écran par sujet ---------- */
function resumeBesoins() {
  var on = BESOINS.filter(function (b) { return besoin(b.k); }).map(function (b) { return b.nom; });
  return on.length ? on.join(", ") : "Rien d'allumé pour l'instant";
}
function scrReglages(r) {
  var s = soleil(new Date()), nom = (S.profil.prenom || "").trim(), noms = S.proches.map(nomProche), nMenu = menuVisible().length;
  var themes = [["auto", "Automatique"], ["jour", "Jour"], ["nuit", "Nuit"]];
  return subHead(r, "Réglages", "") +
    '<div class="group">' + cell("reg-besoins", I.reglages, "Ce dont j'ai besoin", esc(resumeBesoins())) + "</div>" +
    '<div class="group">' +
    cell("reg-moi", I.moi, "Mon prénom, ma ville", esc((nom ? nom + ", " : "") + lieu().nom)) +
    cell("reg-proches", I.deux, "Mes proches", noms.length ? esc(noms.join(", ")) : "Personne pour l'instant") +
    cell("reg-deleguer", I.delegue, "Ce que je peux déléguer", nMenu + (nMenu > 1 ? " choses proposées dans Relais" : " chose proposée dans Relais")) +
    cell("reg-messages", I.message, "Mes messages prêts", S.messages.length + (S.messages.length > 1 ? " messages pour WhatsApp" : " message pour WhatsApp")) + "</div>" +
    '<section class="card"><h2>Jour et nuit</h2><div class="seg" role="group" aria-label="Jour et nuit">' + themes.map(function (t) { return '<button type="button" data-action="theme" data-v="' + t[0] + '" aria-pressed="' + ((S.profil.theme || "auto") === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>" +
    '<p class="fine">Automatique : le jour au lever du soleil, la nuit au coucher, à ' + esc(lieu().nom) + (s.lever && s.coucher ? " (aujourd'hui " + heure(s.lever) + " et " + heure(s.coucher) + ")" : "") + ". Le petit soleil ou la petite lune, en haut de l'accueil, change de mode pour le moment.</p>" +
    (S.vu.themeTemp && (S.profil.theme || "auto") === "auto" ? '<p class="fine warn">Pour l\'instant : mode ' + (S.vu.themeTemp.mode === "nuit" ? "nuit, choisi avec la petite lune" : "jour, choisi avec le petit soleil") + ". Le rythme du soleil reprend à " + heure(S.vu.themeTemp.jusqua) + ".</p>" : "") + "</section>" +
    '<section class="card"><h2>La Pause</h2><p class="fine">Combien de temps tu demandes quand tu montres l\'écran Pause.</p><div class="seg" role="group" aria-label="Durée de la Pause">' +
    [10, 20, 30].map(function (m) { return '<button type="button" data-action="pause-duree" data-v="' + m + '" aria-pressed="' + (S.profil.pause === m) + '">' + m + " min</button>"; }).join("") + "</div></section>" +
    '<section class="card"><h2>Les animations</h2><div class="seg" role="group" aria-label="Les animations">' +
    [["vif", "Toutes"], ["doux", "Douces"], ["aucun", "Aucune"]].map(function (o) { return '<button type="button" data-action="mvt" data-v="' + o[0] + '" aria-pressed="' + (mouvement() === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>" +
    '<p class="fine">' + ({ vif: "Toutes : la lumière respire, les écrans arrivent en glissant, chaque geste a sa réponse.", doux: "Douces : la lumière respire et les écrans arrivent en fondu, sans aucun déplacement.", aucun: "Aucune : plus rien ne bouge à l'écran, sauf la lumière des exercices de respiration." })[mouvement()] + "</p>" +
    (!S.profil.mvt && !S.profil.calme && appareilReduit() ? '<p class="fine">Ton appareil demande de réduire les animations : « Douces » est choisi d\'office. Tu peux changer ici.</p>' : "") + "</section>" +
    '<div class="group">' +
    cell("reg-retour", I.crayon, "Mon retour sur la démo", "Ce qui marche, ce qui manque") +
    cell("reg-donnees", I.cadenas, "Mes données", "Elles restent dans ce téléphone") +
    cell("guide", I.guide, "Le guide", "Où trouver quoi") + "</div>" +
    '<button class="link center" data-action="revoir-mot">Revoir la présentation</button>' +
    '<p class="fine">Ma veilleuse ne remplace pas un soignant.</p>';
}
/* Le compte des jours d'ouverture, en une phrase. */
function ligneJours() {
  var o = S.vu.ouvertures || [], k = dayKey();
  if (!o.length) return "";
  var premier = o.slice().sort()[0], depuis = daysBetween(premier, k) + 1;
  var d = labelCourt(premier);   /* « 5 nov. » porte déjà son point */
  return "J'ai ouvert Ma veilleuse " + o.length + " jour" + (o.length > 1 ? "s" : "") + " sur " + depuis + ", depuis le " + d + (/\.$/.test(d) ? "" : ".");
}
function texteRetour() {
  var t = "Retour sur Ma veilleuse (démo) : " + (S.vu.retour || "");
  if (S.vu.retourCompte !== false && ligneJours()) t += "\n" + ligneJours();
  return t;
}
function scrReg(r) {
  var retour = S.vu.retour || "";
  if (r.arg === "besoins") {
    return subHead(r, "Ce dont j'ai besoin", "Chaque curseur ajoute ou retire des contenus. Allume ce qui te sert en ce moment. Éteindre un curseur n'efface rien.") + besoinsHTML();
  }
  if (r.arg === "moi") {
    return subHead(r, "Mon prénom, ma ville", "") +
      '<section class="card">' + field("prenom", "Ton prénom", "text", "") + accordChoix() + villeSelect() +
      '<p class="fine">Ta ville sert au lever et au coucher du soleil' + (besoin("foi") && S.profil.foi === "islam" ? ", et aux horaires des prières" : "") + ". Si elle n'est pas dans la liste, prends la plus proche.</p></section>";
  }
  if (r.arg === "proches") {
    return subHead(r, "Mes proches", "Les personnes à qui tu peux demander un coup de main. Le numéro sert seulement à ouvrir WhatsApp. Hors de France, ajoute l'indicatif, par exemple +32 pour la Belgique.") + prochesEditeur();
  }
  if (r.arg === "deleguer") {
    return subHead(r, "Ce que je peux déléguer", "Ce qui est proposé dans Relais. Ce sont des exemples : change le texte, retire, ajoute. Le mieux : choisir avec la personne qui t'aide.") + delegueEditeur();
  }
  if (r.arg === "messages") {
    return subHead(r, "Mes messages prêts", "Les messages qui s'ouvrent dans WhatsApp. Ce sont des exemples : change leurs mots, retire, ajoute les tiens.") + messagesEditeur();
  }
  if (r.arg === "retour") {
    return subHead(r, "Mon retour sur la démo", "Ce qui marche, ce qui manque, ce qui agace. Écris-le ici, puis envoie-le à la personne qui t'a partagé cette démo.") +
      '<label class="sr-only" for="retour">Ton retour</label><textarea id="retour" rows="6" placeholder="Ce qui marche, ce qui manque…">' + esc(retour) + "</textarea>" +
      '<section class="card"><h2>Le compte de tes jours</h2><p class="fine">' + esc(ligneJours()) + '</p>' +
      sw("retour-compte", "", S.vu.retourCompte !== false, "Le joindre à mon retour", "Ça dit si l'appli sert vraiment. Rien d'autre ne part : ni tes notes, ni ta jauge.", I.semaine, true) + "</section>" +
      '<div class="stack"><a class="btn primary big" id="retour-wa" href="' + waLink("", texteRetour()) + '">Envoyer sur WhatsApp</a><button class="btn big" data-action="retour-copier">Copier le texte</button></div>' +
      '<p class="fine">WhatsApp s\'ouvre avec ton texte : choisis le contact, puis envoie.</p>';
  }
  if (r.arg === "donnees") {
    return subHead(r, "Mes données", "Tout reste dans ce téléphone, dans ce navigateur : pas de compte, pas de serveur. Personne d'autre n'y a accès.") +
      (storageOK ? "" : '<p class="fine warn">Ce navigateur n\'enregistre pas les données : elles disparaîtront à la fermeture. Ouvre plutôt le lien dans Safari ou Chrome.</p>') +
      '<div class="stack"><button class="btn big" data-action="sauvegarde">Copier mes listes et mes notes</button><button class="btn big danger" data-action="effacer">Tout effacer</button></div>' +
      '<p class="fine">« Copier » met tout ton contenu en texte dans le presse-papiers : colle-le dans tes notes pour en garder une trace.</p>';
  }
  return subHead(r, "Introuvable", "");
}

/* ---------- Typographie française ----------
   Les espaces qui ne doivent pas se couper : avant « : ; ? ! », dans les guillemets, entre un nombre et son unité,
   à l'intérieur d'un numéro. Et de vraies apostrophes. On ne touche qu'au texte affiché, jamais à ce qui est saisi. */
function T(s) {
  return String(s)
    .replace(/'/g, "’")
    .replace(/«[  ]/g, "« ").replace(/[  ]»/g, " »")
    .replace(/(\S) :(?=\s|$)/g, "$1 :").replace(/^ :(?=\s|$)/, " :")
    .replace(/(\S) ([;?!])(?=\s|$)/g, "$1 $2").replace(/^ ([;?!])(?=\s|$)/, " $1")
    .replace(/(\d) (?=\d)/g, "$1 ")
    .replace(/(\d) (?=(?:h|min|minutes?|s|heures?|jours?|semaines?|séances|ans?)(?![\wÀ-ÿ]))/g, "$1 ")
    .replace(/(\d h) (?=\d)/g, "$1 ");
}
function typo(root) {
  if (!root) return;
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
  while ((n = w.nextNode())) { var p = n.parentNode && n.parentNode.nodeName; if (p !== "TEXTAREA" && p !== "OPTION" && p !== "SCRIPT" && p !== "STYLE") list.push(n); }
  list.forEach(function (x) { var a = x.nodeValue, b = T(a); if (a !== b) x.nodeValue = b; });
  root.querySelectorAll("[placeholder]").forEach(function (el) { var a = el.getAttribute("placeholder"), b = T(a); if (a !== b) el.setAttribute("placeholder", b); });
}

/* ---------- Mouvement ----------
   Rien ne bouge tout seul, sauf la lumière. Le reste répond à un geste. Et tout peut se réduire. */
function appareilReduit() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
function mouvement() {
  var m = S.profil.mvt;
  if (m === "vif" || m === "doux" || m === "aucun") return m;
  if (S.profil.calme) return "aucun";            /* l'ancien réglage « Réduites » */
  return appareilReduit() ? "doux" : "vif";
}
function calme() { return mouvement() === "aucun"; }
function appliquerMouvement() { document.documentElement.setAttribute("data-mvt", mouvement()); }
/* Changer de jour à nuit : la nouvelle lumière s'étend depuis l'endroit touché. Sans cette fonction du navigateur, le changement est immédiat. */
function avecLumiere(fn, origine) {
  var root = document.documentElement;
  if (!document.startViewTransition || mouvement() !== "vif" || !origine) { fn(); return; }
  var b = origine.getBoundingClientRect();
  root.style.setProperty("--vx", (b.left + b.width / 2) + "px"); root.style.setProperty("--vy", (b.top + b.height / 2) + "px");
  root.classList.add("vt-astre");
  var t;
  try { t = document.startViewTransition(fn); } catch (e) { root.classList.remove("vt-astre"); fn(); return; }
  function fin() { root.classList.remove("vt-astre"); }
  /* Page cachée au moment du geste : la transition est annulée par le navigateur, sans conséquence. On le sait, on n'en fait rien. */
  if (t && t.ready) t.ready.then(null, function () {});
  if (t && t.finished) t.finished.then(fin, fin); else fin();
}

/* ---------- Rendu ---------- */
var lastDepth = null, lastName = null;
var SCREENS = { aujourdhui: scrAujourdhui, minimum: scrMinimum, liste: scrListe, projets: scrProjets, journal: scrJournal, evolution: scrEvolution, reglages: scrReglages, reg: scrReg, guide: scrGuide, memo: scrMemo,
  relais: scrRelais, "pour-eux": scrPourEux, preparer: scrPreparer, nuit: scrNuit, contact: scrContact, maintenant: scrMaintenant, sos: scrSOS, respirer: scrRespirer, plan: scrPlan, reperes: scrReperes, rep: scrRep };
function render(anim) {
  var main = $("#main"), nav = $(".tabs");
  if (!S.onboarded || revoir) {
    if (!welcomeStep) welcomeStep = 1;
    nav.hidden = true;
    /* L'ouverture de l'appli : les herbes. */
    document.body.classList.add("vp"); document.body.classList.remove("sous"); document.body.setAttribute("data-lieu", LIEU_OUVERTURE); appliquerDecor();
    main.innerHTML = scrBienvenue(); typo(main);
    main.classList.remove("push", "pop", "fade");
    if (sensEtape) { void main.offsetWidth; main.classList.add(sensEtape); sensEtape = ""; }
    majCoach();
    return;
  }
  nav.hidden = false;
  var r = route();
  if (r.name === "guide" && !S.vu.guideVu) { S.vu.guideVu = true; save(); }
  /* Les pages en verre portent leur lieu ; les autres gardent l'ancien habillage, le temps de la transition. */
  var lieuPage = LIEUX[r.name] || "";
  document.body.classList.toggle("vp", !!lieuPage);
  document.body.classList.toggle("sous", !!lieuPage && r.def.depth > 0);
  if (lieuPage) document.body.setAttribute("data-lieu", lieuPage); else document.body.removeAttribute("data-lieu");
  appliquerDecor();
  main.innerHTML = SCREENS[r.name](r); typo(main);
  if (anim) {
    var dir = lastDepth === null ? "fade" : r.def.depth > lastDepth ? "push" : r.def.depth < lastDepth ? "pop" : (r.name !== lastName || r.arg !== lastArg ? "fade" : "");
    main.classList.remove("push", "pop", "fade");
    if (dir) { void main.offsetWidth; main.classList.add(dir); }
  }
  lastDepth = r.def.depth; lastName = r.name; lastArg = r.arg;
  nav.querySelectorAll("a").forEach(function (a) { if (a.getAttribute("data-tab") === r.def.tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  majTabs(); majCoach();
}
var lastArg = null;
/* Le repère de l'onglet actif glisse d'un onglet à l'autre. */
function majTabs() {
  var nav = $(".tabs"), ind = $(".tab-ind"); if (!nav || !ind || nav.hidden) return;
  var a = nav.querySelector('a[aria-current="page"]');
  if (!a) { ind.style.opacity = "0"; return; }
  var premier = ind.style.opacity !== "1";
  if (premier) ind.style.transition = "none";
  ind.style.width = a.offsetWidth + "px"; ind.style.transform = "translateX(" + a.offsetLeft + "px)"; ind.style.opacity = "1";
  if (premier) { void ind.offsetWidth; ind.style.transition = ""; }
}
/* Le premier jour, une fois la jauge faite : un mot au-dessus de la lumière, pour dire à quoi elle sert. */
function majCoach() {
  var c = $("#coach"); if (!c) return;
  var voir = S.onboarded && !revoir && !S.vu.coach && !editJauge && route().name === "aujourdhui" && hasGauge(S.jours[dayKey()]);
  if (c.hidden === !voir) return;
  c.hidden = !voir; document.body.classList.toggle("avec-coach", voir);
}
var ancre = null;
function versAncre() { var el = ancre && document.getElementById(ancre); ancre = null; if (el) { el.scrollIntoView({ block: "start" }); return true; } return false; }
function go(view, a) { ancre = a || null; closeSheet(); closeShow(); if ((location.hash || "").replace("#", "") === view) { render(true); if (!versAncre()) window.scrollTo(0, 0); } else location.hash = view; }

/* ---------- Feuille du bas, écran à montrer, toast ----------
   Ils arrivent et repartent en douceur : on voit d'où ils viennent et où ils retournent. */
var lastFocus = null, sheetT = 0, showT = 0;
function openSheet(html) {
  var w = $("#sheet");
  clearTimeout(sheetT); w.classList.remove("ferme");
  if (w.hidden) lastFocus = document.activeElement;
  $("#sheet-body").innerHTML = html; typo($("#sheet-body"));
  w.hidden = false;
  document.body.classList.add("noscroll");
  var t = $("#sheet-title"); if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
}
function closeSheet() {
  var w = $("#sheet"); if (w.hidden || w.classList.contains("ferme")) return;
  function fin() { w.hidden = true; w.classList.remove("ferme"); if ($("#show").hidden) document.body.classList.remove("noscroll"); }
  if (calme()) fin(); else { w.classList.add("ferme"); sheetT = setTimeout(fin, 260); }
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
function openShow(body, actions) {
  var w = $("#show");
  clearTimeout(showT); w.classList.remove("ferme");
  $("#show-body").innerHTML = body; $("#show-actions").innerHTML = actions; typo(w);
  w.hidden = false; document.body.classList.add("noscroll");
  $("#show-body").focus({ preventScroll: true });
}
function closeShow() {
  var w = $("#show"); if (w.hidden || w.classList.contains("ferme")) return;
  arreterSouffle(); arreterMinuteur();
  function fin() { w.hidden = true; w.classList.remove("ferme"); if ($("#sheet").hidden) document.body.classList.remove("noscroll"); }
  if (calme()) fin(); else { w.classList.add("ferme"); showT = setTimeout(fin, 190); }
}
var toastT;
function toast(m) { var t = $("#toast"); t.textContent = T(m); t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 2400); }
function copyText(txt) {
  function manual() { openSheet('<h2 id="sheet-title">Copie à la main</h2><p class="fine">Ce navigateur bloque la copie automatique. Appuie longuement dans le texte pour le copier.</p><textarea rows="8" readonly>' + esc(txt) + '</textarea><button class="btn big" data-action="close-sheet">Fermer</button>'); }
  try { if (!navigator.clipboard) { manual(); return; } navigator.clipboard.writeText(txt).then(function () { toast("Copié"); }, manual); } catch (e) { manual(); }
}

function showPause() {
  var p = nPresent();
  openShow((p ? '<p class="to">' + esc(p) + ",</p>" : "") +
    (pauseBebe()
      ? '<p class="big">Tu peux prendre ' + esc(nBebe()) + " maintenant ?</p>" + '<p class="big">J\'ai besoin de ' + S.profil.pause + " minutes pour moi.</p>"
      : '<p class="big">J\'ai besoin d\'une pause de ' + S.profil.pause + " minutes.</p>" + '<p class="big">Tu peux prendre le relais ?</p>') +
    '<p class="mid">Ce n\'est pas grave. Je reviens.</p>',
    '<button class="btn primary big" data-action="close-show">C\'est bon</button><button class="link center" data-action="pas-la">' + (p ? esc(p) + " n'est pas là" : "Personne n'est là") + "</button>");
}
function sheetPasLa() {
  var cur = presentId(), items = "";
  S.proches.forEach(function (x) {
    if (x.id === cur) return;
    items += '<a class="btn left" href="' + waLink(x.tel, msgTxt("deborde")) + '">' + I.orbe + "Écrire à " + esc(nomProche(x)) + "</a>";
    if (x.passer) items += '<a class="btn left" href="' + waLink(x.tel, msgTxt("passer")) + '">' + I.orbe + "Demander à " + esc(nomProche(x)) + " de passer</a>";
  });
  openSheet('<h2 id="sheet-title">Pas de relais sur place ?</h2>' + (items ? '<div class="stack veille-sheet">' + items + "</div>" : "") +
    (pauseBebe()
      ? '<div class="doux"><h3>Si tu es à bout</h3>' +
        "<p>Si ton bébé a mangé et que sa couche est propre : pose-le sur le dos dans son lit, sors de la pièce, et respire quelques minutes. Tu as le droit.</p>" +
        '<button class="btn" data-action="souffle-go" data-id="soupir">Respirer avec moi, une minute</button>' +
        '<p>Puis appelle quelqu\'un qui peut prendre le relais, ou une ligne d\'écoute : SOS Amitié répond jour et nuit, au <a href="tel:0972394050">09 72 39 40 50</a>.</p>' +
        '<button class="link" data-action="go" data-h="sos-bebe" style="align-self:flex-start">D\'autres idées pour ce moment</button></div>'
      : '<div class="doux"><h3>Une pause sur place</h3>' +
        "<p>Pose ce que tu fais, mets-toi dans un coin calme, et respire une minute. Ça compte aussi.</p>" +
        '<button class="btn" data-action="souffle-go" data-id="soupir">Respirer avec moi, une minute</button>' +
        '<p>Besoin de parler ? SOS Amitié répond jour et nuit, au <a href="tel:0972394050">09 72 39 40 50</a>.</p></div>') +
    '<button class="btn big" data-action="close-sheet">Fermer</button>');
}
function showConfie() {
  var sel = confiesDuJour(), p = nPresent();
  if (!sel.length) { showPause(); return; }
  if (sel.length === 1) {
    openShow((p ? '<p class="to">' + esc(p) + ",</p>" : "") + '<p class="big">' + esc(fill(sel[0].txt)) + '</p><p class="mid">Ça m\'aiderait beaucoup. Merci.</p>', '<button class="btn primary big" data-action="close-show">Fermer</button>');
    return;
  }
  openShow('<p class="to">' + (p ? esc(p) + ", ce" : "Ce") + " qui m'aiderait aujourd'hui :</p><ul class=\"biglist\">" + sel.map(function (m) { return "<li>" + esc(fill(m.txt)) + "</li>"; }).join("") + '</ul><p class="mid">Merci.</p>',
    '<button class="btn primary big" data-action="close-show">Fermer</button>');
}
function messageConfie(sel) {
  if (!sel.length) return pauseBebe() ? "Tu peux prendre " + nBebe() + " " + S.profil.pause + " minutes ? J'ai besoin d'une pause." : "J'ai besoin d'une pause de " + S.profil.pause + " minutes. Tu peux prendre le relais ?";
  return "Ce qui m'aiderait aujourd'hui :\n" + sel.map(function (m) { var t = fill(m.txt); return "- " + t.charAt(0).toLowerCase() + t.slice(1); }).join("\n") + "\nMerci.";
}
function sheetMessage() {
  var sel = confiesDuJour(), p = nPresent(), tel = telPresent(), txt = messageConfie(sel);
  openSheet('<h2 id="sheet-title">Message pour ' + (p ? esc(p) : "un proche") + '</h2><label class="sr-only" for="msg">Le message</label><textarea id="msg" rows="6">' + esc(txt) + "</textarea>" +
    '<p class="fine">Tu peux modifier le message avant de l\'envoyer.</p>' +
    '<div class="row"><a class="btn primary" id="msg-wa" href="' + waLink(tel, txt) + '">Ouvrir WhatsApp</a><button class="btn" data-action="copy" data-target="#msg">Copier</button></div>' +
    '<p class="fine">' + (tel ? "WhatsApp s'ouvre avec le message prêt. Il ne reste qu'à envoyer." : "WhatsApp s'ouvre avec le message prêt. Choisis " + (p ? esc(p) : "le contact") + ", puis envoie.") + "</p>" +
    '<button class="btn big" data-action="close-sheet">Fermer</button>');
}
function nouvelleListe() { creneauListe = ideesPour(creneauMode, creneauMin); creneauIdx = 0; }
function sheetEtape(id) {
  var p = byId(S.projets, id); if (!p) return;
  openSheet('<h2 id="sheet-title">Étape faite. La suivante ?</h2><p class="fine">Pour « ' + esc(p.titre || "ton projet") + ' ». Toute petite, faisable en un moment.</p>' +
    '<label class="sr-only" for="etape-next">Prochaine étape</label><input id="etape-next" type="text" autocomplete="off" placeholder="La prochaine petite étape">' +
    '<button class="btn primary big" data-action="etape-save" data-id="' + id + '">Enregistrer</button><button class="link center" data-action="etape-save" data-id="' + id + '" data-vide="1">Je verrai plus tard</button>');
}
function sheetDeCote() {
  var d = S.jours[dayKey()]; if (!hasGauge(d)) return;
  var T = TYPES[typeDe(d)];
  openSheet('<h2 id="sheet-title">Ce que tu peux mettre de côté aujourd\'hui</h2><p class="fine">Ça peut attendre. Le mettre de côté ne bouleverse rien, et ne te mettra pas en difficulté.</p><ul class="plain">' + T.cote.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul><button class="btn big" data-action="close-sheet">D\'accord</button>');
}
function sheetRetirer(id) {
  var p = byId(S.proches, id); if (!p) return;
  openSheet('<h2 id="sheet-title">Retirer ' + esc(nomProche(p)) + " de tes relais ?</h2><p>Son prénom et son numéro seront effacés de Ma veilleuse. Tu pourras l'ajouter à nouveau quand tu veux.</p>" +
    '<button class="btn big danger" data-action="proche-del-oui" data-id="' + id + '">Oui, retirer</button><button class="btn big" data-action="close-sheet">Annuler</button>');
}
/* Ma veilleuse : un geste, où que l'on soit dans l'appli. */
function sheetVeilleuse() {
  var who = nPresent();
  var parler = S.proches.map(function (p) { return '<a class="btn left" href="' + waLink(p.tel, msgTxt("parler")) + '">' + I.orbe + "Parler à " + esc(nomProche(p)) + "</a>"; }).join("");
  openSheet('<div class="veille-sheet stack"><p class="kicker">Il est ' + heure(Date.now()) + '.</p><h2 id="sheet-title">De quoi as-tu besoin, là ?</h2>' +
    (besoin("crise") ? '<button class="btn left" data-action="go" data-h="plan">' + I.orbe + "Mon plan de crise</button>" : "") +
    '<button class="btn left" data-action="pause">' + I.orbe + "Une pause, maintenant" + (who ? " (avec " + esc(who) + ")" : "") + "</button>" +
    '<button class="btn left" data-action="souffle-go" data-id="long">' + I.orbe + "Respirer avec moi, deux minutes</button>" +
    (besoin("tete") ? '<button class="btn left" data-action="minuteur" data-min="5">' + I.orbe + "Juste 5 minutes, pour démarrer</button>" : "") +
    '<button class="btn left" data-action="go" data-h="maintenant">' + I.orbe + "Ça déborde</button>" +
    '<p class="kicker" style="margin-top:8px">Avec quelqu\'un</p>' +
    '<button class="btn left" data-action="go" data-h="relais">' + I.orbe + "Demander un coup de main</button>" +
    parler +
    '<button class="btn left" data-action="go" data-h="nuit">' + I.orbe + "Mes proches ne sont pas dispos</button>" +
    '<p class="kicker" style="margin-top:8px">Une urgence</p>' +
    appelsUrgence() +
    '<button class="link center" data-action="close-sheet">Fermer</button></div>');
}
function sheetEffacer() {
  openSheet('<h2 id="sheet-title">Tout effacer ?</h2><p>Tes listes, tes notes et tes jauges seront supprimées de ce téléphone. On ne pourra pas les récupérer.</p><button class="btn big danger" data-action="effacer-oui">Oui, tout effacer</button><button class="btn big" data-action="close-sheet">Annuler</button>');
}
function notesText() { return "À dire au médecin\n" + S.notes.map(function (n) { return "- " + labelCourt(n.date) + (n.ts ? ", " + heure(n.ts) : "") + " : " + n.txt; }).join("\n"); }
function backupText() {
  var out = ["Ma veilleuse, mes listes et mes notes (" + labelCourt(dayKey()) + ")", ""];
  if (besoin("traitement")) { out.push("Mes prises :"); S.prises.forEach(function (p) { out.push("- " + ((p.nom || "").trim() || "Mon traitement") + (p.heure ? " : " + heureTxt(p.heure) : "")); }); out.push(""); }
  out.push("Le minimum, mes impératifs :"); S.imperatifs.forEach(function (x) { out.push("- " + x.txt + (x.quotidien ? " (tous les jours)" : "")); });
  out.push("", "Ma liste :"); S.taches.forEach(function (t) { out.push("- " + t.txt + (t.done ? " (fait)" : "")); });
  out.push("", "Mes projets :"); S.projets.forEach(function (p) { out.push("- " + p.titre + (p.etape ? " : " + p.etape : "")); });
  out.push("", "À dire au médecin :"); S.notes.forEach(function (n) { out.push("- " + labelCourt(n.date) + " : " + n.txt); });
  out.push("", "Ce qui m'aide :"); S.aide.forEach(function (a) { out.push("- " + a.txt); });
  out.push("", "Mes vidéos :"); S.videos.forEach(function (v) { out.push("- " + titreVideo(v) + " : " + v.url); });
  out.push("", "Mon journal :"); Object.keys(S.jours).sort().forEach(function (kk) { var m = S.jours[kk].mot; if (m && m.trim()) out.push("- " + labelJour(kk) + " : " + m.trim()); });
  out.push("", "Ce que je peux déléguer :"); menuVisible().forEach(function (m) { out.push("- " + fill(m.txt)); });
  if (besoin("souvenir")) {
    out.push("", "Où sont mes affaires :"); S.affaires.forEach(function (a) { out.push("- " + a.txt); });
    out.push("", "À retenir :"); S.retenir.forEach(function (a) { out.push("- " + (a.date ? labelCourt(a.date) + " : " : "") + a.txt); });
  }
  if (besoin("crise")) out.push("", planText());
  return out.join("\n");
}

/* ---------- Actions ---------- */
var A = {
  "jauge": function (el) {
    /* Les deux lignes en plus (humeur, nuit) sont facultatives : retoucher le niveau choisi l'efface. */
    var k = el.getAttribute("data-k"), v = +el.getAttribute("data-v");
    J[k] = (k === "h" || k === "s") && J[k] === v ? 0 : v;
    paintRow(k); var er = $("#jerr"); if (er) er.textContent = "";
  },
  "voir-journee": function () {
    if (!J || !J.e || !J.t || !J.r) {
      /* Les lignes qui manquent se signalent d'elles-mêmes. */
      ["e", "t", "r"].forEach(function (k) { var row = document.querySelector('.jr[data-jr="' + k + '"]'); if (row) { row.classList.remove("manque"); if (!J || !J[k]) { void row.offsetWidth; row.classList.add("manque"); } } });
      var er = $("#jerr"); if (er) er.textContent = T("Il manque une ligne : choisis un niveau pour chacune.");
      return;
    }
    var d = today(), now = Date.now();
    if (!d.checks) d.checks = hasGauge(d) ? [{ ts: null, e: d.e, t: d.t, r: d.r, h: d.h || 0, s: d.s || 0 }] : [];
    var c = { ts: now, e: J.e, t: J.t, r: J.r, h: J.h || 0, s: J.s || 0 }, last = d.checks[d.checks.length - 1];
    /* Refaite moins de 15 minutes après, la jauge remplace la précédente : c'est une correction, pas un nouveau moment. */
    if (last && last.ts && now - last.ts < 15 * 60000) d.checks[d.checks.length - 1] = c; else d.checks.push(c);
    d.e = J.e; d.t = J.t; d.r = J.r; d.h = J.h || 0; d.s = J.s || 0; editJauge = false; J = null; justLit = true; save(); render(); window.scrollTo(0, 0);
    toast("Jauge enregistrée à " + heure(now));
  },
  "refaire-jauge": function () { var d = today(); J = { e: d.e, t: d.t, r: d.r, h: d.h || 0, s: d.s || 0 }; editJauge = true; render(); window.scrollTo(0, 0); },
  "refaire-jauge-evo": function () { var d = today(); J = { e: d.e, t: d.t, r: d.r, h: d.h || 0, s: d.s || 0 }; editJauge = true; go("aujourdhui"); },
  "annuler-jauge": function () { editJauge = false; J = null; render(); },
  "de-cote": function () { sheetDeCote(); },
  "theme-bascule": function (el) {
    var cible = nuitAffichee() ? "jour" : "nuit", mode = S.profil.theme || "auto";
    if (mode === "auto") {
      /* Revenir au mode que le soleil donne déjà, c'est simplement reprendre son rythme. */
      if ((cible === "nuit") === etatSoleil().nuit) { delete S.vu.themeTemp; toast("Mode " + cible + ", au rythme du soleil"); }
      else { S.vu.themeTemp = { mode: cible, jusqua: prochainSoleil() }; toast("Mode " + cible + " pour l'instant"); }
    } else { S.profil.theme = cible; toast("Mode " + cible); }
    save(); avecLumiere(appliquerTheme, el);
  },
  "souffle-go": function (el) { startSouffle(el.getAttribute("data-id")); },
  "souffle-stop": function () { closeShow(); },
  "son": function (el) { S.profil.son = !S.profil.son; save(); el.setAttribute("aria-checked", String(S.profil.son)); if (S.profil.son) bip(440); },
  "son-live": function (el) { S.profil.son = !S.profil.son; save(); el.textContent = S.profil.son ? "Couper le son" : "Avec un son doux"; if (S.profil.son) bip(440); },
  "video-del": function (el) { var id = el.getAttribute("data-id"); S.videos = S.videos.filter(function (x) { return x.id !== id; }); save(); render(); toast("Vidéo retirée"); },
  "veilleuse": function (el) {
    /* La lumière s'ouvre sous le doigt, puis la feuille monte. */
    el.classList.remove("eclat"); void el.offsetWidth; el.classList.add("eclat");
    if (!S.vu.coach) { S.vu.coach = true; save(); majCoach(); }
    closeShow(); sheetVeilleuse();
  },
  "coach-ok": function () { S.vu.coach = true; save(); majCoach(); },
  "geo-on": function (el) { demanderPosition(el); },
  "accord": function (el) { S.profil.accord = el.getAttribute("data-v"); save(); render(); },
  "retour-compte": function () { S.vu.retourCompte = S.vu.retourCompte === false; save(); render(); },
  "retour-copier": function () { copyText(texteRetour()); },
  "geo-off": function () { delete S.profil.geo; save(); appliquerTheme(); render(); },
  "mvt": function (el) { var v = el.getAttribute("data-v"); S.profil.mvt = v; S.profil.calme = v === "aucun"; save(); appliquerMouvement(); render(); },
  "go": function (el) { go(el.getAttribute("data-h"), el.getAttribute("data-ancre")); },
  "guide-plus-tard": function () { S.vu.guideVu = true; save(); render(); toast("Le guide reste là : le « ? » en haut de l'accueil"); },
  "min": function (el) {
    var k = el.getAttribute("data-k"), imp = byId(S.imperatifs, k);
    if (imp && !imp.quotidien) { imp.doneTs = imp.doneTs ? null : Date.now(); imp.doneDay = imp.doneTs ? dayKey() : null; }
    else { var d = today(); d.min = d.min || {}; if (d.min[k]) delete d.min[k]; else d.min[k] = Date.now(); }
    save(); render();
  },
  "imp-mode": function (el) {
    impMode = el.getAttribute("data-v");
    el.parentNode.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === el)); });
    var i = $("#imp-in"); if (i) { i.placeholder = impPlaceholder(); i.focus({ preventScroll: true }); }
  },
  "imp-del": function (el) { var id = el.getAttribute("data-id"); S.imperatifs = S.imperatifs.filter(function (x) { return x.id !== id; }); save(); render(); toast("Retiré du minimum"); },
  "prieres": function () { S.profil.prieres = !S.profil.prieres; save(); if (surBesoins()) majBesoins("foi"); else render(); toast(S.profil.prieres ? "Les horaires des prières s'affichent sur l'accueil" : "Horaires des prières retirés"); },
  "angle": function (el) { S.profil.angle = +el.getAttribute("data-v"); save(); if (surBesoins()) majBesoins("foi"); else render(); },
  "tache-done": function (el) { var t = byId(S.taches, el.getAttribute("data-id")); if (!t) return; t.done = !t.done; t.doneDay = t.done ? dayKey() : null; t.doneTs = t.done ? Date.now() : null; save(); render(); if (t.done) toast("C'est fait, à " + heure(t.doneTs)); },
  "tache-star": function (el) { var t = byId(S.taches, el.getAttribute("data-id")); if (!t) return; var k = dayKey(); t.today = t.today === k ? null : k; save(); render(); toast(t.today ? "Ajouté à tes priorités du jour" : "Retiré de tes priorités"); },
  "tache-del": function (el) { var id = el.getAttribute("data-id"); S.taches = S.taches.filter(function (x) { return x.id !== id; }); save(); render(); },
  "creneau-go": function (el) {
    var m = +el.getAttribute("data-min");
    if (creneauMin === m) { creneauMin = 0; render(); return; }
    creneauMin = m; creneauMode = modeParDefaut(); nouvelleListe(); ideeNeuve = true; render();
    var c = $("#moment"); if (c) c.scrollIntoView({ block: "start", behavior: "smooth" });
  },
  "creneau-mode": function (el) { creneauMode = el.getAttribute("data-v"); nouvelleListe(); ideeNeuve = true; render(); },
  "creneau-autre": function () { creneauIdx++; ideeNeuve = true; render(); },
  "creneau-fini": function () { creneauMin = 0; render(); toast("C'est parti, à ton rythme"); },
  "etape-faite": function (el) { sheetEtape(el.getAttribute("data-id")); },
  "etape-save": function (el) {
    var p = byId(S.projets, el.getAttribute("data-id")); if (!p) return;
    var i = $("#etape-next"); p.etape = el.getAttribute("data-vide") ? "" : (i ? i.value.trim() : "");
    if (creneauMin) nouvelleListe();
    save(); closeSheet(); render(); toast(p.etape ? "Prochaine étape enregistrée" : "Étape faite");
  },
  "projet-del": function (el) { var id = el.getAttribute("data-id"); S.projets = S.projets.filter(function (x) { return x.id !== id; }); save(); render(); },
  "confie": function (el) {
    var d = today(), id = el.getAttribute("data-id"); d.confie = d.confie || [];
    var i = d.confie.indexOf(id); if (i >= 0) d.confie.splice(i, 1); else d.confie.push(id);
    save(); render();
  },
  "pause-mode": function (el) { S.vu.pauseMode = el.getAttribute("data-v"); save(); render(); },
  "present": function (el) { S.vu.present = el.getAttribute("data-id"); save(); render(); },
  "montrer-confie": function () { showConfie(); },
  "envoyer-confie": function () { sheetMessage(); },
  "pause": function () { closeSheet(); showPause(); },
  "pas-la": function () { closeShow(); sheetPasLa(); },
  "evo": function (el) { evoPeriode = el.getAttribute("data-v"); render(); },
  "theme": function (el) { S.profil.theme = el.getAttribute("data-v"); delete S.vu.themeTemp; save(); avecLumiere(function () { appliquerTheme(); render(); }, el); },
  "copy": function (el) { var t = $(el.getAttribute("data-target")); if (t) copyText(t.value); },
  "notes-copy": function () { copyText(notesText()); },
  "sauvegarde": function () { copyText(backupText()); },
  "aide-del": function (el) { var id = el.getAttribute("data-id"); S.aide = S.aide.filter(function (x) { return x.id !== id; }); save(); render(); },
  "note-del": function (el) { var id = el.getAttribute("data-id"); S.notes = S.notes.filter(function (x) { return x.id !== id; }); save(); render(); },
  "menu-del": function (el) {
    var id = el.getAttribute("data-id"), m = byId(S.menu, id);
    S.menu = S.menu.filter(function (x) { return x.id !== id; });
    Object.keys(S.jours).forEach(function (k) { var c = S.jours[k].confie; if (c) S.jours[k].confie = c.filter(function (x) { return x !== id; }); });
    save(); render(); if (m) toast("Retiré : " + fill(m.txt));
  },
  "messages-edit": function () { editMessages = !editMessages; render(); window.scrollTo(0, 0); },
  "msg-add": function () {
    var m = { id: uid(), k: null, label: "", txt: "" }; S.messages.push(m); save(); render();
    var i = document.getElementById("ml-" + m.id); if (i) { i.scrollIntoView({ block: "center" }); i.focus({ preventScroll: true }); }
  },
  "msg-del": function (el) { var id = el.getAttribute("data-id"); S.messages = S.messages.filter(function (x) { return x.id !== id; }); save(); render(); toast("Message retiré"); },
  "msg-reset": function () { S.messages = freshMessages(); save(); render(); toast("Exemples de départ remis"); },
  "delegue-edit": function () { editDelegue = !editDelegue; render(); var c = $("#delegue"); if (c) c.scrollIntoView({ block: "start" }); if (editDelegue) { var i = $("#menu-in"); if (i) i.focus({ preventScroll: true }); } },
  "menu-reset": function () { S.menu = freshMenu(); save(); render(); toast("Exemples de départ remis"); },
  "proche-add": function () { var p = { id: uid(), nom: "", tel: "", passer: false }; S.proches.push(p); save(); render(); var i = document.getElementById("n-" + p.id); if (i) i.focus(); toast("Écris son prénom, et son numéro si tu veux"); },
  "proche-del": function (el) {
    /* Une fiche encore vide se retire sans demander confirmation. */
    var id = el.getAttribute("data-id"), p = byId(S.proches, id);
    if (p && !(p.nom || "").trim() && !(p.tel || "").trim()) { S.proches = S.proches.filter(function (x) { return x.id !== id; }); save(); render(); return; }
    sheetRetirer(id);
  },
  "proche-del-oui": function (el) {
    var id = el.getAttribute("data-id"), p = byId(S.proches, id);
    S.proches = S.proches.filter(function (x) { return x.id !== id; });
    save(); closeSheet(); render(); toast(p ? nomProche(p) + " ne fait plus partie de tes relais" : "C'est fait");
  },
  "proche-passer": function (el) { var p = byId(S.proches, el.getAttribute("data-id")); if (!p) return; p.passer = !p.passer; save(); el.setAttribute("aria-checked", String(p.passer)); },
  "pause-duree": function (el) { S.profil.pause = +el.getAttribute("data-v"); save(); render(); },
  /* Un curseur : allumer ou éteindre un besoin. Éteindre n'efface rien : les contenus sont seulement retirés de l'écran. */
  "besoin": function (el) {
    var k = el.getAttribute("data-k"), b = byKey(BESOINS, k); if (!b) return;
    var on = !besoin(k); S.profil.besoins[k] = on;
    if (k === "traitement" && on && !S.prises.length) S.prises.push({ id: uid(), nom: "", heure: "" });
    save(); majBesoins(k);
    toast(b.nom + (on ? " : allumé" : " : éteint"));
  },
  /* Un raccourci : plusieurs curseurs d'un coup. Les retoucher un par un reste possible. */
  "raccourci": function (el) {
    var r = byKey(RACCOURCIS, el.getAttribute("data-k")); if (!r) return;
    var tous = r.set.every(function (k) { return besoin(k); });
    r.set.forEach(function (k) { S.profil.besoins[k] = !tous; });
    save(); r.set.forEach(function (k) { majBesoins(k); });
    toast(tous ? "Raccourci éteint" : "Allumé : " + r.set.map(function (k) { return byKey(BESOINS, k).nom; }).join(", "));
  },
  "foi": function (el) {
    S.profil.foi = el.getAttribute("data-v") || ""; if (S.profil.foi !== "islam") S.profil.prieres = false;
    save(); if (surBesoins()) majBesoins("foi"); else render();
    toast("Un texte par jour t'attendra sur l'accueil");
  },
  "prise-add": function () { var p = { id: uid(), nom: "", heure: "" }; S.prises.push(p); save(); if (surBesoins()) majBesoins("traitement"); else render(); var i = document.getElementById("pn-" + p.id); if (i) i.focus({ preventScroll: true }); },
  "prise-del": function (el) { var id = el.getAttribute("data-id"); S.prises = S.prises.filter(function (x) { return x.id !== id; }); save(); if (surBesoins()) majBesoins("traitement"); else render(); toast("Prise retirée"); },
  "plan-del": function (el) { var k = el.getAttribute("data-k"), id = el.getAttribute("data-id"); if (!S.plan[k]) return; S.plan[k] = S.plan[k].filter(function (x) { return x.id !== id; }); save(); render(); },
  "plan-copy": function () { copyText(planText()); },
  "memo-del": function (el) { var k = el.getAttribute("data-k"), id = el.getAttribute("data-id"); if (k !== "affaires" && k !== "retenir") return; S[k] = S[k].filter(function (x) { return x.id !== id; }); save(); render(); },
  "minuteur": function (el) { startMinuteur(+el.getAttribute("data-min") || 5); },
  "bienvenue-etape": function (el) { var v = +el.getAttribute("data-v") || 1; sensEtape = v > welcomeStep ? "push" : "pop"; welcomeStep = v; render(); window.scrollTo(0, 0); },
  "effacer": function () { sheetEffacer(); },
  "effacer-oui": function () { try { localStorage.removeItem(KEY); } catch (e) {} S = freshState(); closeSheet(); welcomeStep = 1; revoir = false; J = null; editJauge = false; creneauMin = 0; try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { try { location.hash = ""; } catch (e2) {} } render(); window.scrollTo(0, 0); },
  "revoir-mot": function () { revoir = true; welcomeStep = 1; render(); window.scrollTo(0, 0); },
  "revoir-fermer": function () { revoir = false; welcomeStep = 0; render(true); window.scrollTo(0, 0); },
  "bienvenue-suite": function () { welcomeStep = 2; sensEtape = "push"; render(); window.scrollTo(0, 0); },
  "bienvenue-fin": function () {
    /* Les fiches laissées vides ne sont pas gardées ; la première personne qui peut être là est proposée d'office. */
    S.proches = S.proches.filter(function (p) { return (p.nom || "").trim() || (p.tel || "").trim(); });
    var premier = S.proches.filter(function (p) { return p.passer; })[0];
    S.vu.present = premier ? premier.id : "autre";
    S.onboarded = true; welcomeStep = 0; save(); go("aujourdhui"); window.scrollTo(0, 0);
  },
  "notice-ok": function () { S.vu.notice = dayKey(); save(); render(); },
  "notice-note": function () { var b = bilan14(); S.notes.unshift({ id: uid(), txt: "Ces deux dernières semaines, ma jauge a souvent été basse (" + b.v + " jours sur " + b.n + ").", date: dayKey(), ts: Date.now() }); S.vu.notice = dayKey(); save(); render(); toast("Ajouté à « À dire au médecin »"); },
  "close-sheet": function () { closeSheet(); },
  "close-show": function () { closeShow(); }
};

document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-action]");
  if (!el || el.disabled) return;
  var fn = A[el.getAttribute("data-action")];
  if (!fn) return;
  if (el.tagName === "A") e.preventDefault();
  var cle = cleGeste(el);
  fn(el, e);
  /* Si l'écran a été reconstruit, on retrouve l'élément touché pour qu'il réponde au geste. */
  var cible = document.contains(el) ? el : (cle ? document.querySelector(cle) : null);
  if (cible) { cible.classList.remove("tap-in"); void cible.offsetWidth; cible.classList.add("tap-in"); }
});
function cleGeste(el) {
  var out = "";
  ["data-action", "data-k", "data-id", "data-v", "data-min"].forEach(function (n) { var v = el.getAttribute(n); if (v != null) out += "[" + n + '="' + String(v).replace(/["\\]/g, "\\$&") + '"]'; });
  return out;
}
document.addEventListener("submit", function (e) {
  var f = e.target.closest("form[data-form]"); if (!f) return;
  e.preventDefault();
  if (f.getAttribute("data-form") === "video") { ajouterVideo(); return; }
  var input = f.querySelector("input"), v = input.value.trim(), id = input.id;
  if (!v) return;
  var kind = f.getAttribute("data-form"), msg = "";
  if (kind === "tache") { S.taches.push({ id: uid(), txt: v, done: false, today: null, created: Date.now() }); msg = "Ajouté à ta liste"; }
  if (kind === "imperatif") { S.imperatifs.push({ id: uid(), txt: v, quotidien: impMode === "tous", created: dayKey() }); msg = impMode === "tous" ? "Ajouté au minimum de chaque jour" : "Ajouté au minimum d'aujourd'hui"; }
  if (kind === "projet") { S.projets.push({ id: uid(), titre: v, etape: "" }); msg = "Projet ajouté : note sa première petite étape"; }
  if (kind === "aide") { S.aide.push({ id: uid(), txt: v }); msg = "Ajouté à ce qui t'aide"; }
  if (kind === "note") { S.notes.unshift({ id: uid(), txt: v, date: dayKey(), ts: Date.now() }); msg = "Noté pour ton médecin, à " + heure(Date.now()); }
  if (kind === "menu") { S.menu.push({ id: uid(), txt: v }); msg = "Ajouté à ce que tu peux déléguer"; }
  if (kind === "plan") { var pk = f.getAttribute("data-k"); if (S.plan[pk]) { S.plan[pk].push({ id: uid(), txt: v }); msg = "Ajouté à ton plan"; } }
  if (kind === "affaire") { S.affaires.push({ id: uid(), txt: v }); msg = "Noté"; }
  if (kind === "retenir") { S.retenir.unshift({ id: uid(), txt: v, date: dayKey() }); msg = "Noté"; }
  save(); render(); if (msg) toast(msg);
  if (kind === "projet") { var last = S.projets[S.projets.length - 1], ie = document.getElementById("pe-" + last.id); if (ie) { ie.focus(); return; } }
  var again = document.getElementById(id); if (again) again.focus({ preventScroll: true });
});
document.addEventListener("input", function (e) {
  var el = e.target;
  if (el.getAttribute && el.getAttribute("data-profil")) { S.profil[el.getAttribute("data-profil")] = el.value; save(); if (el.getAttribute("data-profil") === "lieu") appliquerTheme(); }
  if (el.getAttribute && el.getAttribute("data-prise")) { var ps = byId(S.prises, el.getAttribute("data-prise")); if (ps) { ps[el.getAttribute("data-f")] = el.value; save(); } }
  if (el.getAttribute && el.getAttribute("data-proche")) {
    var pr = byId(S.proches, el.getAttribute("data-proche"));
    if (pr) { pr[el.getAttribute("data-f")] = el.value; save(); }
  }
  if (el.getAttribute && el.getAttribute("data-menu")) { var mm = byId(S.menu, el.getAttribute("data-menu")); if (mm) { mm.txt = el.value; save(); } }
  if (el.getAttribute && el.getAttribute("data-msg")) { var ms = byId(S.messages, el.getAttribute("data-msg")); if (ms) { ms[el.getAttribute("data-f")] = el.value; save(); } }
  if (el.getAttribute && el.getAttribute("data-projet")) {
    var pj = byId(S.projets, el.getAttribute("data-projet"));
    if (pj) { pj[el.getAttribute("data-f")] = el.value; save(); if (el.getAttribute("data-f") === "etape") { var b = el.closest(".projet").querySelector('[data-action="etape-faite"]'); if (b) b.disabled = !el.value.trim(); } }
  }
  if (el.id === "mot") { var d = today(); d.mot = el.value; d.motTs = Date.now(); save(); var st = $("#mot-etat"); if (st) st.textContent = T("Enregistré à " + heure(d.motTs) + "."); }
  if (el.id === "msg") { var a = $("#msg-wa"); if (a) a.href = waLink(telPresent(), el.value); }
  if (el.id === "retour") { S.vu.retour = el.value; save(); var r = $("#retour-wa"); if (r) r.href = waLink("", texteRetour()); }
});
/* Changer de ville : le soleil, le thème et les horaires se recalculent tout de suite. */
document.addEventListener("change", function (e) {
  var el = e.target;
  if (el && el.getAttribute && el.getAttribute("data-profil") === "lieu") { S.profil.lieu = el.value; delete S.profil.geo; save(); appliquerTheme(); render(); var again = document.getElementById("p-lieu"); if (again) again.focus({ preventScroll: true }); }
});
document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!$("#show").hidden) closeShow(); else closeSheet(); } });
/* Une miniature YouTube qui ne charge pas laisse simplement place au bouton lecture. */
document.addEventListener("error", function (e) { var t = e.target; if (t && t.classList && t.classList.contains("vimg")) t.remove(); }, true);
window.addEventListener("hashchange", function () { closeSheet(); closeShow(); editDelegue = false; editMessages = false; render(true); if (!versAncre()) window.scrollTo(0, 0); });
document.addEventListener("visibilitychange", function () { if (!document.hidden) { appliquerTheme(); if (route().name === "aujourdhui" && S.onboarded) render(); } });
/* L'heure et la lumière se mettent à jour toutes seules. */
setInterval(function () {
  appliquerTheme();
  var c = $("#clock"); if (c) c.textContent = T(heure(Date.now()));
  var s = $("#sun"); if (s) s.textContent = phraseSoleil();
  var pr = $("#prieres"); if (pr) { pr.innerHTML = prieresHTML(); typo(pr); }
}, 30000);

/* L'appli gère elle-même le défilement : chaque écran s'ouvre en haut. */
try { history.scrollRestoration = "manual"; } catch (e) {}
appliquerMouvement();
try { window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", appliquerMouvement); } catch (e) {}
appliquerTheme();
render(true);
window.addEventListener("resize", majTabs);
/* Le service worker met l'appli en réserve : elle s'ouvre ensuite sans connexion. Pas sur file:// ni dans un aperçu. */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
})();

/* Hors artefact (aperçu dans une conversation, fichier ouvert dans un cadre isolé), un lien « #écran » viserait la page hôte.
   On change l'ancre nous-mêmes : la navigation reste dans l'appli. */
document.addEventListener("click", function (e) {
  var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  var h = a.getAttribute("href");
  try {
    if (location.hash !== h) location.hash = h;
    else window.dispatchEvent(new Event("hashchange"));
  } catch (err) {}
}, false);
