// =============================================================================
// COLOR PALETTE GENERATOR - OPTIMIZED FOR UI/UX DESIGN WITH AUTHENTICATION
// =============================================================================

class ColorPaletteGenerator {
  constructor() {
    this.init();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  init() {
    this.state = {
      currentPalette: null,
      history: JSON.parse(localStorage.getItem('paletteHistory')) || [],
      historyIndex: parseInt(localStorage.getItem('paletteIndex')) || -1,
      colorCount: 5,
      paletteType: 'ui-design',
      isGenerating: false,
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
    };

    this.bindEvents();
    this.initializeFeatherIcons();
    this.loadInitialPalette();
    this.checkAuthState();
  }

  bindEvents() {
    // Core controls
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());
    document.getElementById('decreaseColors').addEventListener('click', () => this.adjustColorCount(-1));
    document.getElementById('increaseColors').addEventListener('click', () => this.adjustColorCount(1));
    
    // Auth buttons
    document.getElementById('signUpBtn')?.addEventListener('click', () => this.openAuthModal());
    document.getElementById('signInBtn')?.addEventListener('click', () => this.openAuthModal('signin'));
    document.getElementById('closeAuthModal')?.addEventListener('click', () => this.closeAuthModal());
    
    // Profile menu
    document.getElementById('profileIcon')?.addEventListener('mouseenter', () => {
      document.getElementById('profileMenu').classList.remove('hidden');
    });
    document.getElementById('profileSection')?.addEventListener('mouseleave', () => {
      document.getElementById('profileMenu').classList.add('hidden');
    });
    document.getElementById('signOutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.signOut();
    });
    
    // Auth modal navigation
    document.getElementById('continueWithEmail')?.addEventListener('click', () => this.showSignUpForm());
    document.getElementById('switchToSignIn')?.addEventListener('click', () => this.showSignInForm());
    document.getElementById('switchToSignUp')?.addEventListener('click', () => this.showSignUpForm());
    
    // Password toggles
    document.getElementById('toggleSignUpPassword')?.addEventListener('click', () => this.togglePassword('signUpPassword', 'toggleSignUpPassword'));
    document.getElementById('toggleSignInPassword')?.addEventListener('click', () => this.togglePassword('signInPassword', 'toggleSignInPassword'));
    
    // Form submissions
    document.getElementById('signUpForm')?.addEventListener('submit', (e) => this.handleSignUp(e));
    document.getElementById('signInForm')?.addEventListener('submit', (e) => this.handleSignIn(e));
    
    // Palette type selector
    document.getElementById('toolsBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('toolsDropdown').classList.toggle('hidden');
    });

    document.getElementById('paletteTypeBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('paletteTypeDropdown').classList.toggle('hidden');
    });
    
    document.querySelectorAll('.palette-type-option').forEach(option => {
      option.addEventListener('click', () => {
        this.setPaletteType(option.dataset.type);
      });
    });

    // Export functionality
    document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
    // Add these in the bindEvents() method
