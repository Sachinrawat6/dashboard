import { useState } from "react";
import { useGlobalContext } from "./ProductContext";

const EmpDashboard = () => {
  const { scanTracking2, orders } = useGlobalContext();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatDate = (date) => {
    if (!date) return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? null : parsedDate.toISOString().split("T")[0];
  };

  const isWithinDateRange = (date) => {
    const formattedDate = formatDate(date);
    if (!formattedDate) return false;
    const start = startDate ? formatDate(startDate) : null;
    const end = endDate ? formatDate(endDate) : null;
    return (!start || formattedDate >= start) && (!end || formattedDate <= end);
  };

  const filteredOrders = orders.filter((order) => isWithinDateRange(order.created_at));
  const filteredTracking = scanTracking2.filter((track) => isWithinDateRange(track.date));

  const totalOrders = filteredOrders.length;
  const foundInInventory = filteredOrders.filter(order => order.status === "shipped").length;
  const cutting = filteredOrders.filter(order => order.status === "pending").length;

  // const shippingOrderIds = new Set(
  //   filteredTracking
  //     .filter(track => track.locations?.some(location => location.name?.toLowerCase().includes("shipping")))
  //     .map(track => track.order_id)
  // );


  const shippingOrderIds = new Set(
    scanTracking2
      .filter((track) => track.locations?.name?.includes("Shipping Table"))
      .map((track) => track.order_id)
  );
  const ship = filteredOrders.filter(order => shippingOrderIds.has(order.order_id)).length;
  // const ship = filteredOrders.filter(order => order.status==="shipped").length;


  const portals = ["Myntra", "Ajio", "TataCliq", "ShoppersStop", "Nykaa", "Shopify"];
  const portalStats = portals.map((portal) => {
    const ordersByPortal = filteredOrders.filter(order => order.channel.includes(portal)).length;
    const inventoryByPortal = filteredOrders.filter(order => order.status === "shipped" && order.channel.includes(portal)).length;
    const cuttingByPortal = filteredOrders.filter(order => order.status === "pending" && order.channel.includes(portal)).length;
    const shipByPortal = filteredOrders.filter(order => shippingOrderIds.has(order.order_id) && order.channel.includes(portal)).length;
    // const shipByPortal = filteredOrders.filter(order => order.status ==="shipped" && order.channel.includes(portal)).length;
    return { portal, ordersByPortal, inventoryByPortal, cuttingByPortal, shipByPortal };
  });

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 border-gray-200 rounded-md" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 border-gray-200 rounded-md" />
      </div>
      
      <table className="border-collapse border w-full text-center text-md text-xl">
        <thead>
          <tr className="bg-gray-100 text-center text-2xl text-blue-500">
            <th className="border border-gray-200 p-3">Portal</th>
            {portals.map((portal) => (<th key={portal} className="border p-3 border-gray-200">{portal}</th>))}
            <th className="border border-gray-200 p-3">Total Orders</th>
          </tr>
        </thead>
        <tbody>
          {["Orders", "Inventory", "Cutting", "Ship"].map((type, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border border-gray-200 p-3">{type}</td>
              {portalStats.map((stat, i) => (
                <td key={i} className="border border-gray-200 p-3">
                  {type === "Orders" ? stat.ordersByPortal : 
                   type === "Inventory" ? stat.inventoryByPortal : 
                   type === "Cutting" ? stat.cuttingByPortal : 
                   stat.shipByPortal + stat.inventoryByPortal}
                </td>
              ))}
              <td className="border border-gray-100 p-3">
                {type === "Orders" ? totalOrders :
                 type === "Inventory" ? foundInInventory :
                 type === "Cutting" ? cutting :
                 ship +foundInInventory}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpDashboard;
