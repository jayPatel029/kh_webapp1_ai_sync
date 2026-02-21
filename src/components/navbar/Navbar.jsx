/**
 * Navbar Component
 * Main navigation bar with sidebar toggle and user menu
 * 
 * @file src/components/navbar/Navbar.jsx
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dummyadmin from "../../assets/dummyadmin.png";
import { Flex, Button, IconButton, Box } from "../../component-library";
import '../../design-system/styles/index.css';
import { ArrowBack } from "@mui/icons-material";
import { useIsMobile } from "../mobile/useIsMobile";
import MobileTopBar from "../mobile/MobileTopBar";

const Navbar = () => {
    const [uname, setUname] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [dropdownVisible, setDDVisible] = useState(false);
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
        localStorage.removeItem("token");
        localStorage.removeItem("firstname");
        navigate("/doctorLogin");
    };

    useEffect(() => {
        const u = localStorage.getItem("firstname");
        setUname(u);
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
            <Box className="sticky top-0 left-0 right-0  px-2 z-[50]">
                <Flex align="center" justify="between" className="bg-white h-14 navbar-container">
                    <Flex align="center" gap={4}>

                        {/* sidebar toggle could be added here if needed */}

                    </Flex>

                    <Flex align="center" gap={4}>
                        {isCollapsed && (<IconButton variant="outline" icon={<ArrowBack />} onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} />)}
                        <span className="text-base text-dark hidden md:inline">{uname || 'User'}</span>
                        <Button variant="ghost" onClick={logout} className="p-0">
                            <img src={dummyadmin} alt="profile" className="h-9 w-9 rounded-full border border-border" />
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default Navbar;
