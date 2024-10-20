import React, {useState, useEffect} from 'react';
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, fetchUserData, monitorAuthState } from '../redux/authSlice';
import Image from "next/image";
import jeopardyLogo from "../icons/Jeopardy-Symbol.png";
import userIcon from "../icons/user.png";
import styles from './navbar.module.css';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { userid } = useParams();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if(!user) {
            router.push("/");
        }else{
            dispatch(fetchUserData(userid));
            console.log("username:", user.displayName);
        }
    }, [userid, dispatch]);

    useEffect(() => {
        const unsubscribe = dispatch(monitorAuthState());
        return () => {
            unsubscribe();
        }
    }, []);

    const viewProfile = () => {
        router.push(`/${userid}/profile`);
    }

    const handleLogout = async() => {
        try{
            await dispatch(logoutUser());
            alert("Successfully logged out!");
            router.push("/");
        }catch(error){
            console.error('Error:', error);
            alert("Error logging out. Please try again.");
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
            <Image
                src={jeopardyLogo}
                alt="Jeopardy Logo"
                width={300}
                height={100}
            />
            <div className={styles.withFriends}>With Friends!</div>
            </div>
            <div className={styles.userContainer}>
            <Image src={userIcon} alt="User Icon" width={40} height={40} />
            {user && user.displayName ? <div className={styles.username}>{user.displayName}</div> : null}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={styles.dropdownButton}
            >
                ▼
            </button>
            {isDropdownOpen && (
                <div className={styles.dropdown}>
                <button onClick={viewProfile}>View Profile</button>
                <button onClick={handleLogout}>Log out</button>
                </div>
            )}
            </div>
        </header>
    );
};

export default Navbar;