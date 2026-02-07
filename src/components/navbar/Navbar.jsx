import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { TiThMenu } from "react-icons/ti";
import kifayti_logo from "../../assets/kifayti_logo.png";
import dummyadmin from "../../assets/dummyadmin.png";
import { Flex, Button, IconButton } from "../../component-library";

const Navbar = () => {
    const [uname, setUname] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [dropdownVisible, setDDVisible] = useState(false);
    const navigate = useNavigate();

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
            <div className="sticky top-0 left-0 right-0 w-full px-2 z-[9999]">
                <Flex align="center" justify="between" className="bg-white h-14">
                    <Flex align="center" gap={4}>

                        {/* <IconButton variant="outline" textColor="black" className="text-black" onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            <TiThMenu /> 
                        </IconButton> */}
                        <div onClick={toggleCollapse} className="text-black text-2xl  border border-black p-1 rounded-xl cursor-pointer">
                            <TiThMenu />
                        </div>


                    </Flex>

                    <Flex align="center" gap={4}>

                        <span className="text-base text-slate-800 hidden md:inline">{uname || 'User'}</span>
                        <Button variant="ghost" onClick={logout} className="p-0">
                            <img src={dummyadmin} alt="profile" className="h-9 w-9 rounded-full border border-slate-100" />
                        </Button>
                    </Flex>
                </Flex>
            </div>

            {/* Mobile sidebar */}
            <div className={dropdownVisible ? "block md:hidden" : "hidden md:hidden"}>
                <Sidebar mobile />
            </div>
        </>
    );
};

export default Navbar;
