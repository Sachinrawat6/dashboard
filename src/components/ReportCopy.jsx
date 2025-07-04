import { useState, useEffect } from "react";
import { useGlobalContext } from "./ProductContext";
import Filters from "./Filters";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { scanTracking, orders, loading } = useGlobalContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [latestScans, setLatestScans] = useState([]);
  const itemsPerPage = 100;

  useEffect(() => {
    if (scanTracking.length > 0) {
      const scansByOrder = {};

      scanTracking.forEach((scan) => {
        if (
          !scansByOrder[scan.order_id] ||
          new Date(scan.scanned_timestamp) >
            new Date(scansByOrder[scan.order_id].scanned_timestamp)
        ) {
          scansByOrder[scan.order_id] = scan;
        }
      });

      setLatestScans(Object.values(scansByOrder));
    }
  }, [scanTracking]);

  // Pagination Logic
  const totalPages = Math.ceil(latestScans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = latestScans.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

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

  const handleSelectAll = (e) => {
    setSelectedOrders(e.target.checked ? latestScans : []);
  };

  // Corrected scanner name extraction
  const getScannerName = (order) => {
    try {
      const extractName = (name) => {
        // Ensure it's a string and return part before " / " if present
        return typeof name === "string" ? name.split(" / ")[0] : "N/A";
      };

      if (order.employees && typeof order.employees === "object") {
        if (order.employees.value && order.employees.value.user_name) {
          return extractName(order.employees.value.user_name);
        }
        if (order.employees.user_name) {
          return extractName(order.employees.user_name);
        }
      }

      if (typeof order.employees === "string") {
        const parsed = JSON.parse(order.employees);
        if (parsed.value && parsed.value.user_name) {
          return extractName(parsed.value.user_name);
        }
        if (parsed.user_name) {
          return extractName(parsed.user_name);
        }
      }

      return "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  const exportToCSV = () => {
    const csvData = latestScans.map((order) => ({
      "Order ID": order.order_id,
      Channel:
        orders.find((o) => o.order_id === order.order_id)?.channel || "N/A",
      "Style Number": order.orders_2?.style_number || "N/A",
      Size: orders.find((o) => o.order_id === order.order_id)?.size || "N/A",
      "Last Scanner": getScannerName(order),
      Location: order.locations?.name || "N/A",
      "Last Scan": order.scanned_timestamp || "N/A",
      Status: order.locations?.name?.includes("Shipping Table")
        ? "Shipped"
        : "Pending",
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

  // const exportToPDF = () => {
  //   if (selectedOrders.length === 0) {
  //     alert("Please select at least one order to export!");
  //     return;
  //   }

  //   const doc = new jsPDF();
  //   doc.setFontSize(16);
  //   doc.text("Orders Report", 14, 16);
  //   doc.setFontSize(10);

  //   const headers = [
  //     ["Sr.No", "Channel", "Order Id", "Sku", "Scanner", "Location", "Time"],
  //   ];

  //   const rows = selectedOrders
  //     .filter((item) => !item.locations?.name?.includes("Shipping Table"))

  //     .map((order, i) => [
  //       i + 1,
  //       orders.find((o) => o.order_id === order.order_id)?.channel || "N/A",
  //       order.order_id || "N/A",
  //       `${order.orders_2?.style_number}-${
  //         orders.find((o) => o.order_id === order.order_id)?.size
  //       }` || "N/A",
  //       // orders.find((o) => o.order_id === order.order_id)?.size || "N/A",
  //       getScannerName(order),
  //       order.locations?.name?.split(" / ")[0] || "N/A",
  //       // order.locations?.name?.includes("Shipping Table") ? "Shipped" : "Pending"
  //       new Date(order.scanned_timestamp).toLocaleString("en-IN", {
  //         day: "2-digit",
  //         month: "short",
  //         year: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //       }),
  //     ]);

  //   autoTable(doc, {
  //     head: headers,
  //     body: rows,
  //     startY: 25,
  //     styles: {
  //       fontSize: 9,
  //       cellPadding: 3,
  //       valign: "middle",
  //     },
  //     headStyles: {
  //       fillColor: [41, 128, 185],
  //       textColor: 255,
  //       fontStyle: "bold",
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 15 },
  //       1: { cellWidth: 25 },
  //       2: { cellWidth: 25 },
  //       3: { cellWidth: 30 },
  //       4: { cellWidth: 25 },
  //       5: { cellWidth: 32 },
  //       6: { cellWidth: 50 },
  //       // 7: { cellWidth: 20 }
  //     },
  //     margin: { top: 20 },
  //   });

  //   doc.save("orders_report.pdf");
  // };
  const exportToPDF = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to export!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Orders Report", 14, 16);
    doc.setFontSize(10);

    const headers = [
      ["Sr.No", "Channel", "Order Id", "Sku", "Scanner", "Location", "Time"],
    ];

    // Sort the selected orders by date (descending) and then by style number (descending)
    const sortedOrders = [...selectedOrders]
      .filter((item) => !item.locations?.name?.includes("Shipping Table"))
      .sort((a, b) => {
        // First sort by date (newest first)
        const dateA = new Date(a.scanned_timestamp).getTime();
        const dateB = new Date(b.scanned_timestamp).getTime();

        if (dateB !== dateA) {
          return dateB - dateA;
        }

        // If dates are equal, sort by style number (descending)
        // const styleNumA = orders.find(o => o.order_id === a.order_id)?.style_number || "";
        // const styleNumB = orders.find(o => o.order_id === b.order_id)?.style_number || "";

        // return styleNumB.localeCompare(styleNumA);
        // return styleNumA - styleNumA ;
      });

    const rows = sortedOrders.map((order, i) => [
      i + 1,
      orders.find((o) => o.order_id === order.order_id)?.channel || "N/A",
      order.order_id || "N/A",
      `${order.orders_2?.style_number}-${
        orders.find((o) => o.order_id === order.order_id)?.size
      }` || "N/A",
      getScannerName(order),
      order.locations?.name?.split(" / ")[0] || "N/A",
      new Date(order.scanned_timestamp).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 32 },
        6: { cellWidth: 50 },
      },
      margin: { top: 20 },
    });

    doc.save("orders_report.pdf");
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const format = (n) => (n < 10 ? `0${n}` : n);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <div className="mb-6">
        <Filters />
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Order Tracking Report
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Created At Start Date + Time */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                CreatedAt SD
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <select className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {hours.map((h) => (
                      <option key={h} value={format(h)}>
                        {format(h)}
                      </option>
                    ))}
                  </select>
                  <select className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {minutes.map((m) => (
                      <option key={m} value={format(m)}>
                        {format(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Created At End Date + Time */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                CreatedAt ED
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <select className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {hours.map((h) => (
                      <option key={h} value={format(h)}>
                        {format(h)}
                      </option>
                    ))}
                  </select>
                  <select className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {minutes.map((m) => (
                      <option key={m} value={format(m)}>
                        {format(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={selectedOrders.length === 0}
              className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                selectedOrders.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, latestScans.length)} of{" "}
            {latestScans.length} records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-md">
              {currentPage}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedOrders.length === latestScans.length &&
                      latestScans.length > 0
                    }
                    className="rounded text-blue-500 focus:ring-blue-400"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Style
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scanner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Scan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order, i) => {
                const matchingData =
                  orders.find((item) => item.order_id === order.order_id) || {};
                const isSelected = selectedOrders.some(
                  (o) => o.order_id === order.order_id
                );

                return (
                  <tr
                    key={`order-${i}`}
                    className={`${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(order)}
                        className="rounded text-blue-500 focus:ring-blue-400"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + i + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.order_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {matchingData.channel || (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.orders_2?.style_number || (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {matchingData.size || (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {getScannerName(order)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.locations?.name || (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.scanned_timestamp ? (
                        new Date(order.scanned_timestamp).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      ) : (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {matchingData?.created_at ? (
                        new Date(matchingData?.created_at).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      ) : (
                        <span className="text-gray-300">
                          N/A {console.log(order)}{" "}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.locations?.name?.includes("Shipping Table")
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.locations?.name?.includes("Shipping Table")
                          ? "Shipped"
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {latestScans.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">
            No order records found
          </div>
        )}
      </div>
    </div>
  );
}
