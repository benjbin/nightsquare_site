// Night Square - Translation System

const translations = {
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      howItWorks: 'Comment ça marche',
      events: 'Événements',
      organizers: 'Organisateurs',
      download: 'Télécharger',
      login: 'Se connecter',
      signup: 'Inscription'
    },
    auth: {
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      name: 'Nom',
      withApple: 'Continuer avec Apple',
      withGoogle: 'Continuer avec Google',
      orEmail: 'ou continuer avec email',
      login: {
        title: 'Se connecter',
        subtitle: 'Accédez à votre compte Night Square',
        submit: 'Se connecter',
        noAccount: 'Pas encore de compte ?',
        link: 'Se connecter'
      },
      signup: {
        title: 'Inscription',
        subtitle: 'Créez votre compte Night Square',
        submit: "S'inscrire",
        hasAccount: 'Déjà un compte ?',
        link: "S'inscrire"
      }
    },
    // Homepage
    home: {
      hero: {
        title: 'Night Square',
        subtitle: 'Réservation de tables premium et accès à des événements exclusifs',
        cta: 'Télécharger l\'application'
      },
      whatIs: {
        title: 'Qu\'est-ce que Night Square ?',
        tableReservation: {
          title: 'Réservation de tables premium',
          description: 'Accédez aux meilleures tables des clubs les plus exclusifs'
        },
        exclusiveEvents: {
          title: 'Événements exclusifs',
          description: 'Accès privilégié aux soirées et événements les plus sélects'
        },
        personalized: {
          title: 'Expérience personnalisée',
          description: 'Un service sur mesure adapté à vos préférences'
        }
      },
      howItWorks: {
        title: 'Comment ça marche',
        step1: {
          title: 'Choisir un événement',
          description: 'Parcourez notre sélection d\'événements premium'
        },
        step2: {
          title: 'Réserver une table ou un accès',
          description: 'Sélectionnez votre option et finalisez votre réservation'
        },
        step3: {
          title: 'Vivre l\'expérience',
          description: 'Profitez de votre soirée avec un accès fluide et sécurisé'
        }
      },
      why: {
        title: 'Pourquoi Night Square ?',
        fluidity: {
          title: 'Fluidité',
          description: 'Réservation en quelques clics, sans friction'
        },
        security: {
          title: 'Sécurité',
          description: 'Paiements sécurisés et transactions protégées'
        },
        centralization: {
          title: 'Centralisation',
          description: 'Tous vos événements et réservations en un seul endroit'
        }
      },
      trust: {
        title: 'Ils nous font confiance',
        subtitle: 'Des organisateurs premium qui utilisent Night Square'
      },
      cities: {
        title: 'Nos destinations',
        description: 'Découvrez Night Square dans les villes les plus exclusives'
      },
      cta: {
        title: 'Prêt à vivre l\'expérience Night Square ?',
        subtitle: 'Téléchargez l\'application dès maintenant'
      }
    },
    // How it works page
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'Un processus simple et sécurisé pour vos réservations',
      userJourney: {
        title: 'Parcours utilisateur',
        description: 'Découvrez comment réserver en quelques étapes simples'
      },
      tableVsTicket: {
        title: 'Table ou Ticket ?',
        table: {
          title: 'Réservation de table',
          description: 'Réservez une table complète pour votre groupe. Idéal pour une expérience VIP exclusive.'
        },
        ticket: {
          title: 'Accès événement',
          description: 'Accédez à l\'événement avec un ticket individuel. Parfait pour profiter de la soirée.'
        }
      },
      payment: {
        title: 'Paiement flexible',
        description: 'Paiement sécurisé en plusieurs fois disponible. Partagez les frais avec votre groupe facilement.'
      },
      qrCode: {
        title: 'Accès événement',
        description: 'Recevez votre QR code après réservation. Présentez-le à l\'entrée pour un accès fluide.'
      }
    },
    // Events page
    events: {
      title: 'Événements & Expériences',
      subtitle: 'Découvrez notre sélection d\'événements exclusifs',
      types: {
        clubs: 'Clubs',
        privateRooms: 'Salles privées',
        festivals: 'Festivals'
      },
      cta: 'Réserver dans l\'application'
    },
    // Organizers page
    organizers: {
      hero: {
        title: 'The all-in-one platform built for nightlife organizers',
        subtitle: 'Manage events, tables, teams, payments and clients — all in one place.',
        ctaDemo: 'Request a demo',
        ctaContact: 'Contact us'
      },
      painPoints: {
        title: 'Les défis actuels de la gestion d\'événements',
        subtitle: 'Outils dispersés, manque de visibilité, coordination complexe',
        toolDispersion: {
          title: 'Outils dispersés',
          description: 'Excel pour les tables, WhatsApp pour la coordination, billetterie séparée... Tout est éparpillé et difficile à synchroniser.'
        },
        visibility: {
          title: 'Manque de visibilité',
          description: 'Pas de vision en temps réel des entrées, des tables occupées ou des réservations. Vous naviguez à l\'aveugle le soir même.'
        },
        data: {
          title: 'Data client inexploitée',
          description: 'Vos clients réservent mais vous ne connaissez pas leurs préférences. Impossible de créer des campagnes ciblées ou de fidéliser.'
        },
        coordination: {
          title: 'Coordination d\'équipe',
          description: 'Le soir même, la coordination entre managers, chefs de rang et scanneurs devient chaotique sans outil centralisé.'
        }
      },
      solution: {
        title: 'La solution Night Square',
        subtitle: 'Un écosystème de gestion complet pensé spécifiquement pour le monde de la nuit',
        text: 'Night Square n\'est pas une simple billetterie ou une app grand public basique. C\'est l\'équivalent d\'un ERP / Odoo adapté au nightlife — une plateforme centralisée utilisée en conditions réelles pour gérer soirées, flux et équipes.'
      },
      pillars: {
        title: 'Les 4 piliers de Night Square',
        subtitle: 'Une solution complète pour chaque aspect de votre activité',
        backoffice: {
          title: 'BackOffice Organisateur',
          features: [
            'Gestion des événements',
            'Tables & billets',
            'Suivi des réservations',
            'Gestion des stocks',
            'Reporting & chiffres clés',
            'Données clients exploitables'
          ]
        },
        manager: {
          title: 'Application Manager (équipes)',
          features: [
            'Rôles par membre : manager, chef de rang, scanneur',
            'Suivi en temps réel : entrées, tables, statuts clients',
            'Coordination fluide pendant l\'événement'
          ]
        },
        user: {
          title: 'Application Utilisateur',
          features: [
            'Réservation table ou ticket',
            'Multi-paiement',
            'Invitations clients',
            'QR codes synchronisés',
            'Expérience premium sans friction'
          ]
        },
        data: {
          title: 'Data & Marketing',
          features: [
            'Segmentation clients',
            'Campagnes ciblées (SMS / notifications)',
            'Recommandations basées sur les données',
            'Fidélisation long terme'
          ]
        }
      },
      benefits: {
        title: 'Bénéfices concrets pour votre activité',
        subtitle: 'Des résultats mesurables qui transforment votre business',
        time: {
          title: 'Gain de temps opérationnel',
          description: 'Centralisez tous vos outils en un seul endroit. Fini les allers-retours entre Excel, WhatsApp et votre billetterie.'
        },
        organization: {
          title: 'Meilleure organisation sur site',
          description: 'Coordination fluide entre vos équipes le soir même. Vision en temps réel de toutes les opérations.'
        },
        experience: {
          title: 'Meilleure expérience client',
          description: 'Réservations fluides, QR codes synchronisés, expérience premium qui fidélise vos clients.'
        },
        revenue: {
          title: 'Augmentation du panier moyen',
          description: 'Recommandations intelligentes et campagnes ciblées qui augmentent vos revenus par client.'
        },
        vision: {
          title: 'Vision claire du chiffre d\'affaires',
          description: 'Reporting complet : tables + billets + bar (si intégré). Tout votre CA en un coup d\'œil.'
        },
        growth: {
          title: 'Croissance durable',
          description: 'Exploitez vos données clients pour créer des campagnes qui génèrent des revenus récurrents.'
        }
      },
      target: {
        title: 'Pour qui ?',
        subtitle: 'Night Square s\'adapte à tous les types d\'organisateurs',
        clubs: {
          title: 'Clubs',
          description: 'Gérez vos soirées récurrentes, vos résidences et vos événements spéciaux depuis une seule plateforme.'
        },
        residences: {
          title: 'Résidences',
          description: 'Coordonnez vos événements réguliers avec une solution pensée pour la récurrence et la fidélisation.'
        },
        oneShot: {
          title: 'Événements one-shot',
          description: 'Organisez vos événements ponctuels avec tous les outils nécessaires, même pour une seule soirée.'
        },
        festivals: {
          title: 'Festivals',
          description: 'Gérez plusieurs jours d\'événements, plusieurs scènes et des milliers de participants.'
        },
        premium: {
          title: 'Lieux premium',
          description: 'Offrez une expérience VIP à vos clients avec une plateforme à la hauteur de vos standards.'
        },
        collectives: {
          title: 'Collectifs & Producteurs',
          description: 'Coordonnez vos équipes et gérez vos événements avec des outils professionnels adaptés.'
        }
      },
      finalCta: {
        title: 'Prêt à transformer la gestion de vos événements ?',
        subtitle: 'Découvrez comment Night Square peut s\'adapter à votre structure',
        ctaDemo: 'Request a demo',
        ctaTalk: 'Talk to our team',
        reassurance: [
          'Solution déjà opérationnelle',
          'Adaptable à chaque structure',
          'Accompagnement inclus'
        ]
      }
    },
    // Download page
    download: {
      title: 'Téléchargez Night Square',
      subtitle: 'Disponible sur iOS et Android',
      benefits: {
        title: 'Pourquoi télécharger ?',
        benefit1: 'Accès aux meilleures tables',
        benefit2: 'Événements exclusifs',
        benefit3: 'Réservation en quelques clics',
        benefit4: 'Paiement sécurisé'
      },
      legal: {
        terms: 'Conditions d\'utilisation',
        privacy: 'Politique de confidentialité',
        copyright: '© 2024 Night Square. Tous droits réservés.'
      }
    },
    // Footer
    footer: {
      about: 'À propos',
      legal: 'Légal',
      contact: 'Contact',
      follow: 'Suivez-nous'
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      howItWorks: 'How it works',
      events: 'Events',
      organizers: 'Organizers',
      download: 'Download',
      login: 'Log in',
      signup: 'Sign up'
    },
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      name: 'Name',
      withApple: 'Continue with Apple',
      withGoogle: 'Continue with Google',
      orEmail: 'or continue with email',
      login: {
        title: 'Log in',
        subtitle: 'Access your Night Square account',
        submit: 'Log in',
        noAccount: "Don't have an account?",
        link: 'Log in'
      },
      signup: {
        title: 'Sign up',
        subtitle: 'Create your Night Square account',
        submit: 'Sign up',
        hasAccount: 'Already have an account?',
        link: 'Sign up'
      }
    },
    // Homepage
    home: {
      hero: {
        title: 'Night Square',
        subtitle: 'Premium table reservations and access to exclusive events',
        cta: 'Download the app'
      },
      whatIs: {
        title: 'What is Night Square?',
        tableReservation: {
          title: 'Premium table reservations',
          description: 'Access the best tables at the most exclusive clubs'
        },
        exclusiveEvents: {
          title: 'Exclusive events',
          description: 'Privileged access to the most select parties and events'
        },
        personalized: {
          title: 'Personalized experience',
          description: 'A tailored service adapted to your preferences'
        }
      },
      howItWorks: {
        title: 'How it works',
        step1: {
          title: 'Choose an event',
          description: 'Browse our selection of premium events'
        },
        step2: {
          title: 'Reserve a table or access',
          description: 'Select your option and finalize your reservation'
        },
        step3: {
          title: 'Live the experience',
          description: 'Enjoy your night with smooth and secure access'
        }
      },
      why: {
        title: 'Why Night Square?',
        fluidity: {
          title: 'Fluidity',
          description: 'Reservation in a few clicks, without friction'
        },
        security: {
          title: 'Security',
          description: 'Secure payments and protected transactions'
        },
        centralization: {
          title: 'Centralization',
          description: 'All your events and reservations in one place'
        }
      },
      trust: {
        title: 'They trust us',
        subtitle: 'Premium organizers who use Night Square'
      },
      cities: {
        title: 'Our destinations',
        description: 'Discover Night Square in the most exclusive cities'
      },
      cta: {
        title: 'Ready to experience Night Square?',
        subtitle: 'Download the app now'
      }
    },
    // How it works page
    howItWorks: {
      title: 'How it works',
      subtitle: 'A simple and secure process for your reservations',
      userJourney: {
        title: 'User journey',
        description: 'Discover how to book in a few simple steps'
      },
      tableVsTicket: {
        title: 'Table or Ticket?',
        table: {
          title: 'Table reservation',
          description: 'Reserve a complete table for your group. Ideal for an exclusive VIP experience.'
        },
        ticket: {
          title: 'Event access',
          description: 'Access the event with an individual ticket. Perfect for enjoying the night.'
        }
      },
      payment: {
        title: 'Flexible payment',
        description: 'Secure payment in installments available. Share costs with your group easily.'
      },
      qrCode: {
        title: 'Event access',
        description: 'Receive your QR code after reservation. Present it at the entrance for smooth access.'
      }
    },
    // Events page
    events: {
      title: 'Events & Experiences',
      subtitle: 'Discover our selection of exclusive events',
      types: {
        clubs: 'Clubs',
        privateRooms: 'Private rooms',
        festivals: 'Festivals'
      },
      cta: 'Book in the app'
    },
    // Organizers page
    organizers: {
      hero: {
        title: 'The all-in-one platform built for nightlife organizers',
        subtitle: 'Manage events, tables, teams, payments and clients — all in one place.',
        ctaDemo: 'Request a demo',
        ctaContact: 'Contact us'
      },
      painPoints: {
        title: 'Current event management challenges',
        subtitle: 'Scattered tools, lack of visibility, complex coordination',
        toolDispersion: {
          title: 'Scattered tools',
          description: 'Excel for tables, WhatsApp for coordination, separate ticketing... Everything is scattered and hard to synchronize.'
        },
        visibility: {
          title: 'Lack of visibility',
          description: 'No real-time view of entries, occupied tables or reservations. You\'re navigating blind on the night itself.'
        },
        data: {
          title: 'Unexploited customer data',
          description: 'Your customers book but you don\'t know their preferences. Impossible to create targeted campaigns or build loyalty.'
        },
        coordination: {
          title: 'Team coordination',
          description: 'On the night itself, coordination between managers, head waiters and scanners becomes chaotic without a centralized tool.'
        }
      },
      solution: {
        title: 'The Night Square solution',
        subtitle: 'A complete management ecosystem designed specifically for the nightlife world',
        text: 'Night Square is not just a simple ticketing system or a basic consumer app. It\'s the equivalent of an ERP / Odoo adapted for nightlife — a centralized platform used in real conditions to manage parties, flows and teams.'
      },
      pillars: {
        title: 'The 4 pillars of Night Square',
        subtitle: 'A complete solution for every aspect of your business',
        backoffice: {
          title: 'Organizer BackOffice',
          features: [
            'Event management',
            'Tables & tickets',
            'Reservation tracking',
            'Stock management',
            'Reporting & key figures',
            'Exploitable customer data'
          ]
        },
        manager: {
          title: 'Manager App (teams)',
          features: [
            'Roles per member: manager, head waiter, scanner',
            'Real-time tracking: entries, tables, customer statuses',
            'Smooth coordination during events'
          ]
        },
        user: {
          title: 'User Application',
          features: [
            'Table or ticket reservation',
            'Multi-payment',
            'Customer invitations',
            'Synchronized QR codes',
            'Premium frictionless experience'
          ]
        },
        data: {
          title: 'Data & Marketing',
          features: [
            'Customer segmentation',
            'Targeted campaigns (SMS / notifications)',
            'Data-based recommendations',
            'Long-term loyalty'
          ]
        }
      },
      benefits: {
        title: 'Concrete benefits for your business',
        subtitle: 'Measurable results that transform your business',
        time: {
          title: 'Operational time savings',
          description: 'Centralize all your tools in one place. No more back and forth between Excel, WhatsApp and your ticketing system.'
        },
        organization: {
          title: 'Better on-site organization',
          description: 'Smooth coordination between your teams on the night itself. Real-time view of all operations.'
        },
        experience: {
          title: 'Better customer experience',
          description: 'Smooth reservations, synchronized QR codes, premium experience that builds customer loyalty.'
        },
        revenue: {
          title: 'Increased average basket',
          description: 'Smart recommendations and targeted campaigns that increase your revenue per customer.'
        },
        vision: {
          title: 'Clear view of revenue',
          description: 'Complete reporting: tables + tickets + bar (if integrated). All your revenue at a glance.'
        },
        growth: {
          title: 'Sustainable growth',
          description: 'Leverage your customer data to create campaigns that generate recurring revenue.'
        }
      },
      target: {
        title: 'For whom?',
        subtitle: 'Night Square adapts to all types of organizers',
        clubs: {
          title: 'Clubs',
          description: 'Manage your recurring parties, residencies and special events from a single platform.'
        },
        residences: {
          title: 'Residencies',
          description: 'Coordinate your regular events with a solution designed for recurrence and loyalty.'
        },
        oneShot: {
          title: 'One-shot events',
          description: 'Organize your one-time events with all the necessary tools, even for a single night.'
        },
        festivals: {
          title: 'Festivals',
          description: 'Manage multiple days of events, multiple stages and thousands of participants.'
        },
        premium: {
          title: 'Premium venues',
          description: 'Offer a VIP experience to your customers with a platform that matches your standards.'
        },
        collectives: {
          title: 'Collectives & Producers',
          description: 'Coordinate your teams and manage your events with professional adapted tools.'
        }
      },
      finalCta: {
        title: 'Ready to transform your event management?',
        subtitle: 'Discover how Night Square can adapt to your structure',
        ctaDemo: 'Request a demo',
        ctaTalk: 'Talk to our team',
        reassurance: [
          'Already operational solution',
          'Adaptable to each structure',
          'Support included'
        ]
      }
    },
    // Download page
    download: {
      title: 'Download Night Square',
      subtitle: 'Available on iOS and Android',
      benefits: {
        title: 'Why download?',
        benefit1: 'Access to the best tables',
        benefit2: 'Exclusive events',
        benefit3: 'Reservation in a few clicks',
        benefit4: 'Secure payment'
      },
      legal: {
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        copyright: '© 2024 Night Square. All rights reserved.'
      }
    },
    // Footer
    footer: {
      about: 'About',
      legal: 'Legal',
      contact: 'Contact',
      follow: 'Follow us'
    }
  },
  de: {
    // Navigation
    nav: {
      home: 'Startseite',
      howItWorks: 'So funktioniert es',
      events: 'Veranstaltungen',
      organizers: 'Veranstalter',
      download: 'Herunterladen',
      login: 'Anmelden',
      signup: 'Registrieren'
    },
    auth: {
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      name: 'Name',
      withApple: 'Mit Apple fortfahren',
      withGoogle: 'Mit Google fortfahren',
      orEmail: 'oder mit E-Mail fortfahren',
      login: {
        title: 'Anmelden',
        subtitle: 'Zugang zu Ihrem Night-Square-Konto',
        submit: 'Anmelden',
        noAccount: 'Noch kein Konto?',
        link: 'Anmelden'
      },
      signup: {
        title: 'Registrieren',
        subtitle: 'Night-Square-Konto erstellen',
        submit: 'Registrieren',
        hasAccount: 'Bereits ein Konto?',
        link: 'Registrieren'
      }
    },
    // Homepage
    home: {
      hero: {
        title: 'Night Square',
        subtitle: 'Premium-Tischreservierung und Zugang zu exklusiven Veranstaltungen',
        cta: 'App herunterladen'
      }
    }
  },
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      howItWorks: 'Cómo funciona',
      events: 'Eventos',
      organizers: 'Organizadores',
      download: 'Descargar',
      login: 'Iniciar sesión',
      signup: 'Registrarse'
    },
    auth: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      name: 'Nombre',
      withApple: 'Continuar con Apple',
      withGoogle: 'Continuar con Google',
      orEmail: 'o continuar con correo',
      login: {
        title: 'Iniciar sesión',
        subtitle: 'Accede a tu cuenta Night Square',
        submit: 'Iniciar sesión',
        noAccount: '¿No tienes cuenta?',
        link: 'Iniciar sesión'
      },
      signup: {
        title: 'Registrarse',
        subtitle: 'Crea tu cuenta Night Square',
        submit: 'Registrarse',
        hasAccount: '¿Ya tienes cuenta?',
        link: 'Registrarse'
      }
    },
    // Homepage
    home: {
      hero: {
        title: 'Night Square',
        subtitle: 'Reserva de mesas premium y acceso a eventos exclusivos',
        cta: 'Descargar la aplicación'
      }
    }
  }
};

