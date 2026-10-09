const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.hidden = isOpen;
});

document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  });
});

/* =========================================
   DIGINEEDS SERVICE INTAKE
   ========================================= */

/*
 * Replace APPS_SCRIPT_URL and the payment URLs before launch.
 * Never put private API keys or payment secrets in this file.
 */
const DIGINEEDS_CONFIG = {
  APPS_SCRIPT_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  payments: {
    registration: "PASTE_YOCO_REGISTRATION_PAYMENT_LINK_HERE",
    "landing-page": "PASTE_YOCO_LANDING_PAGE_PAYMENT_LINK_HERE",
    cv: "PASTE_YOCO_CV_PAYMENT_LINK_HERE",
    marketing: "PASTE_YOCO_MARKETING_PAYMENT_LINK_HERE"
  }
};

const serviceDefinitions = {
  registration: {
    label: "START",
    title: "Register your business.",
    description: "Tell us a little about what you're starting so we can help with the right registration next steps.",
    price: "R300 + official fees",
    fields: [
      { name: "business_name", label: "Preferred business name", type: "text", required: false, placeholder: "If you have one in mind" },
      { name: "business_type", label: "What type of business are you starting?", type: "select", required: true,
        options: ["Sole proprietor", "Private company (Pty) Ltd", "Non-profit organisation", "I'm not sure yet"] },
      { name: "registration_status", label: "Have you already started the registration process?", type: "select", required: true,
        options: ["No, I haven't started", "I've reserved a name", "I've started but need help", "I'm not sure"] },
      { name: "service_notes", label: "Anything else you'd like us to know?", type: "textarea", required: false,
        placeholder: "Tell us anything that may help us understand your request." }
    ]
  },

  "landing-page": {
    label: "GET ONLINE",
    title: "Build your professional landing page.",
    description: "Tell us about your business and what you'd like your one-page online presence to do.",
    price: "R1,500",
    fields: [
      { name: "business_name", label: "Business or brand name", type: "text", required: true },
      { name: "business_description", label: "What does your business do?", type: "textarea", required: true,
        placeholder: "A short description is enough." },
      { name: "website_or_social", label: "Existing website or social media link(s)", type: "text", required: false,
        placeholder: "Instagram, Facebook, website, etc." },
      { name: "has_logo", label: "Do you already have a logo?", type: "select", required: true,
        options: ["Yes", "No", "I have something but may need help"] },
      { name: "service_notes", label: "What would you like the landing page to achieve?", type: "textarea", required: false,
        placeholder: "For example: enquiries, bookings, WhatsApp leads, credibility." }
    ]
  },

  cv: {
    label: "GET HIRED",
    title: "Get a tailored ATS-friendly CV.",
    description: "Tell us about the role or direction you're targeting so your CV can be tailored appropriately.",
    price: "R50",
    fields: [
      { name: "target_role", label: "Role or type of work you're targeting", type: "text", required: true,
        placeholder: "e.g. Customer Support Specialist" },
      { name: "experience", label: "Briefly describe your experience", type: "textarea", required: true,
        placeholder: "A few sentences about your recent work or experience." },
      { name: "existing_cv", label: "Do you already have a CV?", type: "select", required: true,
        options: ["Yes — I'll send it after submitting", "No — I need one created from scratch"] },
      { name: "linkedin", label: "LinkedIn or professional profile link", type: "url", required: false, placeholder: "https://..." },
      { name: "service_notes", label: "Anything else you'd like us to know?", type: "textarea", required: false }
    ]
  },

  marketing: {
    label: "GET SEEN",
    title: "Improve your digital marketing.",
    description: "Give us a quick picture of your current online presence and what you'd like to improve.",
    price: "R350",
    fields: [
      { name: "business_name", label: "Business or brand name", type: "text", required: true },
      { name: "website", label: "Website", type: "url", required: false, placeholder: "https://..." },
      { name: "social_links", label: "Social media profile(s)", type: "text", required: false,
        placeholder: "Instagram, Facebook, TikTok, etc." },
      { name: "marketing_goal", label: "What would you most like to improve?", type: "textarea", required: true,
        placeholder: "Tell us what isn't working or what you'd like to achieve." },
      { name: "service_notes", label: "Anything else you'd like us to know?", type: "textarea", required: false }
    ]
  }
};

