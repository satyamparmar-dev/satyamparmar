/**
 * Content Protection Utilities
 * 
 * 100% Free, Open-Source Content Protection for Blog Posts
 * 
 * Features:
 * - Disable text selection, right-click, keyboard shortcuts
 * - Prevent printing and clipboard access
 * - Dynamic watermark overlay
 * - DevTools detection
 * 
 * License: MIT (Free forever)
 */

export interface ProtectionConfig {
  disableTextSelection?: boolean;
  disableRightClick?: boolean;
  disableKeyboardShortcuts?: boolean;
  disablePrint?: boolean;
  disableClipboard?: boolean;
  enableWatermark?: boolean;
  watermarkText?: string;
  enableDevToolsDetection?: boolean;
}

export class ContentProtection {
  private config: ProtectionConfig;
  private watermarkCanvas: HTMLCanvasElement | null = null;

  constructor(config: ProtectionConfig = {}) {
    this.config = {
      disableTextSelection: true,
      disableRightClick: true,
      disableKeyboardShortcuts: true,
      disablePrint: true,
      disableClipboard: true,
      enableWatermark: true,
      watermarkText: 'Protected Content',
      enableDevToolsDetection: true,
      ...config,
    };
  }

  /**
   * Initialize all protection mechanisms
   */
  public init(): void {
    if (this.config.disableTextSelection) {
      this.disableTextSelection();
    }

    if (this.config.disableRightClick) {
      this.disableRightClick();
    }

    if (this.config.disableKeyboardShortcuts) {
      this.disableKeyboardShortcuts();
    }

    if (this.config.disablePrint) {
      this.disablePrint();
    }

    if (this.config.disableClipboard) {
      this.disableClipboard();
    }

    if (this.config.enableWatermark) {
      this.createWatermark();
    }

    if (this.config.enableDevToolsDetection) {
      this.detectDevTools();
    }

    // Prevent drag and drop
    this.disableDragAndDrop();

    // Prevent image save
    this.disableImageSave();

    // Console warning
    this.addConsoleWarning();
  }

