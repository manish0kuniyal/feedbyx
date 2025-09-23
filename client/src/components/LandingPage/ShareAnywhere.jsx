import { FaGlobeEurope, FaEnvelope, FaBloggerB, FaChrome, FaCommentDots } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import { RiMessage2Line } from "react-icons/ri";
import { IoIosShareAlt } from "react-icons/io";

import { motion } from "framer-motion";

export default function ShareAnywhere() {
  const icons = [
    <FaGlobeEurope className="text-4xl text-blue-100" />,
    < MdMailOutline  className="text-4xl text-blue-100" />,
    <FaBloggerB className="text-4xl text-blue-100" />,
    <IoIosShareAlt className="text-4xl text-blue-100" />,
    <FaChrome className="text-4xl text-blue-100" />,
    <RiMessage2Line className="text-4xl text-blue-100" />,
  ];

  return (
    <motion.div
      className="flex py-4 flex-wrap justify-center items-center gap-10 mt-16 opacity-70 z-10 relative"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {icons.map((icon, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {icon}
        </div>
      ))}
    </motion.div>
  );
}
