const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-header nav");
if (menuButton && navigation) {
  menuButton.addEventListener("click", () => navigation.classList.toggle("open"));
  navigation.addEventListener("click", () => navigation.classList.remove("open"));
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("revealed");
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

const lightbox = document.querySelector(".lightbox");
if (lightbox) {
  const lightboxImage = lightbox.querySelector("img");
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.querySelector("img").src;
      lightbox.hidden = false;
    });
  });
  lightbox.addEventListener("click", () => {
    lightbox.hidden = true;
    lightboxImage.src = "";
  });
}
