const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting complete setup...\n');

const scripts = [
  { name: 'Clean Duplicate Patients', file: 'cleanDuplicatePatients.js' },
  { name: 'Seed Doctors', file: '../seedDoctors.js' },
  { name: 'Seed Patients', file: 'seedPatients.js' }
];

scripts.forEach(({ name, file }) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Running: ${name}`);
  console.log('='.repeat(50));
  
  try {
    execSync(`node ${file}`, { 
      cwd: __dirname,
      stdio: 'inherit' 
    });
    console.log(`✅ ${name} completed successfully`);
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
  }
});

console.log('\n' + '='.repeat(50));
console.log('🎉 Setup complete!');
console.log('='.repeat(50));
