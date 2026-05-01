function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button ? button.querySelector(".copy-text") : null;

  if (!bibtexElement || !button || !copyText) {
    return;
  }

  const text = bibtexElement.textContent || "";

  navigator.clipboard.writeText(text).then(() => {
    button.classList.add("copied");
    copyText.textContent = "Cop";

    window.setTimeout(() => {
      button.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 2000);
  }).catch(() => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    button.classList.add("copied");
    copyText.textContent = "Cop";

    window.setTimeout(() => {
      button.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 2000);
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.addEventListener("scroll", () => {
  const scrollButton = document.querySelector(".scroll-to-top");

  if (!scrollButton) {
    return;
  }

  if (window.pageYOffset > 320) {
    scrollButton.classList.add("visible");
  } else {
    scrollButton.classList.remove("visible");
  }
});

function setupDatasetCarousel() {
  const carousel = document.querySelector("[data-carousel='real-dataset']");

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector(".carousel-track");
  const prevButton = carousel.querySelector(".carousel-arrow-left");
  const nextButton = carousel.querySelector(".carousel-arrow-right");

  if (!track || !prevButton || !nextButton) {
    return;
  }

  const cards = Array.from(track.children);
  const items = cards.map((card) => card.outerHTML);
  let startIndex = 0;

  function visibleCount() {
    if (window.innerWidth <= 560) {
      return 1;
    }

    if (window.innerWidth <= 1023) {
      return 2;
    }

    return 5;
  }

  function render() {
    const count = visibleCount();
    const visibleItems = [];

    for (let i = 0; i < count; i += 1) {
      visibleItems.push(items[(startIndex + i) % items.length]);
    }

    track.innerHTML = visibleItems.join("");
  }

  prevButton.addEventListener("click", () => {
    startIndex = (startIndex - 1 + items.length) % items.length;
    render();
  });

  nextButton.addEventListener("click", () => {
    startIndex = (startIndex + 1) % items.length;
    render();
  });

  window.addEventListener("resize", render);
  render();
}

function setupSequenceFilters() {
  const checkboxes = Array.from(document.querySelectorAll(".sequence-checkbox"));
  const track = document.querySelector(".sequence-track");
  const toggles = Array.from(document.querySelectorAll(".sequence-dropdown-toggle"));
  const dropdowns = Array.from(document.querySelectorAll(".sequence-dropdown"));
  const prevButton = document.querySelector(".sequence-arrow-left");
  const nextButton = document.querySelector(".sequence-arrow-right");

  if (!track || checkboxes.length === 0 || !prevButton || !nextButton) {
    return;
  }

  const items = Array.from(track.children).map((row) => row.outerHTML);
  let startIndex = 0;

  function selectedValue(group) {
    const checked = checkboxes.find((checkbox) => checkbox.dataset.filterGroup === group && checkbox.checked);
    return checked ? checked.value : "all";
  }

  function dropdownLabel(group) {
    const value = selectedValue(group);
    return value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1);
  }

  function updateDropdownLabels() {
    ["tissue", "celltype"].forEach((group) => {
      const target = document.querySelector(`[data-dropdown-value='${group}']`);

      if (target) {
        target.textContent = dropdownLabel(group);
      }
    });
  }

  function visibleCount() {
    if (window.innerWidth <= 768) {
      return 1;
    }

    if (window.innerWidth <= 1200) {
      return 2;
    }

    return 3;
  }

  function filteredItems() {
    const tissue = selectedValue("tissue");
    const celltype = selectedValue("celltype");

    return items.filter((html) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      const row = wrapper.firstElementChild;

      if (!row) {
        return false;
      }

      const rowTissue = row.dataset.sequenceTissue || "";
      const rowCelltype = row.dataset.sequenceCelltype || "";
      const tissueMatch = tissue === "all" || rowTissue === tissue;
      const celltypeMatch = celltype === "all" || rowCelltype === celltype;

      return tissueMatch && celltypeMatch;
    });
  }

  function render() {
    const filtered = filteredItems();
    const count = visibleCount();
    const renderItems = [];

    if (startIndex >= filtered.length) {
      startIndex = 0;
    }

    for (let i = 0; i < Math.min(count, filtered.length); i += 1) {
      renderItems.push(filtered[(startIndex + i) % filtered.length]);
    }

    track.innerHTML = renderItems.join("");
    prevButton.disabled = filtered.length <= count;
    nextButton.disabled = filtered.length <= count;
    updateDropdownLabels();
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const group = checkbox.dataset.filterGroup;

      if (!group || !checkbox.checked) {
        return;
      }

      const groupBoxes = checkboxes.filter((item) => item.dataset.filterGroup === group);
      groupBoxes.forEach((item) => {
        item.checked = item === checkbox;
      });

      startIndex = 0;
      render();
    });
  });

  prevButton.addEventListener("click", () => {
    const filtered = filteredItems();
    const count = visibleCount();

    if (filtered.length <= count) {
      return;
    }

    startIndex = (startIndex - 1 + filtered.length) % filtered.length;
    render();
  });

  nextButton.addEventListener("click", () => {
    const filtered = filteredItems();
    const count = visibleCount();

    if (filtered.length <= count) {
      return;
    }

    startIndex = (startIndex + 1) % filtered.length;
    render();
  });

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.dataset.dropdownToggle;
      const current = document.querySelector(`[data-dropdown-group='${group}']`);

      dropdowns.forEach((dropdown) => {
        const isCurrent = dropdown === current;
        dropdown.classList.toggle("is-open", isCurrent ? !dropdown.classList.contains("is-open") : false);
      });
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("is-open");
      }
    });
  });

  window.addEventListener("resize", render);
  render();
}

setupSequenceFilters();
setupDatasetCarousel();
