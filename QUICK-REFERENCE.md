# Quick Reference Guide

## Common Tasks

### Add a New Student

1. Get student submission (form data, photos, audio)
2. Edit `_data/students.json`
3. Add new entry using this template:

```json
{
  "id": "firstname-lastname-001",
  "submission_date": "2025-01-13",
  "public_display_consent": true,
  "language": "en",
  "full_name": "",
  "preferred_name": "",
  "pronunciation_file": "/assets/audio/firstname-lastname.mp3",
  "photo": "/assets/images/firstname-lastname.jpg",
  "photo_alt": "",
  "pronouns": "",
  "languages_spoken": [],
  "social_media": {},
  "role": "",
  "organization": "",
  "about": "",
  "previous_experience": "",
  "course": "",
  "course_badge": "google-classroom",
  "section": "2025-1",
  "enrollment_reason": "",
  "learning_goals": "",
  "team": "",
  "alter_ego": {
    "name": "",
    "photo": "/assets/images/firstname-lastname-alter-ego.jpg",
    "photo_alt": "",
    "photo_credits": "",
    "job_title": "",
    "organization": "",
    "about": "",
    "subject_fields": "",
    "hobbies": ""
  },
  "anything_else": ""
}
```

4. Upload photos to `/assets/images/`
5. Upload audio to `/assets/audio/`
6. Commit and push

### Update Student Privacy Setting

Change `"public_display_consent": true` to `false` (or vice versa)

### Assign Teams

Add team name to student entries:
```json
"team": "Team Alpha"
```

### Change Course Badge

Update `course_badge` field:
- `"google-classroom"` - Globe icon
- `"uic"` - Eagle icon  
- `"uwm"` - Panther icon
- `"open-source"` - Mangrove icon

### Update Branding Colors

Edit `/assets/css/styles.css`:
```css
:root {
  --pink: #ef91c6;
  --light-blue: #50A5E6;
  --medium-blue: #2b7bb9;
  --dark-blue: #1c6399;
}
```

## File Structure Quick Reference

```
/
├── index.html                 Main directory
├── game.html                  Guess Who game
├── answer-key.html            All matches
├── submit.html                Submission form
├── _data/
│   └── students.json          ⭐ Edit this to add students
├── assets/
│   ├── css/
│   │   └── styles.css         Styling
│   ├── js/
│   │   ├── main.js            Main functionality
│   │   └── form-translations.js   Translations
│   ├── images/                ⭐ Add photos here
│   └── audio/                 ⭐ Add pronunciations here
```

## Git Commands

### Save changes
```bash
git add .
git commit -m "Add new student profiles"
git push
```

### Create backup
```bash
git branch backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
```

### Check status
```bash
git status
git log --oneline -5
```

## URLs

- **Live site**: https://YOUR_USERNAME.github.io/introductions/
- **Or custom**: https://introductions.locessentials.com/
- **Repository**: https://github.com/YOUR_USERNAME/introductions/

## Pages

- `/` - Main directory with filters
- `/game.html` - Guess Who game
- `/answer-key.html` - All profile matches
- `/submit.html` - Student submission form

## Support

- **Setup issues**: See SETUP.md
- **Technical details**: See README.md
- **Questions**: alaina@locessentials.com

## JSON Validation

Before committing, validate JSON:
- Use https://jsonlint.com/
- Or in VSCode: Format Document

## Image Guidelines

- **Max size**: 1MB per file
- **Format**: JPG for photos, PNG for graphics
- **Naming**: `firstname-lastname.jpg`
- **Dimensions**: 400x400px recommended

## Audio Guidelines

- **Format**: MP3
- **Bitrate**: 128kbps or lower
- **Duration**: 1-3 seconds
- **Naming**: `firstname-lastname.mp3`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Site not updating | Wait 2-3 mins, check GitHub Actions |
| Images not showing | Check file paths in JSON |
| Filters not working | Validate JSON syntax |
| Form not submitting | Currently manual processing only |

## Course Options

```json
"course": "Loc101: Introduction to Localization"
"course": "Loc101: Introducción a la localización"
"course": "Loc501: Terminology for Beginners"
```

## Section Options

```json
"section": "2025-1"
"section": "2024-1"
"section": "2023-1"
```

## Language Options

```json
"language": "en"   // English
"language": "es"   // Spanish
```

## Privacy Values

```json
"public_display_consent": true   // Show publicly after course
"public_display_consent": false  // Only show during course
```
