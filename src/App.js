import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/auth';
import { usePathContext } from './context/path';
import { useColorContext } from './context/colorcontext';
import { ROLES } from './config/roles';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import RequireRoles from './components/RequireRoles';
import Signup from './pages/Signup';
import Activate from './pages/auth/Activate';
import VerifyEmail from './pages/auth/recover-password/VerifyEmail';
import Navbar from './components/Navbar';
import Status from './components/Status';
import User from './pages/User';
import Assign from './pages/Assign';
import Error from './pages/error/Error';
import NotFound from './pages/error/NotFound';
import io from 'socket.io-client';
import Login from './pages/Login';
import Guest from './pages/Guest'; // Import your Guest component
import TradeForm from './pages/Trade';
import ProductList from './components/Products/ProductList';
import ProductAdder from './components/Products/ProductAdder';
import SavePlan from './pages/SavePlan';
import AddToCart from './pages/AddToCart';
import AddCabinet from './components/admin/AddCabinet';
import Shipping from './components/Shipping/Shipping';
import PaymentPage from './components/payment/PaymentPage';
import PendingTransactions from './components/payment/pendingTransactions';

function App() {
  const { auth } = useAuthContext();
  const { link } = usePathContext();
  const { componentColors } = useColorContext(); // Access ColorContext

  // Fetch background color for the body from componentColors
  const bodyBackgroundColor = componentColors?.Body?.background || '#ffffff'; // Default to white

  useEffect(() => {
    // Dynamically apply the background color to the body
    document.body.style.backgroundColor = bodyBackgroundColor;

    // Clean up by resetting to default on component unmount
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [bodyBackgroundColor]);
  console.log("Auth roles:", auth?.roles);
  console.log("abc")

  // Determine the redirection route based on the user's role
  const getRedirectPath = () => {
    if (!auth) return '/guest'; // Redirect to Guest for unauthenticated users
    if (auth.roles.includes(ROLES.Guest)) {
      return '/guest'
    }
    // Check roles and redirect accordingly
    if (auth.roles.includes(ROLES.Staff) || auth.roles.includes(ROLES.Admin)) {
      return '/user'; // Redirect to the user management page for Staff/Admin
    }
    if (auth.roles.includes(ROLES.Trade)) {
      return '/trade'; // Redirect to a specific dashboard for Trade
    }


    // Default for other users
    return link || '/';
  };

  useEffect(() => {
    if (auth?.accessToken) {
      const socket = io(process.env.REACT_APP_SOCKET_URL);
      socket.emit('online', auth._id);

      return () => {
        socket.disconnect();
      };
    }
  }, [auth]);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Status />

        <div className="container mt-3">
          <Routes>
            {/* Public Routes */}
            <Route path='/trade' element={<TradeForm />} />
            <Route path="/guest" element={<Guest />} />
            <Route path="/activate/:activation_token" element={<Activate />} />
            <Route path="/recover-password" element={<VerifyEmail />} />
            <Route path="/login" element={!auth ? <Login /> : <Navigate to={getRedirectPath()} />} />
            <Route path="/" element={!auth ? <Guest /> : <Navigate to={getRedirectPath()} />} />
            <Route path="/product-list/:category/:subcategory" element={<ProductList />} />
            <Route path="/add-product/:category/:subcategory" element={<ProductAdder />} />


            {/* Authenticated Routes */}
            <Route element={<PersistLogin />}>
              <Route path="/signup" element={!auth ? <Signup /> : <Navigate to={getRedirectPath()} />} />

              <Route element={<RequireAuth />}>
                <Route path="/account" element={<SavePlan />} />
                <Route path="/cart" element={<AddToCart />} />
                <Route path="/shipping-address" element={<Shipping />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/pending-transactions" element={<PendingTransactions />} />


                <Route element={<RequireRoles Roles={[ROLES.Staff, ROLES.Admin]} />}>
                  <Route path="/user" element={<User />} />
                  <Route path="/assign" element={<Assign />} />
                  <Route path="/admin-add-cabinates" element={<AddCabinet />} />
                </Route>
              </Route>
            </Route>

            {/* Error Routes */}
            <Route path="/error" element={<Error />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
