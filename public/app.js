const initializeSwiper = () => {
  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: false,
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 35,
    initialSlide: 1,
    navigation: {
      nextEl: ".swiper-button-next-custom",
      prevEl: ".swiper-button-prev-custom",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
      },
    },
  });

  swiper.on("slideChange", updateActiveSlideBackground);
  updateActiveSlideBackground();
};

const updateActiveSlideBackground = () => {
  document.querySelectorAll(".swiper-slide").forEach((slide) => {
    slide.classList.remove("swiper-slide-active");
  });

  const activeSlide = document.querySelector(".swiper-slide-active");
  if (activeSlide) {
    activeSlide.classList.add("swiper-slide-active");
  }
};

const highlightActiveNavLink = () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const updateActiveLink = () => {
    const currentHash = window.location.hash;
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("text-gradient");
      } else {
        link.classList.remove("text-gradient");
      }
    });
  };

  updateActiveLink();
  window.addEventListener("hashchange", updateActiveLink);
};

const trackSectionTimeSpent = () => {
  const sections = ["home", "about-me", "services", "portfolio", "contact-me"];
  const sectionTimers = {};
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const sectionId = entry.target.id;
      if (entry.isIntersecting) {
        sectionTimers[sectionId] = Date.now();
      } else if (sectionTimers[sectionId]) {
        const timeSpent = Date.now() - sectionTimers[sectionId];
        gtag("event", "Section Time Spent", {
          event_category: "Section",
          event_label: sectionId,
          value: timeSpent,
        });
        delete sectionTimers[sectionId];
      }
    });
  }, observerOptions);

  sections.forEach((section) =>
    observer.observe(document.getElementById(section))
  );
};

const setupHeaderMenu = () => {
  document.getElementById("menu-toggle").addEventListener("click", () => {
    const navbar = document.getElementById("navbar-default");
    const hamburgerIcon = document.getElementById("menu-toggle-icon");
    const crossIcon = document.getElementById("menu-toggle-x");
    const isHidden = navbar.classList.toggle("hidden");

    hamburgerIcon.classList.toggle("hidden", !isHidden);
    crossIcon.classList.toggle("hidden", isHidden);
    this.setAttribute("aria-expanded", !isHidden);
  });
};

const displaySkills = (skills) => {
  const skillsContainer = document.getElementById("skills-container");

  skills.forEach((item) => {
    const skillElement = document.createElement("div");
    skillElement.classList.add("flex", "flex-col", "items-center", "gap-2");
    skillElement.innerHTML = `<div class="flex flex-col items-center gap-2"><img class="size-20" src="${item.url}" alt="${item.name}"><p class="font-poppins text-md">${item.name}</p></div>`;

    skillsContainer.appendChild(skillElement);
  });
};

