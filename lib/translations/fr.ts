import type { Translations } from './types';

export const fr: Translations = {
  // Core App
  title: 'Photomaton',
  description:
    'Prenez une photo avec des autocollants, créez une bande de compte à rebours, ou capturez une bande chronométrée !',
  camera: 'Caméra',
  edit: 'Modifier',
  strip: 'Bande',
  gallery: 'Galerie',
  chooseLayout: 'Choisir la disposition :',
  takePhoto: 'Prendre une photo',
  countdownStrip: 'Bande de compte à rebours',
  timedStrip: 'Bande chronométrée',
  stickers: 'Autocollants :',
  takeNewPhoto: 'Prendre une nouvelle photo',
  saveToGallery: 'Enregistrer dans la galerie',
  download: 'Télécharger',
  downloading: 'Téléchargement...',
  saving: 'Enregistrement...',
  takeNewStrip: 'Prendre une nouvelle bande',
  downloadStrip: 'Télécharger la bande',
  galleryEmpty: 'Votre galerie est vide. Prenez quelques photos !',
  view: 'Voir',
  delete: 'Supprimer',
  processing: 'Traitement...',
  createMoment: 'Cela peut prendre un moment',
  nextPhotoIn: 'Prochaine photo dans',
  photoComplete: 'Photo terminée !',
  stripComplete: 'Bande terminée !',
  errorTitle: 'Erreur',
  errorDescription: 'Il y a eu un problème. Veuillez réessayer.',
  cameraError:
    "Impossible d'accéder à la caméra. Veuillez vous assurer d'avoir accordé les permissions de caméra.",
  photoSaved: 'Votre photo a été enregistrée dans la galerie.',
  photoDeleted: 'La photo a été supprimée de votre galerie.',
  downloadStarted: 'Votre photo est en cours de téléchargement.',
  timedCaptureStarted: 'photos, une toutes les 5 secondes.',
  photos: 'photos',
  photo: 'photo',

  // Navigation
  backToPhotoBooth: 'Retour au Photomaton',

  // Support Page
  supportCenter: 'Centre de support',
  supportDescription: "Obtenez de l'aide avec l'application Photomaton",
  faqTitle: 'Questions fréquemment posées',
  contactForm: 'Formulaire de contact',
  contactFormDescription: 'Envoyez-nous un message et nous vous répondrons dès que possible.',
  contactDirect: 'Email direct',
  contactDirectDescription: 'Vous pouvez également nous contacter directement à :',
  yourName: 'Votre nom',
  yourEmail: 'Votre email',
  subject: 'Sujet',
  message: 'Message',
  send: 'Envoyer',
  sending: 'Envoi...',
  emailSent: 'Votre message a été envoyé avec succès !',
  emailError: "Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer.",
  emailRequired: 'Email requis',
  messageRequired: 'Message requis',
  nameRequired: 'Nom requis',
  subjectRequired: 'Sujet requis',
  directEmail: 'support@photobooth.app',

  // FAQ Items
  faqQuestion1: 'Comment prendre une photo ?',
  faqAnswer1:
    'Cliquez sur le bouton "Prendre une photo" et autorisez l\'accès à votre caméra. Positionnez-vous et cliquez sur le bouton de capture.',
  faqQuestion2: 'Comment ajouter des autocollants ?',
  faqAnswer2:
    'Après avoir pris une photo, vous pouvez sélectionner des autocollants dans le panneau latéral et les faire glisser sur votre photo.',
  faqQuestion3: "Qu'est-ce qu'une bande photo ?",
  faqAnswer3:
    'Une bande photo est une série de 4 photos prises en séquence, soit avec un compte à rebours, soit automatiquement toutes les 5 secondes.',
  faqQuestion4: 'Comment télécharger mes photos ?',
  faqAnswer4:
    'Vous pouvez télécharger vos photos individuellement ou en tant que bande depuis la galerie en cliquant sur le bouton "Télécharger".',
  faqQuestion5: 'Mes photos sont-elles stockées en ligne ?',
  faqAnswer5:
    'Non, toutes vos photos sont stockées localement dans votre navigateur et ne sont jamais téléchargées vers nos serveurs.',

  // Privacy Page
  privacyPolicy: 'Politique de confidentialité',
  privacyLastUpdated: 'Dernière mise à jour : {date}',
  privacyIntro:
    'Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application Photomaton.',
  privacyInfoCollection: "Collecte d'informations",
  privacyInfoCollectionText:
    'Nous collectons uniquement les informations que vous fournissez volontairement, telles que votre nom et votre adresse email lorsque vous nous contactez via notre formulaire de support.',
  privacyInfoUse: 'Utilisation des informations',
  privacyInfoUseText:
    'Nous utilisons vos informations uniquement pour répondre à vos demandes de support et améliorer notre service. Nous ne vendons ni ne partageons vos informations personnelles avec des tiers.',
  privacyDataStorage: 'Stockage des données',
  privacyDataStorageText:
    "Toutes les photos prises avec l'application sont stockées localement sur votre appareil. Nous n'avons pas accès à vos photos et elles ne sont jamais téléchargées vers nos serveurs.",
  privacyThirdParty: 'Services tiers',
  privacyThirdPartyText:
    "Nous n'utilisons aucun service tiers de suivi ou d'analyse. Votre vie privée est notre priorité.",
  privacyUserRights: 'Vos droits',
  privacyUserRightsText:
    "Vous avez le droit d'accéder, de modifier ou de supprimer toute information personnelle que nous pourrions avoir. Contactez-nous pour exercer ces droits.",
  privacyChanges: 'Modifications de cette politique',
  privacyChangesText:
    'Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page.',
  privacyContact: 'Nous contacter',
  privacyContactText:
    'Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à support@photobooth.app.',

  // Terms Page
  termsOfService: "Conditions d'utilisation",
  termsLastUpdated: 'Dernière mise à jour : {date}',
  termsIntro:
    "En utilisant notre application Photomaton, vous acceptez d'être lié par ces conditions d'utilisation.",
  termsAcceptance: 'Acceptation des conditions',
  termsAcceptanceText:
    "En accédant à et en utilisant cette application, vous acceptez d'être lié par ces conditions d'utilisation et notre politique de confidentialité.",
  termsUse: "Utilisation de l'application",
  termsUseText:
    "Vous pouvez utiliser cette application à des fins personnelles et non commerciales. Vous ne devez pas utiliser l'application de manière à violer les lois locales ou nationales.",
  termsContent: 'Contenu utilisateur',
  termsContentText:
    'Vous conservez tous les droits sur le contenu que vous créez avec cette application. Nous ne revendiquons aucun droit sur vos photos ou autre contenu.',
  termsPrivacy: 'Confidentialité',
  termsPrivacyText:
    'Votre vie privée est importante pour nous. Veuillez consulter notre politique de confidentialité pour comprendre comment nous traitons vos informations.',
  termsLimitations: 'Limitation de responsabilité',
  termsLimitationsText:
    "Cette application est fournie \"en l'état\" sans garantie d'aucune sorte. Nous ne serons pas responsables des dommages résultant de l'utilisation de cette application.",
  termsModifications: 'Modifications des conditions',
  termsModificationsText:
    'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet immédiatement après leur publication.',
  termsGoverning: 'Droit applicable',
  termsGoverningText:
    'Ces conditions sont régies par les lois du pays où nous opérons, sans égard aux conflits de dispositions légales.',
  termsContactInfo: 'Informations de contact',
  termsContactInfoText:
    'Si vous avez des questions concernant ces conditions, veuillez nous contacter à support@photobooth.app.',

  // Missing translations
  stripCompleteEdit: 'Modifier la bande',
  preview: 'Aperçu',
  retake: 'Reprendre',
  retryCamera: 'Réessayer la caméra',
  capturing: 'Capture en cours...',
  clearStickers: 'Effacer les autocollants',
  noPhotoTaken: 'Aucune photo prise',
  takePhotoFirst: "Prenez d'abord une photo",
  clearStrip: 'Effacer la bande',
  addToStrip: 'Ajouter à la bande',
  backgroundsFrames: 'Arrière-plans et Cadres',
};
