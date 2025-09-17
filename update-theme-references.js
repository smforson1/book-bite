const fs = require('fs');

// Read the file
const filePath = 'src/screens/restaurant/RestaurantMenuManagementScreen.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all theme. references with currentTheme.
content = content.replace(/theme\./g, 'currentTheme.');

// Write back to file
fs.writeFileSync(filePath, content);

console.log('Updated theme references in RestaurantMenuManagementScreen.tsx');