import { useState } from "react";
import { useGlobalContext } from "./ProductContext";
import Filters from "./Filters";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { scanTracking, orders, loading } = useGlobalContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]); // Store full objects
  const itemsPerPage = 100;

  // Pagination Logic
  // const totalPages = Math.ceil(scanTracking.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = scanTracking.slice(indexOfFirstItem, indexOfLastItem);



  const totalPages = Math.ceil(scanTracking.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  // Store full order objects instead of just order_id
  const toggleSelection = (order) => {
    setSelectedOrders((prev) => {
      const isAlreadySelected = prev.some(
        (selected) => selected.order_id === order.order_id
      );
      return isAlreadySelected
        ? prev.filter((selected) => selected.order_id !== order.order_id)
        : [...prev, order];
    });
  };

  // Select/Deselect All Orders
  const handleSelectAll = (e) => {
    setSelectedOrders(e.target.checked ? scanTracking : []);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = scanTracking.map((order) => ({
      "Order ID": order.order_id,
      Channel:
        orders.find((o) => o.order_id === order.order_id)?.channel || "N/A",
      "Style Number": order.orders_2?.style_number || "N/A",
      Size: orders.find((o) => o.order_id === order.order_id)?.size || "N/A",
      "Last Scanner": order.employees?.user_name || "N/A",
      Location: order.locations?.name || "N/A",
      "Last Scan": order.scanned_timestamp || "N/A",
      Status:
        orders.find((o) => o.order_id === order.order_id)?.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "orders_report.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (selectedOrders.length === 0) {
      alert("No orders selected!");
      return;
    }

    const doc = new jsPDF();
    doc.text("Orders Report", 14, 10);

    const headers = [
      ["Sr.No", "Order ID", "Style Number", "Size", "Channel", "Last Scanner"],
    ];

   

  const rowss = selectedOrders.filter((order)=> order.locations.name!=="Shipping Table / शिपिंग टेबल");
  const rows = rowss.map((order, i)  =>[
          i + 1,
      order.order_id || "N/A",
      order.orders_2?.style_number || "N/A",
      orders.find((o) => o.order_id === order.order_id)?.size || "N/A",
      orders.find((o) => o.order_id === order.order_id)?.channel || "N/A",
      (order.employees?.user_name?.split(" / ")[0] || "N/A").trim(),
    ]


);





    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      styles: { fontSize: 10, cellWidth: "wrap" },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 40 },
      },
    });

    doc.save("orders_report.pdf");
  };

  if (loading)
    return (
    
      <>
      <div className="container mx-auto grid items-center justify-center">
          <span className="w-20 h-20 border-b-2 border-t-2 duration-100 ease-in animate-spin border-blue-500 rounded-full"> </span>
      </div>
    </>
    
    );

  return (
    <div className="p-6">
      <Filters />
      <h2 className="text-xl font-bold mb-4">Orders List</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 p-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedOrders.length === scanTracking.length}
              />
            </th>
            <th className="border border-gray-200 p-2">Sr.No</th>
            <th className="border border-gray-200 p-2">Order ID</th>
            <th className="border border-gray-200 p-2">Channel</th>
            <th className="border border-gray-200 p-2">Style Number</th>
            <th className="border border-gray-200 p-2">Size</th>
            <th className="border border-gray-200 p-2">Last Scanner</th>
            <th className="border border-gray-200 p-2">Location</th>
            <th className="border border-gray-200 p-2">Last Scan</th>
            <th className="border border-gray-200 p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, i) => {
            const matchingData =
              orders.find((item) => item.order_id === order.order_id) || {};
            return (
              <tr
                key={`order-${i}`}
                className="text-center border-b hover:bg-gray-100"
              >
                <td className="border border-gray-200 p-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.some(
                      (o) => o.order_id === order.order_id
                    )}
                    onChange={() => toggleSelection(order)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  {indexOfFirstItem + i + 1}
                </td>
                <td className="border border-gray-200 text-blue-500 p-2">
                  {order.order_id}
                </td>
                <td className="border border-gray-200 p-2">
                  {matchingData.channel || "loading..."}
                </td>
                <td className="border border-gray-200 p-2">
                  {order.orders_2?.style_number || "N/A"}
                </td>
                <td className="border border-gray-200 p-2">
                  {matchingData.size || "loading..."}
                </td>
                <td className="border border-gray-200 p-2">
                  {order.employees?.user_name || "N/A"}
                </td>
                <td className="border border-gray-200 p-2">
                  {order.locations?.name || "N/A"}
                </td>
                <td className="border border-gray-200 p-2">
                  {order.scanned_timestamp || "N/A"}
                </td>
                <td className="border border-gray-200 p-2 text-white">
                  <span
                    className={`rounded-xl py-0 px-2 ${
                      order.locations?.name?.includes("Shipping Table")
                        ? "bg-green-400"
                        : "bg-yellow-300"
                    }`}
                  >
                    {order.locations?.name?.includes("Shipping Table")
                      ? "shipped"
                      : "pending"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <div className="flex gap-4  ">
          <button
            onClick={exportToCSV}
            className="px-4  bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            disabled={selectedOrders.length === 0}
            className={`px-4 py-2 bg-red-500 text-white rounded ${
              selectedOrders.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-600"
            }`}
          >
            Export PDF
          </button>
         
        </div>
        <div className="flex justify-center space-x-4 items-center ">
      <button 
        onClick={handlePrev} 
        disabled={currentPage === 1} 
        className="px-4 py-2 bg-blue-300 cursor-pointer rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span className="font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages} 
        className="px-4 py-2 bg-blue-300 cursor-pointer rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

        
      </div>
    </div>
  );
}
