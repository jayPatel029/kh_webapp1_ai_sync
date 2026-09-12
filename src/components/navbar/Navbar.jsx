/**
 * Navbar Component
 * Main navigation bar with sidebar toggle and user menu
 * 
 * @file src/components/navbar/Navbar.jsx
 */

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dummyadmin from "../../assets/dummyadmin.png";
import kifayti_logo from "../../assets/kifayti_logo.png";
import { Flex, Button, IconButton, Box, Card,  Text } from "../../component-library";
import '../../design-system/styles/index.css';
import { ArrowBack } from "@mui/icons-material";
import { useIsMobile } from "../mobile/useIsMobile";
import MobileTopBar from "../mobile/MobileTopBar";
import { clearAllCaches } from "../../cache";
import { clearAuthSession, getHomePathForRole } from "../../helpers/authSession";
import { clearPermissions } from "../../redux/permissionSlice";
import { isRole } from "../../helpers/roleUtils";
import { ROUTES } from "../../routes/routeConstants";

const Navbar = () => {
    const dispatch = useDispatch();
    const roleName = useSelector((state) => state.permission?.role_name);
    const role = roleName || localStorage.getItem("role");
    const isDoctor = isRole(role, "Doctor");
    const [uname, setUname] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [dropdownVisible, setDDVisible] = useState(false);
    const ddRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // const handleStorageChange = () => {
        //     const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        //     setIsCollapsed(collapsed);
        // };
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        setIsCollapsed(collapsed);
        // window.addEventListener('storage', handleStorageChange);
        // return () => {
        //     window.removeEventListener('storage', handleStorageChange);
        // };
    }, [localStorage.getItem('sidebarCollapsed')]);

    const logout = () => {
        clearAllCaches();
        clearAuthSession();
        dispatch(clearPermissions());
        navigate(isDoctor ? ROUTES.DOCTOR_LOGIN : ROUTES.LOGIN);
    };

    useEffect(() => {
        const u = localStorage.getItem("firstname");
        setUname(u);
    }, []);

    // close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ddRef.current && !ddRef.current.contains(e.target)) {
                setDDVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // toggle sidebar collapsed state and notify other components
    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        try {
            localStorage.setItem('sidebarCollapsed', next ? 'true' : 'false');
        } catch (e) { }
        // dispatch custom event so Sidebar can listen
        window.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { isCollapsed: next } }));
    };

    const { isMobile } = useIsMobile();

    // mobile shortcut
    if (isMobile) {
        return <MobileTopBar />;
    }

    return (
        <>
            <Box className="sticky top-0 left-0 right-0  pr-8 pt-4  z-[50]">
                <Flex align="center" justify="between" className="bg-white h-14 navbar-container pl-4 ">
                    <Flex align="center" className={isDoctor ? "pl-6" : "pl-2"} gap={4}>
                        {/* Left: logo + app name (full left) */}
                        <Link to={getHomePathForRole(role)} className="flex items-center gap-3">
                            {isDoctor ? <img src={kifayti_logo} alt="Kifayti logo" style={{ width: 36, height: 36, objectFit: 'contain' }} /> : null}
                            {/* <img src={kifayti_logo} alt="Kifayti logo" style={{ width: 36, height: 36, objectFit: 'contain' }} /> */}
                            <span className="text-lg font-semibold text-[#004c6d]">Welcome to Kifayti Health</span>
                        </Link>
                    </Flex>

                    <Flex align="center" justify="end" gap={4}>
                        {isCollapsed && (<IconButton variant="outline" icon={<ArrowBack className="rotate-180" />} onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} />)}
                        <Text className="text-base text-dark hidden md:inline">{uname || 'User'}</Text>
                        <Box className="relative" ref={ddRef}>
                            <Button variant="ghost" onClick={() => setDDVisible(v => !v)} className="p-0" aria-expanded={dropdownVisible} aria-haspopup="menu">
                                <img src={dummyadmin} alt="profile" className="h-9 w-9 rounded-full border border-border" />
                            </Button>
                            {dropdownVisible && (
                                <Card className="absolute right-0 mt-2 w-44 bg-white border border-border rounded shadow-md z-50 p-0 overflow-hidden">
                                    <Flex direction="column" className="py-1">
                                        <Button variant="ghost" className="justify-start px-3 py-2 w-full" onClick={() => { setDDVisible(false); navigate('/ChangePassword'); }}>
                                            Reset Password
                                        </Button>
                                        <Button variant="ghost" className="justify-start px-3 py-2 w-full" onClick={() => { setDDVisible(false); logout(); }}>
                                            Logout
                                        </Button>
                                    </Flex>
                                </Card>
                            )}
                        </Box>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default Navbar;