  /**
   * Disable text selection
   */
  private disableTextSelection(): void {
    // CSS approach (applied via className)
    const preventSelection = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('selectstart', preventSelection, { capture: true, passive: false });
    document.addEventListener('dragstart', preventSelection, { capture: true, passive: false });
    document.addEventListener('mousedown', (e) => {
      // Prevent text selection on double/triple click
      if (e.detail > 1) {
        e.preventDefault();
      }
    }, { capture: true, passive: false });

    // Additional protection using CSS classes
    const style = document.createElement('style');
    style.id = 'content-protection-styles';
    style.textContent = `
      .protected-content,
      .protected-content * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      .protected-content img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* Additional protection for all text elements */
      .content-protection-active .protected-content p,
      .content-protection-active .protected-content span,
      .content-protection-active .protected-content div,
      .content-protection-active .protected-content h1,
      .content-protection-active .protected-content h2,
      .content-protection-active .protected-content h3,
      .content-protection-active .protected-content h4,
      .content-protection-active .protected-content h5,
      .content-protection-active .protected-content h6 {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('content-protection-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }

  /**
   * Disable right-click context menu
   */
  private disableRightClick(): void {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.logSecurityEvent('right_click_attempt');
      return false;
    }, false);

    // Also catch onmousedown
    document.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right mouse button
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, false);
  }

  /**
   * Block keyboard shortcuts for copy, save, print, view source
   */
  private disableKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Only block if target is within protected content or body
      const target = e.target as HTMLElement;
      const isInProtectedContent = target.closest('.protected-content') !== null;
      
      if (!isInProtectedContent && target.tagName !== 'BODY') {
        return; // Allow shortcuts outside protected content
      }
      const ctrlKey = e.ctrlKey || e.metaKey; // Cmd on Mac
      const shiftKey = e.shiftKey;

      // Block Ctrl/Cmd + C (Copy)
      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('copy_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + A (Select All)
      if (ctrlKey && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('select_all_attempt');
        return false;
      }

      // Block Ctrl/Cmd + S (Save)
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('save_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + P (Print)
      if (ctrlKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('print_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + U (View Source)
      if (ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('view_source_attempt');
        return false;
      }

      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('devtools_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + Shift + I (DevTools)
      if (ctrlKey && shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('devtools_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + Shift + J (Console)
      if (ctrlKey && shiftKey && e.key === 'J') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('console_shortcut_attempt');
        return false;
      }

      // Block Ctrl/Cmd + Shift + C (Inspect Element)
      if (ctrlKey && shiftKey && e.key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('inspect_shortcut_attempt');
        return false;
      }

      // Block Print Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        this.logSecurityEvent('screenshot_attempt');
        // Can't prevent OS-level screenshot, but can log it
      }
    }, false);
  }

  /**
   * Prevent printing via CSS and JavaScript
   */
  private disablePrint(): void {
    // CSS @media print prevention
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        * {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        body::before {
          content: "This content is protected and cannot be printed.";
          display: block !important;
          visibility: visible !important;
          font-size: 24px;
          text-align: center;
          padding: 50px;
        }
      }
      
      @page {
        size: auto;
        margin: 0;
      }
    `;
    document.head.appendChild(printStyle);

    // JavaScript print prevention
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      this.logSecurityEvent('print_attempt');
      alert('Printing is disabled for protected content.');
      return false;
    }, false);

    // Override window.print
    const originalPrint = window.print;
    const self = this; // Store reference to 'this' for use in closure
    window.print = function() {
      self.logSecurityEvent('print_function_call');
      alert('Printing is disabled for protected content.');
      return false;
    };
  }

  /**
   * Disable clipboard access
   */
  private disableClipboard(): void {
    const preventClipboard = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isInProtectedContent = target.closest('.protected-content') !== null;
      
      if (isInProtectedContent) {
        e.preventDefault();
        e.stopPropagation();
        e.clipboardData?.setData('text/plain', '');
        this.logSecurityEvent('copy_event');
        return false;
      }
    };

    document.addEventListener('copy', preventClipboard, { capture: true, passive: false });
    document.addEventListener('cut', preventClipboard, { capture: true, passive: false });
    
    document.addEventListener('paste', (e) => {
      const target = e.target as HTMLElement;
      const isInProtectedContent = target.closest('.protected-content') !== null;
      
      if (isInProtectedContent) {
        e.preventDefault();
        e.stopPropagation();
        this.logSecurityEvent('paste_event');
        return false;
      }
    }, { capture: true, passive: false });
  }

  /**
   * Create dynamic watermark overlay
   */
  private createWatermark(): void {
    const watermark = document.createElement('div');
    watermark.id = 'content-watermark';
    
    const sessionId = this.generateSessionId();
    const timestamp = new Date().toISOString();
    const watermarkText = `${this.config.watermarkText || 'Protected'} - ${sessionId.substring(0, 8)} - ${timestamp.substring(0, 10)}`;

    watermark.textContent = watermarkText;
    
    const style = document.createElement('style');
    style.textContent = `
      #content-watermark {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.03) 10px,
          rgba(0, 0, 0, 0.03) 20px
        );
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.1);
        user-select: none;
        opacity: 0.3;
      }
      
      @media print {
        #content-watermark {
          opacity: 0.8 !important;
          color: rgba(0, 0, 0, 0.5) !important;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(watermark);
  }

  /**
   * Detect DevTools opening
   */
  private detectDevTools(): void {
    let devToolsOpen = false;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          this.logSecurityEvent('devtools_opened');
          // Optionally redirect or show warning
          console.clear();
          console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis is a browser feature intended for developers. Unauthorized access attempts may be logged.', 'color: red; font-size: 16px;');
        }
      } else {
        devToolsOpen = false;
      }
    };

    // Check every 500ms
    setInterval(detectDevTools, 500);

    // Also detect console access
    let consoleWarnCount = 0;
    const originalConsole = { ...console };
    
    Object.keys(console).forEach((key) => {
      const originalMethod = (console as any)[key];
      (console as any)[key] = function(...args: any[]) {
        consoleWarnCount++;
        if (consoleWarnCount === 1) {
          detectDevTools();
        }
        return originalMethod.apply(console, args);
      };
    });
  }

  /**
   * Disable drag and drop
   */
  private disableDragAndDrop(): void {
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    }, false);

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      return false;
    }, false);
  }

  /**
   * Disable image save
   */
  private disableImageSave(): void {
    // Prevent image context menu
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    }, false);

    // Add no-drag attribute to images
    document.querySelectorAll('img').forEach((img) => {
      (img as HTMLElement).setAttribute('draggable', 'false');
      img.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
    });
  }

  /**
   * Add console warning
   */
  private addConsoleWarning(): void {
    // This runs when console is opened
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        console.log('%c⚠️ Security Warning ⚠️', 'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cUnauthorized access attempts are logged and monitored.', 'color: red; font-size: 14px;');
        console.log('%cIf you are a legitimate developer, contact the site administrator.', 'color: orange; font-size: 12px;');
      })();
    `;
    document.head.appendChild(script);
  }

  /**
   * Generate session ID for watermark
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Log security events (send to backend)
   */
  private logSecurityEvent(eventType: string): void {
    // Send to backend analytics endpoint
    try {
      fetch('/api/security/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail if backend unavailable
      });
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Cleanup protection (if needed)
   */
  public destroy(): void {
    // Remove event listeners and cleanup
    const watermark = document.getElementById('content-watermark');
    if (watermark) {
      watermark.remove();
    }
  }
}

// Export singleton instance
export const contentProtection = new ContentProtection();

