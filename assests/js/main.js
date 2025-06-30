import { db, collection, getDocs, query, orderBy } from "./firebase-config.js";

const inputEl = document.querySelector("input[type='search']");
const loadingSpinner = document.querySelector("#loadingSpinner");
const resultSection = document.querySelector("#resultSection");
const initialState = document.querySelector("#initialState");
const searchResults = document.querySelector("#searchResults");

let cachedRTOData = null;

async function loadRTOData() {
  try {
    if (cachedRTOData) {
      return cachedRTOData;
    }

    const rtoCollection = collection(db, "rto-data");
    const q = query(rtoCollection, orderBy("id"));
    const querySnapshot = await getDocs(q);

    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ docId: doc.id, ...doc.data() });
    });

    cachedRTOData = data;
    return data;
  } catch (error) {
    console.error("Error loading RTO data:", error);
    throw new Error("Failed to load RTO data");
  }
}

const PATTERNS = {
  BASIC_RTO: /^[A-Z]{2}\d{2}$/,
  EXTENDED_RTO: /^[A-Z]{2}\d{2}[A-Z]$/,
  EXTENDED_RTO_2: /^[A-Z]{2}\d{2}[A-Z]{2}$/,
  VEHICLE_NUMBER: /^[A-Z]{2}\d{2}[A-Z]\d{4}$/,
  VEHICLE_NUMBER_2: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/,
  DL_PATTERN_1: /^DL\d{2}[A-Z]$/,
  DL_PATTERN_2: /^DL\d{1}[A-Z]$/,
  DL_PATTERN_3: /^DL[A-Z]{2}$/,
  DL_PATTERN_4: /^DL[A-Z]{2,3}$/,
  DL_PATTERN_5: /^DL\d{2}[A-Z]{2}$/,
  DL_PATTERN_6: /^DL\d{2}[A-Z]{3}$/,
};

function isValidFormat(value) {
  const isDelhiPattern = value.startsWith("DL") && 
    Object.values(PATTERNS)
      .filter(pattern => pattern.source.includes("DL"))
      .some(pattern => pattern.test(value));

  return Object.values(PATTERNS).some(pattern => pattern.test(value)) || isDelhiPattern;
}

function findRTORecord(data, searchValue) {
  const baseRTO = searchValue.slice(0, 4);
  const extendedRTO1 = searchValue.slice(0, 5);
  const extendedRTO2 = searchValue.slice(0, 6);

  let found = data.find((record) => {
    if (Array.isArray(record.code)) {
      return record.code.some((code) => {
        if (code.includes("*")) {
          const regex = new RegExp("^" + code.replace("*", "\\d") + "$");
          return regex.test(searchValue);
        }
        return code === searchValue;
      });
    }
    return record.code === searchValue;
  });

  if (!found) {
    found = data.find((record) => {
      if (Array.isArray(record.code)) {
        return record.code.includes(extendedRTO1) || record.code.includes(baseRTO);
      }

      if (PATTERNS.VEHICLE_NUMBER.test(searchValue) && record.code === extendedRTO1) return true;
      if (PATTERNS.VEHICLE_NUMBER_2.test(searchValue) && record.code === extendedRTO2) return true;

      return false;
    });
  }

  if (!found) {
    found = data.find((record) => {
      if (Array.isArray(record.code)) {
        return record.code.includes(baseRTO);
      }
      return record.code === baseRTO;
    });
  }

  return found;
}

function displayResults(query, record) {
  document.querySelector("#query").textContent = query;
  document.querySelector("#id").textContent = record.id;
  document.querySelector("#rto_code").textContent = Array.isArray(record.code)
    ? record.code.join(", ")
    : record.code;
  document.querySelector("#location").textContent = record.location;
  document.querySelector("#district").textContent = record.district;
  
  initialState.classList.add("hidden");
  searchResults.classList.remove("hidden");
  resultSection.classList.remove("hidden");
}

function hideResults() {
  resultSection.classList.add("hidden");
  initialState.classList.remove("hidden");
  searchResults.classList.add("hidden");
}

function showLoading() {
  loadingSpinner.classList.remove("hidden");
  initialState.classList.add("hidden");
  searchResults.classList.remove("hidden");
}

function hideLoading() {
  loadingSpinner.classList.add("hidden");
}

async function searchRecord(value) {
  try {
    showLoading();
    const data = await loadRTOData();
    await new Promise(resolve => setTimeout(resolve, 300));
    const record = findRTORecord(data, value);
    
    if (record) {
      displayResults(value, record);
    } else {
      hideResults();
    }
  } catch (error) {
    console.error("Search error:", error);
    hideResults();
  } finally {
    hideLoading();
  }
}

function showValidationError() {
  const inputContainer = inputEl.closest(".input-container");
  inputContainer.classList.remove("invalid");
  void inputContainer.offsetWidth;
  inputContainer.classList.add("invalid");
  setTimeout(() => inputContainer.classList.remove("invalid"), 1000);
}

inputEl.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") return;

  const value = inputEl.value.toUpperCase().trim();
  
  if (!value) return;

  if (isValidFormat(value)) {
    searchRecord(value);
  } else {
    showValidationError();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.querySelector("#darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  }
});
