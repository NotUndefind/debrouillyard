/* ==========================================================
   DONNÉES DU SITE — c'est ici qu'on modifie les infos.

   PHOTOS : dépose la photo dans « Logo & photos participants »
   en la nommant avec l'identifiant (champ `id`), ex. lucas.jpg,
   puis double-clique sur « outils/Préparer les photos.command ».
   Elle est recadrée, compressée, nettoyée de ses métadonnées (GPS…)
   et copiée dans site/assets/img/participants/.
   Sans photo, une pastille avec l'initiale s'affiche.

   ⚠️ Les ids ne doivent contenir que des minuscules, chiffres et tirets.
   ========================================================== */

window.EVENT = {
  name: "La Débrouill'Yard",
  // Départ du Tour 1 : samedi 30 janvier 2027, 12h00 (heure de Paris, UTC+1)
  start: "2027-01-30T12:00:00+01:00",
  loopKm: 6.706,
  place: "Salle Jeanne d'Arc",
  town: "La Neuville-en-Tourne-à-Fuy (Ardennes)",
  maxRunners: 25,
};

window.PHOTO_DIR = "assets/img/participants/";

window.PARTICIPANTS = [
  { id: "lucas",      name: "Lucas" },
  { id: "teo",        name: "Téo" },
  { id: "matthieu",   name: "Matthieu" },
  { id: "jules",      name: "Jules" },
  { id: "pierre",     name: "Pierre", note: "Vespa" },
  { id: "remi",       name: "Rémi" },
  { id: "augustin",   name: "Augustin" },
  { id: "corentin",   name: "Corentin" },
  { id: "manon",      name: "Manon" },
  { id: "ysaline",    name: "Ysaline" },
  { id: "lea",        name: "Léa" },
  { id: "bastien",    name: "Bastien" },
  { id: "joris",      name: "Joris" },
  { id: "gonzague",   name: "Gonzague" },
  { id: "hugo",       name: "Hugo" },
  { id: "noemie",     name: "Noémie" },
  { id: "maxime",     name: "Maxime" },
  { id: "arsene",     name: "Arsène" },
  // TODO : remplacer par son prénom
  { id: "invitee-maxime", name: "Invitée de Maxime" },
  { id: "alexandre",  name: "Alexandre" },
  { id: "maurin",     name: "Maurin" },
  { id: "kdcoaching", name: "Kdcoaching" },
  { id: "jeje",       name: "Jéjé" },
  { id: "guillaume",  name: "Guillaume" },
  { id: "baptiste",   name: "Baptiste" },
];