// Language management
let currentLang = localStorage.getItem('nightSquareLang') || 'fr';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('nightSquareLang', lang);
  updatePageContent();
  updateLanguageButtons();
}

function getTranslation(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Fallback to key if translation not found
    }
  }
  
  return value;
}

function updateLanguageButtons() {
  // Update dropdown options
  document.querySelectorAll('.lang-option').forEach(option => {
    if (option.dataset.lang === currentLang) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Update dropdown toggle if exists
  const langDropdownToggle = document.getElementById('lang-dropdown-toggle');
  if (langDropdownToggle) {
    const currentLangData = {
      fr: { flag: '🇫🇷', code: 'FR' },
      en: { flag: '🇬🇧', code: 'EN' },
      de: { flag: '🇩🇪', code: 'DE' },
      es: { flag: '🇪🇸', code: 'ES' }
    };
    
    const langData = currentLangData[currentLang] || currentLangData.fr;
    const flagSpan = langDropdownToggle.querySelector('.lang-flag');
    const codeSpan = langDropdownToggle.querySelector('.lang-code');
    
    if (flagSpan) flagSpan.textContent = langData.flag;
    if (codeSpan) codeSpan.textContent = langData.code;
  }
}

function updatePageContent() {
  // This will be called by each page to update its content
  const event = new CustomEvent('languageChanged', { detail: { lang: currentLang } });
  document.dispatchEvent(event);
}
