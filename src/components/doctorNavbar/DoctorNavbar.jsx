import React from 'react';
import { BsPower } from "react-icons/bs";
import { Flex, Box } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";

function DoctorNavbar() {
  return (
    <Flex
      as="nav"
      align="center"
      justify="end"
      className="navbar pr-10 bg-white"
    >
      <Text size="lg">Doctor</Text>
      <BsPower
        className="text-red-900 ml-5 text-2xl font-extrabold cursor-pointer"
        // onClick={logout}
      />
    </Flex>
  );
}

export default DoctorNavbar;