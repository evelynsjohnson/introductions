// LocEssentials Introductions - Main JavaScript
if (typeof require !== "undefined") {
  try {
    require("dotenv").config();
  } catch (error) {
    // Ignore dotenv in browser
  }
}

// Global state
let cardsData = [];
let renderedCards = [];
let filterOptionsCache = {
  profileTypes: [
    { value: 'real-life', label: 'Us In Real Life' },
    { value: 'alter-ego', label: 'Our Alter Egos' }
  ],
  languages: [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' }
  ],
  groups: []
};
let activeFilters = {
  profileTypes: [], // 'real-life', 'alter-ego'
  languages: [], // 'en', 'es'
  groups: [], // group names
  search: ''
};

async function loadFilterOptions() {
  try {
    const response = await fetch('/api/filter-options');
    if (response.ok) {
      const data = await response.json();
      filterOptionsCache = {
        profileTypes: data.profileTypes || filterOptionsCache.profileTypes,
        languages: data.languages || filterOptionsCache.languages,
        groups: data.groups || []
      };
    }
  } catch (error) {
    console.warn('Failed to load filter options:', error);
  }
  return filterOptionsCache;
}

function getFilterOptions() {
  return filterOptionsCache;
}

// Load students data
async function loadStudents() {
  try {
    await loadFilterOptions();
    const response = await fetch('/api/accepted-profiles');
    const data = await response.json();
    cardsData = buildCardsData(data);
    initializeFilters();
    renderCards();
  } catch (error) {
    console.error('Error loading students:', error);
    const container = document.getElementById('cards-container');
    if (container) {
      container.innerHTML = '<div class="empty-state"><p>Unable to load profiles. Please try again later.</p></div>';
    }
  }
}

