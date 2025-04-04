import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductContextProvider } from "./components/ProductContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DataTable from "./components/DataTable";
import Reports from "./components/Reports";
import EmployeeStatus from "./components/EmployeeStatus";
import EmpDashboard from "./components/EmpDashboard";



function App() {
  return (
    <ProductContextProvider>
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<DataTable />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/status" element={<EmployeeStatus/>} />
              <Route path="/orders" element={<EmpDashboard/>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ProductContextProvider>
  );
}

export default App;
