/**
 * NUTRITION FIRE - Owner Admin & Product Management Panel
 * Modern DTC Edition
 * Features:
 * - 1-Click Quick Edit for Price & Product Photo directly from product cards
 * - Configuring Owner WhatsApp Business Number for Order Redirection
 * - Adding new supplements across all 5 categories
 * - Uploading local product photos from computer or linking images
 * - Exporting catalog JSON backups
 */

(function () {
  let editingProductId = null;
  let uploadedImageData = null;

  // Initialize Admin UI elements
  function initAdmin() {
    const adminModal = document.getElementById("admin-modal");
    const openAdminBtn = document.getElementById("open-admin-btn");
    const closeAdminBtn = document.getElementById("close-admin-btn");
    const adminForm = document.getElementById("admin-product-form");
    const photoFileInput = document.getElementById("admin-photo-file");
    const photoUrlInput = document.getElementById("admin-photo-url");
    const photoPreview = document.getElementById("admin-photo-preview");
    const tabAddBtn = document.getElementById("admin-tab-add");
    const tabListBtn = document.getElementById("admin-tab-list");
    const tabSettingsBtn = document.getElementById("admin-tab-settings");
    const tabAddContent = document.getElementById("admin-content-add");
    const tabListContent = document.getElementById("admin-content-list");
    const tabSettingsContent = document.getElementById("admin-content-settings");
    const exportBtn = document.getElementById("admin-export-btn");
    const resetBtn = document.getElementById("admin-reset-btn");

    // WhatsApp configuration elements
    const whatsappInput = document.getElementById("admin-whatsapp-input");
    const saveWhatsappBtn = document.getElementById("save-whatsapp-btn");

    // Quick Edit Price/Photo Modal elements
    const quickEditModal = document.getElementById("quick-edit-modal");
    const closeQuickEditBtn = document.getElementById("close-quick-edit-btn");
    const quickEditForm = document.getElementById("quick-edit-form");
    const qePhotoFile = document.getElementById("qe-photo-file");
    const qePhotoUrl = document.getElementById("qe-photo-url");
    const qePhotoPreview = document.getElementById("qe-photo-preview");

    // Load saved WhatsApp number into input
    if (whatsappInput) {
      whatsappInput.value = localStorage.getItem("nf_owner_whatsapp") || "918397998199";
    }

    if (saveWhatsappBtn && whatsappInput) {
      saveWhatsappBtn.addEventListener("click", () => {
        let cleanNumber = whatsappInput.value.replace(/[^0-9]/g, "");
        if (!cleanNumber) {
          window.App?.showToast("Please enter a valid phone number with country code (e.g. 919876543210)", "error");
          return;
        }
        localStorage.setItem("nf_owner_whatsapp", cleanNumber);
        window.App?.showToast(`WhatsApp number updated to +${cleanNumber}`, "success");
      });
    }

    if (openAdminBtn && adminModal) {
      openAdminBtn.addEventListener("click", () => {
        adminModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        switchTab("add");
        renderProductManageList();
      });
    }

    // Back to Store & Close handlers
    const backToStoreBtn = document.getElementById("back-to-store-btn");
    const exitStudioFooterBtn = document.getElementById("exit-studio-footer-btn");

    function closeStudio() {
      if (adminModal) {
        adminModal.classList.add("hidden");
        document.body.style.overflow = "";
        resetForm();
      }
    }

    if (closeAdminBtn) closeAdminBtn.addEventListener("click", closeStudio);
    if (backToStoreBtn) backToStoreBtn.addEventListener("click", closeStudio);
    if (exitStudioFooterBtn) exitStudioFooterBtn.addEventListener("click", closeStudio);

    // Close on backdrop click
    if (adminModal) {
      adminModal.addEventListener("click", (e) => {
        if (e.target === adminModal) {
          closeStudio();
        }
      });
    }

    // Close on ESC key press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && adminModal && !adminModal.classList.contains("hidden")) {
        closeStudio();
      }
    });

    if (tabAddBtn && tabListBtn && tabSettingsBtn) {
      tabAddBtn.addEventListener("click", () => switchTab("add"));
      tabListBtn.addEventListener("click", () => {
        switchTab("list");
        renderProductManageList();
      });
      tabSettingsBtn.addEventListener("click", () => switchTab("settings"));
    }

    function switchTab(tab) {
      const allTabs = [tabAddBtn, tabListBtn, tabSettingsBtn];
      const allContents = [tabAddContent, tabListContent, tabSettingsContent];

      allTabs.forEach(t => {
        if (t) {
          t.classList.remove("text-neutral-900", "dark:text-white", "border-b-2", "border-neutral-900", "dark:border-white");
          t.classList.add("text-neutral-400", "dark:text-neutral-500");
        }
      });

      allContents.forEach(c => {
        if (c) c.classList.add("hidden");
      });

      if (tab === "add") {
        tabAddBtn.classList.add("text-neutral-900", "dark:text-white", "border-b-2", "border-neutral-900", "dark:border-white");
        tabAddBtn.classList.remove("text-neutral-400", "dark:text-neutral-500");
        tabAddContent.classList.remove("hidden");
      } else if (tab === "list") {
        tabListBtn.classList.add("text-neutral-900", "dark:text-white", "border-b-2", "border-neutral-900", "dark:border-white");
        tabListBtn.classList.remove("text-neutral-400", "dark:text-neutral-500");
        tabListContent.classList.remove("hidden");
      } else if (tab === "settings") {
        tabSettingsBtn.classList.add("text-neutral-900", "dark:text-white", "border-b-2", "border-neutral-900", "dark:border-white");
        tabSettingsBtn.classList.remove("text-neutral-400", "dark:text-neutral-500");
        tabSettingsContent.classList.remove("hidden");
      }
    }

    // Photo file picker with Base64 preview
    if (photoFileInput) {
      photoFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            uploadedImageData = loadEvt.target.result;
            photoPreview.src = uploadedImageData;
            photoPreview.classList.remove("hidden");
            if (photoUrlInput) photoUrlInput.value = "";
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (photoUrlInput) {
      photoUrlInput.addEventListener("input", (e) => {
        const url = e.target.value.trim();
        if (url) {
          uploadedImageData = url;
          photoPreview.src = url;
          photoPreview.classList.remove("hidden");
        }
      });
    }

    // Submit in full Studio Modal
    if (adminForm) {
      adminForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("admin-name").value.trim();
        const section = document.getElementById("admin-section").value;
        const brand = document.getElementById("admin-brand").value.trim() || "Nutrition Fire";
        const price = parseFloat(document.getElementById("admin-price").value) || 0;
        const originalPrice = parseFloat(document.getElementById("admin-original-price").value) || Math.round(price * 1.3);
        const badge = document.getElementById("admin-badge").value.trim() || (brand === "Nutrition Fire" ? "OFFICIAL PRODUCT" : "PREMIUM");
        const servings = parseInt(document.getElementById("admin-servings").value) || 60;
        const flavorsStr = document.getElementById("admin-flavors").value.trim();
        const flavors = flavorsStr ? flavorsStr.split(",").map(s => s.trim()).filter(Boolean) : ["Chocolate", "Vanilla"];
        const weightsStr = document.getElementById("admin-weights").value.trim();
        const weightOptions = weightsStr ? weightsStr.split(",").map(s => s.trim()).filter(Boolean) : ["1 kg", "2.2 kg"];
        const description = document.getElementById("admin-desc").value.trim() || "Premium high-grade sports nutrition designed for optimal muscle recovery and athletic performance.";

        const proteinSpec = document.getElementById("admin-spec-protein").value.trim();
        const bcaaSpec = document.getElementById("admin-spec-bcaa").value.trim();
        const calSpec = document.getElementById("admin-spec-calories").value.trim();

        const nutritionFacts = {
          protein: proteinSpec || "25g",
          bcaa: bcaaSpec || "5.5g",
          calories: calSpec || "120 kcal",
          sugar: "0g"
        };

        let imageToUse = uploadedImageData || (photoUrlInput ? photoUrlInput.value.trim() : "");
        if (!imageToUse) {
          if (section === "proteins-own") imageToUse = "assets/images/products/nf_whey.jpg";
          else if (section === "creatine") imageToUse = "assets/images/products/nf_creatine.jpg";
          else if (section === "pre-workout") imageToUse = "assets/images/products/nf_preworkout.jpg";
          else if (section === "mass-gainer") imageToUse = "assets/images/products/nf_massgainer.jpg";
          else imageToUse = "assets/images/products/other_brand_whey.jpg";
        }

        const id = editingProductId || ("nf-prod-" + Date.now().toString(36));

        const productData = {
          id,
          name,
          section,
          brand,
          price,
          originalPrice,
          badge,
          servings,
          flavors,
          weightOptions,
          nutritionFacts,
          description,
          image: imageToUse,
          rating: editingProductId ? (window.ProductStore.getById(editingProductId)?.rating || 4.9) : 5.0,
          reviewsCount: editingProductId ? (window.ProductStore.getById(editingProductId)?.reviewsCount || 10) : 12,
          inStock: true,
          isFeatured: true
        };

        window.ProductStore.saveProduct(productData);
        window.App?.showToast(editingProductId ? "Product Updated Successfully" : "New Product Added to Store", "success");

        resetForm();
        switchTab("list");
        renderProductManageList();

        if (window.App && typeof window.App.renderProducts === "function") {
          window.App.renderProducts();
        }
      });
    }

    // Quick-Edit Modal Handlers
    if (closeQuickEditBtn && quickEditModal) {
      closeQuickEditBtn.addEventListener("click", () => {
        quickEditModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }

    if (qePhotoFile) {
      qePhotoFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            qePhotoPreview.src = loadEvt.target.result;
            qePhotoPreview.classList.remove("hidden");
            if (qePhotoUrl) qePhotoUrl.value = "";
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (qePhotoUrl) {
      qePhotoUrl.addEventListener("input", (e) => {
        const url = e.target.value.trim();
        if (url) {
          qePhotoPreview.src = url;
          qePhotoPreview.classList.remove("hidden");
        }
      });
    }

    if (quickEditForm) {
      quickEditForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const prodId = document.getElementById("qe-product-id").value;
        const prod = window.ProductStore.getById(prodId);
        if (!prod) return;

        const newName = document.getElementById("qe-name").value.trim();
        const newPrice = parseFloat(document.getElementById("qe-price").value) || prod.price;
        const newOriginalPrice = parseFloat(document.getElementById("qe-original-price").value) || prod.originalPrice;
        const newImage = qePhotoPreview.src || qePhotoUrl.value.trim() || prod.image;

        prod.name = newName;
        prod.price = newPrice;
        prod.originalPrice = newOriginalPrice;
        if (newImage && !newImage.includes("data:,") && newImage !== window.location.href) {
          prod.image = newImage;
        }

        window.ProductStore.saveProduct(prod);

        quickEditModal.classList.add("hidden");
        document.body.style.overflow = "";

        window.App?.showToast(`Updated "${prod.name}" successfully`, "success");

        if (window.App && typeof window.App.renderProducts === "function") {
          window.App.renderProducts();
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        window.ProductStore.exportJSON();
        window.App?.showToast("Catalog JSON downloaded successfully", "info");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset the product catalog back to default? Any custom changes will be replaced.")) {
          window.ProductStore.resetToDefault();
          renderProductManageList();
          if (window.App && typeof window.App.renderProducts === "function") {
            window.App.renderProducts();
          }
          window.App?.showToast("Store catalog restored to defaults", "info");
        }
      });
    }
  }

  function resetForm() {
    editingProductId = null;
    uploadedImageData = null;
    const form = document.getElementById("admin-product-form");
    if (form) form.reset();
    const preview = document.getElementById("admin-photo-preview");
    if (preview) {
      preview.src = "";
      preview.classList.add("hidden");
    }
    const submitBtn = document.getElementById("admin-submit-btn");
    if (submitBtn) submitBtn.textContent = "Add Product to Store";
    const title = document.getElementById("admin-form-title");
    if (title) title.textContent = "Add New Supplement";
  }

  // Quick Edit popup for Price & Photo
  function openQuickEdit(productId) {
    const prod = window.ProductStore.getById(productId);
    if (!prod) return;

    const modal = document.getElementById("quick-edit-modal");
    if (!modal) return;

    document.getElementById("qe-product-id").value = prod.id;
    document.getElementById("qe-name").value = prod.name;
    document.getElementById("qe-price").value = prod.price;
    document.getElementById("qe-original-price").value = prod.originalPrice || "";
    document.getElementById("qe-photo-url").value = prod.image.startsWith("data:") ? "" : prod.image;
    
    const preview = document.getElementById("qe-photo-preview");
    preview.src = prod.image;
    preview.classList.remove("hidden");

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function editProduct(id) {
    const p = window.ProductStore.getById(id);
    if (!p) return;

    editingProductId = p.id;
    uploadedImageData = p.image;

    const tabAddBtn = document.getElementById("admin-tab-add");
    if (tabAddBtn) tabAddBtn.click();

    document.getElementById("admin-name").value = p.name;
    document.getElementById("admin-section").value = p.section;
    document.getElementById("admin-brand").value = p.brand;
    document.getElementById("admin-price").value = p.price;
    document.getElementById("admin-original-price").value = p.originalPrice || "";
    document.getElementById("admin-badge").value = p.badge || "";
    document.getElementById("admin-servings").value = p.servings || 60;
    document.getElementById("admin-flavors").value = (p.flavors || []).join(", ");
    document.getElementById("admin-weights").value = (p.weightOptions || []).join(", ");
    document.getElementById("admin-desc").value = p.description || "";

    if (p.nutritionFacts) {
      document.getElementById("admin-spec-protein").value = p.nutritionFacts.protein || "";
      document.getElementById("admin-spec-bcaa").value = p.nutritionFacts.bcaa || "";
      document.getElementById("admin-spec-calories").value = p.nutritionFacts.calories || "";
    }

    const preview = document.getElementById("admin-photo-preview");
    if (preview && p.image) {
      preview.src = p.image;
      preview.classList.remove("hidden");
    }

    const submitBtn = document.getElementById("admin-submit-btn");
    if (submitBtn) submitBtn.textContent = "Save Changes";
    const title = document.getElementById("admin-form-title");
    if (title) title.textContent = `Edit Product: ${p.name}`;
  }

  function deleteProductItem(id) {
    const p = window.ProductStore.getById(id);
    if (!p) return;
    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
      window.ProductStore.deleteProduct(id);
      renderProductManageList();
      if (window.App && typeof window.App.renderProducts === "function") {
        window.App.renderProducts();
      }
      window.App?.showToast("Product deleted", "info");
    }
  }

  function renderProductManageList() {
    const listContainer = document.getElementById("admin-product-items");
    if (!listContainer) return;

    const products = window.ProductStore.getAll();
    if (products.length === 0) {
      listContainer.innerHTML = `<p class="text-neutral-500 text-center py-8">No products found. Add your first supplement.</p>`;
      return;
    }

    listContainer.innerHTML = products.map(p => `
      <div class="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-contain rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex-shrink-0 p-1" onerror="this.src='assets/images/products/nf_whey.jpg'">
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-neutral-900 dark:text-white truncate">${p.name}</h4>
            <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium uppercase text-[10px]">${p.section}</span>
              <span class="font-semibold text-neutral-900 dark:text-white">₹${p.price.toLocaleString()}</span>
              <span>• ${p.brand}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button data-quick-id="${p.id}" class="quick-edit-btn px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-semibold rounded-lg transition shadow-sm">
            Quick Edit
          </button>
          <button data-edit-id="${p.id}" class="edit-prod-btn px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-xs font-semibold rounded-lg transition text-neutral-800 dark:text-neutral-200">
            Full Edit
          </button>
          <button data-delete-id="${p.id}" class="del-prod-btn px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition">
            ✕
          </button>
        </div>
      </div>
    `).join("");

    listContainer.querySelectorAll(".quick-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openQuickEdit(btn.dataset.quickId));
    });

    listContainer.querySelectorAll(".edit-prod-btn").forEach(btn => {
      btn.addEventListener("click", () => editProduct(btn.dataset.editId));
    });

    listContainer.querySelectorAll(".del-prod-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteProductItem(btn.dataset.deleteId));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
  } else {
    initAdmin();
  }

  window.AdminPanel = {
    openQuickEdit,
    editProduct,
    deleteProductItem,
    renderProductManageList
  };
})();
