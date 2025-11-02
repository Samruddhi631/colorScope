  const firebaseConfig = {
    apiKey: "AIzaSyAumzAsfbqrb_Afp0dZvgDCmBFj8DxMvrA",
    authDomain: "colorscope-475ba.firebaseapp.com",
    projectId: "colorscope-475ba",
    storageBucket: "colorscope-475ba.firebasestorage.app",
    messagingSenderId: "216162643321",
    appId: "1:216162643321:web:d360c12b3601fe4bd213a8",
    measurementId: "G-6GHK1PH9TW"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

// =============================================================================
// NAVIGATION & UI CONTROLLER
// =============================================================================

const NavigationController = (() => {
  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  // cached elements (initialized after DOM ready)
  let toolsBtn, toolsDropdown, dropdownBackdrop, profileSection, signUpBtn, signInBtn, profileIcon;

  const init = () => {
    // ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _init);
    } else {
      _init();
    }
  };

  function _init() {
    // cache elements
    toolsBtn = document.getElementById('toolsBtn');
    toolsDropdown = document.getElementById('toolsDropdown');
    profileSection = document.getElementById('profileSection');
    signUpBtn = document.getElementById('signUpBtn');
    signInBtn = document.getElementById('signInBtn');
    profileIcon = document.querySelector('#profileIcon span');

    bindNavigationEvents();
    checkAuthState();
    initializeFeatherIcons();

  }

  const bindNavigationEvents = () => {
    if (toolsBtn && toolsDropdown) {
      toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // toggle visibility
        toolsDropdown.classList.toggle('hidden');

        // aria
        const expanded = toolsDropdown.classList.contains('hidden') ? 'false' : 'true';
        toolsBtn.setAttribute('aria-expanded', expanded);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#toolsBtn') && !e.target.closest('#toolsDropdown')) {
        toolsDropdown?.classList.add('hidden');
        toolsBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toolsDropdown?.classList.add('hidden');
        toolsBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    // hide dropdown when any internal link is clicked
    if (toolsDropdown) {
      toolsDropdown.querySelectorAll('.elem').forEach((e) => {
        e.addEventListener('click', () => {
          toolsDropdown.classList.add('hidden');
          toolsBtn?.setAttribute('aria-expanded', 'false');
        });
      });
    }
  };

  // ---------- SPA SECTION SWITCHER ----------
  const toolButtons = document.querySelectorAll("#toolsDropdown .elem");
  const sections = document.querySelectorAll(".fullElems");

  toolButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.id; // 0, 1, 2, etc.
      console.log(targetId);
      // Hide all sections
      sections.forEach((section) => {
        section.classList.add("hidden");
      });

      // Show selected section
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        console.log(targetSection);
        sections[targetSection.id].classList.remove("hidden");
      }

      // Close the dropdown
      document.getElementById("toolsDropdown").classList.add("hidden");
    });
  });

  const initializeFeatherIcons = () => {
    if (typeof feather !== 'undefined' && feather.replace) {
      feather.replace();
    }
  };

  const checkAuthState = () => {
    if (currentUser) {
      showProfileSection();
    } else {
      showAuthButtons();
    }
  };

  const showProfileSection = () => {
    if (signUpBtn) signUpBtn.style.display = 'none';
    if (signInBtn) signInBtn.style.display = 'none';
    if (profileSection) profileSection.classList.remove('hidden');

    if (currentUser && profileIcon && currentUser.name) {
      profileIcon.textContent = currentUser.name.charAt(0).toUpperCase();
    }
  };

  const showAuthButtons = () => {
    if (signUpBtn) signUpBtn.style.display = 'block';
    if (signInBtn) signInBtn.style.display = 'block';
    if (profileSection) profileSection.classList.add('hidden');
  };

  const updateUser = (user) => {
    currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      showProfileSection();
    } else {
      localStorage.removeItem('currentUser');
      showAuthButtons();
    }
  };

  const getCurrentUser = () => currentUser;

  return {
    init,
    updateUser,
    getCurrentUser,
    initializeFeatherIcons
  };
})();

//Initalize Navigation Controller
NavigationController.init();



// =============================================================================
// AUTHENTICATION CONTROLLER
// =============================================================================

const AuthController = (() => {
  const init = () => {
    bindAuthEvents();
  };

  const bindAuthEvents = () => {
    // Auth buttons
    document.getElementById('signUpBtn')?.addEventListener('click', () => openAuthModal());
    document.getElementById('signInBtn')?.addEventListener('click', () => openAuthModal('signin'));
    document.getElementById('closeAuthModal')?.addEventListener('click', () => closeAuthModal());
    
    // Profile menu
    document.getElementById('profileIcon')?.addEventListener('mouseenter', () => {
      document.getElementById('profileMenu')?.classList.remove('hidden');
    });
    document.getElementById('profileSection')?.addEventListener('mouseleave', () => {
      document.getElementById('profileMenu')?.classList.add('hidden');
    });
    document.getElementById('signOutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      signOut();
    });
    
    // Auth modal navigation
    document.getElementById('continueWithEmail')?.addEventListener('click', () => showSignUpForm());
    document.getElementById('switchToSignIn')?.addEventListener('click', () => showSignInForm());
    document.getElementById('switchToSignUp')?.addEventListener('click', () => showSignUpForm());
    
    // Password toggles
    document.getElementById('toggleSignUpPassword')?.addEventListener('click', () => 
      togglePassword('signUpPassword', 'toggleSignUpPassword'));
    document.getElementById('toggleSignInPassword')?.addEventListener('click', () => 
      togglePassword('signInPassword', 'toggleSignInPassword'));
    
    // Form submissions
    document.getElementById('signUpForm')?.addEventListener('submit', (e) => handleSignUp(e));
    document.getElementById('signInForm')?.addEventListener('submit', (e) => handleSignIn(e));

    // Close modal on backdrop click
    document.getElementById('authModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'authModal') {
        closeAuthModal();
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('authModal')?.classList.contains('hidden')) {
        closeAuthModal();
      }
    });
  };

  const openAuthModal = (view = 'initial') => {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authModalContent');
    
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
    
    setTimeout(() => {
      if (content) {
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
      }
    }, 10);
    
    if (view === 'signin') {
      showSignInForm();
    } else {
      showInitialView();
    }
    
    NavigationController.initializeFeatherIcons();
  };

  const closeAuthModal = () => {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authModalContent');
    
    if (content) {
      content.style.transform = 'scale(0.95)';
      content.style.opacity = '0';
    }
    
    setTimeout(() => {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      showInitialView();
      resetForms();
    }, 300);
  };

  const showInitialView = () => {
    document.getElementById('authInitial')?.classList.remove('hidden');
    document.getElementById('authSignUp')?.classList.add('hidden');
    document.getElementById('authSignIn')?.classList.add('hidden');
  };

  const showSignUpForm = () => {
    document.getElementById('authInitial')?.classList.add('hidden');
    document.getElementById('authSignUp')?.classList.remove('hidden');
    document.getElementById('authSignIn')?.classList.add('hidden');
    NavigationController.initializeFeatherIcons();
  };

  const showSignInForm = () => {
    document.getElementById('authInitial')?.classList.add('hidden');
    document.getElementById('authSignUp')?.classList.add('hidden');
    document.getElementById('authSignIn')?.classList.remove('hidden');
    NavigationController.initializeFeatherIcons();
  };

  const togglePassword = (inputId, buttonId) => {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (!input || !button) return;
    
    if (input.type === 'password') {
      input.type = 'text';
      button.innerHTML = '<i data-feather="eye-off" class="w-5 h-5"></i>';
    } else {
      input.type = 'password';
      button.innerHTML = '<i data-feather="eye" class="w-5 h-5"></i>';
    }
    
    NavigationController.initializeFeatherIcons();
  };

