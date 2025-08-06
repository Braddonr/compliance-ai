const { Client } = require('pg');

async function getSampleIds() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    username: 'braddr',
    password: '',
    database: 'compliance_ai',
  });

  try {
    await client.connect();
    
    console.log('🔍 Sample IDs for Postman testing:\n');
    
    // Get sample user IDs
    const users = await client.query('SELECT id, email, "firstName", "lastName" FROM users LIMIT 3');
    console.log('👥 Users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}): ${user.id}`);
    });
    
    // Get sample framework IDs
    const frameworks = await client.query('SELECT id, name, "displayName" FROM frameworks LIMIT 4');
    console.log('\n📋 Frameworks:');
    frameworks.rows.forEach(framework => {
      console.log(`  - ${framework.displayName}: ${framework.id}`);
    });
    
    // Get sample organization ID
    const orgs = await client.query('SELECT id, name FROM organizations LIMIT 1');
    console.log('\n🏢 Organization:');
    orgs.rows.forEach(org => {
      console.log(`  - ${org.name}: ${org.id}`);
    });
    
    // Get sample compliance progress IDs
    const progress = await client.query(`
      SELECT cp.id, f."displayName" 
      FROM compliance_progress cp 
      JOIN frameworks f ON cp."frameworkId" = f.id 
      LIMIT 4
    `);
    console.log('\n📊 Compliance Progress:');
    progress.rows.forEach(p => {
      console.log(`  - ${p.displayName} Progress: ${p.id}`);
    });
    
    // Get sample document IDs
    const documents = await client.query('SELECT id, title FROM documents LIMIT 4');
    console.log('\n📄 Documents:');
    documents.rows.forEach(doc => {
      console.log(`  - ${doc.title}: ${doc.id}`);
    });
    
    // Get sample task IDs
    const tasks = await client.query('SELECT id, name FROM tasks LIMIT 3');
    console.log('\n✅ Tasks:');
    tasks.rows.forEach(task => {
      console.log(`  - ${task.name}: ${task.id}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

getSampleIds();