const displayPortfolio = (portfolio) => {
  const htmlTag = document.querySelector("html");
  const portfolioModal = document.getElementById("portfolio-modal");
  const portfolioContainer = document.getElementById("portfolio-container");

  const closeModal = () => {
    portfolioModal.classList.add("hidden");
    htmlTag.classList.remove("overflow-hidden");
  };

  const openModal = (item) => {
    const portfolioProjectURL = portfolioModal.querySelector(
      "#portfolio-project-url"
    );
    portfolioProjectURL.innerText = item.liveUrl;
    portfolioProjectURL.href = item.liveUrl;

    const portfolioProjectTools = portfolioModal.querySelector(
      "#portfolio-project-tools"
    );
    portfolioProjectTools.innerHTML = "";
    item.tools.forEach((tool) => {
      const toolDiv = document.createElement("div");
      toolDiv.classList.add("bg-[#EAF7FF]", "text-primary", "px-2.5", "py-1.5");
      toolDiv.textContent = tool;
      portfolioProjectTools.appendChild(toolDiv);
    });

    portfolioModal.querySelector(
      "#portfolio-project-image"
    ).style.backgroundImage = `url('${item.imageUrl}')`;
    portfolioModal.querySelector("#portfolio-project-name").innerText =
      item.heading;
    portfolioModal.querySelector("#portfolio-project-type").innerText =
      item.type;
    portfolioModal.querySelector("#portfolio-project-description").innerText =
      item.description;

    portfolioModal.classList.remove("hidden");
    htmlTag.classList.add("overflow-hidden");
  };

  const createPortfolioElement = (item) => {
    const portfolioElement = document.createElement("div");
    portfolioElement.classList.add(
      "flex",
      "flex-col",
      "gap-2",
      "modal-trigger",
      "drop-shadow",
      "cursor-pointer"
    );
    portfolioElement.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.heading}" class="rounded-2xl">
      <div class="px-4 box-border">
        <p class="font-poppins font-medium">${item.heading}</p>
        <p class="font-poppins text-sm">${item.type}</p>
      </div>`;
    portfolioElement.onclick = () => openModal(item);
    return portfolioElement;
  };

  const renderPortfolio = (type) => {
    portfolioContainer.innerHTML = "";
    portfolio
      .filter((item) => type === "All" || item.type === type)
      .forEach((item) => {
        const portfolioElement = createPortfolioElement(item);
        portfolioContainer.appendChild(portfolioElement);
      });
  };

  const handleButtonClick = (button, type, buttons) => {
    buttons.forEach((btn) => {
      btn.classList.toggle("bg-transparent", btn === button);
      btn.classList.toggle("text-white", btn === button);
      btn.classList.toggle("bg-white", btn !== button);
      btn.classList.toggle("hover:bg-transparent", btn !== button);
      btn.classList.toggle("hover:text-white", btn !== button);
    });
    renderPortfolio(type);
  };

  portfolioModal.querySelector("#portfolio-modal-close").onclick = closeModal;

  const allPortfolioBtn = document.getElementById("all-portfolio");
  const webDesignPortfolioBtn = document.getElementById("web-design-portfolio");
  const appDesignPortfolioBtn = document.getElementById("app-design-portfolio");
  const buttons = [
    allPortfolioBtn,
    webDesignPortfolioBtn,
    appDesignPortfolioBtn,
  ];
  let selectedPortfolio = "All";

  allPortfolioBtn.onclick = () => {
    if (selectedPortfolio !== "All") {
      selectedPortfolio = "All";
      handleButtonClick(allPortfolioBtn, "All", buttons);
    }
  };
  webDesignPortfolioBtn.onclick = () => {
    if (selectedPortfolio !== "Web design") {
      selectedPortfolio = "Web design";
      handleButtonClick(webDesignPortfolioBtn, "Web design", buttons);
    }
  };
  appDesignPortfolioBtn.onclick = () => {
    if (selectedPortfolio !== "App design") {
      selectedPortfolio = "App design";
      handleButtonClick(appDesignPortfolioBtn, "App design", buttons);
    }
  };

  renderPortfolio("All");
};

const displayTestimonials = (testimonials) => {
  const testimonialContainer = document.getElementById("testimonial-container");

  testimonials.forEach((item) => {
    const testimonialDiv = document.createElement("div");
    testimonialDiv.className = "bg-primaryLight p-4 rounded-xl swiper-slide";

    testimonialDiv.innerHTML = `
      <p class="mb-4 font-poppins">${item.message}</p>
      <div class="flex items-center">
        <img src="${item.imageUrl}" alt="${item.name}" class="size-12 rounded-full mr-4" />
        <div>
          <p class="font-poppins font-medium">${item.name}</p>
          <p class="text-sm font-poppins font-medium text-primary">${item.designation}</p>
        </div>
      </div>
    `;

    testimonialContainer.appendChild(testimonialDiv);
  });
};

const displayServices = (services) => {
  const servicesContainer = document.getElementById("services-container");
  const htmlTag = document.querySelector("html");
  const serviceModal = document.getElementById("service-modal");

  const closeModal = () => {
    serviceModal.classList.add("hidden");
    htmlTag.classList.remove("overflow-hidden");
  };

  const openModal = (item) => {
    serviceModal.querySelector("#service-modal-title").innerText = item.title;
    serviceModal.querySelector("#service-modal-description").innerText =
      item.description;

    serviceModal.classList.remove("hidden");
    htmlTag.classList.add("overflow-hidden");
  };

  serviceModal.querySelector("#service-modal-close").onclick = closeModal;

  services.forEach((item) => {
    const serviceDiv = document.createElement("div");
    serviceDiv.className =
      "rounded-2xl px-6 pb-6 border-l-4 border-t-4 border-white hover:border-primary flex flex-col gap-2";

    serviceDiv.innerHTML = `
      <img src="${item.imageUrl}" class="w-[4rem]" alt="${item.title}" />
          <h2 class="font-semibold text-md font-poppins">${item.title}</h2>
          <p class="text-[0.85rem] font-poppins">
          ${item.description}
          </p>
          <div id="modal-trigger3" class="flex items-center">
            <div class="p-1 bg-primary size-2"></div>
            <button
              id="read-more-btn"
              class="px-4 py-2 text-primary font-poppins text-left font-semibold rounded-md cursor-pointer">
              Read More</button>
          </div>
    `;

    servicesContainer.appendChild(serviceDiv);

    const readMoreBtn = serviceDiv.querySelector("#read-more-btn");
    readMoreBtn.addEventListener("click", () => {
      openModal(item);
    });
  });
};

const fetchAndDisplayDynamicData = () => {
  fetch("./constants.json")
    .then((response) => response.json())
    .then((data) => {
      displaySkills(data.skills);
      displayPortfolio(data.portfolio);
      displayTestimonials(data.testimonial);
      displayServices(data.services);
    })
    .catch((error) => console.error("Error fetching the JSON file:", error));
};

const handleContactFormSubmission = () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitButton = form.querySelector("button");
    submitButton.innerText = "Submitting...";
    submitButton.disabled = true;

    const data = new FormData(form);
    fetch(
      "https://script.google.com/macros/s/AKfycbw7XAqLhoXNliUzwTnEDSd06XLTsfxFy7zzOtnx86xIxTGW43t7nJJlgqRkNQqrU9E/exec",
      {
        method: "POST",
        body: data,
      }
    )
      .then((res) => res.text())
      .then(() => {
        form.reset();
        submitButton.innerText = "Send Message";
        submitButton.disabled = false;
        document
          .getElementById("contact-success-notification")
          .classList.remove("hidden");
        setTimeout(() => {
          document
            .getElementById("contact-success-notification")
            .classList.add("hidden");
        }, 10000);
      });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initializeSwiper();
  highlightActiveNavLink();
  trackSectionTimeSpent();
  setupHeaderMenu();
  fetchAndDisplayDynamicData();
  handleContactFormSubmission();
});

window.addEventListener("load", () => {
  console.log("1229-> load");
});