const handleSignUp = async (e) => {
  e.preventDefault();

  if (!FormValidator.validateSignUpForm()) return;

  const name = document.getElementById('signUpName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value.trim();
  const birthdate = document.getElementById('signUpBirthdate').value;

  NotificationManager.show('Creating your account...', 'info');

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user data in Firestore
    await db.collection('users').doc(user.uid).set({
      name,
      email,
      birthdate,
      createdAt: new Date().toISOString()
    });

    NotificationManager.show('Account created successfully!', 'success');
    closeAuthModal();
  } catch (error) {
    NotificationManager.show(error.message, 'error');
    console.error('Signup error:', error);
  }
};




const handleSignIn = async (e) => {
  e.preventDefault();

  if (!FormValidator.validateSignInForm()) return;

  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPassword").value.trim();

  NotificationManager.show("Signing in...", "info");

  try {
    // Sign in using Firebase Authentication
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Fetch user data from Firestore
    const docRef = firebase.firestore().collection("users").doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // update UI (e.g., show profile icon, hide sign-in button)
      NavigationController.updateUser(docSnap.data());
      NotificationManager.show("Signed in successfully!", "success");
      closeAuthModal();
    } else {
      NotificationManager.show("User data not found in database.", "error");
    }

  } catch (error) {
    console.error("Sign-in Error:", error);
    if (error.code === "auth/wrong-password") {
      NotificationManager.show("Incorrect password. Please try again.", "error");
    } else if (error.code === "auth/user-not-found") {
      NotificationManager.show("No account found with this email. Please sign up first.", "warning");
    } else {
      NotificationManager.show(error.message, "error");
    }
  }
};



const signOut = () => {
  auth.signOut()
    .then(() => {
      NavigationController.updateUser(null);
      NotificationManager.show('Signed out successfully', 'success');
    })
    .catch((error) => {
      NotificationManager.show(error.message, 'error');
    });
};


  const resetForms = () => {
    document.getElementById('signUpForm')?.reset();
    document.getElementById('signInForm')?.reset();
    
    document.querySelectorAll('.text-red-500').forEach(error => {
      error.classList.add('hidden');
    });
  };

  return {
    init
  };
})();

// =============================================================================
// FORM VALIDATOR
// =============================================================================

const FormValidator = (() => {
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateSignUpForm = () => {
    let isValid = true;
    
    // Name validation
    const name = document.getElementById('signUpName')?.value.trim() || '';
    const nameError = document.getElementById('nameError');
    if (name.length < 2) {
      nameError?.classList.remove('hidden');
      isValid = false;
    } else {
      nameError?.classList.add('hidden');
    }
    
    // Email validation
    const email = document.getElementById('signUpEmail')?.value.trim() || '';
    const emailError = document.getElementById('emailError');
    if (!validateEmail(email)) {
      emailError?.classList.remove('hidden');
      isValid = false;
    } else {
      emailError?.classList.add('hidden');
    }
    
    // Password validation
    const password = document.getElementById('signUpPassword')?.value || '';
    const passwordError = document.getElementById('passwordError');
    if (password.length < 6) {
      passwordError?.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError?.classList.add('hidden');
    }
    
    // Birthdate validation
    const birthdate = document.getElementById('signUpBirthdate')?.value || '';
    const birthdateError = document.getElementById('birthdateError');
    if (!birthdate) {
      birthdateError?.classList.remove('hidden');
      isValid = false;
    } else {
      birthdateError?.classList.add('hidden');
    }

    
    return isValid;
  };

  const validateSignInForm = () => {
    let isValid = true;
    
    // Email validation
    const email = document.getElementById('signInEmail')?.value.trim() || '';
    const emailError = document.getElementById('signInEmailError');
    if (!validateEmail(email)) {
      emailError?.classList.remove('hidden');
      isValid = false;
    } else {
      emailError?.classList.add('hidden');
    }
    
    // Password validation
    const password = document.getElementById('signInPassword')?.value || '';
    const passwordError = document.getElementById('signInPasswordError');
    if (password.length < 6) {
      passwordError?.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError?.classList.add('hidden');
    }
    
    return isValid;
  };

  return {
    validateEmail,
    validateSignUpForm,
    validateSignInForm
  };
})();

// =============================================================================
// NOTIFICATION MANAGER
// =============================================================================

