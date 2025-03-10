
import { useEffect, useMemo, useState } from "react";
import { ROLES } from "../config/roles";
import { GoSearch } from "react-icons/go";
import { useAuthContext } from "../context/auth";
import { useUserContext } from "../context/user";
import { usePathContext } from "../context/path";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Details from "../components/users/Index";
import Add from "../components/users/Add";
import io from "socket.io-client";
import { useColorContext } from "../context/colorcontext"; // Import useColorContext

const User = () => {
  const { auth } = useAuthContext();
  const { setTitle } = usePathContext();
  const { users, dispatch } = useUserContext();
  const { componentColors } = useColorContext(); // Access colors from context
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const isAdminOrStaff = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Staff);
  const admin = auth && isAdminOrStaff;

  const defaultColors = {
    background: "#ffffff",
    text: "#000000",
  };

  // Use colors from the context or fallback to defaults
  const backgroundColor = componentColors?.User?.background || defaultColors.background;
  const textColor = componentColors?.User?.text || defaultColors.text;

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);

    setTitle("User Management");
    let isMounted = true;
    const abortController = new AbortController();

    const getAllUser = async () => {
      try {
        const response = await axiosPrivate.get("/api/users", {
          signal: abortController.signal,
        });
        isMounted && dispatch({ type: "SET_USER", payload: response.data });
      } catch (err) {
        setNotFound(true);
      }
    };

    if (auth) {
      getAllUser();
    }

    socket.emit("online", auth._id);

    socket.on("StaffUpdateUserList", (user) => {
      dispatch({ type: "SET_USER", payload: user });
    });

    socket.on("adminUpdateUserList", (user) => {
      dispatch({ type: "SET_USER", payload: user });
    });

    return () => {
      isMounted = false;
      socket.off("adminUpdateUserList");
      abortController.abort();
    };
  }, []);

  const filteredNames = useMemo(
    () => users?.filter((user) => user.name.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        minHeight: "100vh", // Ensure styles are visible
        padding: "1rem", // Add padding for better visibility
      }}
    >
      {admin && (
        <>
          <Add />

          <div className="input-group mt-2 mb-3">
            <input
              type="search"
              className="form-control"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
                borderColor: textColor,
              }}
            />
            <button
              className="btn btn-outline-primary"
              type="button"
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
                borderColor: textColor,
              }}
            >
              <GoSearch />
            </button>
          </div>

          {users && (
            <table
              className="table table-hover mt-2"
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
              }}
            >
              <thead
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
              >
                <tr >
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }} scope="col" >No.</th>
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}scope="col">Name</th>
                  <th   style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }} scope="col">Email</th>
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}scope="col">Roles</th>
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}scope="col">Account Status</th>
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}scope="col">Active Status</th>
                  <th    style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}scope="col">Active Date</th>
                  <th   style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }} scope="col">Action</th>
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                }}
              >
                <Details  filteredNames={filteredNames} />
              </tbody>
            </table>
          )}
        </>
      )}

      {!filteredNames?.length && query && <div>No matching results found...</div>}

      {notFound && !query && !users?.length && <div>No Record Found...</div>}
    </div>
  );
};

export default User;
