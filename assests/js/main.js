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

// search the record in JSON
async function searchRecord(value) {
  try {
    loadingSpinner.classList.remove("hidden");
    const jsonData = await getJSON();

    const found = jsonData.find((record) => {
      return record.code === value || value.substring(0, 5) === record.code || value.substring(0, 4) === record.code;
    });

    if (found) {
      document.querySelector("#query").textContent = value;
      document.querySelector("#id").textContent = found.id;
      document.querySelector("#rto_code").textContent = found.code;
      document.querySelector("#location").textContent = found.location;
      document.querySelector("#district").textContent = found.district;
      resultSection.classList.remove("hidden");
    } else {
      resultSection.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error searching record:", error);
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

inputEl.addEventListener("keyup", (e) => {
  const value = inputEl.value.toUpperCase();
  const inputContainer = inputEl.closest(".input-container");
  // checking the enter key
  if (e.key === "Enter") {
    const pattern1 = /^[A-Z]{2}\d{2}[A-Z]$/;
    const pattern2 =  /^[A-Z]{2}\d{2}$/;
    const pattern3 = /^[A-Z]{2}\d{2}[A-Z]\d{4}$/;
    const pattern4 = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
    // regex validation
    if (
      pattern1.test(value) ||
      pattern2.test(value) ||
      pattern3.test(value) ||
      pattern4.test(value)
    ) {
      inputContainer.classList.remove("invalid");
      searchRecord(value);
    } else {
      // Remove class and force reflow to restart animation
      inputContainer.classList.remove("invalid");
      void inputContainer.offsetWidth;
      // Add invalid class back to trigger the animation
      inputContainer.classList.add("invalid");

      // Remove invalid class after 1000ms
      setTimeout(() => {
        inputContainer.classList.remove("invalid");
      }, 1000);
    }
  }
});

// Dark mode toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.querySelector("#darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  }
});
