const form = document.getElementById('quoteForm');
const statusMsg = document.getElementById('formStatus');

// One rule per field: return true if valid, or an error message if not
const rules = {
  Name:        v => v.trim().length >= 2 || 'Enter your full name (min 2 characters)',
  Company:     v => v.trim() !== ''      || 'Company is required',
  Email:       v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
  Phone:       v => v === '' || /^\+?[0-9\s-]{10,15}$/.test(v) || 'Enter a valid phone number',
  ProjectType: v => v !== ''             || 'Select a project type',
  Budget:      v => v !== ''             || 'Select a budget range',
  Message:     v => v.trim().length >= 10 || 'Message must be at least 10 characters'
};

function validateField(field) {
  const result = rules[field.name](field.value);
  const error = field.parentElement.querySelector('.error');
  if (result !== true) {
    error.textContent = result;
    field.classList.add('invalid');
    return false;
  }
  error.textContent = '';
  field.classList.remove('invalid');
  return true;
}

// Validate a field when the user leaves it, and re-check while they fix it
form.addEventListener('focusout', e => {
  if (rules[e.target.name]) validateField(e.target);
});
form.addEventListener('input', e => {
  if (e.target.classList.contains('invalid')) validateField(e.target);
});

form.addEventListener('submit', async e => {
  e.preventDefault();                       // stop the page from reloading

  const fields = [...form.querySelectorAll('input, select, textarea')];
  const allValid = fields.map(validateField).every(Boolean); // checks ALL, so every error shows
  if (!allValid) return;

  const data = Object.fromEntries(new FormData(form)); // {Name: "...", Email: "..."}
  console.log(data);                        // test this first, before the backend

  try {
    const res = await fetch('http://localhost:5000/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Server error');
    statusMsg.textContent = 'Thank you! We will contact you within 24 hours.';
    form.reset();
  } catch (err) {
    statusMsg.textContent = 'Something went wrong. Please try again.';
  }
});

// ---------- Mobile menu toggle ----------
const header = document.querySelector('header');
const toggle = document.querySelector('.menu-toggle');

function setMenu(open) {
  header.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.innerHTML = open ? '&#10005;' : '&#9776;';
}
toggle.addEventListener('click', () => setMenu(!header.classList.contains('open')));
document.querySelectorAll('header nav a').forEach(a =>
  a.addEventListener('click', () => setMenu(false))
);

// ---------- Portfolio filter ----------
const filterItems = document.querySelectorAll('.filters li');
const projectCards = document.querySelectorAll('.comcards .cards1');

// Each card's category comes from the text of its tag (Commercial, Residential...)
projectCards.forEach(card => {
  card.dataset.category = card.querySelector('.tag p').textContent.trim().toLowerCase();
});

document.querySelector('.filters').addEventListener('click', e => {
  const link = e.target.closest('a[data-filter]');
  if (!link) return;
  e.preventDefault();                       // stop "#" from jumping to the top

  const filter = link.dataset.filter;
  filterItems.forEach(li => li.classList.toggle('active', li === link.parentElement));

  projectCards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('is-hidden', !show);
    card.classList.remove('fade-in');
    if (show) {
      void card.offsetWidth;                // restart the animation
      card.classList.add('fade-in');
    }
  });
});