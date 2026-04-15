const STORAGE_KEY = "jude-house.invoice-gen.v1";
const ALLOWED_CURRENCIES = new Set(["USD", "CAD", "EUR", "GBP", "AUD"]);

function localDateValue(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMoney(value, currency) {
  const safeCurrency = ALLOWED_CURRENCIES.has(currency) ? currency : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }
}

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function accentInkFromHex(hex) {
  const normalized = String(hex || "").trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#2c1224";
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  // Relative luminance approximation, tuned for a simple dark/light contrast choice.
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 165 ? "#1f1713" : "#ffffff";
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "JH";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatContactLines(lines, fallback) {
  const filtered = lines
    .map((line) => String(line || "").trim())
    .filter(Boolean);

  return filtered.length ? filtered.join("\n") : fallback;
}

function buildDefaultItems() {
  return [
    {
      id: 1,
      title: "Creative services",
      description: "Strategy, production support, and delivery.",
      quantity: "1",
      rate: "2500",
    },
  ];
}

function normalizeItem(item, index) {
  const hasTitle = Object.prototype.hasOwnProperty.call(item || {}, "title");
  const legacyDescription = String(item?.description ?? "");

  return {
    id: Number.isFinite(Number(item?.id)) ? Number(item.id) : index + 1,
    title: hasTitle ? String(item?.title ?? "") : legacyDescription,
    description: hasTitle ? legacyDescription : "",
    quantity: String(item?.quantity ?? "1"),
    rate: String(item?.rate ?? "0"),
  };
}

function buildDefaultState() {
  return {
    brandName: "Jude House",
    brandTagline: "Creative direction and production",
    accentColor: "#fa98f0",
    email: "info@jude.house",
    phone: "",
    website: "jude.house",
    address: "Atlanta, Georgia",
    invoiceNumber: "INV-2026-001",
    issueDate: localDateValue(0),
    dueDate: localDateValue(14),
    projectName: "Creative services",
    currency: "USD",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    purchaseOrder: "",
    taxRate: "0",
    discountRate: "0",
    notes:
      "Thanks for the quick turnaround. Payment can be sent by ACH or card once approved.",
    terms: "Due on receipt.",
    items: buildDefaultItems(),
  };
}

function loadState() {
  const fallback = buildDefaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    const merged = { ...fallback, ...parsed };

    if (Array.isArray(parsed?.items) && parsed.items.length) {
      merged.items = parsed.items.map((item, index) => normalizeItem(item, index));
    } else {
      merged.items = buildDefaultItems();
    }

    if (!ALLOWED_CURRENCIES.has(merged.currency)) {
      merged.currency = fallback.currency;
    }

    return merged;
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best effort only.
  }
}

function nextItemId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function sumItems(items) {
  return items.reduce(
    (totals, item) => {
      const quantity = toNumber(item.quantity);
      const rate = toNumber(item.rate);
      const total = quantity * rate;

      totals.subtotal += total;
      return totals;
    },
    { subtotal: 0, tax: 0, discount: 0, totalDue: 0 },
  );
}

function calculateTotals() {
  const totals = sumItems(state.items);
  const subtotal = totals.subtotal;
  const tax = subtotal * (toNumber(state.taxRate) / 100);
  const discount = subtotal * (toNumber(state.discountRate) / 100);
  const totalDue = Math.max(subtotal + tax - discount, 0);

  return {
    subtotal,
    tax,
    discount,
    totalDue,
  };
}

function setPreviewText(key, value) {
  document.querySelectorAll(`[data-preview="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function renderPreview() {
  const totals = calculateTotals();
  const currency = state.currency || "USD";

  const brandLines = formatContactLines(
    [
      state.address,
      state.email,
      state.phone,
      state.website ? `https://${state.website.replace(/^https?:\/\//, "")}` : "",
    ],
    "Add your contact details",
  );

  const clientLines = formatContactLines(
    [
      state.clientName,
      state.clientCompany,
      state.clientEmail,
      state.clientPhone,
      state.clientAddress,
    ],
    "Add client details",
  );

  setPreviewText("brandInitials", initialsFromName(state.brandName));
  setPreviewText("brandName", state.brandName || "Jude House");
  setPreviewText("brandTagline", state.brandTagline || "Creative direction and production");
  setPreviewText("invoiceNumber", state.invoiceNumber || "INV-2026-001");
  setPreviewText("issueDate", formatDate(state.issueDate));
  setPreviewText("dueDate", formatDate(state.dueDate));
  setPreviewText("projectName", state.projectName || "Creative services");
  setPreviewText("purchaseOrder", state.purchaseOrder || "-");
  setPreviewText("brandContact", brandLines);
  setPreviewText("clientContact", clientLines);
  setPreviewText("notes", state.notes || "-");
  setPreviewText("terms", state.terms || "-");
  setPreviewText("subtotal", formatMoney(totals.subtotal, currency));
  setPreviewText("taxAmount", formatMoney(totals.tax, currency));
  setPreviewText("discountAmount", formatMoney(totals.discount, currency));
  setPreviewText("totalDue", formatMoney(totals.totalDue, currency));
  setPreviewText("heroInvoiceNumber", state.invoiceNumber || "INV-2026-001");
  setPreviewText("heroDueDate", formatDate(state.dueDate));
  setPreviewText("heroTotalDue", formatMoney(totals.totalDue, currency));

  document.documentElement.style.setProperty("--invoice-accent", state.accentColor || "#fa98f0");
  document.documentElement.style.setProperty(
    "--invoice-accent-ink",
    accentInkFromHex(state.accentColor),
  );
}

