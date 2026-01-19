// LocEssentials Introductions - Main JavaScript

// Global state
let studentsData = [];
let activeFilters = {
  type: 'all', // all, real-life, alter-ego
  course: 'all',
  section: 'all',
  team: 'all',
  language: 'all'
};

// Load students data
async function loadStudents() {
  try {
    const response = await fetch('/_data/students.json');
    const data = await response.json();
    studentsData = data.students.filter(student => student.public_display_consent);
    initializeFilters();
    renderCards();
  } catch (error) {
    console.error('Error loading students:', error);
    document.getElementById('cards-container').innerHTML = 
      '<div class="empty-state"><p>Unable to load profiles. Please try again later.</p></div>';
  }
}

// Initialize filter options based on available data
function initializeFilters() {
  const courses = [...new Set(studentsData.map(s => s.course))];
  const sections = [...new Set(studentsData.map(s => s.section))].sort().reverse();
  const teams = [...new Set(studentsData.map(s => s.team).filter(t => t))];
  const languages = [...new Set(studentsData.map(s => s.language))];
  
  // Populate course filters
  const courseFilters = document.getElementById('course-filters');
  if (courseFilters) {
    courses.forEach(course => {
      const count = studentsData.filter(s => s.course === course).length;
      courseFilters.innerHTML += createFilterTag(course, count, 'course');
    });
  }
  
  // Populate section filters
  const sectionFilters = document.getElementById('section-filters');
  if (sectionFilters) {
    sections.forEach(section => {
      const count = studentsData.filter(s => s.section === section).length;
      sectionFilters.innerHTML += createFilterTag(section, count, 'section');
    });
  }
  
  // Populate team filters (only if teams exist)
  if (teams.length > 0) {
    const teamFilters = document.getElementById('team-filters');
    const teamSection = document.getElementById('team-filter-section');
    if (teamFilters && teamSection) {
      teamSection.classList.remove('hidden');
      teams.forEach(team => {
        const count = studentsData.filter(s => s.team === team).length;
        teamFilters.innerHTML += createFilterTag(team, count, 'team');
      });
    }
  }
  
  // Update filter counts
  updateFilterCounts();
}

// Create filter tag HTML
function createFilterTag(value, count, type) {
  return `
    <div class="filter-tag" data-filter="${type}" data-value="${value}" onclick="toggleFilter('${type}', '${value}')">
      <span>${value}</span>
      <span class="filter-count">${count}</span>
    </div>
  `;
}

// Toggle filter
function toggleFilter(type, value) {
  if (activeFilters[type] === value) {
    activeFilters[type] = 'all';
  } else {
    activeFilters[type] = value;
  }
  
  // Update UI
  document.querySelectorAll(`.filter-tag[data-filter="${type}"]`).forEach(tag => {
    if (tag.dataset.value === value && activeFilters[type] === value) {
      tag.classList.add('active');
    } else {
      tag.classList.remove('active');
    }
  });
  
  renderCards();
}

// Toggle view type
function toggleViewType(type) {
  activeFilters.type = type;
  
  // Update button states
  document.querySelectorAll('.filter-tag[data-filter="type"]').forEach(tag => {
    tag.classList.remove('active');
  });
  document.querySelector(`.filter-tag[data-value="${type}"]`)?.classList.add('active');
  
  renderCards();
}

// Filter students based on active filters
function filterStudents() {
  return studentsData.filter(student => {
    // Course filter
    if (activeFilters.course !== 'all' && student.course !== activeFilters.course) {
      return false;
    }
    
    // Section filter
    if (activeFilters.section !== 'all' && student.section !== activeFilters.section) {
      return false;
    }
    
    // Team filter
    if (activeFilters.team !== 'all' && student.team !== activeFilters.team) {
      return false;
    }
    
    // Language filter
    if (activeFilters.language !== 'all' && student.language !== activeFilters.language) {
      return false;
    }
    
    return true;
  });
}

// Render profile cards
function renderCards() {
  const container = document.getElementById('cards-container');
  const filteredStudents = filterStudents();
  
  if (filteredStudents.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No profiles match your filters.</p></div>';
    return;
  }
  
  container.innerHTML = '';
  
  filteredStudents.forEach(student => {
    if (activeFilters.type === 'all' || activeFilters.type === 'real-life') {
      container.innerHTML += createProfileCard(student, 'real-life');
    }
    
    if (activeFilters.type === 'all' || activeFilters.type === 'alter-ego') {
      container.innerHTML += createProfileCard(student, 'alter-ego');
    }
  });
}

// Create profile card HTML
function createProfileCard(student, type) {
  const isAlterEgo = type === 'alter-ego';
  const name = isAlterEgo ? student.alter_ego.name : student.preferred_name;
  const photo = isAlterEgo ? student.alter_ego.photo : student.photo;
  const photoAlt = isAlterEgo ? student.alter_ego.photo_alt : student.photo_alt;
  const about = isAlterEgo ? student.alter_ego.about : student.about;
  const role = isAlterEgo ? student.alter_ego.job_title : student.role;
  const org = isAlterEgo ? student.alter_ego.organization : student.organization;
  
  const badgeImage = getCourseBadge(student.course_badge);
  const languageLabel = student.language === 'en' ? 'English' : 'Español';
  
  return `
    <div class="profile-card" data-student-id="${student.id}" data-type="${type}">
      <div class="card-header">
        <img src="${photo}" alt="${photoAlt}" class="card-image">
        <div class="course-badge">
          <img src="${badgeImage}" alt="Course badge">
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${name}</h3>
        <p class="card-subtitle">${role} ${org ? `at ${org}` : ''}</p>
        <div class="card-meta">
          <span class="meta-tag course">${student.course}</span>
          <span class="meta-tag section">${student.section}</span>
          ${student.team ? `<span class="meta-tag team">${student.team}</span>` : ''}
          <span class="meta-tag language">${languageLabel}</span>
        </div>
        <p class="card-bio">${about}</p>
        ${!isAlterEgo && student.pronunciation_file ? `
          <div class="audio-player">
            <audio controls>
              <source src="${student.pronunciation_file}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        ` : ''}
        <div class="card-footer">
          <a href="/profiles/${student.id}.html" class="btn btn-primary">View Full Profile</a>
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

// Update filter counts
function updateFilterCounts() {
  document.querySelectorAll('.filter-tag').forEach(tag => {
    const type = tag.dataset.filter;
    const value = tag.dataset.value;
    
    // Count matching students
    let count = 0;
    if (type === 'type') {
      if (value === 'all') {
        count = studentsData.length * 2; // Both real-life and alter-ego
      } else {
        count = studentsData.length;
      }
    } else {
      count = studentsData.filter(s => {
        if (type === 'course') return s.course === value;
        if (type === 'section') return s.section === value;
        if (type === 'team') return s.team === value;
        if (type === 'language') return s.language === value;
        return true;
      }).length;
    }
    
    const countElement = tag.querySelector('.filter-count');
    if (countElement) {
      countElement.textContent = count;
    }
  });
}

// Clear all filters
function clearFilters() {
  activeFilters = {
    type: 'all',
    course: 'all',
    section: 'all',
    team: 'all',
    language: 'all'
  };
  
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.classList.remove('active');
  });
  
  renderCards();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
});
