document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  
    const stickySection = document.querySelector(".sticky");
    const slidesContainer = document.querySelector(".slides");
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
  
    if (!stickySection || !slidesContainer || !slider || slides.length === 0) {
      console.warn("dom not exist");
      return;
    }
  
    const stickyHeight = window.innerHeight * 6;
    const totalMove = slidesContainer.offsetWidth - slider.offsetWidth;
    const slideWidth = slider.offsetWidth;
  
    slides.forEach((slide) => {
      const title = slide.querySelector(".title h1");
      if (title) gsap.set(title, { y: -200 });
    });
  
    let currentVisibleIndex = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const titles = Array.from(slides).map(slide =>
          slide.querySelector(".title h1")
        );
  
        entries.forEach((entry) => {
          const idx = Array.from(slides).indexOf(entry.target);
          if (entry.intersectionRatio >= 0.25) {
            currentVisibleIndex = idx;
            titles.forEach((title, i) => {
              if (!title) return;
              gsap.to(title, {
                y: i === idx ? 0 : -200,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            });
          } else if (entry.intersectionRatio < 0.25 && currentVisibleIndex === idx) {
            const prevIdx = idx - 1;
            currentVisibleIndex = prevIdx >= 0 ? prevIdx : null;
            titles.forEach((title, i) => {
              if (!title) return;
              gsap.to(title, {
                y: i === prevIdx ? 0 : -200,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            });
          }
        });
      },
      { root: slider, threshold: [0, 0.25] }
    );
    slides.forEach((slide) => observer.observe(slide));
  
    ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: `+=${stickyHeight}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const mainMove = self.progress * totalMove;
        gsap.set(slidesContainer, { x: -mainMove });
  
        const currentSlide = Math.floor(mainMove / slideWidth);
        const sliderProg = (mainMove % slideWidth) / slideWidth;
        slides.forEach((slide, i) => {
          const img = slide.querySelector("img");
          if (!img) return;
          if (i === currentSlide || i === currentSlide + 1) {
            const relProg = i === currentSlide ? sliderProg : sliderProg - 1;
            gsap.set(img, {
              x: relProg * slideWidth * 0.25,
              scale: 1.35,
            });
          } else {
            gsap.set(img, { x: 0, scale: 1.35 });
          }
        });
      },
    });
});
  