function renderItemRows() {
  const itemsRoot = document.querySelector("[data-items]");

  if (!itemsRoot) {
    return;
  }

  itemsRoot.innerHTML = state.items
    .map((item, index) => {
      const itemTotal = toNumber(item.quantity) * toNumber(item.rate);

      return `
        <div class="item-row" data-item-row data-item-index="${index}" data-item-id="${item.id}">
          <input
            class="item-row__title"
            type="text"
            data-item-field="title"
            aria-label="Item title"
            placeholder="Video Coverage"
            value="${escapeHtml(item.title)}"
          />
          <input
            type="number"
            min="0"
            step="1"
            data-item-field="quantity"
            aria-label="Quantity"
            value="${escapeHtml(item.quantity)}"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            data-item-field="rate"
            aria-label="Rate"
            value="${escapeHtml(item.rate)}"
          />
          <div class="item-row__total" data-item-total>${formatMoney(itemTotal, state.currency)}</div>
          <button
            type="button"
            class="invoice-button invoice-button--ghost invoice-button--small item-row__remove"
            data-action="remove-item"
            aria-label="Remove this line item"
          >
            Remove
          </button>
          <textarea
            class="item-row__description"
            data-item-field="description"
            aria-label="Item description"
            rows="3"
            placeholder="Capture ceremony highlights, reception coverage, and edited deliverables."
          >${escapeHtml(item.description)}</textarea>
        </div>
      `;
    })
    .join("");
}

function renderPreviewTable() {
  const previewRows = document.querySelector('[data-preview="itemRows"]');

  if (!previewRows) {
    return;
  }

  previewRows.innerHTML = state.items
    .map((item) => {
      const quantity = toNumber(item.quantity);
      const rate = toNumber(item.rate);
      const itemTotal = quantity * rate;
      const title = item.title?.trim() || "Untitled service";
      const description = item.description?.trim() || "";

      return `
        <tr>
          <td>
            <div class="sheet__item-name">
              <strong>${escapeHtml(title)}</strong>
              ${
                description
                  ? `<span>${escapeHtml(description)}</span>`
                  : `<span>${quantity || 0} x ${formatMoney(rate, state.currency)}</span>`
              }
            </div>
          </td>
          <td class="sheet__num">${quantity || 0}</td>
          <td class="sheet__num">${formatMoney(rate, state.currency)}</td>
          <td class="sheet__num">${formatMoney(itemTotal, state.currency)}</td>
        </tr>
      `;
    })
    .join("");
}

function refreshItemTotals() {
  document.querySelectorAll("[data-item-row]").forEach((row) => {
    const index = Number(row.dataset.itemIndex);
    const item = state.items[index];

    if (!item) {
      return;
    }

    const total = toNumber(item.quantity) * toNumber(item.rate);
    const totalNode = row.querySelector("[data-item-total]");
    if (totalNode) {
      totalNode.textContent = formatMoney(total, state.currency);
    }
  });
}

function syncBoundInputs() {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const field = element.dataset.field;

    if (!(field in state)) {
      return;
    }

    const value = state[field];
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
      return;
    }

    element.value = value ?? "";
  });
}

function applyInitialState() {
  syncBoundInputs();
  renderItemRows();
  renderPreviewTable();
  renderPreview();
  refreshItemTotals();
}

function updateField(field, value) {
  state[field] = value;
  if (field === "accentColor") {
    document.documentElement.style.setProperty("--invoice-accent", value || "#fa98f0");
    document.documentElement.style.setProperty("--invoice-accent-ink", accentInkFromHex(value));
  }
  saveState();
  renderPreviewTable();
  refreshItemTotals();
  renderPreview();
}

function updateItem(index, field, value) {
  if (!state.items[index]) {
    return;
  }

  state.items[index][field] = value;
  saveState();
  renderPreview();
  refreshItemTotals();
  renderPreviewTable();
}

function addItem() {
  state.items.push({
    id: nextItemId(state.items),
    title: "",
    description: "",
    quantity: "1",
    rate: "0",
  });

  saveState();
  renderItemRows();
  renderPreview();
  renderPreviewTable();
}

function removeItem(index) {
  if (state.items.length === 1) {
    state.items[0] = {
      id: state.items[0].id,
      title: "",
      description: "",
      quantity: "1",
      rate: "0",
    };
  } else {
    state.items.splice(index, 1);
  }

  saveState();
  renderItemRows();
  renderPreview();
  renderPreviewTable();
}

function resetState() {
  const confirmed = window.confirm("Reset the invoice generator to the sample values?");
  if (!confirmed) {
    return;
  }

  state = buildDefaultState();
  saveState();
  applyInitialState();
}

function printInvoice() {
  window.print();
}

function bindEvents() {
  const form = document.getElementById("invoice-form");

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }

    const action = actionButton.dataset.action;
    if (action === "add-item") {
      addItem();
    }

    if (action === "remove-item") {
      const row = actionButton.closest("[data-item-row]");
      if (!row) {
        return;
      }

      removeItem(Number(row.dataset.itemIndex));
    }

    if (action === "reset") {
      resetState();
    }

    if (action === "print") {
      printInvoice();
    }
  });

  if (!form) {
    return;
  }

  form.addEventListener("input", (event) => {
    const field = event.target.closest("[data-field]");
    if (field) {
      const name = field.dataset.field;
      updateField(name, field.value);
      return;
    }

    const itemField = event.target.closest("[data-item-field]");
    if (itemField) {
      const row = itemField.closest("[data-item-row]");
      if (!row) {
        return;
      }

      const index = Number(row.dataset.itemIndex);
      updateItem(index, itemField.dataset.itemField, itemField.value);
    }
  });
}

let state = loadState();

function init() {
  bindEvents();
  applyInitialState();

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      renderPreview();
      renderPreviewTable();
    });
  }
}

init();
