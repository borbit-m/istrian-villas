document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  const navLinks = nav.querySelectorAll('a');

  if (hamburger && nav) {
    // Toggle nav when clicking the hamburger
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    // Close nav when any link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
      });
    });
  }
});