const serviceModal = document.getElementById("service-modal");
const serviceForm = document.getElementById("service-form");
const dynamicFields = document.getElementById("dynamic-fields");
const modalLabel = document.getElementById("modal-label");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const serviceNameInput = document.getElementById("service-name");
const servicePriceInput = document.getElementById("service-price");
const formError = document.getElementById("form-error");
const formSuccess = document.getElementById("form-success");
const paymentLink = document.getElementById("payment-link");
const submitButton = document.getElementById("form-submit");

let activeService = null;
let lastFocusedElement = null;

function createField(field) {
  const wrapper = document.createElement("label");
  wrapper.className = "dynamic-field";

  const label = document.createElement("span");
  label.innerHTML = `${field.label} ${field.required ? "<b aria-hidden='true'>*</b>" : ""}`;
  wrapper.appendChild(label);

  let input;
  if (field.type === "select") {
    input = document.createElement("select");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Please select";
    placeholder.disabled = true;
    placeholder.selected = true;
    input.appendChild(placeholder);

    field.options.forEach(optionText => {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      input.appendChild(option);
    });
  } else if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 4;
  } else {
    input = document.createElement("input");
    input.type = field.type || "text";
  }

  input.name = field.name;
  input.required = Boolean(field.required);
  if (field.placeholder) input.placeholder = field.placeholder;

  wrapper.appendChild(input);
  return wrapper;
}

function populateForm(serviceKey) {
  const service = serviceDefinitions[serviceKey];
  if (!service) return;

  activeService = serviceKey;
  modalLabel.textContent = service.label;
  modalTitle.textContent = service.title;
  modalDescription.textContent = service.description;
  serviceNameInput.value = serviceKey;
  servicePriceInput.value = service.price;

  dynamicFields.replaceChildren(...service.fields.map(createField));
  formError.hidden = true;
  formError.textContent = "";
  formSuccess.hidden = true;
  serviceForm.hidden = false;
  paymentLink.href = DIGINEEDS_CONFIG.payments[serviceKey] || "#";
  paymentLink.hidden = true;
}

function openServiceModal(serviceKey, trigger) {
  populateForm(serviceKey);
  lastFocusedElement = trigger || document.activeElement;
  serviceModal.hidden = false;
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    serviceForm.querySelector("input:not([type='hidden']), select, textarea")?.focus();
  });
}

function closeServiceModal() {
  serviceModal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus?.();
}

document.querySelectorAll(".service-trigger").forEach(trigger => {
  trigger.addEventListener("click", () => {
    openServiceModal(trigger.dataset.service, trigger);
  });
});

document.querySelectorAll("[data-modal-close]").forEach(element => {
  element.addEventListener("click", closeServiceModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !serviceModal.hidden) closeServiceModal();
});

serviceForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!serviceForm.checkValidity()) {
    serviceForm.reportValidity();
    return;
  }

  const endpoint = DIGINEEDS_CONFIG.APPS_SCRIPT_URL;
  if (!endpoint || endpoint === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    formError.hidden = false;
    formError.textContent = "The intake form is ready, but the DigiNeeds submission endpoint still needs to be connected before launch.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  formError.hidden = true;

  const formData = new FormData(serviceForm);
  formData.append("submitted_at", new Date().toISOString());
  formData.append("source", "DigiNeeds website");

  try {
    await fetch(endpoint, { method: "POST", mode: "no-cors", body: formData });

    serviceForm.hidden = true;
    formSuccess.hidden = false;

    const configuredPayment =
      DIGINEEDS_CONFIG.payments[activeService] &&
      !DIGINEEDS_CONFIG.payments[activeService].startsWith("PASTE_");

    if (configuredPayment) {
      paymentLink.href = DIGINEEDS_CONFIG.payments[activeService];
      paymentLink.hidden = false;
    }
  } catch (error) {
    console.error("DigiNeeds form submission failed:", error);
    formError.hidden = false;
    formError.textContent = "We couldn't submit your request right now. Please try again or contact DigiNeeds on WhatsApp.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit request →";
  }
});

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();
