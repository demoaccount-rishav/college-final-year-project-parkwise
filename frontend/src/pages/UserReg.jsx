import { background } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function UserReg() {
    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.heading}>Registration</h2>
                <form style={{}}>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your name" style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Username</label>
                            <input type="text" placeholder="Enter your username" style={styles.input} />
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label>Email</label>
                            <input type="email" placeholder="Enter your email" style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Phone Number</label>
                            <input type="text" placeholder="Enter your number" style={styles.input} />
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label>Password</label>
                            <input type="password" placeholder="Enter your password" style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm your password" style={styles.input} />
                        </div>
                    </div>
                    {/* <div style={styles.genderContainer}>
                        <label>Gender</label>
                        <div style={styles.radioGroup}>
                            <label><input type="radio" name="gender" value="male" /> Male</label>
                            <label><input type="radio" name="gender" value="female" /> Female</label>
                            <label><input type="radio" name="gender" value="preferNotToSay" /> Prefer not to say</label>
                        </div>
                    </div> */}
                    <Link to={'/userLogin'}>
                        <button type="submit" style={styles.button}>Register</button>
                    </Link>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        margin: '10% 30%'
    },
    formContainer: {
        background: 'linear-gradient(135deg, #4A90E2, #8E44AD)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        width: '40vw',
    },
    heading: {
        fontSize: '1.2rem',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    row: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    inputGroup: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        // background:'white',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    genderContainer: {
        marginBottom: '1rem',
    },
    radioGroup: {
        display: 'flex',
        gap: '1rem',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '4px',
        border: 'none',
        color: '#fff',
        background: 'linear-gradient(135deg, #26c9eb, #3084cf)',
        cursor: 'pointer',
        fontSize: '1rem',
    },
};