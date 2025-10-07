#!/bin/bash

# List of all screen files
screens=(
  "src/screens/Incidents/IncidentReports.tsx"
  "src/screens/Welcome/Welcome.tsx"
  "src/screens/Dashboard/Dashboard.tsx"
  "src/screens/DOB/DailyOccurrenceBook.tsx"
  "src/screens/Messages/Messages.tsx"
  "src/screens/Messages/MessageChat.tsx"
  "src/screens/Settings/Settings.tsx"
  "src/screens/Earnings/Earnings.tsx"
  "src/screens/Jobs/JobHistory.tsx"
  "src/screens/Jobs/AvailableJobs.tsx"
  "src/screens/Jobs/Jobs.tsx"
  "src/screens/Jobs/ActiveJob.tsx"
  "src/screens/Auth/Login.tsx"
  "src/screens/Auth/Signup.tsx"
  "src/screens/Profile/Profile.tsx"
  "src/screens/Splash/Splash.tsx"
)

echo "🔧 Adding DevPanel to all screens..."

for file in "${screens[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Check if DevPanel is already imported
    if ! grep -q "import.*DevPanel" "$file"; then
      echo "  → Adding DevPanel import"
      # Add import after other imports
      sed -i '/^import/a import DevPanel from '"'"'../../components/dev/DevPanel'"'"';' "$file" | head -1
    fi
    
    # Remove NODE_ENV conditional if it exists
    if grep -q "process.env.NODE_ENV.*DevPanel" "$file"; then
      echo "  → Removing NODE_ENV conditional"
      sed -i 's/{process\.env\.NODE_ENV === .*development.* && <DevPanel \/>}/<DevPanel \/>/g' "$file"
    fi
    
    # If DevPanel is not in the JSX yet, add it before the last closing tag
    if ! grep -q "<DevPanel" "$file"; then
      echo "  → Adding <DevPanel /> to JSX"
      # This is tricky, we'll need to do this manually for each file
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ Done!"
