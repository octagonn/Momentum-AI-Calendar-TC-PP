// Password reset page logic using Supabase Auth v2
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, APP_STORE_URL } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const formWrapper = document.getElementById('reset-wrapper');
const statusEl = document.getElementById('reset-status');
const formEl = document.getElementById('reset-form');
const passwordInput = document.getElementById('new-password');
const confirmInput = document.getElementById('confirm-password');
const successEl = document.getElementById('reset-success');

function show(el) { if (el) el.style.display = 'block'; }
function hide(el) { if (el) el.style.display = 'none'; }

function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.style.color = isError ? '#B91C1C' : '#065F46';
}

async function handleReset(e) {
    e.preventDefault();
    const pwd = passwordInput && passwordInput.value ? passwordInput.value.trim() : '';
    const confirm = confirmInput && confirmInput.value ? confirmInput.value.trim() : '';

    if (!pwd || pwd.length < 8) {
        setStatus('Password must be at least 8 characters.', true);
        return;
    }
    if (pwd !== confirm) {
        setStatus('Passwords do not match.', true);
        return;
    }

    setStatus('Updating password...');
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) {
        setStatus(error.message || 'Failed to update password. Try again.', true);
        return;
    }

    hide(formWrapper);
    show(successEl);
    setStatus('Password updated. You can now sign in.');
}

if (formEl) formEl.addEventListener('submit', handleReset);

// Supabase will set a session when arriving from the email link. We wait for the recovery event.
supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
        show(formWrapper);
        hide(successEl);
        setStatus('Enter a new password to complete reset.');
    }
});

// If the user loads the page without the email link (no session), show guidance.
(async function init() {
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
        hide(formWrapper);
        show(successEl);
        if (successEl) {
            successEl.innerHTML = '<p>Open the password reset link from your email on this device. If you do not have a link, request a new reset from the app.</p>' +
                `<p><a class="btn" href="${APP_STORE_URL}">Open App Store</a></p>`;
        }
    }
})();

