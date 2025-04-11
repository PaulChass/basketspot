import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization'; // Import expo-localization

// Detect the user's locale
const userLocale = Localization.locale.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')

// Define translations
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
      addNow: 'Here now',
      addAtTime: 'Will come at',
      removePlayer: 'Remove Player',
      explore: 'Explore',
      allowPresenceDetection: 'Allow Presence Detection',
      presenceDetectionAllowed: 'Presence Detection Allowed',
      username: 'Username',
      enterUsername: 'Enter your username',
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
      addNow: 'Là maintenant',
      addAtTime: 'Viendra à',
      removePlayer: 'Supprimer le joueur',
      explore: 'Explorer',
      allowPresenceDetection: 'Autoriser la détection de présence',
      presenceDetectionAllowed: 'Détection de présence autorisée',
      username: 'Nom d\'utilisateur',
      enterUsername: 'Entrez votre nom d\'utilisateur',
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
      addNow: 'Aquí ahora',
      addAtTime: 'Vendrá a',
      removePlayer: 'Eliminar jugador',
      explore: 'Explorar',
      allowPresenceDetection: 'Permitir detección de presencia',
      presenceDetectionAllowed: 'Detección de presencia permitida',
      username: 'Nombre de usuario',
      enterUsername: 'Ingrese su nombre de usuario',
    },
  },
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: userLocale, // Set the default language based on the user's locale
  fallbackLng: 'en', // Fallback to English if the user's locale is not supported
  interpolation: {
    escapeValue: false, // React already handles escaping
  },
});

export default i18n;