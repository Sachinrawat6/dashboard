import React, { useEffect, useState } from 'react';
import { useGlobalContext } from './ProductContext';
import Filters from "./Filters";

const EmployeeStatus = () => {
  const { scanTracking,loading } = useGlobalContext();
  const [summary, setSummary] = useState({});
  const [employeeTotals, setEmployeeTotals] = useState({});

  useEffect(() => {
    processScanData();
  }, [scanTracking]);

  // Process scanTracking data to get daily order counts per employee
  const processScanData = () => {
    let orderSummary = {};
    let employeeOrderTotals = {};

    scanTracking.forEach((scan) => {
      const { order_id, scanned_timestamp } = scan;
      if (!order_id || !scanned_timestamp || !scan.employees.user_name) return;

      const employeeName = scan.employees.user_name;
      const orderDate = new Date(scanned_timestamp).toISOString().split('T')[0];

      if (!orderSummary[employeeName]) {
        orderSummary[employeeName] = {};
      }

      if (!orderSummary[employeeName][orderDate]) {
        orderSummary[employeeName][orderDate] = new Set();
      }

      orderSummary[employeeName][orderDate].add(order_id);

      // Count total unique orders per employee
      if (!employeeOrderTotals[employeeName]) {
        employeeOrderTotals[employeeName] = new Set();
      }
      employeeOrderTotals[employeeName].add(order_id);
    });

    let finalSummary = {};
    Object.keys(orderSummary).forEach((employee) => {
      finalSummary[employee] = {};
      Object.keys(orderSummary[employee]).forEach((date) => {
        finalSummary[employee][date] = orderSummary[employee][date].size;
      });
    });

    let totalOrdersPerEmployee = {};
    Object.keys(employeeOrderTotals).forEach((employee) => {
      totalOrdersPerEmployee[employee] = employeeOrderTotals[employee].size;
    });

    setSummary(finalSummary);
    setEmployeeTotals(totalOrdersPerEmployee);
  };
  if (loading)
    return (
    
      <div className=" container mx-auto grid items-center w-full h-full">
        <img src="https://i.pinimg.com/originals/71/3a/32/713a3272124cc57ba9e9fb7f59e9ab3b.gif" className=" mx-auto" alt="loading..." />
        </div>
        
    
    );
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Employee Order Summary</h2>
      <Filters />

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 border-gray-400">
            <th className="border border-gray-300 text-left p-2">Employee Name</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Total Orders Scanned</th>
            <th className="border border-gray-300 p-2">Total Orders (Overall)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(summary).map((employee, index) =>
          
            Object.keys(summary[employee]).map((date, dateIndex) => (
             
              <tr key={`${employee}-${date}`} className="text-center hover:bg-gray-100 cursor-pointer">
                <td className="border border-gray-200 text-left text-blue-500 p-2">
                  {employee}
                </td>
                <td className="border border-gray-200 p-2">{date}</td>
                <td className="border border-gray-200 p-2">{summary[employee][date]}</td>
                {dateIndex === 0 && (
                  <td className="border border-gray-200  p-2 font-bold" rowSpan={Object.keys(summary[employee]).length}>
                    {employeeTotals[employee]}
                  </td>
                  
                )}
                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeStatus;
