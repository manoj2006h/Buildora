// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Greet button functionality
const greetBtn = document.getElementById('greetBtn');
const greetingCard = document.getElementById('greetingCard');
const greetingText = document.getElementById('greetingText');
const closeCard = document.getElementById('closeCard');

const greetings = [
    "Hello, World! You're looking fantastic today. ✨",
    "Greetings! Ready to build something legendary? 🚀",
    "Hello there! Code is poetry written in logic. 💻",
    "Welcome! The digital universe is yours to shape. 🌌"
];

greetBtn.addEventListener('click', () => {
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    greetingText.textContent = randomGreeting;
    greetingCard.classList.remove('hidden');
});

closeCard.addEventListener('click', () => {
    greetingCard.classList.add('hidden');
});

// Personalized greeting functionality
const nameInput = document.getElementById('nameInput');
const nameBtn = document.getElementById('nameBtn');
const personalizedOutput = document.getElementById('personalizedOutput');

function handlePersonalizedGreeting() {
    const name = nameInput.value.trim();
    if (name) {
        personalizedOutput.textContent = `👋 Hello, ${name}! Welcome to the future of web development.`;
        personalizedOutput.classList.add('animate-fade-in');
    } else {
        personalizedOutput.textContent = `Please enter a valid name first!`;
    }
}

nameBtn.addEventListener('click', handlePersonalizedGreeting);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handlePersonalizedGreeting();
    }
});

// Theme toggle sparkle effect
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const colors = [
        'from-slate-950 via-slate-900 to-indigo-950',
        'from-zinc-950 via-stone-900 to-emerald-950',
        'from-neutral-950 via-zinc-900 to-rose-950',
        'from-slate-950 via-gray-900 to-blue-950'
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];
    document.body.className = `bg-gradient-to-br ${randomBg} text-white min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-700`;
    
    themeToggle.textContent = 'Sparkled! ✨';
    setTimeout(() => {
        themeToggle.textContent = 'Sparkle ✨';
    }, 1500);
});