const NotificationManager = (() => {
  const show = (message, type = 'info') => {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    
    const icons = {
      success: 'check',
      error: 'x',
      info: 'info',
      warning: 'alert-triangle'
    };
    
    notification.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg notification-enter flex items-center gap-2`;
    notification.innerHTML = `
      <i data-feather="${icons[type]}" class="w-4 h-4"></i>
      ${message}
    `;
    
    const container = document.getElementById('notifications');
    if (container) {
      container.appendChild(notification);
    }
    
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
    
    setTimeout(() => {
      notification.classList.remove('notification-enter');
      notification.classList.add('notification-exit');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  };

  return { show };
})();

// =============================================================================
// PALETTE GENERATOR - MAIN FUNCTION
// =============================================================================

const PaletteGenerator = (() => {
  // State
  let state = {
    currentPalette: null,
    history: JSON.parse(localStorage.getItem('paletteHistory')) || [],
    historyIndex: parseInt(localStorage.getItem('paletteIndex')) || -1,
    colorCount: 5,
    paletteType: 'ui-design',
    isGenerating: false
  };

  const init = () => {
    bindPaletteEvents();
    loadInitialPalette();
  };

  const bindPaletteEvents = () => {
    // Core controls
    document.getElementById('undoBtn')?.addEventListener('click', () => undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => redo());
    document.getElementById('decreaseColors')?.addEventListener('click', () => adjustColorCount(-1));
    document.getElementById('increaseColors')?.addEventListener('click', () => adjustColorCount(1));
    
    // Palette type selector
    document.getElementById('paletteTypeBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('paletteTypeDropdown')?.classList.toggle('hidden');
    });
    
    document.querySelectorAll('.palette-type-option').forEach(option => {
      option.addEventListener('click', () => {
        setPaletteType(option.dataset.type);
      });
    });

    // Export and share functionality
    document.getElementById('exportBtn')?.addEventListener('click', () => showExportModal());
    document.getElementById('shareBtn')?.addEventListener('click', () => showShareModal());
    document.getElementById('closeShareModal')?.addEventListener('click', () => hideShareModal());
    document.getElementById('shareNative')?.addEventListener('click', () => shareCurrentPalette());
    document.getElementById('shareCopyLink')?.addEventListener('click', () => shareCopyLink());
    document.getElementById('shareCopyColors')?.addEventListener('click', () => shareCopyColors());
    document.getElementById('shareTwitter')?.addEventListener('click', () => shareToTwitter());
    document.getElementById('closeExportModal')?.addEventListener('click', () => hideExportModal());
    
    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', () => {
        exportPalette(option.dataset.format);
      });
    });

    // Save palette
    document.getElementById('saveBtn')?.addEventListener('click', () => savePalette());

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => handleKeyboard(e));
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#paletteTypeBtn')) {
        document.getElementById('paletteTypeDropdown')?.classList.add('hidden');
      }
    });

    // Close modals on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('paletteTypeDropdown')?.classList.add('hidden');
        hideExportModal();
        hideShareModal();
      }
    });
  };

  const loadInitialPalette = () => {
    if (state.historyIndex >= 0 && state.history.length > 0) {
      renderPalette(state.history[state.historyIndex]);
    } else {
      generateNewPalette();
    }
    updateUI();
  };

  // =============================================================================
  // CORE COLOR THEORY & ALGORITHMS
  // =============================================================================

  const hslToHex = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      Math.round(
        (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255
      );
    
    const r = f(0).toString(16).padStart(2, '0');
    const g = f(8).toString(16).padStart(2, '0');
    const b = f(4).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`.toLowerCase();
  };

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const getContrastRatio = (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = [1, 3, 5].map(i => {
        let c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getOptimalTextColor = (backgroundColor, options = {}) => {
    const { forceWhite, forceBlack, threshold = 4.5 } = options;
    
    if (forceWhite) return '#ffffff';
    if (forceBlack) return '#000000';

    const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
    const blackContrast = getContrastRatio(backgroundColor, '#000000');

    if (whiteContrast >= threshold && blackContrast >= threshold) {
      return whiteContrast > blackContrast ? '#ffffff' : '#000000';
    } else if (whiteContrast >= threshold) {
      return '#ffffff';
    } else if (blackContrast >= threshold) {
      return '#000000';
    } else {
      return whiteContrast > blackContrast ? '#ffffff' : '#000000';
    }
  };

  // =============================================================================
  // ADVANCED PALETTE GENERATION ALGORITHMS
  // =============================================================================

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateUIDesignPalette = (baseHue, count) => {
    const colors = [];
    const harmonies = ['complementary', 'triadic', 'analogous', 'split-complementary'];
    const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];

    switch (harmony) {
      case 'complementary':
        colors.push(hslToHex(baseHue, random(60, 80), random(45, 65)));
        colors.push(hslToHex((baseHue + 180) % 360, random(50, 70), random(50, 70)));
        break;
        
      case 'triadic':
        for (let i = 0; i < Math.min(3, count); i++) {
          const hue = (baseHue + i * 120) % 360;
          colors.push(hslToHex(hue, random(55, 75), random(45, 65)));
        }
        break;
        
      case 'analogous':
        for (let i = 0; i < count; i++) {
          const hue = (baseHue + i * 30 - 60) % 360;
          colors.push(hslToHex(hue, random(50, 80), random(40, 70)));
        }
        break;
        
      case 'split-complementary':
        colors.push(hslToHex(baseHue, random(60, 80), random(45, 65)));
        colors.push(hslToHex((baseHue + 150) % 360, random(50, 70), random(50, 70)));
        colors.push(hslToHex((baseHue + 210) % 360, random(50, 70), random(50, 70)));
        break;
    }

    while (colors.length < count) {
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const [h, s, l] = hexToHsl(baseColor);
      const newHue = (h + random(-30, 30)) % 360;
      const newSat = Math.max(20, Math.min(90, s + random(-20, 20)));
      const newLight = Math.max(25, Math.min(85, l + random(-25, 25)));
      colors.push(hslToHex(newHue, newSat, newLight));
    }

    return {
      colors: colors.slice(0, count),
      name: `${harmony.charAt(0).toUpperCase() + harmony.slice(1)} UI`,
      description: `Professional UI palette using ${harmony} harmony`,
      harmony,
      baseHue
    };
  };

  const generateBrandIdentityPalette = (baseHue, count) => {
    const colors = [];
    
    colors.push(hslToHex(baseHue, random(70, 90), random(45, 55)));
    
    const secondaryHue = (baseHue + random(150, 210)) % 360;
    colors.push(hslToHex(secondaryHue, random(60, 80), random(50, 60)));
    
    colors.push(hslToHex(baseHue, random(10, 30), random(20, 30)));
    colors.push(hslToHex(baseHue, random(5, 15), random(85, 95)));
    
    if (count > 4) {
      const accentHue = (baseHue + random(60, 120)) % 360;
      colors.push(hslToHex(accentHue, random(80, 95), random(55, 65)));
    }

    while (colors.length < count) {
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const [h, s, l] = hexToHsl(baseColor);
      const newHue = (h + random(-20, 20)) % 360;
      const newSat = Math.max(10, Math.min(95, s + random(-15, 15)));
      const newLight = Math.max(20, Math.min(95, l + random(-20, 20)));
      colors.push(hslToHex(newHue, newSat, newLight));
    }

    return {
      colors: colors.slice(0, count),
      name: 'Brand Identity',
      description: 'Professional brand color scheme with strong visual identity',
      harmony: 'brand',
      baseHue
    };
  };

  const generateIllustrationPalette = (baseHue, count) => {
    const colors = [];
    const temperature = Math.random() > 0.5 ? 'warm' : 'cool';
    
    if (temperature === 'warm') {
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + random(-60, 60)) % 360;
        const adjustedHue = hue < 30 || hue > 300 ? hue : 
                           (Math.random() > 0.5 ? hue + 180 : hue - 180);
        colors.push(hslToHex(adjustedHue, random(60, 95), random(35, 75)));
      }
    } else {
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + random(-45, 45)) % 360;
        const adjustedHue = (hue > 60 && hue < 300) ? hue : hue + 180;
        colors.push(hslToHex(adjustedHue, random(50, 85), random(40, 80)));
      }
    }

    return {
      colors: colors.slice(0, count),
      name: `${temperature.charAt(0).toUpperCase() + temperature.slice(1)} Illustration`,
      description: `Creative ${temperature} palette perfect for illustrations and artwork`,
      harmony: temperature,
      baseHue
    };
  };

  const generateAccessibilityPalette = (baseHue, count) => {
    const colors = [];
    
    const darkColors = [
      hslToHex(baseHue, 80, 20),
      hslToHex((baseHue + 60) % 360, 75, 25),
      hslToHex((baseHue + 180) % 360, 70, 22),
    ];
    
    const lightColors = [
      hslToHex(baseHue, 60, 85),
      hslToHex((baseHue + 60) % 360, 55, 90),
      hslToHex((baseHue + 180) % 360, 50, 88),
    ];

    for (let i = 0; i < Math.ceil(count / 2); i++) {
      if (i < darkColors.length) colors.push(darkColors[i]);
      if (colors.length < count && i < lightColors.length) colors.push(lightColors[i]);
    }

    return {
      colors: colors.slice(0, count),
      name: 'Accessibility First',
      description: 'WCAG AAA compliant high-contrast palette',
      harmony: 'accessibility',
      baseHue
    };
  };

  // =============================================================================
  // PALETTE GENERATION CONTROLLER
  // =============================================================================

  const generateNewPalette = (forceHarmony = null, forceBaseHue = null) => {
    if (state.isGenerating) return;
    
    state.isGenerating = true;
    const baseHue = forceBaseHue !== null ? forceBaseHue : Math.floor(Math.random() * 360);
    
    let palette;
    
    switch (state.paletteType) {
      case 'ui-design':
        palette = generateUIDesignPalette(baseHue, state.colorCount);
        break;
      case 'brand-identity':
        palette = generateBrandIdentityPalette(baseHue, state.colorCount);
        break;
      case 'illustration':
        palette = generateIllustrationPalette(baseHue, state.colorCount);
        break;
      case 'accessibility':
        palette = generateAccessibilityPalette(baseHue, state.colorCount);
        break;
      default:
        palette = generateUIDesignPalette(baseHue, state.colorCount);
    }

    addToHistory(palette);
    renderPalette(palette);
    updateUI();
    
    setTimeout(() => {
      state.isGenerating = false;
    }, 100);
  };

  // =============================================================================
  // UI RENDERING
  // =============================================================================

  const renderPalette = (palette) => {
    state.currentPalette = palette;
    const container = document.getElementById('colorPalette');
    if (!container) return;
    
    container.innerHTML = '';

    palette.colors.forEach((color, index) => {
      const colorBox = createColorBox(color, index, palette.colors.length);
      container.appendChild(colorBox);
    });

    updatePaletteInfo(palette);
    analyzePalette(palette);
    NavigationController.initializeFeatherIcons();
  };

  const createColorBox = (color, index, totalColors) => {
    const textColor = getOptimalTextColor(color);
    
    const box = document.createElement('div');
    box.className = 'flex-1 relative group cursor-pointer color-transition h-[76vh] flex flex-col justify-center items-center p-6';
    box.style.backgroundColor = color;
    
    let hexSize = 'text-2xl md:text-3xl lg:text-4xl';
    let detailSize = 'text-sm';
    let spacing = 'space-y-4';
    
    if (totalColors >= 7) {
      hexSize = 'text-lg md:text-xl lg:text-2xl';
      detailSize = 'text-xs';
      spacing = 'space-y-2';
    } else if (totalColors === 6) {
      hexSize = 'text-xl md:text-2xl lg:text-3xl';
      detailSize = 'text-sm';
      spacing = 'space-y-3';
    }

    box.innerHTML = `
      <div class="text-center ${spacing} opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="space-y-2">
          <h3 class="${hexSize} font-bold tracking-tight" style="color: ${textColor}">
            ${color.toUpperCase()}
          </h3>
        </div>
        
        <div class="flex justify-center gap-2 mt-4">
          <button class="copy-btn w-8 h-8 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 color-transition flex items-center justify-center" 
                  data-color="${color}" title="Copy HEX">
            <i data-feather="copy" class="w-4 h-4" style="stroke: ${textColor}"></i>
          </button>
        </div>
      </div>
      
      <div class="absolute bottom-4 left-4 right-4">
        <div class="text-center">
          <div class="${hexSize} font-bold" style="color: ${textColor}">
            ${color.toUpperCase().replace('#', '')}
          </div>
          <div class="${detailSize} opacity-80 mt-1" style="color: ${textColor}">
            Click to copy
          </div>
        </div>
      </div>
    `;

    box.addEventListener('click', (e) => {
      if (!e.target.closest('.copy-btn')) {
        copyToClipboard(color);
      }
    });

    box.querySelector('.copy-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(color);
    });

    return box;
  };

  const updatePaletteInfo = (palette) => {
    const infoEl = document.getElementById('paletteInfo');
    if (infoEl) {
      infoEl.textContent = `${palette.name} • ${palette.description}`;
    }
  };

  const analyzePalette = (palette) => {
    let totalContrast = 0;
    let contrastPairs = 0;
    let accessiblePairs = 0;

    for (let i = 0; i < palette.colors.length; i++) {
      for (let j = i + 1; j < palette.colors.length; j++) {
        const contrast = getContrastRatio(palette.colors[i], palette.colors[j]);
        totalContrast += contrast;
        contrastPairs++;
        if (contrast >= 4.5) accessiblePairs++;
      }
    }

    const avgContrast = contrastPairs > 0 ? (totalContrast / contrastPairs) : 0;
    const accessibilityScore = contrastPairs > 0 ? (accessiblePairs / contrastPairs * 100) : 0;

    const contrastEl = document.getElementById('contrastScore');
    const accessEl = document.getElementById('accessibilityScore');
    const harmonyEl = document.getElementById('harmonyScore');
    
    if (contrastEl) contrastEl.textContent = avgContrast.toFixed(1);
    if (accessEl) accessEl.textContent = `${Math.round(accessibilityScore)}%`;
    if (harmonyEl) harmonyEl.textContent = getHarmonyScore(palette);
  };

  const getHarmonyScore = (palette) => {
    const hues = palette.colors.map(color => hexToHsl(color)[0]);
    let harmonyScore = 85;

    const relationships = [];
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        const diff = Math.abs(hues[i] - hues[j]);
        const minDiff = Math.min(diff, 360 - diff);
        relationships.push(minDiff);
      }
    }

    relationships.forEach(rel => {
      if (Math.abs(rel - 60) < 15 || Math.abs(rel - 120) < 15 || Math.abs(rel - 180) < 15) {
        harmonyScore += 5;
      }
    });

    return Math.min(100, Math.round(harmonyScore)) + '%';
  };

  // =============================================================================
  // USER INTERACTIONS
  // =============================================================================

  const handleKeyboard = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        generateNewPalette();
        break;
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          undo();
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          redo();
        }
        break;
      case 'KeyS':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          savePalette();
        }
        break;
      case 'KeyE':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          showExportModal();
        }
        break;
    }
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
      NotificationManager.show(`${color} copied to clipboard!`, 'success');
    }).catch(() => {
      NotificationManager.show('Failed to copy color', 'error');
    });
  };

  const adjustColorCount = (delta) => {
    const newCount = Math.max(3, Math.min(8, state.colorCount + delta));
    if (newCount !== state.colorCount) {
      state.colorCount = newCount;
      if (state.currentPalette) {
        generateNewPalette(state.currentPalette.harmony, state.currentPalette.baseHue);
      }
      const countEl = document.getElementById('colorCount');
      if (countEl) countEl.textContent = state.colorCount;
    }
  };

  const setPaletteType = (type) => {
    state.paletteType = type;
    const typeNames = {
      'ui-design': 'UI Design',
      'brand-identity': 'Brand Identity', 
      'illustration': 'Illustration',
      'accessibility': 'Accessibility First'
    };
    
    const typeEl = document.getElementById('currentPaletteType');
    if (typeEl) typeEl.textContent = typeNames[type];
    document.getElementById('paletteTypeDropdown')?.classList.add('hidden');
    
    if (state.currentPalette) {
      generateNewPalette();
    }
  };

  // =============================================================================
  // HISTORY MANAGEMENT
  // =============================================================================

  const addToHistory = (palette) => {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(palette);
    state.historyIndex = state.history.length - 1;
    
    if (state.history.length > 50) {
      state.history.shift();
      state.historyIndex--;
    }
    
    saveToLocalStorage();
  };

  const undo = () => {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      renderPalette(state.history[state.historyIndex]);
      updateUI();
      saveToLocalStorage();
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      renderPalette(state.history[state.historyIndex]);
      updateUI();
      saveToLocalStorage();
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('paletteHistory', JSON.stringify(state.history));
    localStorage.setItem('paletteIndex', state.historyIndex.toString());
  };

  // =============================================================================
  // EXPORT FUNCTIONALITY
  // =============================================================================

  const showExportModal = () => {
    const modal = document.getElementById('exportModal');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
  };

  const hideExportModal = () => {
    const modal = document.getElementById('exportModal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  };

  const exportPalette = (format) => {
    if (!state.currentPalette) return;
    
    const palette = state.currentPalette;
    let exportData;
    
    switch (format) {
      case 'css':
        exportData = generateCSSExport(palette);
        break;
      case 'json':
        exportData = generateJSONExport(palette);
        break;
      case 'adobe':
        exportData = generateAdobeExport(palette);
        break;
      case 'url':
        exportData = generateURLExport(palette);
        break;
    }
    
    if (format === 'url') {
      navigator.clipboard.writeText(exportData);
      NotificationManager.show('Shareable URL copied to clipboard!', 'success');
    } else {
      downloadFile(exportData.content, exportData.filename);
      NotificationManager.show(`${format.toUpperCase()} file downloaded!`, 'success');
    }
    
    hideExportModal();
  };

  const generateCSSExport = (palette) => {
    const cssVars = palette.colors.map((color, index) => 
      `  --color-${index + 1}: ${color};`
    ).join('\n');
    
    const content = `:root {\n${cssVars}\n\n  /* Palette: ${palette.name} */\n  /* ${palette.description} */\n}`;
    
    return {
      content,
      filename: `palette-${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`
    };
  };

  const generateJSONExport = (palette) => {
    const content = JSON.stringify({
      name: palette.name,
      description: palette.description,
      colors: palette.colors,
      harmony: palette.harmony,
      baseHue: palette.baseHue,
      generatedAt: new Date().toISOString()
    }, null, 2);
    
    return {
      content,
      filename: `palette-${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`
    };
  };

  const generateAdobeExport = (palette) => {
    const content = palette.colors.map((color, index) => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
      return `Color ${index + 1}: RGB(${r}, ${g}, ${b}) | HEX: ${color}`;
    }).join('\n');
    
    return {
      content: `Adobe Swatch Exchange (Simplified)\nPalette: ${palette.name}\n\n${content}`,
      filename: `palette-${palette.name.toLowerCase().replace(/\s+/g, '-')}.ase.txt`
    };
  };

  const generateURLExport = (palette) => {
    const colorString = palette.colors.map(c => c.replace('#', '')).join('-');
    return `${window.location.origin}${window.location.pathname}?colors=${colorString}&name=${encodeURIComponent(palette.name)}`;
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // =============================================================================
  // SHARE FUNCTIONALITY
  // =============================================================================

  const showShareModal = () => {
    const modal = document.getElementById('shareModal');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
    NavigationController.initializeFeatherIcons();
  };

  const hideShareModal = () => {
    const modal = document.getElementById('shareModal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  };

  const shareCurrentPalette = async () => {
    if (!state.currentPalette) {
      NotificationManager.show('No palette to share!', 'error');
      return;
    }

    const palette = state.currentPalette;
    const colors = palette.colors.join(', ');
    const shareData = {
      title: `${palette.name} - Color Palette`,
      text: `Check out this amazing ${palette.name} color palette!\n\nColors: ${colors}\n\nGenerated with ColorScope`,
      url: generateURLExport(palette)
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        NotificationManager.show('Palette shared successfully!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(palette);
        }
      }
    } else {
      fallbackShare(palette);
    }
  };

  const fallbackShare = (palette) => {
    const colors = palette.colors.join(', ');
    const shareText = `${palette.name}\n\nColors: ${colors}\n\n${generateURLExport(palette)}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      NotificationManager.show('Share link copied to clipboard!', 'success');
    }).catch(() => {
      NotificationManager.show('Failed to copy share link', 'error');
    });
  };

  const shareToTwitter = () => {
    if (!state.currentPalette) return;
    
    const palette = state.currentPalette;
    const colors = palette.colors.join(' ');
    const url = generateURLExport(palette);
    const text = `Check out this ${palette.name} color palette! ${colors}`;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareCopyColors = () => {
    if (!state.currentPalette) return;
    
    const colors = state.currentPalette.colors.join('\n');
    navigator.clipboard.writeText(colors).then(() => {
      NotificationManager.show('All colors copied to clipboard!', 'success');
      hideShareModal();
    });
  };

  const shareCopyLink = () => {
    if (!state.currentPalette) return;
    
    const url = generateURLExport(state.currentPalette);
    navigator.clipboard.writeText(url).then(() => {
      NotificationManager.show('Share link copied to clipboard!', 'success');
      hideShareModal();
    });
  };

  // =============================================================================
  // UI UPDATES
  // =============================================================================

  const updateUI = () => {
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;
    
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.disabled = !canUndo;
      if (canUndo) {
        undoBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        undoBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
    
    if (redoBtn) {
      redoBtn.disabled = !canRedo;
      if (canRedo) {
        redoBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        redoBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  };

  const savePalette = () => {
    if (!state.currentPalette) return;
    
    const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    saved.push({
      ...state.currentPalette,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedPalettes', JSON.stringify(saved));
    NotificationManager.show('Palette saved successfully!', 'success');
  };

  return {
    init,
    generateNewPalette
  };
})();

// =============================================================================
// PALETTE EXPLORER
// =============================================================================

const PaletteExplorer = (() => {
  // State
  let state = {
    fetching: false,
    currentQuery: 'blue',
    debounceTimer: null
  };

  // DOM Elements
  let elements = {};

  const init = () => {
    cacheElements();
    bindEvents();
    loadMorePalettes(9);
  };

  const cacheElements = () => {
    elements = {
      container: document.getElementById('paletteContainer'),
      searchInput: document.getElementById('searchInput'),
      toast: document.getElementById('toast'),
      errorBox: document.getElementById('errorBox'),
      toolsBtn: document.getElementById('toolsBtn'),
      toolsDropdown: document.getElementById('toolsDropdown')
    };
  };

  const bindEvents = () => {
    // Infinite scroll
    window.addEventListener('scroll', handleScroll);

    // Search input with debounce
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', handleSearchInput);
    }

    // Tools dropdown
    if (elements.toolsBtn) {
      elements.toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.toolsDropdown?.classList.toggle('hidden');
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#toolsBtn')) {
        elements.toolsDropdown?.classList.add('hidden');
      }
    });
  };

  // NOTIFICATION & UI HELPERS
  const showToast = (message) => {
    if (!elements.toast) return;
    
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2000);
  };

  const showError = (message) => {
    if (!elements.errorBox) return;
    
    elements.errorBox.textContent = message;
    elements.errorBox.classList.remove('hidden');
  };

  const hideError = () => {
    if (elements.errorBox) {
      elements.errorBox.classList.add('hidden');
    }
  };

  // COLOR UTILITIES
  const randomHex = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const getContrastYIQ = (hex) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  };

  // API FUNCTIONS
  const fetchPalette = async (seed = 'blue') => {
    const harmonyModes = [
      'analogic',
      'complement',
      'triad',
      'quad',
      'monochrome'
    ];
    
    const mode = harmonyModes[Math.floor(Math.random() * harmonyModes.length)];
    const url = `https://www.thecolorapi.com/scheme?hex=${randomHex()}&mode=${mode}&count=5`;
    
    try {
      const resp = await fetch(url);
      
      if (!resp.ok) {
        throw new Error(`${resp.status} ${resp.statusText}`);
      }
      
      const data = await resp.json();
      
      return {
        colors: data.colors.map((c) => ({
          hex: c.hex.value,
          name: c.name.value
        })),
        seedName: data.seed.name.value + ' ' + 
                  mode.charAt(0).toUpperCase() + mode.slice(1)
      };
    } catch (err) {
      console.error('Fetch error:', err);
      showError('Failed to load palettes.');
      return { 
        colors: [], 
        seedName: 'Untitled' 
      };
    }
  };

  // RENDERING FUNCTIONS
  const renderPalette = (palette) => {
    const { colors, seedName } = palette;
    
    // Create card container
    const card = document.createElement('div');
    card.className = 'bg-white border rounded-lg shadow hover:shadow-lg transition p-3 flex flex-col opacity-0 fade-in';

    // Create colors display
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'flex h-32 rounded overflow-hidden mb-3';

    // Render each color
    colors.forEach((c) => {
      const colorWrapper = createColorElement(c);
      colorsDiv.appendChild(colorWrapper);
    });

    // Create title
    const title = document.createElement('h3');
    title.textContent = seedName;
    title.className = 'font-semibold text-lg mb-2';

    // Create like section
    const likeWrapper = createLikeSection();

    // Assemble card
    card.appendChild(colorsDiv);
    card.appendChild(title);
    card.appendChild(likeWrapper);
    
    elements.container?.appendChild(card);

    // Trigger fade-in animation
    setTimeout(() => card.classList.remove('opacity-0'), 50);
  };

  const createColorElement = (color) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative flex-1 group flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105';
    wrapper.style.backgroundColor = color.hex;

    const hexText = document.createElement('span');
    hexText.textContent = color.hex;
    hexText.style.color = getContrastYIQ(color.hex);
    hexText.className = 'text-sm font-semibold opacity-0 group-hover:opacity-100 transition';

    wrapper.addEventListener('click', () => {
      copyToClipboard(color.hex);
    });

    wrapper.appendChild(hexText);
    return wrapper;
  };

  const createLikeSection = () => {
    const likeWrapper = document.createElement('div');
    likeWrapper.className = 'flex items-center justify-between';
    
    const likes = Math.floor(Math.random() * 10000);
    likeWrapper.innerHTML = `
      <span class="text-gray-500">${likes} likes</span>
      <button class="likeBtn text-gray-400 hover:text-red-500 transition text-xl">♥</button>
    `;

    const likeBtn = likeWrapper.querySelector('.likeBtn');
    likeBtn.addEventListener('click', (e) => {
      e.target.classList.toggle('text-red-500');
    });

    return likeWrapper;
  };

  // =============================================================================
  // PALETTE LOADING
  // =============================================================================

  const loadMorePalettes = async (count = 3) => {
    if (state.fetching) return;
    
    state.fetching = true;
    hideError();

    const palettePromises = Array.from(
      { length: count }, 
      () => fetchPalette(state.currentQuery)
    );
    
    const results = await Promise.all(palettePromises);

    results.forEach((palette) => {
      if (palette.colors.length > 0) {
        renderPalette(palette);
      }
    });

    state.fetching = false;
  };

  // EVENT HANDLERS
  const handleScroll = () => {
    const scrollBottom = window.innerHeight + window.scrollY;
    const pageHeight = document.body.offsetHeight - 200;
    
    if (scrollBottom >= pageHeight) {
      loadMorePalettes(3);
    }
  };

  const handleSearchInput = (e) => {
    clearTimeout(state.debounceTimer);
    
    state.debounceTimer = setTimeout(() => {
      state.currentQuery = e.target.value.trim() || 'blue';
      
      if (elements.container) {
        elements.container.innerHTML = '';
      }
      
      loadMorePalettes(9);
    }, 400);
  };

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      NotificationManager.show(`Copied ${text}`, 'success');
    }).catch(() => {
      NotificationManager.show('Failed to copy', 'error');
    });
  };

  return {
    init,
    loadMorePalettes
  };
})();

