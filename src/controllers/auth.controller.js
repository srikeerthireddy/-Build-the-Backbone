const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, address } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 12);
        
        const result = await db.query(
            'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
            [name, email, password_hash, '']
        );

        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email },
            process.env.JWT_SECRET || 'supersecretpassword',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered',
            user: result.rows[0],
            token
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'supersecretpassword',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email },
            token
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = {
    register,
    login
};
