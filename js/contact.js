// ----- Contact Form Submission
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-button');
            const status = document.getElementById('form-status');
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            btn.disabled = true;
            btn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';
            status.classList.add('hidden');

            // These placeholders will be replaced by GitHub Actions during deployment
            const SUPABASE_URL = '__SUPABASE_URL__'; 
            const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({ name, email, message })
                });

                if (!response.ok) throw new Error('Failed to send message');

                status.textContent = 'Message sent successfully! I will get back to you soon.';
                status.className = 'text-sm mt-4 text-center text-green-600 dark:text-green-400 block font-medium';
                contactForm.reset();
            } catch (error) {
                console.error(error);
                status.textContent = error.message.includes('configure') ? error.message : 'Failed to send message. Please try again or email directly.';
                status.className = 'text-sm mt-4 text-center text-red-600 dark:text-red-400 block font-medium';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Send Message';
            }
        });
    }
});
