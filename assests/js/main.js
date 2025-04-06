// Required elements
const inputEl = document.querySelector("input[type='search']");
const loadingSpinner = document.querySelector("#loadingSpinner");
const resultSection = document.querySelector("#resultSection");

// getting JSON data
async function getJSON() {
  try {
    const response = await fetch("./assests/data/rtoData.json");

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
}

// Search patterns
const PATTERNS = {
  BASIC_RTO: /^[A-Z]{2}\d{2}$/, // e.g TN20
  EXTENDED_RTO: /^[A-Z]{2}\d{2}[A-Z]$/, // e.g TN20X
  EXTENDED_RTO_2: /^[A-Z]{2}\d{2}[A-Z]{2}$/, // e.g TN20ZX
  VEHICLE_NUMBER: /^[A-Z]{2}\d{2}[A-Z]\d{4}$/, // e.g TN20X8055
  VEHICLE_NUMBER_2: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, // e.g TN20ZX8005
};

// search the record in JSON
async function searchRecord(value) {
  try {
    loadingSpinner.classList.remove("hidden");
    document.querySelector("#initialState").classList.add("hidden");
    document.querySelector("#searchResults").classList.remove("hidden");

    const jsonData = await getJSON();

    // Make transition smoother (adding delay)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // RTO codes types
    const baseRTO = value.slice(0, 4); // TN20
    const extendedRTO1 = value.slice(0, 5); // TN20X (special case) gives exact match
    const extendedRTO2 = value.slice(0, 6); // TN20XZ

    // Find exact match Entry Record
    let found = jsonData.find((record) => {
      if (Array.isArray(record.code)) {
        return record.code.some((code) => {
          // Handle wildcard codes (only for Delhi case)
          if (code.includes("*")) {
            const regex = new RegExp("^" + code.replace("*", "\\d") + "$");
            return regex.test(value);
          }

          // Try exact match first
          if (code === value) return true;

          // Try extended RTO matches
          if (PATTERNS.VEHICLE_NUMBER.test(value) && code === extendedRTO1)
            return true;
          if (PATTERNS.VEHICLE_NUMBER_2.test(value) && code === extendedRTO2)
            return true;

          return false;
        });
      }

      // Handling wildcard codes ,e.g. codes with '*'
      if (record.code.includes("*")) {
        const regex = new RegExp("^" + record.code.replace("*", "\\d") + "$");
        return regex.test(value); // Match i/p val against wildcard
      }

      // Try exact match first
      if (record.code === value) return true;

      // Try extended rto matches
      if (PATTERNS.VEHICLE_NUMBER.test(value) && record.code === extendedRTO1)
        return true;
      if (PATTERNS.VEHICLE_NUMBER_2.test(value) && record.code === extendedRTO2)
        return true;

      return false;
    });

    // If no match found, back 2 chekc base RTO
    if (!found) {
      found = jsonData.find((record) => {
        if (Array.isArray(record.code)) {
          return record.code.includes(baseRTO);
        }
        return record.code === baseRTO;
      });
    }

    if (found) {
      document.querySelector("#query").textContent = value;
      document.querySelector("#id").textContent = found.id;
      document.querySelector("#rto_code").textContent = Array.isArray(
        found.code
      )
        ? found.code.join(", ")
        : found.code;
      document.querySelector("#location").textContent = found.location;
      document.querySelector("#district").textContent = found.district;
      resultSection.classList.remove("hidden");
    } else {
      resultSection.classList.add("hidden");
      document.querySelector("#initialState").classList.remove("hidden");
      document.querySelector("#searchResults").classList.add("hidden");
    }
  } catch (error) {
    console.error("Error searching record:", error);
    resultSection.classList.add("hidden");
    document.querySelector("#initialState").classList.remove("hidden");
    document.querySelector("#searchResults").classList.add("hidden");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

inputEl.addEventListener("keyup", (e) => {
  const value = inputEl.value.toUpperCase();
  const inputContainer = inputEl.closest(".input-container");

  if (e.key === "Enter") {
    // Special for DL codes
    const dlPattern1 = /^DL\d{2}[A-Z]$/; // e.g DL01T
    const dlPattern2 = /^DL\d{1}[A-Z]$/; // e.g DL1D
    const dlPattern3 = /^DL[A-Z]{2}$/; // e.g DLER
    const dlPattern4 = /^DL[A-Z]{2,3}$/; // e.g DLSZ, DLSAA
    const dlPattern5 = /^DL\d{2}[A-Z]{2}$/; // e.g DL01RT
    const dlPattern6 = /^DL\d{2}[A-Z]{3}$/; // e.g DL01RTA

    // Check if i/p matches any valid pattern
    const isValidFormat =
      PATTERNS.BASIC_RTO.test(value) ||
      PATTERNS.EXTENDED_RTO.test(value) ||
      PATTERNS.EXTENDED_RTO_2.test(value) ||
      PATTERNS.VEHICLE_NUMBER.test(value) ||
      PATTERNS.VEHICLE_NUMBER_2.test(value) ||
      (value.startsWith("DL") &&
        (dlPattern1.test(value) ||
          dlPattern2.test(value) ||
          dlPattern3.test(value) ||
          dlPattern4.test(value) ||
          dlPattern5.test(value) ||
          dlPattern6.test(value)));

    if (isValidFormat) {
      inputContainer.classList.remove("invalid");
      searchRecord(value);
    } else {
      inputContainer.classList.remove("invalid");
      void inputContainer.offsetWidth;
      inputContainer.classList.add("invalid");
      setTimeout(() => {
        inputContainer.classList.remove("invalid");
      }, 1000);
    }
  }
});

// DarkMode Toggle
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.querySelector("#darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  }
});
