const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MySQL database configuration
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'test',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Create Contact endpoint
app.post('/createContact', async (req, res) => {
    try {
        const { first_name, last_name, email, mobile_number, data_store } = req.body;

        // Validate required parameters
        if (!first_name || !last_name || !email || !mobile_number || !data_store) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Choose the appropriate data store
        let result;
        if (data_store === 'CRM') {
            const response = await axios.post(
                'https://freelancer-647770192557916539.myfreshworks.com/crm/sales/api/contacts',
                {
                    'contact': {
                    'first_name': first_name,
                    'last_name': last_name,
                    'mobile_number': mobile_number,
                    'email':email
                    }
                },
                {
                    headers: {
                    'Authorization': 'Token token=E-ptPsJZp_dBBIvnZ8a43A',//env variables
                    'Content-Type': 'application/json'
                    }
                }
            );
            result = response.data;
            res.json(result);
        } else if (data_store === 'DATABASE') {
            // Save the contact in MySQL database
            const query = 'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)';
            const values = [first_name, last_name, email, mobile_number];

            db.query(query, values, (err, results, fields) => {
                if (err) {
                    console.error('Error saving contact to database:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                console.log('Contact saved in DATABASE:', { first_name, last_name, email, mobile_number });
                
                res.json({ id: results.insertId, message: 'Contact saved in DATABASE' });
            });
        } else {
            return res.status(400).json({ error: 'Invalid data_store value' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// // GET Contact endpoint
app.get('/getContact', async (req, res) => {
    try {
        const { contact_id, data_store } = req.query;

        // Validate required parameters
        if (!contact_id || !data_store) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Choose the appropriate data store
        if (data_store === 'CRM') {
            const response = await axios.get(
                `https://freelancer-647770192557916539.myfreshworks.com/crm/sales/api/contacts/${contact_id}`,
                {
                    headers: {
                        'Authorization': 'Token token=E-ptPsJZp_dBBIvnZ8a43A',//env variables
                        'Content-Type': 'application/json'
                    },
                }
            );
            res.json(response.data)
        } else if (data_store === 'DATABASE') {
            // Retrieve the contact from MySQL database
            const selectQuery = 'SELECT * FROM contacts WHERE id = ?';
            const values = [contact_id];

            db.query(selectQuery, values, (err, results) => {
                if (err) {
                    console.error('Error retrieving contact from database:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const retrievedContact = results[0];
                if (!retrievedContact) {
                    return res.status(404).json({ error: 'Contact not found in DATABASE' });
                }

                console.log('Contact retrieved from DATABASE:', retrievedContact);
                let result = { contact: retrievedContact, message: 'Contact retrieved from DATABASE' };

                res.json(result);
            });
        } else {
            return res.status(400).json({ error: 'Invalid data_store value' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Update Contact endpoint
app.post('/updateContact', async (req, res) => {
    try {
        const { contact_id, data_store, email, mobile_number } = req.body;

        // Validate required parameters
        if (!contact_id || !data_store || (!email && !mobile_number)) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Choose the appropriate data store
        if (data_store === 'CRM') {
            const response = await axios.put(
                `https://freelancer-647770192557916539.myfreshworks.com/crm/sales/api/contacts/${contact_id}`,
                { email, mobile_number },
                {
                    headers: {
                        'Authorization': 'Token token=E-ptPsJZp_dBBIvnZ8a43A',//env variables
                        'Content-Type': 'application/json'
                    },
                }
            );
            res.json(response.data)
        } else if (data_store === 'DATABASE') {
            // Update the contact in MySQL database
            const updateQuery = 'UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?';
            const values = [email, mobile_number, contact_id];

            db.query(updateQuery, values, (err, results) => {
                if (err) {
                    console.error('Error updating contact in database:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                console.log(`Contact with ID ${contact_id} updated in DATABASE`);
                let result = { message: `Contact with ID ${contact_id} updated in DATABASE` };

                res.json(result);
            });
        } else {
            return res.status(400).json({ error: 'Invalid data_store value' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete Contact endpoint
app.post('/deleteContact', async (req, res) => {
    try {
        const { contact_id, data_store } = req.body;

        // Validate required parameters
        if (!contact_id || !data_store) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }


        if (data_store === 'CRM') {
            const response = await axios.delete(
                `https://freelancer-647770192557916539.myfreshworks.com/crm/sales/api/contacts/${contact_id}`,
                {
                    headers: {
                        'Authorization': 'Token token=E-ptPsJZp_dBBIvnZ8a43A',//env variables
                        'Content-Type': 'application/json'
                    },
                }
            );
            res.json(response.data);
        } else if (data_store === 'DATABASE') {
            // Delete the contact from MySQL database
            const deleteQuery = 'DELETE FROM contacts WHERE id = ?';
            const values = [contact_id];

            db.query(deleteQuery, values, (err, results) => {
                if (err) {
                    console.error('Error deleting contact from database:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                console.log(`Contact with ID ${contact_id} deleted from DATABASE`);
                let result = { message: `Contact with ID ${contact_id} deleted from DATABASE` };

                res.json(result);
            });
        } else {
            return res.status(400).json({ error: 'Invalid data_store value' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