// =============================================================================
// IMAGE PICKER
// =============================================================================

const ImagePaletteGenerator = (function () {
  // ======= STATE =======
  let colors = [];
  let currentColorCount = 5;
  let dragging = null;
  let imageLoaded = false;

  // ======= DOM ELEMENTS =======
  const els = {};
  const sampleImageUrl = "https://images.unsplash.com/photo-1595804534811-0e389649da56?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MTR8fHxlbnwwfHx8fHw%3D";

  const sampleColors = [
    { hex: '#8B7CA3', nx: 0.15, ny: 0.2 },
    { hex: '#3E4A5C', nx: 0.25, ny: 0.6 },
    { hex: '#A4C3D2', nx: 0.5, ny: 0.35 },
    { hex: '#5A738C', nx: 0.7, ny: 0.45 },
    { hex: '#7FA7C7', nx: 0.85, ny: 0.25 }
  ];

  // ======= UTILITIES =======
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.floor(v).toString(16).padStart(2, '0')).join('');
  
  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex).then(() => {
      NotificationManager.show(`Copied ${hex}`, 'success');
    }).catch(() => {
      NotificationManager.show('Failed to copy', 'error');
    });
  };
  // ======= IMAGE PROCESSING =======
  const loadImageToCanvas = (img) => {
    const ctx = els.hiddenCanvas.getContext('2d');
    els.hiddenCanvas.width = img.naturalWidth;
    els.hiddenCanvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  };

  const extractColorsFromImage = (count) => {
    if (!imageLoaded) return sampleColors.slice(0, count);
    const ctx = els.hiddenCanvas.getContext('2d');
    const w = els.hiddenCanvas.width;
    const h = els.hiddenCanvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;

    const samples = [];
    const step = Math.max(1, Math.floor(Math.sqrt(w * h) / 50));

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        let found = false;

        for (const s of samples) {
          const dist = Math.sqrt((r - s.r) ** 2 + (g - s.g) ** 2 + (b - s.b) ** 2);
          if (dist < 50) {
            s.r = (s.r * s.count + r) / (s.count + 1);
            s.g = (s.g * s.count + g) / (s.count + 1);
            s.b = (s.b * s.count + b) / (s.count + 1);
            s.count++;
            found = true;
            break;
          }
        }
        if (!found) samples.push({ r, g, b, x: x / w, y: y / h, count: 1 });
      }
    }

    samples.sort((a, b) => b.count - a.count);
    return samples.slice(0, count).map(s => ({
      hex: rgbToHex(s.r, s.g, s.b),
      nx: s.x,
      ny: s.y
    }));
  };

  const generateRandomPalette = () => {
    if (!imageLoaded) return;
    const ctx = els.hiddenCanvas.getContext('2d');
    const w = els.hiddenCanvas.width;
    const h = els.hiddenCanvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;

    colors = Array.from({ length: currentColorCount }, () => {
      const nx = Math.random();
      const ny = Math.random();
      const x = Math.floor(nx * w);
      const y = Math.floor(ny * h);
      const i = (y * w + x) * 4;
      return { hex: rgbToHex(data[i], data[i + 1], data[i + 2]), nx, ny };
    });

    renderPalette();
    renderPickers();
  };

  // ======= RENDERING =======
  const renderPalette = () => {
    els.paletteColors.innerHTML = '';
    colors.forEach((color, i) => {
      const div = document.createElement('div');
      div.className = 'palette-color';
      div.style.backgroundColor = color.hex;
      div.title = color.hex;
      div.setAttribute('data-number', i + 1);
      div.addEventListener('click', () => copyToClipboard(color.hex));
      els.paletteColors.appendChild(div);
    });
  };

  const getPickerPosition = (color) => {
    const imgRect = els.previewImage.getBoundingClientRect();
    const contRect = els.pickersContainer.getBoundingClientRect();
    return {
      left: (imgRect.left - contRect.left) + color.nx * imgRect.width,
      top: (imgRect.top - contRect.top) + color.ny * imgRect.height
    };
  };

  const renderPickers = () => {
    els.pickersContainer.innerHTML = '';
    colors.forEach((color, i) => {
      const picker = document.createElement('div');
      picker.className = 'picker';
      picker.style.backgroundColor = color.hex;
      const label = document.createElement('div');
      label.className = 'picker-label';
      label.textContent = i + 1;
      picker.appendChild(label);
      const pos = getPickerPosition(color);
      picker.style.left = `${pos.left}px`;
      picker.style.top = `${pos.top}px`;
      picker.addEventListener('mousedown', (e) => {
        dragging = i;
        picker.classList.add('dragging');
        e.preventDefault();
      });
      els.pickersContainer.appendChild(picker);
    });
  };

  // ======= EVENTS =======
  const handleMouseMove = (e) => {
    if (dragging === null || !imageLoaded) return;
    const imgRect = els.previewImage.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - imgRect.left), imgRect.width);
    const y = Math.min(Math.max(0, e.clientY - imgRect.top), imgRect.height);
    const nx = x / imgRect.width;
    const ny = y / imgRect.height;
    sampleColorAtPosition(dragging, nx, ny);
    renderPickers();
  };

  const handleMouseUp = () => {
    if (dragging !== null) {
      const picker = els.pickersContainer.children[dragging];
      if (picker) picker.classList.remove('dragging');
      dragging = null;
    }
  };

  const sampleColorAtPosition = (index, nx, ny) => {
    const ctx = els.hiddenCanvas.getContext('2d');
    const x = Math.floor(nx * els.hiddenCanvas.width);
    const y = Math.floor(ny * els.hiddenCanvas.height);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    colors[index] = { hex: rgbToHex(r, g, b), nx, ny };
    renderPalette();
  };

  const handleImageLoad = () => {
    loadImageToCanvas(els.previewImage);
    imageLoaded = true;
    colors = extractColorsFromImage(currentColorCount);
    renderPalette();
    renderPickers();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => (els.previewImage.src = ev.target.result);
    reader.readAsDataURL(file);
  };

  // ======= INITIALIZE =======
  const init = () => {
    // Cache DOM
    Object.assign(els, {
      previewImage: document.getElementById('previewImage'),
      hiddenCanvas: document.getElementById('hiddenCanvas'),
      pickersContainer: document.getElementById('pickersContainer'),
      paletteColors: document.getElementById('paletteColors'),
      fileInput: document.getElementById('fileInput'),
      browseBtn: document.getElementById('browseBtn'),
      generateBtn: document.getElementById('generateBtn'),
      increaseBtn: document.getElementById('increaseBtn'),
      decreaseBtn: document.getElementById('decreaseBtn'),
    });

    // Event binding
    els.previewImage.addEventListener('load', handleImageLoad);
    els.fileInput.addEventListener('change', handleFileUpload);
    els.browseBtn.addEventListener('click', () => els.fileInput.click());
    els.generateBtn.addEventListener('click', generateRandomPalette);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    els.increaseBtn.addEventListener('click', () => {
      if (currentColorCount < 12) {
        currentColorCount++;
        colors = extractColorsFromImage(currentColorCount);
        renderPalette();
        renderPickers();
      }
    });
    els.decreaseBtn.addEventListener('click', () => {
      if (currentColorCount > 1) {
        currentColorCount--;
        colors = colors.slice(0, currentColorCount);
        renderPalette();
        renderPickers();
      }
    });
    window.addEventListener('resize', () => imageLoaded && renderPickers());

    // Default state
    els.previewImage.src = sampleImageUrl;
    colors = sampleColors.slice(0, currentColorCount);
    renderPalette();
  };

  // Public API
  return { init };
})();