document.getElementById('shareBtn')?.addEventListener('click', () => this.showShareModal());
document.getElementById('closeShareModal')?.addEventListener('click', () => this.hideShareModal());
document.getElementById('shareNative')?.addEventListener('click', () => this.shareCurrentPalette());
document.getElementById('shareCopyLink')?.addEventListener('click', () => this.shareCopyLink());
document.getElementById('shareCopyColors')?.addEventListener('click', () => this.shareCopyColors());
document.getElementById('shareTwitter')?.addEventListener('click', () => this.shareToTwitter());
    document.getElementById('closeExportModal').addEventListener('click', () => this.hideExportModal());
    
    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', () => {
        this.exportPalette(option.dataset.format);
      });
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#toolsBtn')) {
        document.getElementById('toolsDropdown').classList.add('hidden');
      }
      if (!e.target.closest('#paletteTypeBtn')) {
        document.getElementById('paletteTypeDropdown').classList.add('hidden');
      }
      // Close auth modal on backdrop click
      if (e.target.id === 'authModal') {
        this.closeAuthModal();
      }
    });

    // Close modals on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('toolsDropdown').classList.add('hidden');
        document.getElementById('paletteTypeDropdown').classList.add('hidden');
        this.closeAuthModal();
      }
    });

    
  }

  initializeFeatherIcons() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  loadInitialPalette() {
    if (this.state.historyIndex >= 0 && this.state.history.length > 0) {
      this.renderPalette(this.state.history[this.state.historyIndex]);
    } else {
      this.generateNewPalette();
    }
    this.updateUI();
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  checkAuthState() {
    if (this.state.currentUser) {
      this.showProfileSection();
    } else {
      this.showAuthButtons();
    }
  }

  showProfileSection() {
    document.getElementById('signUpBtn').style.display = 'none';
    document.getElementById('signInBtn').style.display = 'none';
    document.getElementById('profileSection').classList.remove('hidden');
    
    // Set profile initial
    const initial = this.state.currentUser.name.charAt(0).toUpperCase();
    document.querySelector('#profileIcon span').textContent = initial;
  }

  showAuthButtons() {
    document.getElementById('signUpBtn').style.display = 'block';
    document.getElementById('signInBtn').style.display = 'block';
    document.getElementById('profileSection').classList.add('hidden');
  }

  openAuthModal(view = 'initial') {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authModalContent');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Trigger animation
    setTimeout(() => {
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    }, 10);
    
    if (view === 'signin') {
      this.showSignInForm();
    } else {
      this.showInitialView();
    }
    
    this.initializeFeatherIcons();
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authModalContent');
    
    content.style.transform = 'scale(0.95)';
    content.style.opacity = '0';
    
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      this.showInitialView();
      this.resetForms();
    }, 300);
  }

  showInitialView() {
    document.getElementById('authInitial').classList.remove('hidden');
    document.getElementById('authSignUp').classList.add('hidden');
    document.getElementById('authSignIn').classList.add('hidden');
  }

  showSignUpForm() {
    document.getElementById('authInitial').classList.add('hidden');
    document.getElementById('authSignUp').classList.remove('hidden');
    document.getElementById('authSignIn').classList.add('hidden');
    this.initializeFeatherIcons();
  }

  showSignInForm() {
    document.getElementById('authInitial').classList.add('hidden');
    document.getElementById('authSignUp').classList.add('hidden');
    document.getElementById('authSignIn').classList.remove('hidden');
    this.initializeFeatherIcons();
  }

  togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input.type === 'password') {
      input.type = 'text';
      button.innerHTML = '<i data-feather="eye-off" class="w-5 h-5"></i>';
    } else {
      input.type = 'password';
      button.innerHTML = '<i data-feather="eye" class="w-5 h-5"></i>';
    }
    
    this.initializeFeatherIcons();
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validateSignUpForm() {
    let isValid = true;
    
    // Name validation
    const name = document.getElementById('signUpName').value.trim();
    const nameError = document.getElementById('nameError');
    if (name.length < 2) {
      nameError.classList.remove('hidden');
      isValid = false;
    } else {
      nameError.classList.add('hidden');
    }
    
    // Email validation
    const email = document.getElementById('signUpEmail').value.trim();
    const emailError = document.getElementById('emailError');
    if (!this.validateEmail(email)) {
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
    }
    
    // Password validation
    const password = document.getElementById('signUpPassword').value;
    const passwordError = document.getElementById('passwordError');
    if (password.length < 6) {
      passwordError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError.classList.add('hidden');
    }
    
    // Address validation
    const address = document.getElementById('signUpAddress').value.trim();
    const addressError = document.getElementById('addressError');
    if (address.length === 0) {
      addressError.classList.remove('hidden');
      isValid = false;
    } else {
      addressError.classList.add('hidden');
    }
    
    return isValid;
  }

  validateSignInForm() {
    let isValid = true;
    
    // Email validation
    const email = document.getElementById('signInEmail').value.trim();
    const emailError = document.getElementById('signInEmailError');
    if (!this.validateEmail(email)) {
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
    }
    
    // Password validation
    const password = document.getElementById('signInPassword').value;
    const passwordError = document.getElementById('signInPasswordError');
    if (password.length < 6) {
      passwordError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError.classList.add('hidden');
    }
    
    return isValid;
  }

  handleSignUp(e) {
    e.preventDefault();
    
    if (!this.validateSignUpForm()) {
      return;
    }
    
    const userData = {
      name: document.getElementById('signUpName').value.trim(),
      email: document.getElementById('signUpEmail').value.trim(),
      address: document.getElementById('signUpAddress').value.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (in production, this would be Firebase)
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.state.currentUser = userData;
    
    /* 
    // FIREBASE AUTHENTICATION CODE (for backend integration)
    import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
    import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
    
    const auth = getAuth();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const name = document.getElementById('signUpName').value.trim();
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, { displayName: name });
      })
      .then(() => {
        // Save additional user data to Firestore
        const db = getFirestore();
        const user = auth.currentUser;
        return setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          address: document.getElementById('signUpAddress').value.trim(),
          createdAt: serverTimestamp()
        });
      })
      .then(() => {
        this.showNotification('Account created successfully!', 'success');
        this.closeAuthModal();
        this.showProfileSection();
      })
      .catch((error) => {
        console.error("Sign up error:", error);
        this.showNotification(error.message, 'error');
      });
    */
    
    this.showNotification('Account created successfully!', 'success');
    this.closeAuthModal();
    this.showProfileSection();
  }

  handleSignIn(e) {
    e.preventDefault();
    
    if (!this.validateSignInForm()) {
      return;
    }
    
    const email = document.getElementById('signInEmail').value.trim();
    
    // Check if user exists in localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (storedUser && storedUser.email === email) {
      this.state.currentUser = storedUser;
      
      /* 
      // FIREBASE AUTHENTICATION CODE (for backend integration)
      import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
      import { getFirestore, doc, getDoc } from "firebase/firestore";
      
      const auth = getAuth();
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;
      
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          // Fetch user data from Firestore
          const db = getFirestore();
          return getDoc(doc(db, "users", user.uid));
        })
        .then((docSnap) => {
          if (docSnap.exists()) {
            this.state.currentUser = docSnap.data();
            localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
          }
          this.showNotification('Signed in successfully!', 'success');
          this.closeAuthModal();
          this.showProfileSection();
        })
        .catch((error) => {
          console.error("Sign in error:", error);
          this.showNotification(error.message, 'error');
        });
      */
      
      this.showNotification('Signed in successfully!', 'success');
      this.closeAuthModal();
      this.showProfileSection();
    } else {
      this.showNotification('Invalid credentials. Please sign up first.', 'error');
    }
  }

  signOut() {
    /* 
    // FIREBASE SIGN OUT CODE
    import { getAuth, signOut } from "firebase/auth";
    
    const auth = getAuth();
    signOut(auth).then(() => {
      this.state.currentUser = null;
      localStorage.removeItem('currentUser');
      this.showAuthButtons();
      this.showNotification('Signed out successfully', 'success');
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
    */
    
    this.state.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showAuthButtons();
    this.showNotification('Signed out successfully', 'success');
  }

  resetForms() {
    document.getElementById('signUpForm')?.reset();
    document.getElementById('signInForm')?.reset();
    
    // Hide all error messages
    document.querySelectorAll('.text-red-500').forEach(error => {
      error.classList.add('hidden');
    });
  }

  // =============================================================================
  // CORE COLOR THEORY & ALGORITHMS
  // =============================================================================

  hslToHex(h, s, l) {
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
  }

  hexToHsl(hex) {
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
  }

  getContrastRatio(color1, color2) {
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
  }

  getOptimalTextColor(backgroundColor, options = {}) {
    const { forceWhite, forceBlack, threshold = 4.5 } = options;
    
    if (forceWhite) return '#ffffff';
    if (forceBlack) return '#000000';

    const whiteContrast = this.getContrastRatio(backgroundColor, '#ffffff');
    const blackContrast = this.getContrastRatio(backgroundColor, '#000000');

    if (whiteContrast >= threshold && blackContrast >= threshold) {
      return whiteContrast > blackContrast ? '#ffffff' : '#000000';
    } else if (whiteContrast >= threshold) {
      return '#ffffff';
    } else if (blackContrast >= threshold) {
      return '#000000';
    } else {
      return whiteContrast > blackContrast ? '#ffffff' : '#000000';
    }
  }

  // =============================================================================
  // ADVANCED PALETTE GENERATION ALGORITHMS
  // =============================================================================

  generateUIDesignPalette(baseHue, count) {
    const colors = [];
    const harmonies = ['complementary', 'triadic', 'analogous', 'split-complementary'];
    const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];

    switch (harmony) {
      case 'complementary':
        colors.push(this.hslToHex(baseHue, this.random(60, 80), this.random(45, 65)));
        colors.push(this.hslToHex((baseHue + 180) % 360, this.random(50, 70), this.random(50, 70)));
        break;
        
      case 'triadic':
        for (let i = 0; i < Math.min(3, count); i++) {
          const hue = (baseHue + i * 120) % 360;
          colors.push(this.hslToHex(hue, this.random(55, 75), this.random(45, 65)));
        }
        break;
        
      case 'analogous':
        for (let i = 0; i < count; i++) {
          const hue = (baseHue + i * 30 - 60) % 360;
          colors.push(this.hslToHex(hue, this.random(50, 80), this.random(40, 70)));
        }
        break;
        
      case 'split-complementary':
        colors.push(this.hslToHex(baseHue, this.random(60, 80), this.random(45, 65)));
        colors.push(this.hslToHex((baseHue + 150) % 360, this.random(50, 70), this.random(50, 70)));
        colors.push(this.hslToHex((baseHue + 210) % 360, this.random(50, 70), this.random(50, 70)));
        break;
    }

    while (colors.length < count) {
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const [h, s, l] = this.hexToHsl(baseColor);
      const newHue = (h + this.random(-30, 30)) % 360;
      const newSat = Math.max(20, Math.min(90, s + this.random(-20, 20)));
      const newLight = Math.max(25, Math.min(85, l + this.random(-25, 25)));
      colors.push(this.hslToHex(newHue, newSat, newLight));
    }

    return {
      colors: colors.slice(0, count),
      name: `${harmony.charAt(0).toUpperCase() + harmony.slice(1)} UI`,
      description: `Professional UI palette using ${harmony} harmony`,
      harmony,
      baseHue
    };
  }

  generateBrandIdentityPalette(baseHue, count) {
    const colors = [];
    
    colors.push(this.hslToHex(baseHue, this.random(70, 90), this.random(45, 55)));
    
    const secondaryHue = (baseHue + this.random(150, 210)) % 360;
    colors.push(this.hslToHex(secondaryHue, this.random(60, 80), this.random(50, 60)));
    
    colors.push(this.hslToHex(baseHue, this.random(10, 30), this.random(20, 30)));
    colors.push(this.hslToHex(baseHue, this.random(5, 15), this.random(85, 95)));
    
    if (count > 4) {
      const accentHue = (baseHue + this.random(60, 120)) % 360;
      colors.push(this.hslToHex(accentHue, this.random(80, 95), this.random(55, 65)));
    }

    return {
      colors: colors.slice(0, count),
      name: 'Brand Identity',
      description: 'Professional brand color scheme with strong visual identity',
      harmony: 'brand',
      baseHue
    };
  }

  generateIllustrationPalette(baseHue, count) {
    const colors = [];
    const temperature = Math.random() > 0.5 ? 'warm' : 'cool';
    
    if (temperature === 'warm') {
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + this.random(-60, 60)) % 360;
        const adjustedHue = hue < 30 || hue > 300 ? hue : 
                           (Math.random() > 0.5 ? hue + 180 : hue - 180);
        colors.push(this.hslToHex(adjustedHue, this.random(60, 95), this.random(35, 75)));
      }
    } else {
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + this.random(-45, 45)) % 360;
        const adjustedHue = (hue > 60 && hue < 300) ? hue : hue + 180;
        colors.push(this.hslToHex(adjustedHue, this.random(50, 85), this.random(40, 80)));
      }
    }

    return {
      colors: colors.slice(0, count),
      name: `${temperature.charAt(0).toUpperCase() + temperature.slice(1)} Illustration`,
      description: `Creative ${temperature} palette perfect for illustrations and artwork`,
      harmony: temperature,
      baseHue
    };
  }

  generateAccessibilityPalette(baseHue, count) {
    const colors = [];
    
    const darkColors = [
      this.hslToHex(baseHue, 80, 20),
      this.hslToHex((baseHue + 60) % 360, 75, 25),
      this.hslToHex((baseHue + 180) % 360, 70, 22),
    ];
    
    const lightColors = [
      this.hslToHex(baseHue, 60, 85),
      this.hslToHex((baseHue + 60) % 360, 55, 90),
      this.hslToHex((baseHue + 180) % 360, 50, 88),
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
  }

  // =============================================================================
  // PALETTE GENERATION CONTROLLER
  // =============================================================================

  generateNewPalette(forceHarmony = null, forceBaseHue = null) {
    if (this.state.isGenerating) return;
    
    this.state.isGenerating = true;
    const baseHue = forceBaseHue !== null ? forceBaseHue : Math.floor(Math.random() * 360);
    
    let palette;
    
    switch (this.state.paletteType) {
      case 'ui-design':
        palette = this.generateUIDesignPalette(baseHue, this.state.colorCount);
        break;
      case 'brand-identity':
        palette = this.generateBrandIdentityPalette(baseHue, this.state.colorCount);
        break;
      case 'illustration':
        palette = this.generateIllustrationPalette(baseHue, this.state.colorCount);
        break;
      case 'accessibility':
        palette = this.generateAccessibilityPalette(baseHue, this.state.colorCount);
        break;
      default:
        palette = this.generateUIDesignPalette(baseHue, this.state.colorCount);
    }

    this.addToHistory(palette);
    this.renderPalette(palette);
    this.updateUI();
    
    setTimeout(() => {
      this.state.isGenerating = false;
    }, 100);
  }

  // =============================================================================
  // UI RENDERING
  // =============================================================================

  renderPalette(palette) {
    this.state.currentPalette = palette;
    const container = document.getElementById('colorPalette');
    container.innerHTML = '';

    palette.colors.forEach((color, index) => {
      const colorBox = this.createColorBox(color, index, palette.colors.length);
      container.appendChild(colorBox);
    });

    this.updatePaletteInfo(palette);
    this.analyzePalette(palette);
    this.initializeFeatherIcons();
  }

  createColorBox(color, index, totalColors) {
    const textColor = this.getOptimalTextColor(color);
    
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
      if (!e.target.closest('.copy-btn') && !e.target.closest('.lock-btn')) {
        this.copyToClipboard(color);
      }
    });

    box.querySelector('.copy-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.copyToClipboard(color);
    });

    return box;
  }

  updatePaletteInfo(palette) {
    document.getElementById('paletteInfo').textContent = 
      `${palette.name} • ${palette.description}`;
  }

  analyzePalette(palette) {
    let totalContrast = 0;
    let contrastPairs = 0;
    let accessiblePairs = 0;

    for (let i = 0; i < palette.colors.length; i++) {
      for (let j = i + 1; j < palette.colors.length; j++) {
        const contrast = this.getContrastRatio(palette.colors[i], palette.colors[j]);
        totalContrast += contrast;
        contrastPairs++;
        if (contrast >= 4.5) accessiblePairs++;
      }
    }

    const avgContrast = contrastPairs > 0 ? (totalContrast / contrastPairs) : 0;
    const accessibilityScore = contrastPairs > 0 ? (accessiblePairs / contrastPairs * 100) : 0;

    document.getElementById('contrastScore').textContent = avgContrast.toFixed(1);
    document.getElementById('accessibilityScore').textContent = `${Math.round(accessibilityScore)}%`;
    document.getElementById('harmonyScore').textContent = this.getHarmonyScore(palette);
  }

  getHarmonyScore(palette) {
    const hues = palette.colors.map(color => this.hexToHsl(color)[0]);
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
  }

  // =============================================================================
  // USER INTERACTIONS
  // =============================================================================

  handleKeyboard(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.generateNewPalette();
        break;
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.undo();
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.redo();
        }
        break;
      case 'KeyS':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.savePalette();
        }
        break;
      case 'KeyE':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.showExportModal();
        }
        break;
    }
  }

  copyToClipboard(color) {
    navigator.clipboard.writeText(color).then(() => {
      this.showNotification(`${color} copied to clipboard!`, 'success');
    }).catch(() => {
      this.showNotification('Failed to copy color', 'error');
    });
  }

  // Add this new method after the copyToClipboard method

