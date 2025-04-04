import React, { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext();
const ProductContextProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [scanTracking, setScanTracing] = useState([]);
  const [filters, setFilters] = useState({});


  // f7yY9CWWvyMEm8AmtGgNxZI_EkMeNNPmTHIE8Jn5

  // orders api fetching
  const fetchOrders = async () => {
    const options = {
      method: "GET",
      headers: {
        "xc-token": "LsOnEY-1wS4Nqjz15D1_gxHu0pFVcmA_5LNqCAqK",
      },
    };
    const response = await fetch(
      "https://nocodb.qurvii.com/api/v2/tables/m5rt138j272atfc/records?offset=0&limit=10000&where=&viewId=vwi961elxbm8g0gr",
      options
    );

    const result = await response.json();
    setOrders(result.list || []);
    console.log("Orders api", result.list);
  };

  const fetchLocation = async () => {
    const options = {
      method: "GET",
      headers: {
        "xc-token": "LsOnEY-1wS4Nqjz15D1_gxHu0pFVcmA_5LNqCAqK",
      },
    };
    const response = await fetch(
      "https://nocodb.qurvii.com/api/v2/tables/mhhxiprapvyqjtf/records?offset=0&limit=10000&where=&viewId=vw7oelmdnxn5leeh",
      options
    );

    const result = await response.json();
    setScanTracing(result.list || []);
    console.log("Location api", result.list);
  };

  useEffect(() => {
    fetchOrders();
    fetchLocation();
    
  }, []);

  const applyFilters = (data) => {
    const uniqueOrders = new Map();
    const now = new Date(); // Current timestamp

    data.forEach((item) => {
      const order = orders.find((o) => o.order_id === item.order_id) || {};

      // Convert scanned timestamp to Date
      const itemDateObj = new Date(item.scanned_timestamp);
      const itemDate = itemDateObj.toISOString().split("T")[0];

      // Define filter date ranges
      const startDate = filters.start_date
        ? new Date(filters.start_date).toISOString().split("T")[0]
        : null;
      const endDate = filters.end_date
        ? new Date(filters.end_date).toISOString().split("T")[0]
        : null;

      const last1Hour = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const last3Hours = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const last3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Time-based filtering
      const isTimeMatch =
        !filters.time_filter ||
        (filters.time_filter === "last_1_hour" && itemDateObj >= last1Hour) ||
        (filters.time_filter === "last_3_hours" && itemDateObj >= last3Hours) ||
        (filters.time_filter === "today" && itemDateObj >= today) ||
        (filters.time_filter === "yesterday" &&
          itemDateObj >= yesterday &&
          itemDateObj < today) ||
        (filters.time_filter === "last_3_days" && itemDateObj >= last3Days) ||
        (filters.time_filter === "last_7_days" && itemDateObj >= last7Days) ||
        (filters.time_filter === "this_month" &&
          itemDateObj >= firstDayOfMonth);

      const isMatch =
        (!filters.order_id ||
          item.order_id?.toString().includes(filters.order_id)) &&
        (!filters.channel ||
          (order?.channel &&
            order.channel
              .toString()
              .toLowerCase()
              .includes(filters.channel.toLowerCase()))) &&
        (!filters.style_number ||
          (order?.style_number &&
            order.style_number
              .toString()
              .includes(filters.style_number.toLowerCase()))) &&
        (!filters.last_scanner ||
          (item.employees?.user_name &&
            item.employees.user_name
              .toLowerCase()
              .includes(filters.last_scanner.toLowerCase()))) &&
        (!filters.location ||
          (item.locations?.name &&
            item.locations.name
              .toLowerCase()
              .includes(filters.location.toLowerCase()))) &&
        (!filters.start_date ||
          !filters.end_date ||
          (itemDate >= startDate && itemDate <= endDate)) &&
        isTimeMatch; // Apply time filter

      if (isMatch && !uniqueOrders.has(item.order_id)) {
        uniqueOrders.set(item.order_id, item);
      }
    });

    return Array.from(uniqueOrders.values());
  };

  const filteredOrders = applyFilters(scanTracking);

  return (
    <ProductContext.Provider
      value={{orders, scanTracking: filteredOrders, filters, setFilters }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(ProductContext);
};

export { useGlobalContext, ProductContextProvider };
