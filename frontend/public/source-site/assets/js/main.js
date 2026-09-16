// // 
// const menuBtn = document.getElementById("menu-btn");
// const navLinks = document.getElementById("nav-links");
// const menuBtnIcon = menuBtn.querySelector("i");

// // Toggle Navigation Menu
// menuBtn.addEventListener("click", () => {
//   navLinks.classList.toggle("open");
//   const isOpen = navLinks.classList.contains("open");
//   menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
//   menuBtn.setAttribute("aria-expanded", isOpen);
// });

// // Close menu on nav link click
// navLinks.addEventListener("click", (e) => {
//   if (e.target.tagName === "A") {
//     navLinks.classList.remove("open");
//     menuBtnIcon.setAttribute("class", "ri-menu-line");
//     menuBtn.setAttribute("aria-expanded", "false");
//   }
// });

// // Close nav menu when clicking outside (mobile)
// document.addEventListener("click", (e) => {
//   if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
//     navLinks.classList.remove("open");
//     menuBtnIcon.setAttribute("class", "ri-menu-line");
//   }
// });

// // Scroll Reveal Options
// const scrollRevealOption = {
//   distance: "50px",
//   origin: "bottom",
//   duration: 800,
//   reset: false,
//   easing: "ease-in-out"
// };

// // Header elements
// ScrollReveal().reveal(".header__container h2", scrollRevealOption);
// ScrollReveal().reveal(".header__container h1", { ...scrollRevealOption, delay: 200 });
// ScrollReveal().reveal(".header__container p", { ...scrollRevealOption, delay: 400 });
// ScrollReveal().reveal(".header__btns", { ...scrollRevealOption, delay: 600 });

// // Section cards
// ScrollReveal().reveal(".steps__card, .explore__card, .job__card, .offer__card", {
//   ...scrollRevealOption,
//   interval: 200
// });

// // Swiper Config (with autoplay and pagination)
// const swiper = new Swiper(".swiper", {
//   loop: true,
//   autoplay: {
//     delay: 3000,
//     disableOnInteraction: false,
//   },
//   speed: 800,
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },
//   grabCursor: true,
//   breakpoints: {
//     640: { slidesPerView: 1 },
//     768: { slidesPerView: 2 },
//     1024: { slidesPerView: 3 },
//   }
// });

// Navigation Toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const menuBtnIcon = menuBtn?.querySelector("i");

  if (!menuBtn || !navLinks || !menuBtnIcon) return;

  // Toggle menu
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtnIcon.className = isOpen ? "ri-close-line" : "ri-menu-line";
    menuBtn.setAttribute("aria-expanded", isOpen.toString());
  });

  // Close menu on nav item click
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      menuBtnIcon.className = "ri-menu-line";
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
      menuBtnIcon.className = "ri-menu-line";
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
});
