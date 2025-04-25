import prompt from 'prompt-async';
import pg from 'pg';

const { Client } = pg;
const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_0pgwJMCOrht1@ep-frosty-fire-a94nhe0n-pooler.gwc.azure.neon.tech/neondb?sslmode=require'
});

async function checkDuplicate(phone_number, email) {
    const queryText = 'SELECT * FROM students WHERE phone_number = $1 OR email = $2';
    const { rows } = await client.query(queryText, [phone_number, email]);
    return rows.length > 0;
}

async function insertDataIntoDB(data) {
    const queryText = 'INSERT INTO students(first_name, last_name, phone_number, email, mark) VALUES($1, $2, $3, $4, $5)';
    await client.query(queryText, [data.first_name, data.last_name, data.phone_number, data.email, data.mark]);
    console.log('Дані успішно додані!');
}

async function getDataFromConsole() {
    prompt.start();
    const { first_name, last_name, phone_number, email, mark } = await prompt.get([
        "first_name", "last_name", "phone_number", "email", "mark"
    ]);
    return { first_name, last_name, phone_number, email, mark };
}

async function main() {
    try {
        await client.connect();
        let continueInput = true;

        while (continueInput) {
            const data = await getDataFromConsole();
            const exists = await checkDuplicate(data.phone_number, data.email);
            
            if (exists) {
                console.log('Помилка: Користувач з таким номером телефону або email вже існує.');
            } else {
                await insertDataIntoDB(data);
            }
            
            const { continueResponse } = await prompt.get(['continueResponse']);
            const response = continueResponse.toLowerCase();
            
            continueInput = response === 'так' || response === 'yes';
        }
    } catch (error) {
        console.error('Помилка:', error.message);
    } finally {
        await client.end(); 
    }
}

main();
