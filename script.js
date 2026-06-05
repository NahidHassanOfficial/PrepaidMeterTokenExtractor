/**
 * Prepaid Meter Token Extractor - Core Application Logic
 * Powered by Alpine.js. Implements reactive data binding, translations (English/Bengali),
 * dark/light theme management, clipboard interaction, PWA installation prompts,
 * and custom toast notifications.
 */

// Translation dictionaries for localization support
const TRANSLATION_DICTIONARIES = {
  en: {
    brandName: "Token Extractor",
    brandHelper: "Prepaid Meter Helper",
    prepaidMeter: "Prepaid Meter",
    extractor: "Token Extractor",
    howToUse: "How to use:",
    instruction1: "First copy your meter recharge token message.",
    instruction2: "Paste it into the text box below.",
    instruction3: "Click PROCEED to extract the tokens.",
    instruction4:
      "Navigate through tokens using Previous / Next buttons. And enter them into your meter.",
    placeholder: "Enter your token message here and click to proceed...",
    proceed: "PROCEED",
    share: "Share",
    previous: "❮ Previous",
    next: "Next ❯",
    newExtract: "New Extract",
    shareApp: "Share App",
    sn: "S/N",
    token: "Token",
    seq: "Seq.",
    warning: "Warning",
    enterValidMessage:
      "Please enter a valid prepaid meter recharge token message!",
    linkCopied: "Link Copied",
    urlCopied: "App URL copied to clipboard! Share it with your friends.",
    copied: "Copied!",
    tokenCopied: "Token copied to clipboard successfully!",
    copyFailed: "Copy Failed",
    pleaseCopyManually: "Failed to copy. Please select and copy manually.",
    installed: "Installed Successfully",
    thankYou: "Thank you for installing our application!",
    success: "Success",
    appInstalled: "App installed successfully! You can now use it offline.",
    noTokensFound: "No valid 20-digit prepaid meter tokens found in the text!",
  },
  bn: {
    brandName: "টোকেন এক্সট্রাক্টর",
    brandHelper: "প্রিপেইড মিটার হেল্পার",
    prepaidMeter: "প্রিপেইড মিটার",
    extractor: "টোকেন এক্সট্রাক্টর",
    howToUse: "ব্যবহার পদ্ধতি:",
    instruction1: "প্রথমে রিচার্জ পরবর্তী টোকেনের ম্যাসেজটি কপি করুন।",
    instruction2: "এরপর এটি নিচের টেক্সট বক্সে পেস্ট করুন।",
    instruction3: "টোকেনগুলো বের করতে এগিয়ে যান বাটনে ক্লিক করুন।",
    instruction4:
      "পূর্ববর্তী / পরবর্তী বাটন ব্যাবহার করে একটি একটি করে টোকেন সিকোয়েন্স অনুযায়ী দেখুন। এবং মিটারে প্রবেশ করান",
    placeholder:
      "আপনার টোকেন বার্তাটি এখানে লিখুন এবং এগিয়ে যেতে ক্লিক করুন...",
    proceed: "এগিয়ে যান",
    share: "শেয়ার",
    previous: "❮ পূর্ববর্তী",
    next: "পরবর্তী ❯",
    newExtract: "নতুন এক্সট্রাক্ট",
    shareApp: "অ্যাপ শেয়ার",
    sn: "ক্রমিক",
    token: "টোকেন",
    seq: "সিক.",
    warning: "সতর্কতা",
    enterValidMessage: "দয়া করে সঠিক প্রিপেইড মিটার টোকেন ম্যাসেজ দিন!",
    linkCopied: "লিঙ্ক কপি হয়েছে",
    urlCopied: "অ্যাপের লিঙ্ক কপি করা হয়েছে! বন্ধুদের সাথে শেয়ার করুন।",
    copied: "কপি হয়েছে!",
    tokenCopied: "টোকেন ক্লিপবোর্ডে কপি করা হয়েছে!",
    copyFailed: "কপি ব্যর্থ হয়েছে",
    pleaseCopyManually: "কপি করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি কপি করুন।",
    installed: "ইনস্টল সম্পন্ন",
    thankYou: "ইনস্টল করার জন্য আপনাকে ধন্যবাদ!",
    success: "সফল হয়েছে",
    appInstalled:
      "অ্যাপটি সফলভাবে ইনস্টল করা হয়েছে! এখন অফলাইনেও ব্যবহার করা যাবে।",
    noTokensFound:
      "ম্যাসেজে কোনো সঠিক ২০-ডিজিটের প্রিপেইড মিটার টোকেন পাওয়া যায়নি!",
  },
};

