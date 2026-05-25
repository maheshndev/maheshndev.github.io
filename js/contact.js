// ----- Contact Form Submission
document.addEventListener("DOMContentLoaded", async () => {
  // Default placeholders (will be replaced by GitHub Actions during deployment)
  let SUPABASE_URL = "__SUPABASE_URL__";
  let SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
  let CONTACT_EMAIL = "__CONTACT_EMAIL__";

  // Attempt to load from local env.txt file (ignored in GitHub, so it will fail in production)
  try {
    const envResponse = await fetch("env.txt");
    if (envResponse.ok) {
      const envText = await envResponse.text();
      const envVars = {};
      envText.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
          envVars[key.trim()] = values.join("=").trim();
        }
      });

      if (envVars.SUPABASE_URL) SUPABASE_URL = envVars.SUPABASE_URL;
      if (envVars.SUPABASE_ANON_KEY)
        SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;
      if (envVars.CONTACT_EMAIL) CONTACT_EMAIL = envVars.CONTACT_EMAIL;

      // Dynamically replace DOM placeholders for local viewing if .env exists
      if (envVars.CONTACT_EMAIL || envVars.CONTACT_PHONE) {
        const walkDOM = (node) => {
          if (node.nodeType === 3) {
            // Text node
            let text = node.nodeValue;
            if (envVars.CONTACT_EMAIL && text.includes("__CONTACT_EMAIL__"))
              text = text.replace(/__CONTACT_EMAIL__/g, envVars.CONTACT_EMAIL);
            if (envVars.CONTACT_PHONE && text.includes("__CONTACT_PHONE__"))
              text = text.replace(/__CONTACT_PHONE__/g, envVars.CONTACT_PHONE);
            if (text !== node.nodeValue) node.nodeValue = text;
          } else if (
            node.nodeType === 1 &&
            node.nodeName !== "SCRIPT" &&
            node.nodeName !== "STYLE"
          ) {
            if (node.tagName === "A" && node.href) {
              if (
                envVars.CONTACT_EMAIL &&
                node.href.includes("__CONTACT_EMAIL__")
              )
                node.href = node.href.replace(
                  /__CONTACT_EMAIL__/g,
                  envVars.CONTACT_EMAIL,
                );
              if (
                envVars.CONTACT_PHONE &&
                node.href.includes("__CONTACT_PHONE__")
              )
                node.href = node.href.replace(
                  /__CONTACT_PHONE__/g,
                  envVars.CONTACT_PHONE,
                );
            }
            for (let i = 0; i < node.childNodes.length; i++)
              walkDOM(node.childNodes[i]);
          }
        };
        walkDOM(document.body);
      }
    }
  } catch (error) {
    // Ignore error, fallback to placeholders (or GitHub Actions injected values)
  }

  // Fallback to DOM extraction if placeholder is not replaced and env.txt was not loaded
  if (CONTACT_EMAIL === "__CONTACT_EMAIL__" || !CONTACT_EMAIL) {
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      const extracted = emailLink.getAttribute("href").replace("mailto:", "").trim();
      if (extracted && extracted !== "__CONTACT_EMAIL__") {
        CONTACT_EMAIL = extracted;
      }
    }
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
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
          const errorText = await response
            .text()
            .catch(() => "No response body");
          console.error("Supabase Error Body:", errorText);

          let errorMessage = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {}

          throw new Error(errorMessage);
        }

        status.textContent =
          "Message sent successfully! I will get back to you soon.";
        status.className =
          "text-sm mt-4 text-center text-green-600 dark:text-green-400 block font-medium";
        contactForm.reset();
      } catch (error) {
        console.error("Submission Error:", error);
        status.textContent =
          "Failed to send message. Please try again or email directly.";
        status.className =
          "text-sm mt-4 text-center text-red-600 dark:text-red-400 block font-medium";

        // Open default mail client as fallback
        if (CONTACT_EMAIL) {
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
  }
});
