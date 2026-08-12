// ----- Contact Form Submission (works with dynamically-rendered contact component)
(function () {
  'use strict';

  // Default placeholders (will be replaced by GitHub Actions during deployment)
  let SUPABASE_URL = "__SUPABASE_URL__";
  let SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
  let CONTACT_EMAIL = "__CONTACT_EMAIL__";
  let envVarsLoaded = null;

  async function loadEnv() {
    try {
      const envResponse = await fetch("env.txt");
      if (!envResponse.ok) return;
      const envText = await envResponse.text();
      const envVars = {};
      envText.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
          envVars[key.trim()] = values.join("=").trim();
        }
      });

      if (envVars.SUPABASE_URL) SUPABASE_URL = envVars.SUPABASE_URL;
      if (envVars.SUPABASE_ANON_KEY) SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;
      if (envVars.CONTACT_EMAIL) CONTACT_EMAIL = envVars.CONTACT_EMAIL;

      if (envVars.CONTACT_EMAIL || envVars.CONTACT_PHONE) {
        envVarsLoaded = envVars;
        replaceContactPlaceholders(envVars);
      }
    } catch (error) {
      // Ignore error, fallback to placeholders (or GitHub Actions injected values)
    }
  }

  // Replace __CONTACT_EMAIL__ / __CONTACT_PHONE__ in text nodes and links
  function replaceContactPlaceholders(envVars) {
    const walk = (node) => {
      if (node.nodeType === 3) {
        let text = node.nodeValue;
        if (envVars.CONTACT_EMAIL && text.includes("__CONTACT_EMAIL__"))
          text = text.replace(/__CONTACT_EMAIL__/g, envVars.CONTACT_EMAIL);
        if (envVars.CONTACT_PHONE && text.includes("__CONTACT_PHONE__"))
          text = text.replace(/__CONTACT_PHONE__/g, envVars.CONTACT_PHONE);
        if (text !== node.nodeValue) node.nodeValue = text;
      } else if (node.nodeType === 1 && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
        if (node.tagName === "A" && node.href) {
          if (envVars.CONTACT_EMAIL && node.href.includes("__CONTACT_EMAIL__"))
            node.href = node.href.replace(/__CONTACT_EMAIL__/g, envVars.CONTACT_EMAIL);
          if (envVars.CONTACT_PHONE && node.href.includes("__CONTACT_PHONE__"))
            node.href = node.href.replace(/__CONTACT_PHONE__/g, envVars.CONTACT_PHONE);
        }
        for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
      }
    };
    walk(document.body);
  }

  // Attach the submit handler to the (possibly dynamically-rendered) form
  function initForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm || contactForm.dataset.bound) return false;
    contactForm.dataset.bound = "true";

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submit-button");
      const status = document.getElementById("form-status");
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      btn.disabled = true;
      btn.innerHTML =
        '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';
      status.classList.add("hidden");

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ name, email, message }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "No response body");
          console.error("Supabase Error Body:", errorText);

          let errorMessage = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {}

          throw new Error(errorMessage);
        }

        status.textContent = "Message sent successfully! I will get back to you soon.";
        status.className = "text-sm mt-4 text-center text-green-600 dark:text-green-400 block font-medium";
        contactForm.reset();
      } catch (error) {
        console.error("Submission Error:", error);
        status.textContent = "Failed to send message. Please try again or email directly.";
        status.className = "text-sm mt-4 text-center text-red-600 dark:text-red-400 block font-medium";

        if (CONTACT_EMAIL && CONTACT_EMAIL !== "__CONTACT_EMAIL__") {
          const subject = encodeURIComponent(`Contact Form: Message from ${name}`);
          const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        }
      } finally {
        btn.disabled = false;
        btn.innerHTML =
          '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Send Message';
      }
    });

    return true;
  }

  // Fallback: derive email from a mailto link if placeholder wasn't replaced
  function inferEmail() {
    if (CONTACT_EMAIL && CONTACT_EMAIL !== "__CONTACT_EMAIL__") return;
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (!emailLink) return;
    const extracted = emailLink.getAttribute("href").replace("mailto:", "").trim();
    if (extracted && extracted !== "__CONTACT_EMAIL__") {
      CONTACT_EMAIL = extracted;
    }
  }

  // Watch for the contact component to render the form (async fetch)
  function watchForForm() {
    const tryInit = () => {
      inferEmail();
      if (initForm()) return true;
      return false;
    };

    if (tryInit()) return;

    const observer = new MutationObserver(() => {
      if (envVarsLoaded) replaceContactPlaceholders(envVarsLoaded);
      if (tryInit()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Safety timeout
    setTimeout(() => observer.disconnect(), 15000);
  }

  loadEnv();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForForm);
  } else {
    watchForForm();
  }
})();