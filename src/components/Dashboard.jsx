import { useState ,useMemo} from "react";
import { useGlobalContext } from "./ProductContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Filters from "./Filters";

export default function Dashboard() {
  const { scanTracking, styleLoading, orders ,loading} = useGlobalContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique locations
  const locationsData = scanTracking.reduce((acc, order) => {
    if (order.locations?.name) {
      acc[order.locations.name] = (acc[order.locations.name] || 0) + 1;
    }
    return acc;
  }, {});

  const locationEntries = Object.entries(locationsData);
  const totalPages = Math.ceil(locationEntries.length / itemsPerPage);
  const paginatedLocations = locationEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Prepare data for chart
  const chartData = locationEntries.map(([location, count]) => ({
    location,
    count,
  }));

 // Calculate order counts for different stages with unique order IDs
 // Count orders in different stages
 const shippingTableCount = Array.isArray(scanTracking)
  ? scanTracking.filter(order => 
      order.locations?.name?.trim().toLowerCase().includes("shipping table")
    ).length
  : 0;

// Ensure order_id is consistently compared as a string
const uniqueOrderIds = [...new Set(scanTracking.map(order => String(order.orders_2.order_id)))];

// console.log("Unique Order IDs from scanTracking:", uniqueOrderIds);
// console.log("Order IDs from orders:", orders.map(o => String(o.order_id)));

// Calculate order counts based on unique order IDs
const stageCounts = useMemo(() => ({
  orders: uniqueOrderIds.length,
  foundInInventory: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "shipped").length,
  cutting: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "pending").length,
  ship: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "shipped").length + shippingTableCount,
}), [orders, scanTracking]);

// console.log("Final Stage Counts:", stageCounts);





// const uniqueOrderIds = [...new Set(orders.map(order => String(order.order_id)))];

// console.log("Unique Order IDs from scanTracking:", uniqueOrderIds);
// console.log("Order IDs from orders:", scanTracking.map(o => String(o.orders_2.order_id)));

// // Calculate order counts based on unique order IDs
// const stageCounts = useMemo(() => ({
//   orders: uniqueOrderIds.length,
//   foundInInventory: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "shipped").length,
//   cutting: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "pending").length,
//   ship: orders.filter(order => uniqueOrderIds.includes(String(order.order_id)) && order.status === "shipped").length + shippingTableCount,
// }), [orders, scanTracking]);

// console.log("Final Stage Counts:", stageCounts);







// const totalOrders = scanTracking.length;
// const foundInInventory = orders  and scanTracking matching order_id and orders.staus = "shipped";
// const cuttingCount = orders  and scanTracking matching order_id and orders.staus = "pending"; count it 
// const shipCount = orders  and scanTracking matching order_id and orders.staus = "shipped"; and scanTracking.locations.name="Shipping Table" count it  


  // Process orders to get unique order IDs and count style_number occurrences with sizes
  const uniqueOrders = new Map();
  orders.forEach((order) => {
    if (!uniqueOrders.has(order.order_id)) {
      uniqueOrders.set(order.order_id, {
        style_number: order.style_number,
        size: order.size,
      });
    }
  });

  // Count styles and sizes
  const styleSizeCount = {};
  uniqueOrders.forEach(({ style_number, size }) => {
    if (!styleSizeCount[style_number]) {
      styleSizeCount[style_number] = {};
    }
    styleSizeCount[style_number][size] =
      (styleSizeCount[style_number][size] || 0) + 1;
  });

  // Convert to an array for sorting and display
  const topStyles = Object.entries(styleSizeCount)
    .map(([style, sizes]) => ({ style, sizes }))
    .sort((a, b) => {
      const totalA = Object.values(a.sizes).reduce(
        (sum, count) => sum + count,
        0
      );
      const totalB = Object.values(b.sizes).reduce(
        (sum, count) => sum + count,
        0
      );
      return totalB - totalA;
    })
    .slice(0, 10); // Get top 10 styles

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
      <h2 className="text-2xl text-blue-500 font-bold mb-4">Dashboard</h2>

      {/* Responsive Bar Chart */}
      <div className="mb-6 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="min-w-full  border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-200 p-2">Location</th>
            <th className="border border-gray-200 p-2">Order Count</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLocations.map(([location, count], index) => (
            <tr key={index} className="border-b hover:bg-gray-100 text-left">
              <td className="border border-gray-200 p-2 text-left">
                {location}
              </td>
              <td className="border border-gray-200 p-2">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
      <table className="min-w-full border-collapse border border-gray-300 hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-200 p-2">Stage</th>
            <th className="border border-gray-200 p-2">Order Count</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-100">
            <td className="border border-gray-200 p-2">Total orders</td>
            <td className="border border-gray-200 p-2">{stageCounts.orders}</td>
          </tr>
          <tr className="border-b hover:bg-gray-100">
            <td className="border border-gray-200 p-2">Found In Inventory</td>
            <td className="border border-gray-200 p-2">{stageCounts.foundInInventory}</td>
          </tr>
          <tr className="border-b hover:bg-gray-100">
            <td className="border border-gray-200 p-2">Cutting</td>
            <td className="border border-gray-200 p-2">{stageCounts.cutting}</td>
          </tr>
          <tr className="border-b hover:bg-gray-100">
            <td className="border border-gray-200 p-2">Ship</td>
            <td className="border border-gray-200 p-2">{stageCounts.ship}</td>
          </tr>
        </tbody>
      </table>

      



      <div className="mt-4 text-2xl font-bold text-blue-400">
        <h2>Top Perfoming Styles </h2>
        <hr className="text-gray-300 mt-2" />
      </div>

      <table className="min-w-full border-collapse border border-gray-300 mt-4 ">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th>Sr.No</th>
            <th className="border border-gray-200 p-2">Style Number</th>
            <th className="border border-gray-200 p-2">Sizes & Quantity</th>
          </tr>
        </thead>
        <tbody>
        
          { styleLoading? <div className="text-center  container flex justify-center mx-auto items-center"> <img className="mx-auto w-80" src="https://loading.io/assets/mod/spinner/spinner/lg.gif" alt="loading" /> </div>:     topStyles.map(({ style, sizes }, index) => (
            <tr key={index} className="border-b border-gray-200 text-center ">
              <td className="border border-gray-200 p-2">{index + 1}</td>
              <td className="border border-gray-200 p-2 text-blue-500">
                {style}
              </td>
              <td className="border border-gray-200 ">
                <ul className="list-inside py-2">
                  {Object.entries(sizes)
                    .sort((a, b) => b[1] - a[1]) // Sorting by count in descending order
                    .map(([size, count], i) => (
                      <li
                        key={size}
                        className={`flex justify-between p-2 hover:bg-gray-200 cursor-pointer ${
                          i % 2 === 0 ? "bg-gray-100" : ""
                        }`}
                      >
                        <span className="font-bold">{size}</span>
                        <span>{count}</span>
                      </li>
                    ))}

                  {/* Subtotal Row */}
                  <li className="flex justify-between p-2 mt-2  font-bold text-lg bg-blue-300 text-white rounded-md">
                    <span>Total</span>
                    <span>
                      {Object.values(sizes).reduce(
                        (sum, count) => sum + count,
                        0
                      )}
                    </span>
                  </li>
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
