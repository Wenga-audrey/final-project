import dotenv from 'dotenv';
dotenv.config();

async function checkDatabase() {
    console.log('🔍 Checking Database Connection...');
    console.log('==============================');

    try {
        // Try to connect to the database
        const mysql = await import('mysql2/promise');

        // Extract connection details from DATABASE_URL
        // Format: mysql://user:password@host:port/database
        const url = new URL(process.env.DATABASE_URL);
        const connectionConfig = {
            host: url.hostname,
            port: url.port || 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password || ''),
            database: url.pathname.substring(1)
        };

        console.log('Connection details:');
        console.log('  Host:', connectionConfig.host);
        console.log('  Port:', connectionConfig.port);
        console.log('  User:', connectionConfig.user);
        console.log('  Database:', connectionConfig.database);

        // Try to establish connection
        const connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Database Connection: SUCCESS');

        // Try to execute a simple query
        const [rows] = await connection.execute('SELECT 1 as connected');
        console.log('✅ Database Query: SUCCESS');
        console.log('  Test query result:', rows[0].connected);

        // Check if mindboost database exists
        const [databases] = await connection.execute('SHOW DATABASES');
        const databaseExists = databases.some(db => db.Database === connectionConfig.database);
        console.log('📊 Database Status:');
        console.log('  Database exists:', databaseExists ? 'YES' : 'NO');

        if (databaseExists) {
            // Check if tables exist
            await connection.execute(`USE ${connectionConfig.database}`);
            const [tables] = await connection.execute('SHOW TABLES');
            console.log('  Tables found:', tables.length);

            if (tables.length > 0) {
                console.log('  Sample tables:');
                tables.slice(0, 5).forEach(table => {
                    const tableName = Object.values(table)[0];
                    console.log('    -', tableName);
                });
            }
        }

        await connection.end();
        console.log('\n🎉 Database Check Complete');

    } catch (error) {
        console.log('❌ Database Connection: FAILED');
        console.log('   Error:', error.message);

        // Check if it's a specific type of error
        if (error.code === 'ECONNREFUSED') {
            console.log('   Issue: Database server is not running or not accessible');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('   Issue: Database does not exist');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   Issue: Access denied - check username/password');
        } else {
            console.log('   Issue: General connection problem');
        }
    }
}

checkDatabase();