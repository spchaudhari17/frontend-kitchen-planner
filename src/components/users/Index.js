import Delete from "./Delete";
import Edit from "./Edit";
import { ROLES } from "../../config/roles";
import { MdOutlineWifi, MdOutlineWifiOff } from "react-icons/md";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useAuthContext } from "../../context/auth";
import { useColorContext } from "../../context/colorcontext"; // Import ColorContext

const Index = ({ filteredNames }) => {
  const { auth } = useAuthContext();
  const { componentColors } = useColorContext(); // Access colors from ColorContext

  // const defaultColors = {
  //   background: "#ffffff",
  //   text: "#000000",
  //   border: "#cccccc", // Default border color
  // };

  // Get colors from the context or use defaults
  const rowBackgroundColor = componentColors?.Details?.background 
  const rowTextColor = componentColors?.Details?.text  
  const rowBorderColor = componentColors?.Details?.border  

  const permitDeleteUser = (auth, user) => {
    return (
      (!auth.roles.includes(ROLES.Admin) && !user.roles.includes(ROLES.Staff)) ||
      user.roles.includes(ROLES.User)
    );
  };

  const cellStyle = {
    backgroundColor: rowBackgroundColor,
    color: rowTextColor,
    border: `1px solid ${rowBorderColor}`,
    padding: "8px",
    textAlign: "left",
  };

  return (
    <>
      {filteredNames.map((user, index) => (
        <tr
          key={index}
          style={{
            border: `1px solid ${rowBorderColor}`,
          }}
        >
          <td style={cellStyle}>{index + 1 + "."}</td>
          <td style={cellStyle}>{user.name}</td>
          <td style={cellStyle}>{user.email}</td>
          <td style={cellStyle}>{user.roles}</td>
          <td style={cellStyle}>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={user.active}
                readOnly
              />
            </div>
          </td>
          <td style={cellStyle}>
            {user.isOnline ? (
              <MdOutlineWifi className="text-success" size={25} />
            ) : (
              <MdOutlineWifiOff className="text-secondary" size={25} />
            )}
          </td>
          <td style={cellStyle}>
            {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
          </td>
          <td style={cellStyle}>
            <div className="d-flex align-items-center justify-content-start gap-2">
              <Edit user={user} />
              {permitDeleteUser(auth, user) && <Delete user={user} />}
            </div>
          </td>

        </tr>
      ))}
    </>
  );
};

export default Index;
