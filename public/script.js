// Add click ripple effect to buttons
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    // Remove any existing ripple class
    this.classList.remove("clicked");

    // Force a DOM reflow
    void this.offsetWidth;

    // Add the ripple class
    this.classList.add("clicked");

    // Remove the class after animation
    setTimeout(() => {
      this.classList.remove("clicked");
    }, 700);
  });
});

// Menu toggle functionality
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.getElementById("navMenu");
const header = document.querySelector("header");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

// Enhanced menu toggle functionality
if (menuToggle && navMenu) {
  // Toggle menu
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });

  // Close menu when clicking on nav links
  document.querySelectorAll("#navMenu a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Handle navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links and add to clicked link
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Get the page id from data attribute
      const pageId = link.getAttribute("data-page");

      // Hide all pages and show the selected one
      pages.forEach((page) => {
        page.classList.remove("active");
        if (page.id === pageId) {
          page.classList.add("active");
        }
      });

      // Close mobile menu if open
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");

      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}

// Handle scroll effects
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // Add/remove scrolled class to header
  if (currentScroll > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  lastScroll = currentScroll;
});

// Initialize the page based on URL hash or default to home
function initializePage() {
  const hash = window.location.hash.slice(1) || "home";
  const targetLink = document.querySelector(`.nav-link[data-page="${hash}"]`);
  if (targetLink) {
    targetLink.click();
  }
}

// Run initialization
document.addEventListener("DOMContentLoaded", initializePage);

// Handle browser back/forward buttons
window.addEventListener("popstate", initializePage);

// Global variables
let productData = null;
const API_BASE_URL = window.location.origin + "/api";
let currentSearchType = "name"; // Default search type