async shareCurrentPalette() {
  if (!this.state.currentPalette) {
    this.showNotification('No palette to share!', 'error');
    return;
  }

  const palette = this.state.currentPalette;
  const colors = palette.colors.join(', ');
  const shareData = {
    title: `${palette.name} - Color Palette`,
    text: `Check out this amazing ${palette.name} color palette!\n\nColors: ${colors}\n\nGenerated with ColorScope`,
    url: this.generateURLExport(palette)
  };

  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      this.showNotification('Palette shared successfully!', 'success');
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        this.fallbackShare(palette);
      }
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    this.fallbackShare(palette);
  }
}

fallbackShare(palette) {
  const colors = palette.colors.join(', ');
  const shareText = `${palette.name}\n\nColors: ${colors}\n\n${this.generateURLExport(palette)}`;
  
  navigator.clipboard.writeText(shareText).then(() => {
    this.showNotification('Share link copied to clipboard!', 'success');
  }).catch(() => {
    this.showNotification('Failed to copy share link', 'error');
  });
}

  adjustColorCount(delta) {
    const newCount = Math.max(3, Math.min(8, this.state.colorCount + delta));
    if (newCount !== this.state.colorCount) {
      this.state.colorCount = newCount;
      if (this.state.currentPalette) {
        this.generateNewPalette(this.state.currentPalette.harmony, this.state.currentPalette.baseHue);
      }
      document.getElementById('colorCount').textContent = this.state.colorCount;
    }
  }

  setPaletteType(type) {
    this.state.paletteType = type;
    const typeNames = {
      'ui-design': 'UI Design',
      'brand-identity': 'Brand Identity', 
      'illustration': 'Illustration',
      'accessibility': 'Accessibility First'
    };
    
    document.getElementById('currentPaletteType').textContent = typeNames[type];
    document.getElementById('paletteTypeDropdown').classList.add('hidden');
    
    if (this.state.currentPalette) {
      this.generateNewPalette();
    }
  }

  // =============================================================================
  // HISTORY MANAGEMENT
  // =============================================================================

  addToHistory(palette) {
    this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    this.state.history.push(palette);
    this.state.historyIndex = this.state.history.length - 1;
    
    if (this.state.history.length > 50) {
      this.state.history.shift();
      this.state.historyIndex--;
    }
    
    this.saveToLocalStorage();
  }

  undo() {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.renderPalette(this.state.history[this.state.historyIndex]);
      this.updateUI();
      this.saveToLocalStorage();
    }
  }

  redo() {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.renderPalette(this.state.history[this.state.historyIndex]);
      this.updateUI();
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('paletteHistory', JSON.stringify(this.state.history));
    localStorage.setItem('paletteIndex', this.state.historyIndex.toString());
  }

  // =============================================================================
  // EXPORT FUNCTIONALITY
  // =============================================================================

  showExportModal() {
    document.getElementById('exportModal').classList.remove('hidden');
    document.getElementById('exportModal').classList.add('flex');
  }

  hideExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
    document.getElementById('exportModal').classList.remove('flex');
  }

  exportPalette(format) {
    if (!this.state.currentPalette) return;
    
    const palette = this.state.currentPalette;
    let exportData;
    
    switch (format) {
      case 'css':
        exportData = this.generateCSSExport(palette);
        break;
      case 'json':
        exportData = this.generateJSONExport(palette);
        break;
      case 'adobe':
        exportData = this.generateAdobeExport(palette);
        break;
      case 'url':
        exportData = this.generateURLExport(palette);
        break;
    }
    
    if (format === 'url') {
      navigator.clipboard.writeText(exportData);
      this.showNotification('Shareable URL copied to clipboard!', 'success');
    } else {
      this.downloadFile(exportData.content, exportData.filename);
      this.showNotification(`${format.toUpperCase()} file downloaded!`, 'success');
    }
    
    this.hideExportModal();
  }

  generateCSSExport(palette) {
    const cssVars = palette.colors.map((color, index) => 
      `  --color-${index + 1}: ${color};`
    ).join('\n');
    
    const content = `:root {\n${cssVars}\n\n  /* Palette: ${palette.name} */\n  /* ${palette.description} */\n}`;
    
    return {
      content,
      filename: `palette-${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`
    };
  }

  generateJSONExport(palette) {
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
  }

  generateAdobeExport(palette) {
    const content = palette.colors.map((color, index) => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
      return `Color ${index + 1}: RGB(${r}, ${g}, ${b}) | HEX: ${color}`;
    }).join('\n');
    
    return {
      content: `Adobe Swatch Exchange (Simplified)\nPalette: ${palette.name}\n\n${content}`,
      filename: `palette-${palette.name.toLowerCase().replace(/\s+/g, '-')}.ase.txt`
    };
  }

  generateURLExport(palette) {
    const colorString = palette.colors.map(c => c.replace('#', '')).join('-');
    return `${window.location.origin}${window.location.pathname}?colors=${colorString}&name=${encodeURIComponent(palette.name)}`;
  }

  downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  // Add these methods in the EXPORT FUNCTIONALITY section

