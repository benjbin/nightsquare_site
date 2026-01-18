// Night Square - Main JavaScript

// Global translation update function
function updateTranslations() {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = getTranslation(key);
    if (translation && translation !== key) {
      element.textContent = translation;
    }
  });
}

// Scroll Reveal Animations - Premium
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });
}

// Navigation Active Section Indicator
function initActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  function updateActiveNav() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

// Header Scroll Effect
function initHeaderScroll() {
  const header = document.querySelector('header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  // Initialize premium features
  initScrollReveal();
  initActiveNavigation();
  initHeaderScroll();
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (navLinks.classList.contains('active') &&
          !navLinks.contains(event.target) && 
          !mobileMenuToggle.contains(event.target)) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      }
    });
    
    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      });
    });
  }
  
  // Language dropdown
  const langDropdownToggle = document.getElementById('lang-dropdown-toggle');
  const langDropdownMenu = document.getElementById('lang-dropdown-menu');
  const langOptions = document.querySelectorAll('.lang-option');
  
  // Update dropdown toggle based on current language
  function updateLangDropdownToggle() {
    if (!langDropdownToggle) return;
    
    const currentLangData = {
      fr: { flag: '🇫🇷', code: 'FR' },
      en: { flag: '🇬🇧', code: 'EN' },
      de: { flag: '🇩🇪', code: 'DE' },
      es: { flag: '🇪🇸', code: 'ES' }
    };
    
    const lang = currentLang || 'fr';
    const langData = currentLangData[lang] || currentLangData.fr;
    
    const flagSpan = langDropdownToggle.querySelector('.lang-flag');
    const codeSpan = langDropdownToggle.querySelector('.lang-code');
    
    if (flagSpan) flagSpan.textContent = langData.flag;
    if (codeSpan) codeSpan.textContent = langData.code;
  }
  
  // Toggle dropdown
  if (langDropdownToggle && langDropdownMenu) {
    langDropdownToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdownToggle.classList.toggle('active');
      langDropdownMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!langDropdownToggle.contains(e.target) && !langDropdownMenu.contains(e.target)) {
        langDropdownToggle.classList.remove('active');
        langDropdownMenu.classList.remove('active');
      }
    });
    
    // Language option selection
    langOptions.forEach(option => {
      option.addEventListener('click', function() {
        const lang = this.dataset.lang;
        setLanguage(lang);
        
        // Update active state
        langOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        
        // Update toggle button
        updateLangDropdownToggle();
        
        // Close dropdown
        langDropdownToggle.classList.remove('active');
        langDropdownMenu.classList.remove('active');
      });
    });
    
    // Update on page load
    updateLangDropdownToggle();
    
    // Update active option
    langOptions.forEach(option => {
      if (option.dataset.lang === (currentLang || 'fr')) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
  
  // Initialize language and translations
  updateLanguageButtons();
  updateTranslations();
  
  // Artist images scroll animation for mobile
  function initArtistScrollAnimation() {
    const artistItems = document.querySelectorAll('.artist-item');
    
    if (artistItems.length === 0) return;
    
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    artistItems.forEach(item => {
      observer.observe(item);
    });
  }
  
  // Initialize artist scroll animation
  initArtistScrollAnimation();
  
  // Load DJs from API
  async function loadDJsFromAPI() {
    try {
      // First, check if we can use already loaded events data
      // Use a safe check to avoid initialization errors
      let data = null;
      try {
        if (typeof allEvents !== 'undefined' && allEvents && Array.isArray(allEvents) && allEvents.length > 0) {
          data = allEvents;
        }
      } catch (e) {
        // allEvents not yet initialized, will fetch from API
        data = null;
      }
      
      // If allEvents is not available or empty, fetch from API
      if (!data || !Array.isArray(data) || data.length === 0) {
        // Step 1: Get all events
        const allEventsUrl = 'https://api.nightsquarepro.com/tevents/SelectAll.php';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(allEventsUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let fetchedData = await response.json();
        
        // Handle proxy response
        if (fetchedData.contents) {
          fetchedData = JSON.parse(fetchedData.contents);
        }
        
        // Extract events array
        if (fetchedData && fetchedData.tevents && Array.isArray(fetchedData.tevents)) {
          data = fetchedData.tevents;
        } else if (fetchedData && typeof fetchedData === 'object' && !Array.isArray(fetchedData)) {
          const arrayKey = Object.keys(fetchedData).find(key => Array.isArray(fetchedData[key]));
          if (arrayKey) {
            data = fetchedData[arrayKey];
          }
        }
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('No events found to extract DJs');
        return;
      }
      
      // Filter events by end date - only keep events with end date >= now
      const now = new Date();
      
      const activeEvents = data.filter(event => {
        const eventEndDate = event.event_endDate || event.event_date || event.date;
        if (!eventEndDate) return true; // Keep events without end date
        
        try {
          const endDate = new Date(eventEndDate);
          // Si la date de fin contient une heure, on la compare directement
          // Sinon, on considère que l'événement se termine à la fin de la journée (23:59:59)
          if (eventEndDate.includes('T') || eventEndDate.includes(' ')) {
            // La date contient une heure, comparer directement
            return endDate >= now;
          } else {
            // Pas d'heure, considérer que l'événement se termine à la fin de la journée
            endDate.setHours(23, 59, 59, 999);
            return endDate >= now;
          }
        } catch (e) {
          console.warn('Invalid date format for event:', eventEndDate, e);
          return true; // Keep events with invalid dates
        }
      });
      
      if (activeEvents.length === 0) {
        console.warn('No active events found (all events are past)');
        return;
      }
      
      console.log(`Filtered ${activeEvents.length} active events out of ${data.length} total events`);
      
      // First, try to extract DJs directly from SelectAll data (tdjevent might be included)
      const djsMap = new Map();
      
      // Check if events already have tdjevent data (only for active events)
      activeEvents.forEach(event => {
        // Chercher uniquement dans tdjevent comme indiqué par l'utilisateur
        const tdjevent = event.tdjevent;
        
        // Log pour debug - vérifier si tdjevent existe même s'il est vide
        if (event.hasOwnProperty('tdjevent')) {
          console.log(`Event ${event.event_id || event.event_name} has tdjevent:`, tdjevent, typeof tdjevent);
        }
        
        if (tdjevent) {
          if (Array.isArray(tdjevent)) {
            tdjevent.forEach(dj => {
              if (dj) {
                let djName, djImage;
                
                if (typeof dj === 'object') {
                  djName = dj.name || dj.nom || dj.dj_name || dj.artist_name || '';
                  djImage = dj.image || dj.photo || dj.avatar || dj.img || '';
                } else if (typeof dj === 'string') {
                  djName = dj;
                  djImage = '';
                }
                
                if (djName) {
                  const djNameLower = djName.toLowerCase().trim();
                  if (!djsMap.has(djNameLower)) {
                    djsMap.set(djNameLower, {
                      name: djName,
                      image: djImage,
                      artistKey: djNameLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    });
                  }
                }
              }
            });
          } else if (typeof tdjevent === 'string') {
            const djNames = tdjevent.split(/[,\n]/).map(name => name.trim()).filter(Boolean);
            djNames.forEach(djName => {
              const key = djName.toLowerCase().trim();
              if (!djsMap.has(key)) {
                djsMap.set(key, {
                  name: djName,
                  image: '',
                  artistKey: key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                });
              }
            });
          }
        }
      });
      
      // If we found DJs in SelectAll, use them and skip SelectOne calls
      if (djsMap.size > 0) {
        console.log(`Found ${djsMap.size} DJs directly from SelectAll data`);
        // Skip SelectOne calls and go directly to display
      } else {
        console.log('No DJs found in SelectAll data - tdjevent is only available via SelectOne.php');
        console.log(`Processing ${activeEvents.length} active events to extract DJs from SelectOne.php...`);
        
        // Step 2: Get DJs from each event using SelectOne.php
        // Pour chaque événement actif de SelectAll, on appelle SelectOne.php pour récupérer tdjevent
        // Process events in parallel batches to speed up loading
        const eventsToProcess = activeEvents; // Traiter tous les événements actifs
      
        // Add delay between requests to avoid overwhelming the proxy
        for (let i = 0; i < eventsToProcess.length; i++) {
        const event = eventsToProcess[i];
        
        // Reduced delay between requests to speed up loading (only 200ms)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay to speed up
        }
        try {
          const eventId = event.id || event.event_id || event.ID;
          const eventName = event.name || event.event_name || event.title || event.event_title || '';
          
          if (!eventId) continue;
          
          // Format correct de l'URL - utiliser uniquement event_id pour éviter les erreurs 500
          // Ne pas inclure event_name car cela semble causer des erreurs 500
          const oneEventUrl = `https://api.nightsquarepro.com/tevents/SelectOne.php?event_id=${eventId}`;
          
          // Use proxy directly since CORS is not enabled on the API
          let oneResponse;
          let oneData;
          let success = false;
          
          try {
            // Try corsproxy.io first
            const oneProxyUrl = `https://corsproxy.io/?${encodeURIComponent(oneEventUrl)}`;
            oneResponse = await fetch(oneProxyUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors'
            });
            
            if (oneResponse.ok && oneResponse.status !== 500) {
              oneData = await oneResponse.json();
              
              // Handle proxy response
              if (oneData.contents) {
                oneData = JSON.parse(oneData.contents);
              }
              
              // Check if API returned an error in the response
              if (oneData && !oneData.error && oneData.status !== 'error') {
                success = true;
              }
            }
            
            // If corsproxy.io fails or returns 500, try allorigins.win
            if (!success) {
              try {
                const altProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(oneEventUrl)}`;
                
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                oneResponse = await fetch(altProxyUrl, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                  },
                  mode: 'cors',
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (oneResponse.ok) {
                  oneData = await oneResponse.json();
                  
                  // Handle proxy response
                  if (oneData.contents) {
                    oneData = JSON.parse(oneData.contents);
                  }
                  
                  if (oneData && !oneData.error && oneData.status !== 'error') {
                    success = true;
                  }
                }
              } catch (timeoutError) {
                // Timeout or abort error
                if (timeoutError.name === 'AbortError') {
                  console.warn(`Timeout loading event ${eventId} - Skipping`);
                }
                throw timeoutError;
              }
            }
            
            if (!success) {
              // If still failing, skip this event but don't stop the process
              console.warn(`Failed to load event ${eventId} (status: ${oneResponse?.status || 'unknown'}) - Skipping`);
              continue;
            }
          } catch (proxyError) {
            // Handle timeout or network errors
            if (proxyError.name === 'TimeoutError' || proxyError.name === 'AbortError') {
              console.warn(`Timeout loading event ${eventId} - Skipping`);
            } else {
              console.warn(`Error loading event ${eventId}:`, proxyError.message);
            }
            continue;
          }
          
          // Log the raw response to debug
          console.log(`Raw response for event ${eventId}:`, oneData);
          console.log(`Keys in response for event ${eventId}:`, Object.keys(oneData || {}));
          
          // Ne pas chercher de données imbriquées - les données sont directement dans oneData
          // tdjevent est directement dans la réponse, pas dans un objet imbriqué
          
          // Extract DJs from event data - les DJs sont dans tdjevent
          // tdjevent peut être null, undefined, un tableau vide, ou contenir des données
          const tdjevent = oneData?.tdjevent;
          
          // Log pour debug - vérifier la valeur exacte
          console.log(`tdjevent for event ${eventId}:`, tdjevent, `Type:`, typeof tdjevent, `Is null:`, tdjevent === null, `Is undefined:`, tdjevent === undefined);
          
          // Vérifier si tdjevent existe et a du contenu
          if (tdjevent === null || tdjevent === undefined || (Array.isArray(tdjevent) && tdjevent.length === 0) || (typeof tdjevent === 'string' && tdjevent.trim() === '')) {
            console.log(`tdjevent is empty/null for event ${eventId}`);
            continue;
          }
          
          console.log(`Found tdjevent for event ${eventId}:`, tdjevent, typeof tdjevent);
          
          // Log la structure du premier DJ pour voir les clés disponibles
          if (Array.isArray(tdjevent) && tdjevent.length > 0 && typeof tdjevent[0] === 'object') {
            console.log(`Sample DJ object structure:`, tdjevent[0], `Keys:`, Object.keys(tdjevent[0]));
          }
          
          if (Array.isArray(tdjevent)) {
            // Récupérer les infos de l'événement actuel
            const eventName = oneData.event_name || event.event_name || '';
            const eventDate = oneData.event_date || event.event_date || '';
            const eventLocation = oneData.event_lieux || oneData.event_city || oneData.event_club_name || oneData.event_address || event.event_lieux || event.event_city || event.event_club_name || event.event_address || '';
            
            tdjevent.forEach(dj => {
              if (dj) {
                // Le DJ est un objet dans tdjevent
                let djName, djImage;
                
                if (typeof dj === 'object') {
                  // Chercher le nom dans plusieurs clés possibles
                  djName = dj.name || dj.nom || dj.dj_name || dj.artist_name || dj.dj_nom || '';
                  
                  // Chercher l'image dans plusieurs clés possibles
                  djImage = dj.image || dj.photo || dj.avatar || dj.img || dj.dj_image || dj.dj_photo || dj.dj_avatar || '';
                  
                  // Si l'image est une URL relative, la compléter avec l'URL de base de l'API
                  if (djImage && !djImage.startsWith('http')) {
                    if (djImage.startsWith('/')) {
                      djImage = `https://api.nightsquarepro.com${djImage}`;
                    } else {
                      djImage = `https://api.nightsquarepro.com/${djImage}`;
                    }
                  }
                  
                  // Log pour debug
                  console.log(`DJ found: ${djName}, Image: ${djImage || 'none'}`);
                } else if (typeof dj === 'string') {
                  djName = dj;
                  djImage = '';
                }
                
                if (djName) {
                  const djNameLower = djName.toLowerCase().trim();
                  if (!djsMap.has(djNameLower)) {
                    djsMap.set(djNameLower, {
                      name: djName,
                      image: djImage,
                      artistKey: djNameLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                      events: [] // Array pour stocker tous les événements de ce DJ
                    });
                  }
                  
                  // Ajouter l'événement à la liste des événements de ce DJ
                  const djData = djsMap.get(djNameLower);
                  if (eventName || eventDate || eventLocation) {
                    djData.events.push({
                      name: eventName,
                      date: eventDate,
                      location: eventLocation
                    });
                  }
                }
              }
            });
          } else if (typeof tdjevent === 'string') {
            // Si tdjevent est une chaîne, split par comma ou newline
            const djNames = tdjevent.split(/[,\n]/).map(name => name.trim()).filter(Boolean);
            djNames.forEach(djName => {
              const key = djName.toLowerCase().trim();
              if (!djsMap.has(key)) {
                djsMap.set(key, {
                  name: djName,
                  image: '',
                  artistKey: key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                });
              }
            });
          }
        } catch (error) {
          console.warn(`Error loading DJs for event ${eventId}:`, error.message);
        }
      }
      } // End of else block for SelectOne calls
      
      // Step 3: Update the DOM with DJs
      const upcomingDjsList = document.querySelector('.upcoming-djs-list');
      if (!upcomingDjsList) return;
      
      const djsArray = Array.from(djsMap.values());
      if (djsArray.length === 0) {
        console.warn('No DJs found in events');
        return;
      }
      
      console.log(`Found ${djsArray.length} unique DJs from API:`, djsArray.map(dj => dj.name));
      
      // Clear existing DJs
      upcomingDjsList.innerHTML = '';
      
      // Create DJ items with enhanced SEO
      djsArray.forEach((dj, index) => {
        const djItem = document.createElement('article');
        djItem.className = 'upcoming-dj-item';
        djItem.setAttribute('data-artist', dj.artistKey);
        djItem.setAttribute('itemscope', '');
        djItem.setAttribute('itemtype', 'https://schema.org/Person');
        djItem.setAttribute('itemprop', 'itemListElement');
        djItem.setAttribute('itemid', `#dj-${dj.artistKey}`);
        djItem.setAttribute('role', 'listitem');
        djItem.setAttribute('aria-label', `${dj.name} - DJ et Producer`);
        djItem.id = `dj-${dj.artistKey}`;
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'upcoming-dj-image';
        imageDiv.setAttribute('role', 'img');
        imageDiv.setAttribute('aria-label', `Photo de ${dj.name}, DJ et Producer`);
        imageDiv.setAttribute('itemprop', 'image');
        
        // Set background image if available from API
        if (dj.image) {
          imageDiv.style.backgroundImage = `url(${dj.image})`;
          imageDiv.style.backgroundSize = 'cover';
          imageDiv.style.backgroundPosition = 'center';
          imageDiv.setAttribute('data-image-url', dj.image);
          // Create img element for SEO (hidden but crawlable)
          const seoImg = document.createElement('img');
          seoImg.src = dj.image;
          seoImg.alt = `${dj.name} - DJ et Producer sur Night Square`;
          seoImg.setAttribute('itemprop', 'image');
          seoImg.className = 'sr-only';
          seoImg.loading = 'lazy';
          imageDiv.appendChild(seoImg);
          console.log(`Setting image for ${dj.name}: ${dj.image}`);
        } else {
          // Try to match with existing images based on artistKey
          const imageMap = {
            'reznik': '../src/img/reznik.jpg',
            'hugel': '../src/img/hugel.webp',
            'pablo': '../src/img/pablo fierro.jpg',
            'adriatique': '../src/img/adriatique.webp',
            'levi': '../src/img/levi.jpg',
            'francis': '../src/img/francis mercier.jpg',
            'lazare': '../src/img/lazare.webp',
            'stryv': '../src/img/stryv.jpg',
            'sasson': '../src/img/sasson.jpg',
            'rivo': '../src/img/rivo.webp',
            'alex-wann': '../src/img/alex wann.webp'
          };
          
          const defaultImage = imageMap[dj.artistKey];
          if (defaultImage) {
            imageDiv.style.backgroundImage = `url(${defaultImage})`;
          }
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'upcoming-dj-info';
        
        const nameH3 = document.createElement('h3');
        nameH3.className = 'upcoming-dj-name';
        nameH3.setAttribute('itemprop', 'name');
        nameH3.setAttribute('id', `dj-name-${dj.artistKey}`);
        nameH3.textContent = dj.name;
        
        const jobTitle = document.createElement('span');
        jobTitle.setAttribute('itemprop', 'jobTitle');
        jobTitle.className = 'sr-only';
        jobTitle.textContent = 'DJ • Producer';
        
        // Additional schema.org properties for SEO
        const description = document.createElement('meta');
        description.setAttribute('itemprop', 'description');
        description.content = `${dj.name} est un DJ et Producer qui se produira lors des événements exclusifs Night Square.`;
        nameH3.appendChild(description);
        
        // Add sameAs for social links (if available)
        const sameAs = document.createElement('link');
        sameAs.setAttribute('itemprop', 'sameAs');
        sameAs.href = `https://nightsquare.com/artists/${dj.artistKey}`;
        nameH3.appendChild(sameAs);
        
        // Container pour les événements
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'upcoming-dj-events';
        
        // Afficher le premier événement (ou tous si plusieurs) avec SEO
        if (dj.events && dj.events.length > 0) {
          dj.events.forEach((eventInfo, eventIndex) => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'upcoming-dj-event';
            eventDiv.setAttribute('itemscope', '');
            eventDiv.setAttribute('itemtype', 'https://schema.org/Event');
            eventDiv.setAttribute('itemprop', 'performerIn');
            eventDiv.setAttribute('aria-label', `Événement avec ${dj.name}`);
            
            if (eventInfo.name) {
              const eventNameSpan = document.createElement('span');
              eventNameSpan.className = 'upcoming-dj-event-name';
              eventNameSpan.setAttribute('itemprop', 'name');
              eventNameSpan.textContent = eventInfo.name;
              eventDiv.appendChild(eventNameSpan);
            }
            
            const eventDetails = document.createElement('div');
            eventDetails.className = 'upcoming-dj-event-details';
            
            if (eventInfo.date) {
              const dateSpan = document.createElement('time');
              dateSpan.className = 'upcoming-dj-event-date';
              dateSpan.setAttribute('itemprop', 'startDate');
              dateSpan.setAttribute('datetime', eventInfo.date);
              // Formater la date
              try {
                const date = new Date(eventInfo.date);
                const formattedDate = date.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                });
                dateSpan.textContent = formattedDate;
              } catch (e) {
                dateSpan.textContent = eventInfo.date;
              }
              eventDetails.appendChild(dateSpan);
            }
            
            if (eventInfo.location) {
              const locationSpan = document.createElement('span');
              locationSpan.className = 'upcoming-dj-event-location';
              locationSpan.setAttribute('itemprop', 'location');
              locationSpan.setAttribute('itemscope', '');
              locationSpan.setAttribute('itemtype', 'https://schema.org/Place');
              const locationName = document.createElement('span');
              locationName.setAttribute('itemprop', 'name');
              locationName.textContent = eventInfo.location;
              locationSpan.appendChild(locationName);
              eventDetails.appendChild(locationSpan);
            }
            
            if (eventDetails.children.length > 0) {
              eventDiv.appendChild(eventDetails);
            }
            
            if (eventDiv.children.length > 0) {
              eventsContainer.appendChild(eventDiv);
            }
          });
        }
        
        infoDiv.appendChild(nameH3);
        infoDiv.appendChild(jobTitle);
        if (eventsContainer.children.length > 0) {
          infoDiv.appendChild(eventsContainer);
        }
        
        djItem.appendChild(imageDiv);
        djItem.appendChild(infoDiv);
        
        // Add position in list for schema.org
        const position = document.createElement('meta');
        position.setAttribute('itemprop', 'position');
        position.content = index + 1;
        djItem.appendChild(position);
        
        upcomingDjsList.appendChild(djItem);
      });
      
      // Generate JSON-LD structured data for all DJs
      generateDJsStructuredData(djsArray);
      
      console.log('DJs loaded and displayed successfully');
      
    } catch (error) {
      console.error('Error loading DJs from API:', error);
    }
  }
  
  // Generate JSON-LD structured data for SEO
  function generateDJsStructuredData(djsArray) {
    // Remove existing JSON-LD script if any
    const existingScript = document.getElementById('djs-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create ItemList schema
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Les DJs à venir - Night Square',
      'description': 'Découvrez les prochains DJs et producteurs qui animeront nos événements exclusifs Night Square. Accédez aux performances live des meilleurs artistes de la scène électronique.',
      'url': 'https://nightsquare.com/#upcoming-djs',
      'numberOfItems': djsArray.length,
      'itemListElement': djsArray.map((dj, index) => {
        const djSchema = {
          '@type': 'ListItem',
          'position': index + 1,
          'item': {
            '@type': 'Person',
            '@id': `https://nightsquare.com/artists/${dj.artistKey}`,
            'name': dj.name,
            'jobTitle': 'DJ • Producer',
            'description': `${dj.name} est un DJ et Producer qui se produira lors des événements exclusifs Night Square.`,
            'image': dj.image || `https://nightsquare.com/src/img/${dj.artistKey}.jpg`,
            'sameAs': `https://nightsquare.com/artists/${dj.artistKey}`
          }
        };
        
        // Add events if available
        if (dj.events && dj.events.length > 0) {
          djSchema.item.performerIn = dj.events.map(eventInfo => ({
            '@type': 'Event',
            'name': eventInfo.name || 'Événement Night Square',
            'startDate': eventInfo.date || '',
            'location': {
              '@type': 'Place',
              'name': eventInfo.location || ''
            }
          }));
        }
        
        return djSchema;
      })
    };
    
    // Create and append script tag
    const script = document.createElement('script');
    script.id = 'djs-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(itemList, null, 2);
    document.head.appendChild(script);
    
    console.log('JSON-LD structured data generated for DJs');
  }

  // Spotify Integration - Load tracks for artists (only for featured artists, not upcoming DJs)
  function initSpotifyIntegration() {
    const artistItems = document.querySelectorAll('.artist-item');
    if (artistItems.length === 0) return;
    
    // Mapping des noms d'artistes pour la recherche Spotify
    // Pour les DJs chargés depuis l'API, utiliser directement le nom du DJ
    const artistNameMap = {
      'reznik': 'Reznik',
      'levi': 'LEvi',
      'hugel': 'Hugel',
      'francis': 'Francis Mercier',
      'pablo': 'Pablo Fierro',
      'adriatique': 'Adriatique',
      'lazare': 'Lazare',
      'stryv': 'Stryv',
      'sasson': 'Sasson',
      'notre-dame': 'Notre Dame',
      'rivo': 'Rivo',
      'alex-wann': 'Alex Wann',
      // Ajouter les mappings pour les DJs de l'API
      'bob-sinclar': 'Bob Sinclar',
      'babar': 'Babar DJ', // Nom plus spécifique pour Spotify
      'bagheera-fr': 'Bagheera (FR)',
      'omizs': 'Omizs',
      'saint-amour': 'Saint Amour',
      'zehavi': 'Zehavi',
      'boucle-dor': 'Boucle Dor',
      'hersz': 'Hersz',
      'max-menaged': 'Max Menaged'
    };
    
    // Mapping des tracks spécifiques (optionnel)
    const trackNameMap = {
      'levi': 'Jump',
      'babar': 'Babar', // Track spécifique pour Babar si nécessaire
      'reznik': 'Cloudy Eyes',
      'rivo': 'You & Me'
    };
    
    // Cache pour éviter les appels API multiples
    const trackCache = new Map();
    
    // Configuration de l'API backend
    // Détecter l'environnement : production (Vercel) ou développement (localhost)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const API_BASE_URL = isProduction 
      ? `https://${window.location.hostname}` // Production (Vercel) : les routes API sont sous /api/...
      : 'http://localhost:3000'; // Développement local (Express)
    
    async function loadSpotifyTrack(artistItem) {
      const artistData = artistItem.getAttribute('data-artist');
      
      // PRIORITÉ 1: Récupérer le nom réel du DJ depuis le DOM (le plus fiable)
      let artistName = null;
      const nameElement = artistItem.querySelector('.upcoming-dj-name');
      if (nameElement) {
        artistName = nameElement.textContent.trim();
        console.log(`Using DJ name from DOM for ${artistData}: ${artistName}`);
      }
      
      // PRIORITÉ 2: Si pas de nom dans le DOM, utiliser le mapping
      if (!artistName) {
        artistName = artistNameMap[artistData];
        if (artistName) {
          console.log(`Using mapped name for ${artistData}: ${artistName}`);
        }
      }
      
      // PRIORITÉ 3: Fallback - capitaliser artistData
      if (!artistName) {
        artistName = artistData.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        console.log(`Using fallback name for ${artistData}: ${artistName}`);
      }
      
      if (!artistName) {
        console.warn(`No artist name found for ${artistData}`);
        return;
      }
      
      console.log(`Loading Spotify track for: ${artistName} (data-artist: ${artistData})`);
      
      // Vérifier le cache
      if (trackCache.has(artistData)) {
        displaySpotifyWidget(artistItem, trackCache.get(artistData));
        return;
      }
      
      try {
        // Vérifier si une track spécifique est définie
        const trackName = trackNameMap[artistData];
        let url = `${API_BASE_URL}/api/spotify/artist-track?artistName=${encodeURIComponent(artistName)}`;
        if (trackName) {
          url += `&trackName=${encodeURIComponent(trackName)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`No track found for ${artistName}`);
          return;
        }
        
        const data = await response.json();
        
        // Vérifier que la track correspond bien à l'artiste
        if (data && data.track && data.artist) {
          console.log(`Spotify track loaded for ${artistName}:`, data.track.name, 'by', data.artist.name);
          trackCache.set(artistData, data);
          displaySpotifyWidget(artistItem, data);
        } else {
          console.warn(`Invalid Spotify response for ${artistName}:`, data);
        }
      } catch (error) {
        console.error(`Error loading Spotify track for ${artistName}:`, error);
      }
    }
    
    function displaySpotifyWidget(artistItem, trackData) {
      // Vérifier si le widget existe déjà
      let spotifyContainer = artistItem.querySelector('.spotify-widget-container');
      
      if (!spotifyContainer) {
        // Pour les upcoming-dj-item, le conteneur est dans upcoming-dj-info
        const infoContainer = artistItem.querySelector('.upcoming-dj-info');
        if (infoContainer) {
          spotifyContainer = infoContainer.querySelector('.spotify-widget-container');
          if (!spotifyContainer) {
            spotifyContainer = document.createElement('div');
            spotifyContainer.className = 'spotify-widget-container';
            infoContainer.appendChild(spotifyContainer);
          }
        } else {
          spotifyContainer = document.createElement('div');
          spotifyContainer.className = 'spotify-widget-container';
          artistItem.appendChild(spotifyContainer);
        }
      }
      
      // Créer l'iframe Spotify
      const iframe = document.createElement('iframe');
      iframe.src = trackData.track.embed_url;
      iframe.width = '100%';
      // Hauteur adaptative : plus petite sur mobile
      const isMobile = window.innerWidth <= 768;
      iframe.height = isMobile ? '80' : '80';
      iframe.frameBorder = '0';
      iframe.allowtransparency = 'true';
      iframe.allow = 'encrypted-media';
      iframe.style.borderRadius = '12px';
      iframe.style.marginTop = '0';
      
      spotifyContainer.innerHTML = '';
      spotifyContainer.appendChild(iframe);
    }
    
    // Charger les tracks pour les featured artists uniquement (pas pour upcoming DJs)
    artistItems.forEach(item => {
      const isMobile = window.innerWidth <= 768;
      
      // Desktop: charger au survol
      if (!isMobile) {
        item.addEventListener('mouseenter', function() {
          if (!trackCache.has(item.getAttribute('data-artist'))) {
            loadSpotifyTrack(item);
          }
        }, { once: true });
      } else {
        // Mobile: charger automatiquement
        if (!trackCache.has(item.getAttribute('data-artist'))) {
          loadSpotifyTrack(item);
        }
        
        const checkAndShow = () => {
          const container = item.querySelector('.spotify-widget-container');
          if (container && container.querySelector('iframe')) {
            item.classList.add('touched');
          } else {
            setTimeout(checkAndShow, 100);
          }
        };
        
        setTimeout(checkAndShow, 500);
      }
    });
  }
  
  // Initialize Spotify integration
  initSpotifyIntegration();
  
  // Load DJs from API - will be called after events are loaded
  // loadDJsFromAPI(); // Moved to be called after loadEvents completes
  
  // Listen for language changes
  document.addEventListener('languageChanged', function() {
    updateTranslations();
  });

  // Hero Section Phone Scroll Animation
  const heroPhones = document.querySelector('.hero-phones');
  if (heroPhones && window.innerWidth >= 992) {
    const phones = heroPhones.querySelectorAll('.hero-phone');
    
    // Parallax effect on scroll
    let ticking = false;
    
    function updateParallax() {
      const heroSection = document.querySelector('.hero-section');
      
      if (heroSection && heroPhones && phones.length > 0) {
        const rect = heroSection.getBoundingClientRect();
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress within hero section
        const sectionTop = rect.top + scrollY;
        const scrollProgress = Math.max(0, Math.min(1, (scrollY - sectionTop + windowHeight) / (windowHeight * 0.8)));
        
        phones.forEach((phone) => {
          if (phone.classList.contains('left')) {
            // Base: translateX(calc(-50% - 320px)) translateY(-150px) perspective(1200px) rotateY(15deg) rotate(-12deg) scale(1.05)
            const translateY = -150 + scrollProgress * 30;
            const rotateY = 15 - scrollProgress * 3;
            const rotate = -12 + scrollProgress * 2;
            phone.style.transform = `translateX(calc(-50% - 320px)) translateY(${translateY}px) perspective(1200px) rotateY(${rotateY}deg) rotate(${rotate}deg) scale(1.05)`;
            phone.style.opacity = 0.9 + scrollProgress * 0.05;
          } else if (phone.classList.contains('center')) {
            // Base: translateX(-50%) translateY(-120px) scale(1.2)
            const translateY = -120 + scrollProgress * 20;
            const scale = 1.2 - scrollProgress * 0.05;
            phone.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
          } else if (phone.classList.contains('right')) {
            // Base: translateX(calc(-50% + 320px)) translateY(-150px) perspective(1200px) rotateY(-15deg) rotate(12deg) scale(1.05)
            const translateY = -150 + scrollProgress * 30;
            const rotateY = -15 + scrollProgress * 3;
            const rotate = 12 - scrollProgress * 2;
            phone.style.transform = `translateX(calc(-50% + 320px)) translateY(${translateY}px) perspective(1200px) rotateY(${rotateY}deg) rotate(${rotate}deg) scale(1.05)`;
            phone.style.opacity = 0.9 + scrollProgress * 0.05;
          }
        });
      }
      
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    // Initial call
    updateParallax();
  }

  // Load Events from API
  const eventsGrid = document.getElementById('current-events-grid');
  const filterContainer = document.querySelector('.current-events-filter');
  const loadMoreContainer = document.getElementById('current-events-load-more');
  const loadMoreButton = document.getElementById('load-more-events-btn');
  const searchInput = document.getElementById('event-search-input');
  let allEvents = [];
  let currentCityFilter = 'all';
  let currentSearchQuery = '';
  let displayedEventsCount = 6;
  let currentFilteredEvents = [];

  if (eventsGrid) {
    // Load events initially
    loadEvents();
    
    // Auto-refresh events every 2 minutes (120000ms) to show new events quickly
    const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes
    let refreshIntervalId = setInterval(() => {
      console.log('[Events Refresh] Auto-refreshing events from API...');
      loadEvents();
    }, REFRESH_INTERVAL);
    
    // Also refresh when the page becomes visible again (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('[Events Refresh] Page visible again, refreshing events...');
        loadEvents();
      }
    });
    
    // Store interval ID globally to allow cleanup if needed
    window.eventsRefreshInterval = refreshIntervalId;
  }

  // City filter flags mapping - Complete list of countries
  const cityFlags = {
    // France
    'Paris': '🇫🇷', 'Lyon': '🇫🇷', 'Marseille': '🇫🇷', 'Nice': '🇫🇷', 'Cannes': '🇫🇷', 'Bordeaux': '🇫🇷', 'Toulouse': '🇫🇷', 'Lille': '🇫🇷', 'Strasbourg': '🇫🇷', 'Nantes': '🇫🇷',
    // United Kingdom
    'London': '🇬🇧', 'Manchester': '🇬🇧', 'Birmingham': '🇬🇧', 'Liverpool': '🇬🇧', 'Edinburgh': '🇬🇧', 'Glasgow': '🇬🇧', 'Bristol': '🇬🇧', 'Leeds': '🇬🇧',
    // Switzerland
    'Lausanne': '🇨🇭', 'Zurich': '🇨🇭', 'Geneva': '🇨🇭', 'Bern': '🇨🇭', 'Basel': '🇨🇭', 'Lugano': '🇨🇭',
    // United States
    'Miami': '🇺🇸', 'New York': '🇺🇸', 'Los Angeles': '🇺🇸', 'Las Vegas': '🇺🇸', 'Chicago': '🇺🇸', 'San Francisco': '🇺🇸', 'Boston': '🇺🇸', 'Washington': '🇺🇸',
    // Spain
    'Ibiza': '🇪🇸', 'Madrid': '🇪🇸', 'Barcelona': '🇪🇸', 'Valencia': '🇪🇸', 'Seville': '🇪🇸', 'Marbella': '🇪🇸', 'Mallorca': '🇪🇸', 'Tenerife': '🇪🇸',
    // Germany
    'Berlin': '🇩🇪', 'Munich': '🇩🇪', 'Hamburg': '🇩🇪', 'Frankfurt': '🇩🇪', 'Cologne': '🇩🇪', 'Stuttgart': '🇩🇪', 'Düsseldorf': '🇩🇪',
    // Monaco
    'Monaco': '🇲🇨', 'Monte-Carlo': '🇲🇨',
    // United Arab Emirates
    'Dubai': '🇦🇪', 'Abu Dhabi': '🇦🇪',
    // Italy
    'Milan': '🇮🇹', 'Rome': '🇮🇹', 'Venice': '🇮🇹', 'Florence': '🇮🇹', 'Naples': '🇮🇹', 'Turin': '🇮🇹',
    // Netherlands
    'Amsterdam': '🇳🇱', 'Rotterdam': '🇳🇱', 'The Hague': '🇳🇱',
    // Belgium
    'Brussels': '🇧🇪', 'Antwerp': '🇧🇪', 'Ghent': '🇧🇪',
    // Portugal
    'Lisbon': '🇵🇹', 'Porto': '🇵🇹',
    // Greece
    'Athens': '🇬🇷', 'Mykonos': '🇬🇷', 'Santorini': '🇬🇷',
    // Turkey
    'Istanbul': '🇹🇷', 'Ankara': '🇹🇷',
    // Russia
    'Moscow': '🇷🇺', 'Saint Petersburg': '🇷🇺',
    // Japan
    'Tokyo': '🇯🇵', 'Osaka': '🇯🇵', 'Kyoto': '🇯🇵',
    // China
    'Beijing': '🇨🇳', 'Shanghai': '🇨🇳', 'Hong Kong': '🇭🇰',
    // Singapore
    'Singapore': '🇸🇬',
    // Thailand
    'Bangkok': '🇹🇭', 'Phuket': '🇹🇭',
    // Australia
    'Sydney': '🇦🇺', 'Melbourne': '🇦🇺',
    // Canada
    'Toronto': '🇨🇦', 'Montreal': '🇨🇦', 'Vancouver': '🇨🇦',
    // Brazil
    'Rio de Janeiro': '🇧🇷', 'São Paulo': '🇧🇷',
    // Mexico
    'Mexico City': '🇲🇽', 'Cancun': '🇲🇽',
    // Argentina
    'Buenos Aires': '🇦🇷',
    // South Africa
    'Cape Town': '🇿🇦', 'Johannesburg': '🇿🇦',
    // Egypt
    'Cairo': '🇪🇬',
    // Morocco
    'Casablanca': '🇲🇦', 'Marrakech': '🇲🇦',
    // Default fallback
    'Default': '🌍'
  };

  function getCityFlag(cityName) {
    if (!cityName) return '🌍';
    const city = cityName.trim();
    return cityFlags[city] || '🌍';
  }

  function createFilterButtons(cities) {
    if (!filterContainer) return;
    
    // Get containers
    const desktopContainer = filterContainer.querySelector('.filter-buttons-desktop');
    const mobileDropdown = filterContainer.querySelector('.filter-dropdown-menu');
    const mobileToggle = document.getElementById('filter-dropdown-toggle');
    
    // Clear existing buttons except "Tous"
    if (desktopContainer) {
      const tousButton = desktopContainer.querySelector('[data-city="all"]');
      desktopContainer.innerHTML = '';
      
      // Add "Tous" button to desktop
      if (tousButton) {
        desktopContainer.appendChild(tousButton);
      } else {
        const tousBtn = document.createElement('button');
        tousBtn.className = 'filter-button active';
        tousBtn.setAttribute('data-city', 'all');
        tousBtn.innerHTML = '<span class="filter-flag">🌍</span><span class="filter-text">Tous</span>';
        tousBtn.addEventListener('click', () => filterByCity('all'));
        desktopContainer.appendChild(tousBtn);
      }
      
      // Add city buttons to desktop
      cities.forEach(city => {
        const button = document.createElement('button');
        button.className = 'filter-button';
        button.setAttribute('data-city', city);
        button.innerHTML = `<span class="filter-flag">${getCityFlag(city)}</span><span class="filter-text">${city}</span>`;
        button.addEventListener('click', () => filterByCity(city));
        desktopContainer.appendChild(button);
      });
    }
    
    // Clear and populate mobile dropdown
    if (mobileDropdown) {
      mobileDropdown.innerHTML = '';
      
      // Add "Tous" option
      const tousOption = document.createElement('button');
      tousOption.className = 'filter-option active';
      tousOption.setAttribute('data-city', 'all');
      tousOption.innerHTML = '<span class="filter-flag">🌍</span><span class="filter-text">Tous</span>';
      tousOption.addEventListener('click', () => {
        filterByCity('all');
        updateMobileFilterToggle('all', '🌍', 'Tous');
        closeMobileFilterDropdown();
      });
      mobileDropdown.appendChild(tousOption);
      
      // Add city options (only cities with active events)
      cities.forEach(city => {
        const option = document.createElement('button');
        option.className = 'filter-option';
        option.setAttribute('data-city', city);
        option.innerHTML = `<span class="filter-flag">${getCityFlag(city)}</span><span class="filter-text">${city}</span>`;
        option.addEventListener('click', () => {
          filterByCity(city);
          updateMobileFilterToggle(city, getCityFlag(city), city);
          closeMobileFilterDropdown();
        });
        mobileDropdown.appendChild(option);
      });
    }
    
    // Setup mobile dropdown toggle
    if (mobileToggle) {
      mobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        mobileToggle.classList.toggle('active');
        mobileDropdown.classList.toggle('active');
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (mobileDropdown && mobileToggle && 
          !mobileDropdown.contains(event.target) && 
          !mobileToggle.contains(event.target)) {
        closeMobileFilterDropdown();
      }
    });
  }
  
  function updateMobileFilterToggle(city, flag, text) {
    const toggle = document.getElementById('filter-dropdown-toggle');
    if (toggle) {
      const flagSpan = toggle.querySelector('.filter-flag');
      const textSpan = toggle.querySelector('.filter-text');
      if (flagSpan) flagSpan.textContent = flag;
      if (textSpan) textSpan.textContent = text;
    }
    
    // Update active state
    document.querySelectorAll('.filter-option').forEach(opt => {
      opt.classList.remove('active');
      if (opt.getAttribute('data-city') === city) {
        opt.classList.add('active');
      }
    });
  }
  
  function closeMobileFilterDropdown() {
    const toggle = document.getElementById('filter-dropdown-toggle');
    const menu = document.getElementById('filter-dropdown-menu');
    if (toggle) toggle.classList.remove('active');
    if (menu) menu.classList.remove('active');
  }

  function filterByCity(city) {
    // Normalize city value - ensure 'all' is used consistently
    const normalizedCity = (city === 'all' || city === 'Tous' || city === null || city === undefined) ? 'all' : city;
    
    // Always update the filter, even if clicking "Tous" again
    currentCityFilter = normalizedCity;
    displayedEventsCount = 6; // Reset to 6 when filtering
    
    // Update active button (desktop) - use normalizedCity for comparison
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      const btnCity = btn.getAttribute('data-city');
      // Match if button's city matches normalized city, or if both are 'all'
      if (btnCity === normalizedCity || (btnCity === 'all' && normalizedCity === 'all')) {
        btn.classList.add('active');
      }
    });
    
    // Update active option (mobile) - use normalizedCity for comparison
    document.querySelectorAll('.filter-option').forEach(opt => {
      opt.classList.remove('active');
      const optCity = opt.getAttribute('data-city');
      // Match if option's city matches normalized city, or if both are 'all'
      if (optCity === normalizedCity || (optCity === 'all' && normalizedCity === 'all')) {
        opt.classList.add('active');
      }
    });
    
    // Always refresh display with allEvents to ensure proper reset
    // Make sure allEvents is defined and has content
    if (allEvents && Array.isArray(allEvents) && allEvents.length > 0) {
      // Force refresh by calling displayEvents with allEvents
      displayEvents(allEvents);
    } else if (allEvents && Array.isArray(allEvents) && allEvents.length === 0) {
      // If allEvents is empty array, still call displayEvents to show empty state
      displayEvents(allEvents);
    } else {
      // If allEvents is not defined or not an array, reload events
      console.warn('allEvents not properly initialized, reloading events...');
      loadEvents();
    }
  }

  function displayEvents(events) {
    eventsGrid.innerHTML = '';
    
    // Filter out past events (only show events that haven't ended)
    const now = new Date();
    
    let filteredEvents = events.filter(event => {
      const eventEndDate = event.event_endDate || event.event_date || event.date;
      if (!eventEndDate) return true; // Keep events without end date (assume they're valid)
      
      try {
        const endDate = new Date(eventEndDate);
        // Si la date de fin contient une heure, on la compare directement
        // Sinon, on considère que l'événement se termine à la fin de la journée (23:59:59)
        if (eventEndDate.includes('T') || eventEndDate.includes(' ')) {
          // La date contient une heure, comparer directement
          return endDate >= now;
        } else {
          // Pas d'heure, considérer que l'événement se termine à la fin de la journée
          endDate.setHours(23, 59, 59, 999);
          return endDate >= now;
        }
      } catch (e) {
        console.warn('Invalid date format for event:', eventEndDate, e);
        return true; // Keep events with invalid dates (assume they're valid)
      }
    });
    
    // Apply city filter if needed - only filter if NOT 'all'
    // Explicitly check for 'all' to ensure all events are shown when "Tous" is selected
    if (currentCityFilter && currentCityFilter !== 'all' && currentCityFilter !== 'Tous' && currentCityFilter.trim() !== '') {
      filteredEvents = filteredEvents.filter(event => {
        const eventCity = event.event_city || event.event_lieux || '';
        return eventCity.toLowerCase().includes(currentCityFilter.toLowerCase());
      });
    }
    // If currentCityFilter is 'all' or empty, don't filter by city - show all events
    
    // Apply search filter if needed
    if (currentSearchQuery.trim() !== '') {
      const searchLower = currentSearchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event => {
        const eventName = (event.event_name || event.title || event.name || '').toLowerCase();
        const eventLieux = (event.event_lieux || '').toLowerCase();
        const eventCity = (event.event_city || '').toLowerCase();
        const venueDisplay = eventLieux && eventCity ? `${eventLieux} ${eventCity}` : (eventLieux || eventCity);
        
        return eventName.includes(searchLower) || 
               venueDisplay.includes(searchLower) ||
               (eventLieux && eventLieux.includes(searchLower)) ||
               (eventCity && eventCity.includes(searchLower));
      });
    }
    
    // Store filtered events for load more functionality
    currentFilteredEvents = filteredEvents;
    
    if (filteredEvents.length === 0) {
      let message = 'Aucun événement à venir disponible pour le moment';
      if (currentSearchQuery.trim() !== '') {
        message = `Aucun événement trouvé pour "${currentSearchQuery}"`;
      } else if (currentCityFilter !== 'all') {
        message = 'Aucun événement disponible pour cette ville';
      }
      eventsGrid.innerHTML = `<div class="events-empty"><p>${message}</p></div>`;
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    }
    
    // Limit to maximum 12 events
    const maxEvents = 12;
    const eventsToDisplay = Math.min(displayedEventsCount, maxEvents);
    
    // Display only the first eventsToDisplay events
    const eventsToShow = filteredEvents.slice(0, eventsToDisplay);
    
    eventsToShow.forEach((event, index) => {
      const eventCard = createEventCard(event, index);
      eventsGrid.appendChild(eventCard);
    });
    
    // Show/hide "Voir plus" button
    if (loadMoreContainer && loadMoreButton) {
      // Show button only if there are more events AND we haven't reached the max (12)
      if (filteredEvents.length > eventsToDisplay && eventsToDisplay < maxEvents) {
        loadMoreContainer.style.display = 'flex';
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }
    
    // Inject JSON-LD structured data for events (for SEO)
    injectEventStructuredData(eventsToShow);
  }
  
  function injectEventStructuredData(events) {
    // Remove existing event schemas
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-event-schema]');
    existingSchemas.forEach(schema => schema.remove());
    
    if (!events || events.length === 0) return;
    
    // Get all cards with their schemas
    const cards = Array.from(document.querySelectorAll('.current-event-card[data-schema]'));
    const eventSchemas = cards.map(card => {
      try {
        return JSON.parse(card.getAttribute('data-schema'));
      } catch (e) {
        return null;
      }
    }).filter(schema => schema !== null);
    
    // Inject individual event schemas
    eventSchemas.forEach((eventSchema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-event-schema', 'true');
      script.textContent = JSON.stringify(eventSchema);
      document.head.appendChild(script);
    });
    
    // Create ItemList schema for all displayed events
    if (eventSchemas.length > 0) {
      const eventListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Nos événements du moment",
        "description": "Découvrez les soirées exclusives qui vous attendent.",
        "numberOfItems": eventSchemas.length,
        "itemListElement": eventSchemas.map((eventSchema, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": eventSchema
        }))
      };
      
      const listScript = document.createElement('script');
      listScript.type = 'application/ld+json';
      listScript.setAttribute('data-event-schema', 'true');
      listScript.textContent = JSON.stringify(eventListSchema);
      document.head.appendChild(listScript);
    }
  }

  // Load more events handler
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      displayedEventsCount += 3;
      // Cap at 12 maximum
      if (displayedEventsCount > 12) {
        displayedEventsCount = 12;
      }
      displayEvents(allEvents);
    });
  }

  // Search functionality
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      displayedEventsCount = 6; // Reset to 6 when searching
      
      // Debounce search for better performance
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        displayEvents(allEvents);
      }, 300);
    });
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        displayEvents(allEvents);
      }
    });
  }

  async function loadEvents() {
    try {
      // Utiliser un proxy CORS pour contourner les restrictions
      // Option 1: Utiliser corsproxy.io (gratuit et fiable)
      const apiUrl = 'https://api.nightsquarepro.com/tevents/SelectAll.php';
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      
      // Option 2: Si corsproxy.io ne fonctionne pas, essayer allorigins.win
      // const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let data = await response.json();
      
      // Si on utilise allorigins.win, les données sont dans data.contents
      if (data.contents) {
        data = JSON.parse(data.contents);
      }
      
      // L'API retourne les événements dans la clé "tevents"
      if (data && data.tevents && Array.isArray(data.tevents)) {
        data = data.tevents;
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Chercher un tableau dans l'objet (fallback)
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          data = data[arrayKey];
        }
      }
      
      // Clear loading state
      eventsGrid.innerHTML = '';
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Filter out past events before storing
        const now = new Date();
        
        const activeEvents = data.filter(event => {
          const eventEndDate = event.event_endDate || event.event_date || event.date;
          if (!eventEndDate) return true; // Keep events without end date
          
          try {
            const endDate = new Date(eventEndDate);
            // Si la date de fin contient une heure, on la compare directement
            // Sinon, on considère que l'événement se termine à la fin de la journée (23:59:59)
            if (eventEndDate.includes('T') || eventEndDate.includes(' ')) {
              // La date contient une heure, comparer directement
              return endDate >= now;
            } else {
              // Pas d'heure, considérer que l'événement se termine à la fin de la journée
              endDate.setHours(23, 59, 59, 999);
              return endDate >= now;
            }
          } catch (e) {
            console.warn('Invalid date format for event:', eventEndDate, e);
            return true; // Keep events with invalid dates
          }
        });
        
        // Store only active (non-ended) events
        allEvents = activeEvents;
        
        // Extract unique cities from active events only
        const cities = [...new Set(activeEvents.map(event => {
          return event.event_city || event.event_lieux || '';
        }).filter(city => city.trim() !== ''))].sort();
        
        // Create filter buttons (only cities with active events)
        createFilterButtons(cities);
        
        // Ensure "Tous" filter is active initially
        currentCityFilter = 'all';
        
        // Check if this is an initial load or a refresh
        const isInitialLoad = !window.previousEventsCount;
        const previousCount = window.previousEventsCount || 0;
        const eventsCountChanged = previousCount !== activeEvents.length;
        window.previousEventsCount = activeEvents.length;
        
        // Only reload DJs on initial load (not on auto-refresh to save API calls)
        // DJs will be refreshed when events count changes significantly
        if (isInitialLoad) {
          // Load DJs from API after events are loaded
          loadDJsFromAPI();
        } else if (eventsCountChanged) {
          // Reload DJs only if event count changed (new event added)
          console.log(`[Events Refresh] Event count changed (${previousCount} -> ${activeEvents.length}), reloading DJs...`);
          loadDJsFromAPI();
        }
        
        // Display all events (will update display if events changed)
        displayEvents(allEvents);
        
        // Log refresh status
        if (!isInitialLoad) {
          console.log(`[Events Refresh] Auto-refresh completed: ${activeEvents.length} active events found`);
        }
      } else {
        // No active events found
        eventsGrid.innerHTML = '<div class="events-empty"><p>Aucun événement à venir disponible pour le moment</p></div>';
        
        // Still try to load DJs even if no events
        loadDJsFromAPI();
      }
    } catch (error) {
      console.error('Error loading events:', error);
      
      // Essayer avec un autre proxy si le premier échoue
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        try {
          const apiUrl = 'https://api.nightsquarepro.com/tevents/SelectAll.php';
          const fallbackProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
          
          const fallbackResponse = await fetch(fallbackProxyUrl);
          const fallbackData = await fallbackResponse.json();
          
          let data = fallbackData.contents ? JSON.parse(fallbackData.contents) : fallbackData;
          
          // L'API retourne les événements dans la clé "tevents"
          if (data && data.tevents && Array.isArray(data.tevents)) {
            data = data.tevents;
          } else if (data && typeof data === 'object' && !Array.isArray(data)) {
            const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (arrayKey) {
              data = data[arrayKey];
            }
          }
          
          eventsGrid.innerHTML = '';
          
          if (data && Array.isArray(data) && data.length > 0) {
            // Filter out past events before storing
            const now = new Date();
            
            const activeEvents = data.filter(event => {
              const eventEndDate = event.event_endDate || event.event_date || event.date;
              if (!eventEndDate) return true; // Keep events without end date
              
              try {
                const endDate = new Date(eventEndDate);
                // Si la date de fin contient une heure, on la compare directement
                // Sinon, on considère que l'événement se termine à la fin de la journée (23:59:59)
                if (eventEndDate.includes('T') || eventEndDate.includes(' ')) {
                  // La date contient une heure, comparer directement
                  return endDate >= now;
                } else {
                  // Pas d'heure, considérer que l'événement se termine à la fin de la journée
                  endDate.setHours(23, 59, 59, 999);
                  return endDate >= now;
                }
              } catch (e) {
                console.warn('Invalid date format for event:', eventEndDate, e);
                return true; // Keep events with invalid dates
              }
            });
            
            // Store only active (non-ended) events
            allEvents = activeEvents;
            
            // Extract unique cities from active events only
            const cities = [...new Set(activeEvents.map(event => {
              return event.event_city || event.event_lieux || '';
            }).filter(city => city.trim() !== ''))].sort();
            
            // Create filter buttons
            createFilterButtons(cities);
            
            // Display all events initially
            displayEvents(allEvents);
            
            // Inject structured data for all events
            setTimeout(() => {
              const displayedCards = document.querySelectorAll('.current-event-card');
              if (displayedCards.length > 0) {
                injectEventStructuredData(Array.from(displayedCards).map((card, idx) => allEvents[idx]).filter(Boolean));
              }
            }, 100);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback proxy also failed:', fallbackError);
        }
      }
      
      eventsGrid.innerHTML = '<div class="events-error"><p>Impossible de charger les événements. Veuillez réessayer plus tard.</p></div>';
    }
  }

  function createEventCard(event, index) {
    const card = document.createElement('article');
    card.className = 'current-event-card';
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/Event');
    
    // Get event image or use default gradient
    const gradients = [
      'linear-gradient(135deg, #1a0a0a 0%, #900900 50%, #B2986B 100%)',
      'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #B2986B 100%)',
      'linear-gradient(135deg, #1a1a0a 0%, #3a3a1a 50%, #B2986B 100%)',
      'linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 50%, #B2986B 100%)',
      'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #B2986B 100%)',
      'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #B2986B 100%)'
    ];
    
    const emojis = ['🎭', '🍾', '🎵', '✨', '🌃', '🛥️'];
    
    // Utiliser event_logo_url de l'API
    const imageUrl = event.event_logo_url || event.image_url;
    const gradient = gradients[index % gradients.length];
    const emoji = emojis[index % emojis.length];
    
    // Format date - utiliser event_date de l'API
    let dateText = '';
    const eventDate = event.event_date || event.date;
    if (eventDate) {
      try {
        const date = new Date(eventDate);
        const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        dateText = date.toLocaleDateString('fr-FR', options);
      } catch (e) {
        dateText = eventDate;
      }
    }
    
    // Get location/venue - utiliser event_lieux ou event_city de l'API
    const location = event.event_lieux || event.event_city || event.venue || event.location || 'Événement exclusif';
    
    // Utiliser event_name de l'API
    const eventName = event.event_name || event.title || event.name || 'Événement exclusif';
    
    // Formater la date pour l'affichage
    let formattedDateOverlay = '';
    let formattedDateInfo = '';
    let formattedTimeInfo = '';
    let dayName = '';
    let monthName = '';
    let dayNumber = 0;
    
    if (eventDate) {
      try {
        const date = new Date(eventDate);
        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        dayName = dayNames[date.getDay()];
        dayNumber = date.getDate();
        monthName = monthNames[date.getMonth()];
        
        formattedDateOverlay = `${dayName} [${monthName} ${dayNumber}TH]`;
        formattedDateInfo = `${String(dayNumber).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        formattedTimeInfo = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
      } catch (e) {
        formattedDateOverlay = eventDate;
        formattedDateInfo = '';
        formattedTimeInfo = '';
      }
    }
    
    // Extraire les artistes du nom de l'événement
    const artists = eventName.split('INVITES').map(s => s.trim()).filter(s => s);
    let mainArtists = [];
    if (artists.length > 1) {
      const artistString = artists.slice(1).join(' ');
      mainArtists = artistString.split(/&|VS|vs| - /).map(a => a.trim()).filter(a => a.trim());
    } else {
      mainArtists = [eventName];
    }
    
    // Formater le nom de l'événement avec crochets (ex: "[ART]EFACT")
    const eventNameParts = eventName.split(' ');
    const eventNameFormatted = eventNameParts.length > 1 
      ? `[${eventNameParts[0]}]${eventNameParts.slice(1).join(' ')}`
      : eventName;
    
    // Formater le lieu avec la ville
    const eventLieux = event.event_lieux || '';
    const eventCity = event.event_city || '';
    let venueDisplay = location;
    
    // Si on a event_lieux et event_city, afficher "lieu, ville"
    if (eventLieux && eventCity) {
      venueDisplay = `${eventLieux}, ${eventCity}`;
    } else if (eventLieux && !eventCity) {
      venueDisplay = eventLieux;
    } else if (!eventLieux && eventCity) {
      venueDisplay = eventCity;
    }
    
    // Format ISO date for schema.org
    let isoDate = '';
    let isoEndDate = '';
    if (eventDate) {
      try {
        const date = new Date(eventDate);
        isoDate = date.toISOString();
      } catch (e) {
        console.warn('Invalid date format:', eventDate);
      }
    }
    if (event.event_endDate) {
      try {
        const endDate = new Date(event.event_endDate);
        isoEndDate = endDate.toISOString();
      } catch (e) {
        console.warn('Invalid end date format:', event.event_endDate);
      }
    }
    
    // Create structured data for this event
    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": eventName,
      "description": `${eventName} - Événement exclusif nightlife à ${venueDisplay}. Réservez votre table premium via Night Square.`,
      "startDate": isoDate,
      "endDate": isoEndDate || isoDate,
      "location": {
        "@type": "Place",
        "name": eventLieux || eventCity || venueDisplay,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": eventCity || "",
          "addressCountry": "FR"
        }
      },
      "image": imageUrl || "https://nightsquare.com/src/IMG_9247.PNG",
      "organizer": {
        "@type": "Organization",
        "name": "Night Square",
        "url": "https://nightsquare.com"
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "url": "https://nightsquare.com/events.html",
        "price": "0",
        "priceCurrency": "EUR"
      }
    };
    
    // Add schema as data attribute for later JSON-LD injection
    card.setAttribute('data-schema', JSON.stringify(eventSchema));
    
    card.innerHTML = `
      <div class="current-event-main">
        <div class="current-event-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${eventName} - Événement exclusif à ${venueDisplay}" itemprop="image" loading="lazy" width="400" height="267">` : `<div style="position: absolute; inset: 0; background: ${gradient}; display: flex; align-items: center; justify-content: center; font-size: 4rem; opacity: 0.3;">${emoji}</div>`}
        </div>
        
        <div class="current-event-info">
          <h3 class="current-event-info-title" itemprop="name">${eventName}</h3>
          <address class="current-event-info-venue" itemprop="location" itemscope itemtype="https://schema.org/Place">
            <span itemprop="name">${eventLieux || ''}</span>
            ${eventCity ? `<span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><span itemprop="addressLocality">${eventCity}</span></span>` : ''}
          </address>
          <div class="current-event-info-details">
            ${formattedDateInfo ? `
              <div class="current-event-info-detail">
                <span class="current-event-info-detail-label">Date</span>
                <time class="current-event-info-detail-value" datetime="${isoDate}" itemprop="startDate">${formattedDateInfo}</time>
              </div>
            ` : ''}
            ${formattedTimeInfo ? `
              <div class="current-event-info-detail">
                <span class="current-event-info-detail-label">Heure</span>
                <time class="current-event-info-detail-value" datetime="${isoDate}">${formattedTimeInfo}</time>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    return card;
  }
  
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // Scroll animations - Enhanced with better visibility
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Force reflow to ensure animation triggers
          void element.offsetWidth;
          
          // Add visible class immediately
          element.classList.add('visible');
          
          // Don't observe again once animated
          animationObserver.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px'
    });
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      // Observe all animatable elements
      const animatableElements = document.querySelectorAll(`
        .card, 
        .city-card, 
        .step, 
        .event-card,
        .trust-logo,
        section > h2,
        section > p.text-center
      `);
      
      animatableElements.forEach((el, index) => {
        // Skip hero elements (they animate on load)
        if (el.closest('.hero')) return;
        
        // Add appropriate animation class based on element type
        if (el.classList.contains('card') || el.classList.contains('city-card') || el.classList.contains('event-card')) {
          el.classList.add('fade-in');
          // Stagger cards in grid
          const parent = el.parentElement;
          if (parent && (parent.classList.contains('grid') || parent.classList.contains('events-grid'))) {
            const cards = Array.from(parent.children);
            const cardIndex = cards.indexOf(el);
            el.style.transitionDelay = `${cardIndex * 0.12}s`;
          }
        } else if (el.classList.contains('step')) {
          el.classList.add('scale-in');
          const steps = Array.from(el.parentElement.children);
          const stepIndex = steps.indexOf(el);
          el.style.transitionDelay = `${stepIndex * 0.2}s`;
        } else if (el.tagName === 'H2') {
          el.classList.add('fade-in');
          el.style.transitionDelay = '0.1s';
        } else if (el.tagName === 'P' && el.classList.contains('text-center')) {
          el.classList.add('fade-in');
          el.style.transitionDelay = '0.2s';
        } else {
          el.classList.add('fade-in');
        }
        
        animationObserver.observe(el);
      });
    }, 100);
  }
  
  // Smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Trust carousel - Load all logos from directory and create infinite scroll on two rows
  const trustCarouselTop = document.querySelector('.trust-carousel-top');
  const trustCarouselBottom = document.querySelector('.trust-carousel-bottom');
  
  if (trustCarouselTop && trustCarouselBottom) {
    // List of all logo files in src/img/orga/
    const logoFiles = [
      'cactus 2.png',
      'Capture d\u2019écran 2025-07-27 à 15.13.00 1.png',
      'Capture d\u2019écran 2025-10-08 à 17.33.58 1.png',
      'Capture d\u2019écran 2025-10-08 à 17.34.10 1.png',
      'Capture d\u2019écran 2025-10-08 à 17.34.10.png',
      'Capture d\u2019écran 2026-01-01 à 14.08.25.png',
      'download 12.png',
      'download 13.png',
      'download 14.png',
      'download 15.png',
      'download 16.png',
      'download 2.png',
      'download 3-1.png',
      'download 3.png',
      'download 5.png',
      'download 9.png',
      'download-1 10.png',
      'download-1 4.png',
      'download-1.png',
      'download-10.png',
      'download-11 1.png',
      'download-12.png',
      'download-13.png',
      'download-19.png',
      'download-2.png',
      'download-3 1.png',
      'download-3.png',
      'download-4.png',
      'download-5.png',
      'download-6.png',
      'download-7.png',
      'download-8.png',
      'download-9.png',
      'FACTORY 3.png',
      'Group 1000001184.png',
      'LOGO BLANC 2.png',
      'Logo typographique MYSTIQ (blanc sur fond transparent) 2.png',
      'Logo_Joya_blanc 1.png',
      'Logo_Joya_blanc.png',
      'LT2 2.png',
      'novasima copie 2.png',
      'phc 5.png',
      'phc 6.png',
      'Plan_de_travail_4-4_1_hawu0v 3.png',
      'sanctum_white 1.png',
      'tothem 2.png',
      'Transparent 2-1.png',
      'Transparent 2.png'
    ];
    
    // Function to create logo element
    function createLogoElement(filename) {
      const logoDiv = document.createElement('div');
      logoDiv.className = 'trust-logo';
      const img = document.createElement('img');
      // encodeURIComponent handles Unicode characters including typographic apostrophes correctly
      const encodedFilename = encodeURIComponent(filename);
      img.src = `src/img/orga/${encodedFilename}`;
      img.alt = filename.replace('.png', '').replace(/\d+/g, '').trim();
      img.loading = 'lazy';
      img.onerror = function() {
        console.warn(`Failed to load logo: ${filename}`);
        logoDiv.style.display = 'none';
      };
      logoDiv.appendChild(img);
      return logoDiv;
    }
    
    // Clear existing logos
    trustCarouselTop.innerHTML = '';
    trustCarouselBottom.innerHTML = '';
    
    // Create logo elements for both carousels - EXACTLY the same logos in the same order
    logoFiles.forEach((filename) => {
      trustCarouselTop.appendChild(createLogoElement(filename));
      trustCarouselBottom.appendChild(createLogoElement(filename));
    });
    
    // Wait for images to load, then clone for infinite scroll
    setTimeout(() => {
      const logosTop = Array.from(trustCarouselTop.querySelectorAll('.trust-logo'));
      const logosBottom = Array.from(trustCarouselBottom.querySelectorAll('.trust-logo'));
      const originalCount = logoFiles.length;
      
      if (originalCount > 0) {
        console.log(`Trust carousel: Loaded ${originalCount} logos for each row`);
        
        // Clone ALL logos in top carousel for seamless infinite loop
        logosTop.forEach(logo => {
          const clone = logo.cloneNode(true);
          trustCarouselTop.appendChild(clone);
        });
        
        // Clone ALL logos in bottom carousel for seamless infinite loop - EXACTLY the same as top
        logosBottom.forEach(logo => {
          const clone = logo.cloneNode(true);
          trustCarouselBottom.appendChild(clone);
        });
        
        // Force a reflow to ensure DOM is updated
        void trustCarouselTop.offsetWidth;
        void trustCarouselBottom.offsetWidth;
        
        // Adjust animation duration - slower for better visibility
        // Increased from 1.2s per logo to 2.5s per logo for slower animation
        const duration = Math.max(120, originalCount * 2.5);
        
        // Set animation duration for both carousels - EXACTLY the same
        trustCarouselTop.style.setProperty('--animation-duration', `${duration}s`);
        trustCarouselBottom.style.setProperty('--animation-duration', `${duration}s`);
        
        // Apply animations explicitly - both start already in motion
        // Top: 0 to -50% (left to right)
        // Bottom: -50% to 0 (right to left) - starts offset by 25% to avoid same logos crossing
        const startOffset = duration * -0.5; // Start at 50% of animation (already in motion)
        
        trustCarouselTop.style.animation = `scrollLogosLeft ${duration}s linear infinite`;
        trustCarouselTop.style.animationDelay = `${startOffset}s`;
        
        trustCarouselBottom.style.animation = `scrollLogosRight ${duration}s linear infinite`;
        // Bottom starts already in motion but with smaller offset (25% instead of 50%) to avoid crossing
        trustCarouselBottom.style.animationDelay = `${startOffset + (duration * 0.25)}s`;
        
        // Ensure both carousels have the same structure
        console.log(`Top logos: ${trustCarouselTop.querySelectorAll('.trust-logo').length}, Bottom logos: ${trustCarouselBottom.querySelectorAll('.trust-logo').length}`);
        console.log(`Animations: Top delay ${startOffset}s, Bottom delay ${startOffset + (duration * 0.5)}s`);
        
        console.log(`Trust carousel: Animation duration set to ${duration}s, both rows identical, opposite directions`);
      }
    }, 200);
  }

});

// Features Cards - Empilement simple avec z-index fixe
// Les cartes s'empilent naturellement : carte 1 en dessous (z-index: 1), carte 5 au-dessus (z-index: 5)

// Features Slider (if exists)
document.addEventListener('DOMContentLoaded', function() {
  const sliderTrack = document.querySelector('.features-slider-track');
  const slides = document.querySelectorAll('.feature-slide');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');
  const dots = document.querySelectorAll('.slider-dot');
  
  if (!sliderTrack || slides.length === 0) return;
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  function updateSlider(animate = true) {
    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Add active class to current slide with animation
    if (slides[currentSlide]) {
      slides[currentSlide].classList.add('active');
      
      // Trigger reflow for animation
      if (animate) {
        slides[currentSlide].style.animation = 'none';
        setTimeout(() => {
          slides[currentSlide].style.animation = '';
        }, 10);
      }
    }
    
    // Move track with smooth transition
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots with animation
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Update buttons (allow looping)
    if (prevBtn) {
      prevBtn.disabled = false;
    }
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }
  
  function goToSlide(index, animate = true) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    updateSlider(animate);
  }
  
  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
    } else {
      currentSlide = 0; // Loop back to start
    }
    updateSlider(true);
  }
  
  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
    } else {
      currentSlide = totalSlides - 1; // Loop to end
    }
    updateSlider(true);
  }
  
  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const sliderSection = document.querySelector('.features-key-section');
    if (!sliderSection) return;
    
    const rect = sliderSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    }
  });
  
  // Auto-play (optional - can be disabled)
  let autoPlayInterval;
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  }
  
  // Start auto-play
  startAutoPlay();
  
  // Pause on hover
  const sliderWrapper = document.querySelector('.features-slider-wrapper');
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', stopAutoPlay);
    sliderWrapper.addEventListener('mouseleave', startAutoPlay);
  }
  
  // Initialize - show first slide immediately
  if (slides.length > 0) {
    slides[0].classList.add('active');
    updateSlider(false);
  }
});
