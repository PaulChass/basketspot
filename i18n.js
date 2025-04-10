import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traductions pour chaque langue
const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      availableCourts: 'Available Courts',
      addCourt: 'Add a Court',
      courtNamePlaceholder: 'Court Name',
      createCourt: 'Create Court',
      playersPresent: '{{count}} player present',
      playersPresent_plural: '{{count}} players present',
      distance: 'At {{distance}} from you',
      view: 'View',
      courtName: 'Court Name',
      playersList: 'Players Present / Coming:',
      playerNamePlaceholder: 'Player Name',
      addNow: 'I am here now',
      addAtTime: 'I will come at',
      removePlayer: 'Remove Player',
    },
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      availableCourts: 'Terrains disponibles',
      addCourt: 'Ajouter un terrain',
      courtNamePlaceholder: 'Nom du terrain',
      createCourt: 'Créer un terrain',
      playersPresent: '{{count}} joueur présent',
      playersPresent_plural: '{{count}} joueurs présents',
      distance: 'À {{distance}} de vous',
      view: 'Voir',
      courtName: 'Nom du terrain',
      playersList: 'Joueurs présents / à venir :',
      playerNamePlaceholder: 'Nom du joueur',
      addNow: 'Je suis là maintenant',
      addAtTime: 'Je viendrai à',
      removePlayer: 'Supprimer le joueur',
    },
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      availableCourts: 'Canchas disponibles',
      addCourt: 'Agregar una cancha',
      courtNamePlaceholder: 'Nombre de la cancha',
      createCourt: 'Crear cancha',
      playersPresent: '{{count}} jugador presente',
      playersPresent_plural: '{{count}} jugadores presentes',
      distance: 'A {{distance}} de ti',
      view: 'Ver',
      courtName: 'Nombre de la cancha',
      playersList: 'Jugadores presentes / por venir:',
      playerNamePlaceholder: 'Nombre del jugador',
      addNow: 'Estoy aquí ahora',
      addAtTime: 'Llegaré a',
      removePlayer: 'Eliminar jugador',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', 
  fallbackLng: 'en', 
  interpolation: {
    escapeValue: false, // React gère déjà l'échappement des valeurs
  },
});

export default i18n;