showShareModal() {
  document.getElementById('shareModal').classList.remove('hidden');
  document.getElementById('shareModal').classList.add('flex');
  this.initializeFeatherIcons();
}

hideShareModal() {
  document.getElementById('shareModal').classList.add('hidden');
  document.getElementById('shareModal').classList.remove('flex');
}

shareToTwitter() {
  if (!this.state.currentPalette) return;
  
  const palette = this.state.currentPalette;
  const colors = palette.colors.join(' ');
  const url = this.generateURLExport(palette);
  const text = `Check out this ${palette.name} color palette! ${colors}`;
  
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank'
  );
}

shareCopyColors() {
  if (!this.state.currentPalette) return;
  
  const colors = this.state.currentPalette.colors.join('\n');
  navigator.clipboard.writeText(colors).then(() => {
    this.showNotification('All colors copied to clipboard!', 'success');
    this.hideShareModal();
  });
}

shareCopyLink() {
  if (!this.state.currentPalette) return;
  
  const url = this.generateURLExport(this.state.currentPalette);
  navigator.clipboard.writeText(url).then(() => {
    this.showNotification('Share link copied to clipboard!', 'success');
    this.hideShareModal();
  });
}
  // =============================================================================
  // UI UPDATES & NOTIFICATIONS
  // =============================================================================

  updateUI() {
    const canUndo = this.state.historyIndex > 0;
    const canRedo = this.state.historyIndex < this.state.history.length - 1;
    
    document.getElementById('undoBtn').disabled = !canUndo;
    document.getElementById('redoBtn').disabled = !canRedo;
    
    if (canUndo) {
      document.getElementById('undoBtn').classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      document.getElementById('undoBtn').classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    if (canRedo) {
      document.getElementById('redoBtn').classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      document.getElementById('redoBtn').classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    
    notification.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg notification-enter flex items-center gap-2`;
    notification.innerHTML = `
      <i data-feather="${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}" class="w-4 h-4"></i>
      ${message}
    `;
    
    document.getElementById('notifications').appendChild(notification);
    
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
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  savePalette() {
    if (!this.state.currentPalette) return;
    
    const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    saved.push({
      ...this.state.currentPalette,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedPalettes', JSON.stringify(saved));
    this.showNotification('Palette saved successfully!', 'success');
  }
}

// =============================================================================
// INITIALIZE APPLICATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  window.colorPaletteGenerator = new ColorPaletteGenerator();
  
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
});