// Add a healthcheck function to verify API connection
async function checkApiConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("API connection successful:", await response.json());
      return true;
    } else {
      console.error("API health check failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("API connection error:", error);
    return false;
  }
}

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", async () => {
  const searchByNameBtn = document.getElementById("searchByName");
  const searchByURLBtn = document.getElementById("searchByURL");
  const nameSearchForm = document.getElementById("nameSearchForm");
  const urlSearchForm = document.getElementById("urlSearchForm");
  const productNameInput = document.getElementById("productName");
  const productURLInput = document.getElementById("productURL");
  const analyzeNameBtn = document.getElementById("analyzeNameBtn");
  const analyzeURLBtn = document.getElementById("analyzeURLBtn");
  const analysisResult = document.getElementById("analysisResult");
  const emptyState = document.getElementById("emptyState");

  // Search type tab switching
  searchByNameBtn.addEventListener("click", () => {
    searchByNameBtn.style.background = "var(--gradient)";
    searchByNameBtn.style.border = "none";
    searchByURLBtn.style.background = "var(--dark)";
    searchByURLBtn.style.border = "1px solid var(--primary)";
    nameSearchForm.style.display = "block";
    urlSearchForm.style.display = "none";
    currentSearchType = "name";
    productNameInput.focus();
  });

  searchByURLBtn.addEventListener("click", () => {
    searchByURLBtn.style.background = "var(--gradient)";
    searchByURLBtn.style.border = "none";
    searchByNameBtn.style.background = "var(--dark)";
    searchByNameBtn.style.border = "1px solid var(--primary)";
    urlSearchForm.style.display = "block";
    nameSearchForm.style.display = "none";
    currentSearchType = "url";
    productURLInput.focus();
  });

  // Search form submission
  analyzeNameBtn.addEventListener("click", async () => {
    const productName = productNameInput.value.trim();

    if (!productName) {
      showError("Please enter a product name");
      return;
    }

    try {
      showLoading(productName);
      const response = await fetch(
        `${API_BASE_URL}/search/${encodeURIComponent(productName)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch results");
      }

      productData = data;
      displayProductAnalysis();
    } catch (error) {
      showError(`Error: ${error.message}`);
      console.error("Search error:", error);
    } finally {
      hideLoading();
    }
  });

  analyzeURLBtn.addEventListener("click", async () => {
    const productUrl = productURLInput.value.trim();

    if (!productUrl) {
      showError("Please enter a product URL");
      return;
    }

    // Validate URL
    try {
      new URL(productUrl);
    } catch (e) {
      showError("Please enter a valid URL");
      return;
    }

    try {
      showLoading(productUrl);
      console.log(
        `Sending URL search request to: ${API_BASE_URL}/url with URL: ${productUrl}`
      );

      const response = await fetch(`${API_BASE_URL}/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productUrl }),
      });

      console.log(`URL search response status: ${response.status}`);

      const data = await response.json();
      console.log("URL search response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch results");
      }

      productData = data;
      displayProductAnalysis();
    } catch (error) {
      console.error("URL search error details:", error);
      showError(`Error: ${error.message || "Failed to process URL"}`);
    } finally {
      hideLoading();
    }
  });

  // Function to display product analysis
  function displayProductAnalysis() {
    if (!productData) return;

    emptyState.style.display = "none";
    analysisResult.style.display = "block";

    // Clear previous results
    analysisResult.innerHTML = "";

    // Create analysis sections
    const sections = [
      {
        title: "Overall Sentiment",
        data: productData.sentiment,
        icon: "fas fa-chart-pie",
      },
      {
        title: "Key Features",
        data: productData.features,
        icon: "fas fa-star",
      },
      {
        title: "Common Issues",
        data: productData.issues,
        icon: "fas fa-exclamation-triangle",
      },
      {
        title: "Recommendations",
        data: productData.recommendations,
        icon: "fas fa-lightbulb",
      },
    ];

    sections.forEach((section) => {
      const sectionElement = document.createElement("div");
      sectionElement.className = "analysis-section";
      sectionElement.innerHTML = `
        <div class="section-header">
          <i class="${section.icon}"></i>
          <h3>${section.title}</h3>
        </div>
        <div class="section-content">
          ${formatSectionContent(section.data)}
        </div>
      `;
      analysisResult.appendChild(sectionElement);
    });
  }

  // Helper function to format section content
  function formatSectionContent(data) {
    if (Array.isArray(data)) {
      return `<ul>${data.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    } else if (typeof data === "object") {
      return Object.entries(data)
        .map(
          ([key, value]) => `
        <div class="data-item">
          <strong>${key}:</strong>
          <span>${value}</span>
        </div>
      `
        )
        .join("");
    } else {
      return `<p>${data}</p>`;
    }
  }

  // Function to show loading state
  function showLoading(searchTerm) {
    emptyState.style.display = "none";
    analysisResult.style.display = "block";
    analysisResult.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <h3>Analyzing "${searchTerm}"</h3>
        <p>Please wait while we process the reviews...</p>
      </div>
    `;
  }

  // Function to hide loading state
  function hideLoading() {
    const loadingState = document.querySelector(".loading-state");
    if (loadingState) {
      loadingState.remove();
    }
  }

  // Function to show error message
  function showError(message) {
    emptyState.style.display = "none";
    analysisResult.style.display = "block";
    analysisResult.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
      </div>
    `;
  }

  // Contact form handling
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Create success message
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Gotcha! We will contact you soon.</span>
      `;

      // Remove any existing messages
      const existingMessage = contactForm.querySelector(
        ".success-message, .error-message"
      );
      if (existingMessage) {
        existingMessage.remove();
      }

      // Add success message
      contactForm.insertBefore(successMessage, contactForm.firstChild);

      // Submit the form
      const formData = new FormData(contactForm);
      fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          // Reset the form
          contactForm.reset();

          // Remove success message after 5 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 5000);
        })
        .catch((error) => {
          console.error("Error:", error);
          successMessage.className = "error-message";
          successMessage.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <span>Oops! Something went wrong. Please try again.</span>
        `;
        });
    });
  }
});