function buildCardsData(profiles) {
  const cards = [];
  (profiles || []).forEach(profile => {
    ['en', 'es'].forEach(lang => {
      const data = profile.profiles?.[lang];
      if (!data) return;

      const base = {
        sourceId: profile._id,
        language: lang,
        course: data.course || '',
        section: data.section || '',
        team: data.team || '',
        raw: data,
        profile: profile
      };

      if (data.full_name || data.preferred_name) {
        cards.push({
          ...base,
          type: 'real-life',
          name: data.preferred_name || data.full_name || '',
          fullName: data.full_name || '',
          photo: data.photo_url || '',
          photoAlt: data.photo_alt || '',
          role: data.role || '',
          organization: data.organization || '',
          about: data.about || '',
          pronunciation_url: data.pronunciation_url || ''
        });
      }

      if (data.alter_ego_name) {
        cards.push({
          ...base,
          type: 'alter-ego',
          name: data.alter_ego_name || '',
          photo: data.alter_ego_photo_url || '',
          photoAlt: data.alter_ego_alt || '',
          role: data.alter_ego_job || '',
          organization: data.alter_ego_org || '',
          about: data.alter_ego_about || '',
          hobbies: data.hobbies || ''
        });
      }
    });
  });
  return cards;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatField(label, value) {
  if (!value) return '';
  return `
    <div>
      <div class="profile-field-label">${label}</div>
      <div class="profile-field-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function renderProfileModal(card) {
  // Use card.raw if available; otherwise fallback to empty object
  const data = card.raw || {};
  const name = data.preferred_name || data.full_name || card.name || 'Profile';
  const showRealLife = card.type === 'real-life';
  const showAlterEgo = card.type === 'alter-ego';

  const modal = document.createElement('div');
  modal.className = 'profile-modal-overlay';
  
  modal.innerHTML = `
    <div class="profile-modal">
      <div class="profile-modal-header">
        <button class="profile-modal-btn-close" onclick="this.closest('.profile-modal-overlay').remove()">Close</button>
      </div>
      <div class="profile-modal-body">
        ${showRealLife ? `
          <h3 class="profile-section-title">Real Life Profile</h3>
          <div class="profile-content-grid">
            <div>
              ${data.photo_url ? 
                `<img src="${data.photo_url}" alt="${escapeHtml(data.photo_alt || name)}" class="profile-main-image">` : 
                `<div class="profile-main-image" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 500;">No image</div>`
              }
              ${data.pronunciation_url ? `
                <div class="audio-controls-container" style="margin-top: 1rem;">
                  <div class="audio-label" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 0.25rem;">Pronunciation</div>
                  <audio controls src="${data.pronunciation_url}" style="width: 100%;"></audio>
                </div>
              ` : ''}
            </div>
            
            <div class="profile-details-grid">
              ${formatField('Full name', data.full_name)}
              ${formatField('Preferred name', data.preferred_name)}
              ${formatField('Pronouns', data.pronouns)}
              ${formatField('Languages', data.languages)}
              ${formatField('Course', data.course)}
              ${formatField('Section', data.section)}
              ${formatField('Team', data.team)}
              ${formatField('Enrollment reason', data.enrollment_reason)}
              ${formatField('Goals', data.goals)}
              <div class="profile-detail-full-width">${formatField('Social media', data.social_media)}</div>
              <div class="profile-detail-full-width">${formatField('About', data.about)}</div>
              <div class="profile-detail-full-width">${formatField('Previous experience', data.previous_experience)}</div>
            </div>
          </div>
        ` : ''}

        ${showAlterEgo ? `
          <h3 class="profile-section-title">Alter Ego</h3>
          <div class="profile-content-grid">
            <div>
              ${data.alter_ego_photo_url ? 
                `<img src="${data.alter_ego_photo_url}" alt="${escapeHtml(data.alter_ego_alt || data.alter_ego_name || '')}" class="profile-main-image">` : 
                `<div class="profile-main-image" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 500;">No image</div>`
              }
            </div>
            
            <div class="profile-details-grid">
              ${formatField('Alter ego name', data.alter_ego_name)}
              ${formatField('Job title', data.alter_ego_job)}
              ${formatField('Organization', data.alter_ego_org)}
              ${formatField('Photo credits', data.alter_ego_credits)}
              ${formatField('Subject fields', data.subject_fields)}
              ${formatField('Hobbies', data.hobbies)}
              <div class="profile-detail-full-width">${formatField('About', data.alter_ego_about)}</div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Close on backdrop click
  modal.onclick = (e) => { 
    if (e.target === modal) modal.remove(); 
  };
}

// Initialize filter options based on available data
function initializeFilters() {
  const { profileTypes, languages, groups } = getFilterOptions();

  const profileTypeContainer = document.getElementById('profile-type-checkboxes');
  if (profileTypeContainer) {
    profileTypeContainer.innerHTML = '';
    profileTypes.forEach(type => {
      const value = typeof type === 'string' ? type : type.value;
      const labelText = typeof type === 'string' ? getProfileTypeLabel(type) : (type.label || getProfileTypeLabel(type.value));
      const label = document.createElement('label');
      label.className = 'filter-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" value="${value}" onchange="applyFilters()">
        <span>${labelText}</span>
      `;
      profileTypeContainer.appendChild(label);
    });
  }

  const groupCheckboxes = document.getElementById('group-checkboxes');
  if (groupCheckboxes) {
    groupCheckboxes.innerHTML = '';
    groups.forEach(group => {
      const label = document.createElement('label');
      label.className = 'filter-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" value="${group}" onchange="applyFilters()">
        <span>${group}</span>
      `;
      groupCheckboxes.appendChild(label);
    });
  }

  const languageCheckboxes = document.getElementById('language-checkboxes');
  if (languageCheckboxes) {
    languageCheckboxes.innerHTML = '';
    languages.forEach(lang => {
      const value = typeof lang === 'string' ? lang : lang.value;
      const labelText = typeof lang === 'string' ? getLanguageLabel(lang) : (lang.label || getLanguageLabel(lang.value));
      const label = document.createElement('label');
      label.className = 'filter-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" value="${value}" onchange="applyFilters()">
        <span>${labelText}</span>
      `;
      languageCheckboxes.appendChild(label);
    });
  }

  updateResultsSummary();
}

// Apply all filters
function applyFilters() {
  const profileTypeCheckboxes = document.querySelectorAll('#profile-types-options input[type="checkbox"]');
  activeFilters.profileTypes = Array.from(profileTypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  const languageCheckboxes = document.querySelectorAll('#language-checkboxes input');
  activeFilters.languages = Array.from(languageCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  const groupCheckboxes = document.querySelectorAll('#group-checkboxes input');
  activeFilters.groups = Array.from(groupCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  renderCards();
  updateActiveFilterTags();
}

// Perform search
function performSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  activeFilters.search = searchInput.value.toLowerCase().trim();

  renderCards();
  updateActiveFilterTags();
}

// Clear search
function clearSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  activeFilters.search = '';
  renderCards();
  updateActiveFilterTags();
}

// Clear filter search
function clearFilterSearch() {
  const filterSearch = document.getElementById('filter-search-input');
  if (filterSearch) filterSearch.value = '';
  filterFilterTags('');
}

// Filter the filter tags based on search
function filterFilterTags(searchTerm) {
  const term = searchTerm.toLowerCase();
  document.querySelectorAll('#filter-panel .filter-checkbox-label').forEach(label => {
    const text = label.textContent.toLowerCase();
    label.style.display = text.includes(term) ? 'flex' : 'none';
  });
}

// Toggle filter panel
function toggleFilterPanel() {
  const panel = document.getElementById('filter-panel');
  if (!panel) return;
  const isVisible = panel.style.display === 'block';
  panel.style.display = isVisible ? 'none' : 'block';
}

// Update active filter tags display
function updateActiveFilterTags() {
  const container = document.getElementById('active-filters');
  if (!container) return;

  container.innerHTML = '';
  let hasActiveFilters = false;

  activeFilters.profileTypes.forEach(type => {
    hasActiveFilters = true;
    const label = getProfileTypeLabel(type);
    container.appendChild(createFilterTag(label, 'profileType', type));
  });

  activeFilters.languages.forEach(lang => {
    hasActiveFilters = true;
    const label = getLanguageLabel(lang);
    container.appendChild(createFilterTag(label, 'language', lang));
  });

  activeFilters.groups.forEach(group => {
    hasActiveFilters = true;
    container.appendChild(createFilterTag(group, 'group', group));
  });

  container.style.display = hasActiveFilters ? 'flex' : 'none';
}

function toggleFilterCategory(id) {
  const body = document.getElementById(id);
  if (!body) return;
  body.classList.toggle('is-collapsed');
  const toggle = body.closest('.filter-category')?.querySelector('.filter-category-toggle');
  if (toggle) toggle.classList.toggle('is-collapsed');
}

function getProfileTypeLabel(value) {
  const { profileTypes } = getFilterOptions();
  const match = profileTypes.find(t => (t.value || t) === value);
  if (match && typeof match === 'object') return match.label || match.value;
  if (value === 'real-life') return 'Us In Real Life';
  if (value === 'alter-ego') return 'Our Alter Egos';
  return value;
}

function getLanguageLabel(value) {
  const { languages } = getFilterOptions();
  const match = languages.find(t => (t.value || t) === value);
  if (match && typeof match === 'object') return match.label || match.value;
  if (value === 'en') return 'English';
  if (value === 'es') return 'Spanish';
  return value;
}

// Create filter tag element
function createFilterTag(label, type, value) {
  const tag = document.createElement('div');
  tag.className = 'active-filter-tag';
  tag.innerHTML = `
    <span>${label}</span>
    <button onclick="removeFilter('${type}', '${value}')">×</button>
  `;
  return tag;
}

// Remove individual filter
function removeFilter(type, value) {
  if (type === 'profileType') {
    activeFilters.profileTypes = activeFilters.profileTypes.filter(t => t !== value);
    const checkbox = document.querySelector(`.filter-options-checkboxes input[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  } else if (type === 'language') {
    activeFilters.languages = activeFilters.languages.filter(l => l !== value);
    const checkbox = document.querySelector(`#language-checkboxes input[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  } else if (type === 'group') {
    activeFilters.groups = activeFilters.groups.filter(g => g !== value);
    const checkbox = document.querySelector(`#group-checkboxes input[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  }

  renderCards();
  updateActiveFilterTags();
}

// Clear all filters
function clearAllFilters() {
  activeFilters = {
    profileTypes: [],
    languages: [],
    groups: [],
    search: ''
  };

  document.querySelectorAll('.filter-options-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    const label = cb.closest('.filter-checkbox-label');
    if (label) label.classList.remove('is-checked');
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.querySelector('.clear-search-btn');
  if (clearBtn) clearBtn.style.display = 'none';

  renderCards();
  updateActiveFilterTags();
}

// Filter students based on active filters
function filterStudents() {
  return cardsData.filter(card => {
    if (activeFilters.profileTypes.length > 0 && !activeFilters.profileTypes.includes(card.type)) {
      return false;
    }

    if (activeFilters.languages.length > 0 && !activeFilters.languages.includes(card.language)) {
      return false;
    }

    if (activeFilters.groups.length > 0) {
      const hasMatchingGroup = activeFilters.groups.some(group =>
        card.section === group || card.team === group
      );
      if (!hasMatchingGroup) return false;
    }

    if (activeFilters.search) {
      const searchTerm = activeFilters.search;
      const name = card.name ? card.name.toLowerCase() : '';
      const fullName = card.fullName ? card.fullName.toLowerCase() : '';
      const org = card.organization ? card.organization.toLowerCase() : '';
      if (!name.includes(searchTerm) && !fullName.includes(searchTerm) && !org.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

// Render profile cards
function renderCards() {
  const container = document.getElementById('cards-container');
  if (!container) return;
  const filteredCards = filterStudents();

  if (filteredCards.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No profiles match your filters.</p></div>';
    updateResultsSummary(0);
    return;
  }

  container.innerHTML = '';
  const sortedCards = [...filteredCards].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  renderedCards = sortedCards;
  sortedCards.forEach((card, index) => {
    container.innerHTML += createProfileCard(card, index);
  });

  container.querySelectorAll('.profile-view-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const index = parseInt(button.dataset.cardIndex, 10);
      const card = renderedCards[index];
      if (card) {
        renderProfileModal(card);
      }
    });
  });

  updateResultsSummary(sortedCards.length);
}

// Update results summary
function updateResultsSummary(count) {
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    if (count !== undefined) {
      resultsCount.textContent = count;
    } else {
      resultsCount.textContent = cardsData.length;
    }
  }
}



// Create profile card HTML
function createProfileCard(card, index) {
  const languageLabel = card.language === 'en' ? 'English' : 'Español';
  const photo = card.photo || 'assets/images/placeholder-avatar.svg';
  const roleLine = `${card.role ? card.role : ''} ${card.organization ? `at ${card.organization}` : ''}`.trim();

  return `
    <div class="profile-card enhanced-card" data-profile-type="${card.type}" data-card-index="${index}">
      <div class="card-header enhanced-card-header">
        <img src="${photo}" alt="${card.photoAlt || ''}" class="card-image enhanced-card-image" onerror="this.src='assets/images/placeholder-avatar.svg'">
      </div>
      <div class="card-body enhanced-card-body">
        <div class="card-info">
          <h3 class="card-title enhanced-title">${card.name || ''}</h3>
          <p class="card-subtitle enhanced-subtitle">${roleLine}</p>
        </div>
        <div class="card-meta enhanced-meta">
          ${card.course ? `<span class="meta-tag course">${card.course}</span>` : ''}
          ${card.section ? `<span class="meta-tag section">${card.section}</span>` : ''}
          ${card.team ? `<span class="meta-tag team">${card.team}</span>` : ''}
          <span class="meta-tag language">${languageLabel}</span>
        </div>
        <p class="card-bio enhanced-bio">${card.about || ''}</p>
        ${card.type === 'real-life' && card.pronunciation_url ? `
          <div class="audio-player enhanced-audio" style="margin-top: 0.5rem;">
            <audio controls>
              <source src="${card.pronunciation_url}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        ` : ''}
        <div class="profile-view-btn-container">
          <button class="profile-view-btn" data-card-index="${index}" type="button">View Profile</button>
        </div>
      </div>
    </div>
  `;
}

// Get course badge image
function getCourseBadge(badgeType) {
  const badges = {
    'google-classroom': '/assets/images/badge-google-classroom.png',
    'uic': '/assets/images/badge-uic.png',
    'uwm': '/assets/images/badge-uwm.png',
    'open-source': '/assets/images/badge-open-source.png'
  };
  return badges[badgeType] || badges['open-source'];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();

  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      toggleFilterPanel();
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        performSearch();
      }
    });

    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);
    });
  }

  const filterSearchInput = document.getElementById('filter-search-input');
  if (filterSearchInput) {
    filterSearchInput.addEventListener('input', function() {
      filterFilterTags(this.value);
    });
  }

  document.addEventListener('change', (event) => {
    if (event.target && event.target.matches('.filter-checkbox-label input[type="checkbox"]')) {
      const label = event.target.closest('.filter-checkbox-label');
      if (label) {
        label.classList.toggle('is-checked', event.target.checked);
      }
    }
  });
});

// Close filter panel when clicking outside
document.addEventListener('click', function(event) {
  const panel = document.getElementById('filter-panel');
  const btn = document.querySelector('.filter-dropdown-btn');
  if (panel && btn && !panel.contains(event.target) && !btn.contains(event.target)) {
    panel.style.display = 'none';
  }
});