// =============================================================================
// CONTRAST CHECKER
// =============================================================================

const ContrastChecker = (function () {
  // ===== PRIVATE HELPERS =====
  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const luminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const contrast = (rgb1, rgb2) => {
    const L1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const L2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };

  const setStars = (containerId, rating, maxStars = 3) => {
    const el = document.getElementById(containerId);
    const starsContainer = document.createElement("div");
    starsContainer.className = "flex space-x-1 mt-1";
    starsContainer.innerHTML = "";

    for (let i = 1; i <= maxStars; i++) {
      const star = document.createElement("span");
      star.textContent = i <= rating ? "★" : "☆";
      star.className = i <= rating ? "text-green-600 text-lg" : "text-gray-300 text-lg";
      starsContainer.appendChild(star);
    }

    el.innerHTML = el.dataset.label || el.innerHTML.split(" ")[0];
    el.dataset.label = el.innerHTML.split(" ")[0];
    el.appendChild(starsContainer);
  };

  const updateContrast = () => {
    const textHex = document.getElementById("textHex").value.trim();
    const bgHex = document.getElementById("bgHex").value.trim();

    const textRgb = hexToRgb(textHex);
    const bgRgb = hexToRgb(bgHex);
    const ratio = contrast(textRgb, bgRgb);

    document.getElementById("contrastValue").textContent = ratio.toFixed(2);

    // Update preview
    const preview = document.getElementById("preview");
    preview.style.color = textHex;
    preview.style.backgroundColor = bgHex;

    const resultBox = document.getElementById("resultBox").firstElementChild;
    const contrastLabel = document.getElementById("contrastLabel");

    if (ratio >= 7) {
      contrastLabel.textContent = "Excellent";
      resultBox.className = "flex items-center justify-between p-6 bg-green-200";
      setStars("starRating", 5, 5);
    } else if (ratio >= 4.5) {
      contrastLabel.textContent = "Very good";
      resultBox.className = "flex items-center justify-between p-6 bg-green-100";
      setStars("starRating", 4, 5);
    } else if (ratio >= 3) {
      contrastLabel.textContent = "Fair";
      resultBox.className = "flex items-center justify-between p-6 bg-yellow-100";
      setStars("starRating", 2, 5);
    } else {
      contrastLabel.textContent = "Fail";
      resultBox.className = "flex items-center justify-between p-6 bg-red-100";
      setStars("starRating", 0, 5);
    }

    // Accessibility checks
    const smallRating = ratio >= 7 ? 3 : ratio >= 4.5 ? 2 : ratio >= 3 ? 1 : 0;
    document.getElementById("smallTextResult").innerHTML = "Small text";
    setStars("smallTextResult", smallRating, 3);

    const largeRating = ratio >= 7 ? 3 : ratio >= 4.5 ? 2 : ratio >= 3 ? 1 : 0;
    document.getElementById("largeTextResult").innerHTML = "Large text";
    setStars("largeTextResult", largeRating, 3);
  };

  const syncInput = (colorEl, hexEl) => {
    colorEl.addEventListener("input", () => {
      hexEl.value = colorEl.value;
      updateContrast();
    });
    hexEl.addEventListener("input", () => {
      colorEl.value = hexEl.value;
      updateContrast();
    });
  };


  // ===== PUBLIC =====
  const init = () => {

    syncInput(document.getElementById("textColor"), document.getElementById("textHex"));
    syncInput(document.getElementById("bgColor"), document.getElementById("bgHex"));
    updateContrast();
  };

  // public interface
  return { init };
})();

