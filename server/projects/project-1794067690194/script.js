// Mobile Menu Toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking a link
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Menu Filtering System
const filterButtons = document.querySelectorAll('.menu-filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active state from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('bg-amber-500', 'text-gray-950', 'shadow-md');
            btn.classList.add('bg-gray-800', 'text-gray-300');
        });

        // Add active state to clicked button
        button.classList.remove('bg-gray-800', 'text-gray-300');
        button.classList.add('bg-amber-500', 'text-gray-950', 'shadow-md');

        const filter = button.getAttribute('data-filter');

        menuItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Reservation Form Submission
const reservationForm = document.getElementById('reservation-form');
const successToast = document.getElementById('success-toast');

reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('res-name').value;
    const phone = document.getElementById('res-phone').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;

    if (!name || !phone || !date || !time) {
        alert('Please fill out all required fields.');
        return;
    }

    // Show success toast
    successToast.classList.remove('hidden');
    
    // Reset form
    reservationForm.reset();

    // Hide toast after 5 seconds
    setTimeout(() => {
        successToast.classList.add('hidden');
    }, 5000);
});

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('bg-gray-950/95', 'shadow-lg');
    } else {
        navbar.classList.remove('bg-gray-950/95', 'shadow-lg');
    }
});
