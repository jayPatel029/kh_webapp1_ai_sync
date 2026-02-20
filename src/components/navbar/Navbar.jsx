/**
 * Navbar Component
 * Main navigation bar with sidebar toggle and user menu
 * 
 * @file src/components/navbar/Navbar.jsx
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { TiThMenu } from "react-icons/ti";
import dummyadmin from "../../assets/dummyadmin.png";
import { Flex, Button, IconButton, Box } from "../../component-library";
import '../../design-system/styles/index.css';
import { use } from "react";
import { ArrowBack } from "@mui/icons-material";

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

    return (
        <>
            <Box className="sticky top-0 left-0 right-0  px-2 z-[50]">
                <Flex align="center" justify="between" className="bg-white h-14 navbar-container">
                    <Flex align="center" gap={4}>


                        {/* <div onClick={toggleCollapse} className="text-black text-2xl  border border-black p-1 rounded-xl cursor-pointer">
                            <TiThMenu />
                        </div> */}


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

            {/* Mobile sidebar */}
            <Box className={dropdownVisible ? "block md:hidden" : "hidden md:hidden"}>
                <Sidebar mobile />
            </Box>
        </>
    );
};

export default Navbar;