// ============================================================================
// GRADIENT GENERATOR
// ============================================================================

const GradientGenerator = (() => {
  const preview = document.getElementById("gradientPreview");
  const color1 = document.getElementById("color1");
  const color2 = document.getElementById("color2");
  const pos1 = document.getElementById("position1");
  const pos2 = document.getElementById("position2");
  const rotation = document.getElementById("rotation");
  const type = document.getElementById("type");
  const copyBtn = document.getElementById("copyCssBtn");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      NotificationManager.show('Gradient CSS copied!', 'success');
    }).catch(() => {
      NotificationManager.show('Failed to copy CSS', 'error');
    });
  };

  const updateGradient = () => {
    const c1 = color1.value;
    const c2 = color2.value;
    const p1 = pos1.value + "%";
    const p2 = pos2.value + "%";
    const rot = rotation.value;
    const t = type.value;

    let gradient =
      t === "linear"
        ? `linear-gradient(${rot}, ${c1} ${p1}, ${c2} ${p2})`
        : `radial-gradient(circle, ${c1} ${p1}, ${c2} ${p2})`;

    preview.style.background = gradient;
    pos1.style.background = gradient;
    pos2.style.background = gradient;
  };

  const handleCopyCss = () => {
    const gradientStyle = window.getComputedStyle(preview).backgroundImage;
    if (!gradientStyle || gradientStyle === 'none') {
      NotificationManager.show('No gradient to copy!', 'error');
      return;
    }
    copyToClipboard(`background: ${gradientStyle};`);
  };

  const randomGradient = () => {
    color1.value = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    color2.value = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    pos1.value = Math.floor(Math.random() * 50);
    pos2.value = 50 + Math.floor(Math.random() * 50);
    rotation.value = ["90deg", "180deg", "270deg", "360deg"][Math.floor(Math.random() * 4)];
    type.value = Math.random() > 0.5 ? "linear" : "radial";
    updateGradient();
  };

  const init = () => {
    [color1, color2, pos1, pos2, rotation, type].forEach(el => {
      el.addEventListener("input", updateGradient);
      el.addEventListener("change", updateGradient);
    });

    copyBtn.addEventListener("click", handleCopyCss);
    updateGradient();
  };

  return { init };
})();

// ============================================================================
// DASHBOARD CONTROLLER
// ============================================================================




// =============================================================================
// INITIALIZE APPLICATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  NavigationController.init();
  AuthController.init();
  PaletteGenerator.init();
  PaletteExplorer.init();
  ImagePaletteGenerator.init();
  ContrastChecker.init();
  GradientGenerator.init();

  if (typeof feather !== 'undefined') {
    feather.replace();
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        NavigationController.updateUser(doc.data());
      }
    });
  } else {
    NavigationController.updateUser(null);
  }
});