document.addEventListener("alpine:init", () => {
  Alpine.data("tokenExtractor", () => ({
    // ----------------------------------------------------
    // STATE PROPERTIES
    // ----------------------------------------------------

    // User input text message containing token info
    rawTextMessageInput: "",

    // Processed tokens with metadata
    // Each element is an object: { index, rawToken, formattedTokenForTable, cleanTokenForClipboard, sequenceNumber }
    extractedTokensData: [],

    // Extracted sequence parameters
    extractedSequenceStart: -1,
    extractedSequenceEnd: -1,

    // Current active token index pointer for pagination
    currentTokenPointer: 0,

    // UI visibility controller (true shows result page, false shows input page)
    isDisplayingResults: false,

    // Active interface language (Default to 'bn' as requested by the user)
    currentLanguage: localStorage.getItem("language") || "bn",

    // Color theme state ('dark' | 'light')
    currentTheme:
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),

    // Temporary status indicating if the active token was copied
    isTokenCopied: false,

    // PWA Install Button Visibility state
    showInstallButton: false,

    // Array of active Toast objects: { id, type, icon, title, description }
    toastNotifications: [],

    // Service worker registration and update state
    serviceWorkerRegistration: null,
    updateAvailable: false,
    toastStackExpanded: false,
    toastHoverTimer: null,

    // Cached event for PWA installation trigger
    deferredPwaInstallPrompt: null,

    // ----------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------

    init() {
      // Sync theme settings with DOM
      this.applyColorTheme(this.currentTheme);
      this.registerServiceWorker();

      // Listen for the PWA install event
      window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        this.deferredPwaInstallPrompt = event;
        this.showInstallButton = true;
      });

      // Listen for successful PWA installation
      window.addEventListener("appinstalled", () => {
        this.showInstallButton = false;
        this.deferredPwaInstallPrompt = null;
        this.showNotificationToast(
          "success",
          "",
          this.translate("installed"),
          this.translate("appInstalled"),
        );
      });
    },

    registerServiceWorker() {
      if (!("serviceWorker" in navigator)) return;

      window.addEventListener("load", async () => {
        try {
          const registration =
            await navigator.serviceWorker.register("./sw.js");
          this.serviceWorkerRegistration = registration;

          const handleWaitingWorker = () => {
            if (registration.waiting) {
              this.updateAvailable = true;
              this.showNotificationToast(
                "info",
                "",
                "New version available",
                "A newer cached version is ready. Updating now...",
              );
              registration.waiting.postMessage({ type: "SKIP_WAITING" });
            }
          };

          if (registration.waiting) {
            handleWaitingWorker();
          }

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;
            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                handleWaitingWorker();
              }
            });
          });

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.updateAvailable) {
              this.updateAvailable = false;
              window.location.reload();
            }
          });
        } catch (error) {
          console.error("PWA Service Worker registration failed: ", error);
        }
      });
    },

    // ----------------------------------------------------
    // LOCALIZATION HELPERS
    // ----------------------------------------------------

    /**
     * Translates a label key to the active language
     * @param {string} key - The label key to lookup
     * @returns {string} The localized translation text
     */
    translate(key) {
      const activeDictionary =
        TRANSLATION_DICTIONARIES[this.currentLanguage] ||
        TRANSLATION_DICTIONARIES.en;
      return activeDictionary[key] || key;
    },

    /**
     * Set the application's active language preference
     * @param {string} languageCode - 'en' or 'bn'
     */
    setLanguage(languageCode) {
      if (TRANSLATION_DICTIONARIES[languageCode]) {
        this.currentLanguage = languageCode;
        localStorage.setItem("language", languageCode);
      }
    },

    /**
     * Helper to map English numerals to Bengali numerals if language is 'bn'
     * @param {string|number} input - Value containing numbers to convert
     * @returns {string} Formatted string with translated numerals
     */
    toBengaliDigits(input) {
      if (
        input === null ||
        input === undefined ||
        input === "" ||
        input === -1
      ) {
        return "";
      }
      if (this.currentLanguage !== "bn") {
        return String(input);
      }
      const englishToBengaliNumberMap = {
        0: "০",
        1: "১",
        2: "২",
        3: "৩",
        4: "৪",
        5: "৫",
        6: "৬",
        7: "৭",
        8: "৮",
        9: "৯",
      };
      return String(input).replace(
        /[0-9]/g,
        (digit) => englishToBengaliNumberMap[digit] || digit,
      );
    },

    // ----------------------------------------------------
    // EXTRACTION CORE LOGIC
    // ----------------------------------------------------

    /**
     * Processes input string, extracts tokens, sets sequences, and updates viewport state
     */
    processInputMessage() {
      // Validate input message
      if (!this.rawTextMessageInput || this.rawTextMessageInput.trim() === "") {
        this.showNotificationToast(
          "warning",
          "",
          this.translate("warning"),
          this.translate("enterValidMessage"),
        );
        return;
      }

      // 1. Extract raw token matching strings (looking for 20-digit strings, with or without hyphens)
      const rawTokens = this.extractTokensFromText(this.rawTextMessageInput);

      if (rawTokens.length === 0) {
        this.showNotificationToast(
          "warning",
          "",
          this.translate("warning"),
          this.translate("noTokensFound"),
        );
        return;
      }

      // 2. Parse sequence numbers
      this.extractSequenceDetails(this.rawTextMessageInput);

      // 3. Build token objects array (including calculating sequence number offsets per token)
      this.extractedTokensData = this.generateTokensData(
        rawTokens,
        this.extractedSequenceStart,
        this.extractedSequenceEnd,
      );

      // Reset index pointer to first token
      this.currentTokenPointer = 0;
      this.isDisplayingResults = true;
    },

    /**
     * Parses the string to find 20-digit token numbers
     * Matches 20-digit sequences separated optionally by hyphens: e.g. 1234-5678-9012-3456-7890
     */
    extractTokensFromText(text) {
      const tokenPattern = /(?:\b|\d{4}-?)((?:\d{4}-?){4})(?:\d{4}-?)\b/g;
      const matches = text.match(tokenPattern);
      if (!matches) return [];

      // Clean formats: replace single hyphens with spaces
      return matches.map((tokenStr) => {
        // Normalize: replace hyphens with double space as in original
        let cleaned = tokenStr.replace(/-/g, "  ");
        // Ensure proper spacing between groups of 4 digits
        return cleaned.replace(/(\d{4})(?=\d)/g, "$1  ");
      });
    },

    /**
     * Parses the string to identify sequence identifiers and ranges
     * Looks for terms: SquNo, Sequence, SeqNo followed by number/ranges like 7~11, 8
     */
    extractSequenceDetails(text) {
      const sequencePattern =
        /(?<=(?:Sq(?:u)?No|Sequence|SeqNo):\s*-?\s*)\d+(?:(?:[~=]\d+)?)/g;
      const matches = text.match(sequencePattern);

      this.extractedSequenceStart = -1;
      this.extractedSequenceEnd = -1;

      if (!matches) return;

      try {
        matches.forEach((matchedStr) => {
          const numbers = matchedStr
            .split(/[~=]/)
            .map((num) => parseInt(num, 10));
          if (numbers.length === 2) {
            [this.extractedSequenceStart, this.extractedSequenceEnd] = numbers;
          } else if (numbers.length === 1) {
            this.extractedSequenceEnd = numbers[0];
          }
        });
      } catch (error) {
        console.error("Sequence extraction failed: ", error);
      }
    },

    /**
     * Generates structured objects mapping tokens to their respective sequence numbers
     */
    generateTokensData(rawTokens, seqStart, seqEnd) {
      let difference = 0;
      let currentSeqStart = seqStart;
      let currentSeqEnd = seqEnd;
      let hasSingleSeqFlag = 0;

      // Logic mapping: Check if token count exceeds defined sequence range
      if (currentSeqEnd !== -1) {
        if (currentSeqStart !== -1) {
          difference = rawTokens.length - (currentSeqEnd - currentSeqStart + 1);
        } else {
          difference = rawTokens.length - 1;
        }
      }

      return rawTokens.map((token, index) => {
        let assignedSequence = "";

        if (difference > 0) {
          // If there are more tokens than sequence numbers, fill prepended index slots with 0
          assignedSequence = 0;
          difference--;
        } else if (currentSeqStart !== -1 && currentSeqEnd !== -1) {
          if (currentSeqStart <= currentSeqEnd) {
            assignedSequence = currentSeqStart;
            currentSeqStart++;
          }
        } else if (currentSeqEnd !== -1 && hasSingleSeqFlag === 0) {
          assignedSequence = currentSeqEnd;
          hasSingleSeqFlag++;
        }

        return {
          index: index,
          rawToken: token,
          // Format with hyphens for table view
          formattedTokenForTable: token.replace(/  /g, " - "),
          // Strip whitespaces for clipboard action
          cleanTokenForClipboard: token.replace(/\s+/g, ""),
          sequenceNumber: assignedSequence,
        };
      });
    },

    // ----------------------------------------------------
    // USER ACTIONS
    // ----------------------------------------------------

    /**
     * Move backward in token slide
     */
    navigateToPreviousToken() {
      if (this.currentTokenPointer > 0) {
        this.currentTokenPointer--;
        this.isTokenCopied = false;
      }
    },

    /**
     * Move forward in token slide
     */
    navigateToNextToken() {
      if (this.currentTokenPointer < this.extractedTokensData.length - 1) {
        this.currentTokenPointer++;
        this.isTokenCopied = false;
      }
    },

    /**
     * Copies the current token value directly to the clipboard
     */
    copyCurrentTokenToClipboard() {
      if (this.extractedTokensData.length === 0) return;

      const activeTokenObject =
        this.extractedTokensData[this.currentTokenPointer];
      const digitsToCopy = activeTokenObject.cleanTokenForClipboard;

      navigator.clipboard
        .writeText(digitsToCopy)
        .then(() => {
          this.isTokenCopied = true;
          this.showNotificationToast(
            "success",
            "",
            this.translate("copied"),
            this.translate("tokenCopied"),
          );

          // Restore normal state showing numbers after a visual delay
          setTimeout(() => {
            this.isTokenCopied = false;
          }, 1500);
        })
        .catch((err) => {
          console.error("Clipboard copy failed: ", err);
          this.showNotificationToast(
            "warning",
            "",
            this.translate("copyFailed"),
            this.translate("pleaseCopyManually"),
          );
        });
    },

    /**
     * Shared logic: Copies URL or opens Share Drawer on Web Share API compliant platforms
     */
    shareApplicationLink() {
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator
          .share({
            title: "Prepaid Meter Token Extractor",
            text: "Extract and view tokens from meter recharge SMS messages instantly.",
            url: shareUrl,
          })
          .catch((err) => {
            console.log("Web Share terminated or failed: ", err);
          });
      } else {
        // Fallback: Copy URL to clipboard
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            this.showNotificationToast(
              "info",
              "",
              this.translate("linkCopied"),
              this.translate("urlCopied"),
            );
          })
          .catch((err) => {
            console.error("Url copy failed: ", err);
            this.showNotificationToast(
              "warning",
              "",
              this.translate("copyFailed"),
              this.translate("pleaseCopyManually"),
            );
          });
      }
    },

    /**
     * Resets state variables to go back to initial message text entry box
     */
    resetStateToInputMode() {
      this.rawTextMessageInput = "";
      this.extractedTokensData = [];
      this.extractedSequenceStart = -1;
      this.extractedSequenceEnd = -1;
      this.currentTokenPointer = 0;
      this.isDisplayingResults = false;
      this.isTokenCopied = false;
    },

    // ----------------------------------------------------
    // COMPUTE METHODS
    // ----------------------------------------------------

    /**
     * Compiles localized text regarding the quantity of tokens/digits discovered
     */
    getTokenCounterText() {
      const count = this.extractedTokensData.length;
      const totalDigits = this.extractedTokensData.reduce(
        (sum, item) => sum + item.cleanTokenForClipboard.length,
        0,
      );

      if (this.currentLanguage === "bn") {
        const bnCount = this.toBengaliDigits(count);
        const bnDigits = this.toBengaliDigits(totalDigits);
        return `${bnCount}টি স্টেপ • ${bnDigits}টি ডিজিট টোকেন পাওয়া গেছে`;
      } else {
        const tokenLabel = count > 1 ? "step" : "token";
        return `${count} ${tokenLabel} • ${totalDigits} digits token extracted`;
      }
    },

    /**
     * Returns the formatted string representation of active token
     */
    getCurrentTokenText() {
      if (this.extractedTokensData.length === 0) return "";
      return this.extractedTokensData[this.currentTokenPointer].rawToken;
    },

    // ----------------------------------------------------
    // THEME AND PWA TRIGGERS
    // ----------------------------------------------------

    /**
     * Toggle theme wrapper (Light / Dark)
     */
    toggleColorTheme() {
      this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyColorTheme(this.currentTheme);
    },

    /**
     * Apply style changes to Document context
     */
    applyColorTheme(theme) {
      localStorage.setItem("theme", theme);

      const themeMeta = document.getElementById("meta-theme-color");

      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        if (themeMeta) themeMeta.setAttribute("content", "#0f172a");
      } else {
        document.documentElement.classList.remove("dark");
        if (themeMeta) themeMeta.setAttribute("content", "#ececec");
      }
    },

    /**
     * Trigger PWA prompt
     */
    triggerPwaInstall() {
      if (!this.deferredPwaInstallPrompt) return;

      this.showInstallButton = false;
      this.deferredPwaInstallPrompt.prompt();

      this.deferredPwaInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          this.showNotificationToast(
            "success",
            "",
            this.translate("success"),
            this.translate("thankYou"),
          );
        }
        this.deferredPwaInstallPrompt = null;
      });
    },

    // ----------------------------------------------------
    // TOAST NOTIFICATIONS
    // ----------------------------------------------------

    /**
     * Triggers a visual Toast popup message
     * @param {string} type - 'success' | 'warning' | 'info'
     * @param {string} icon - FontAwesome class string
     * @param {string} title - Main header of toast
     * @param {string} description - Descriptive body content
     */
    showNotificationToast(type, icon, title, description) {
      const uniqueId = Date.now() + Math.random().toString(36).substring(2, 9);

      this.toastNotifications.push({
        id: uniqueId,
        type,
        icon,
        title,
        description,
      });

      // Clear toast automatically after 4 seconds
      setTimeout(() => {
        this.dismissNotificationToast(uniqueId);
      }, 4000);
    },

    /**
     * Dismiss a toast popup manually
     * @param {string} uniqueId - Target ID of toast to remove
     */
    dismissNotificationToast(uniqueId) {
      this.toastNotifications = this.toastNotifications.filter(
        (t) => t.id !== uniqueId,
      );
    },
    expandToastStack() {
      if (this.toastHoverTimer) {
        clearTimeout(this.toastHoverTimer);
        this.toastHoverTimer = null;
      }
      this.toastStackExpanded = true;
    },

    collapseToastStack() {
      if (this.toastHoverTimer) {
        clearTimeout(this.toastHoverTimer);
      }
      this.toastHoverTimer = setTimeout(() => {
        this.toastStackExpanded = false;
        this.toastHoverTimer = null;
      }, 160);
    },
  }));
});
