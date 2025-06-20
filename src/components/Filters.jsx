import { useGlobalContext } from "./ProductContext";

export default function Filters() {
  const { filters, setFilters } = useGlobalContext();

  return (
    <div className=" grid grid-cols-8 gap-4 p-4 bg-gray-100 rounded-md mb-4">
      <input
        type="text"
        placeholder="Order ID"
        className="p-2 border rounded border-gray-200 bg-yellow-500 text-white outline-0"
        value={filters.order_id || ""}
        onChange={(e) => setFilters({ ...filters, order_id: e.target.value })}
      />

      <select
        className="p-2 border rounded border-gray-200 bg-blue-500 text-white outline-0"
        value={filters.channel || ""}
        onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
      >
        <option value="">Select Channel </option>
        <option value="Myntra">Myntra </option>
        <option value="Ajio">Ajio </option>
        <option value="Tatacliq">Tatacliq </option>
        <option value="Nykaa">Nykaa </option>
        <option value="Shoppersstop">Shoppersstop </option>
        <option value="Shopify">Shopify</option>
        <option value="Sample">Sample</option>
        <option value="Tushar">Tushar</option>
        <option value="Sakshi">Sakshi</option>
        
      </select>

      <input
        type="text"
        placeholder="Style Number"
        className="p-2 border rounded border-gray-200 bg-yellow-500 text-white outline-0"
        value={filters.style_number || ""}
        onChange={(e) =>
          setFilters({ ...filters, style_number: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Search by name"
        className="p-2 border rounded border-gray-200 bg-yellow-500 text-white outline-0"
        value={filters.last_scanner || ""}
        onChange={(e) =>
          setFilters({ ...filters, last_scanner: e.target.value })
        }
      />

      <select
        className="p-2 border rounded border-gray-200 bg-blue-500 text-white outline-0"
        value={filters.location || ""}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      >
        <option value="">Select Location </option>
        <option value="Cutting Master">Cutting Master </option>
        <option value="Tailor">Tailor </option>
        <option value="Kharcha">Kharcha </option>
        <option value="Kaaj">Kaaj </option>
        <option value="Shipping Table">Shipping Table </option>
        <option value="Dhaga Cutting">Dhaga Cutting </option>
        <option value="Store Helper">Store Helper </option>
        <option value="Cutting Helper">Cutting Helper </option>
        <option value="First Checking">First Checking </option>
        <option value="Final Checking">Final Checking </option>
        <option value="Ironing & Packing">Ironing & Packing </option>
        <option value="Pattern Making">Pattern Making </option>
        <option value="Fabric Checking">Fabric Checking </option>
      </select>

      <select
        className="p-2 border rounded border-gray-200 bg-blue-500 text-white outline-0"
        value={filters.time_filter || ""}
        onChange={(e) =>
          setFilters({ ...filters, time_filter: e.target.value })
        }
      >
        <option value="">Select Time Range</option>
        <option value="last_1_hour">Last 1 Hour</option>
        <option value="last_3_hours">Last 3 Hours</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last_3_days">Last 3 Days</option>
        <option value="last_7_days">Last 7 Days</option>
        <option value="this_month">This Month</option>
      </select>

      <input
        type="date"
        className="p-2 border rounded border-gray-200 bg-yellow-500 text-white outline-0"
        value={filters.start_date || ""}
        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
      />
      <input
        type="date"
        className="p-2 border rounded border-gray-200 bg-yellow-500 text-white outline-0"
        value={filters.end_date || ""}
        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
      />
      <button
        onClick={() => setFilters({})}
        className="p-2 bg-red-500 text-white rounded"
      >
        Clear Filters
      </button>
    </div>
  );
}
