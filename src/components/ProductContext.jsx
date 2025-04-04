import React, { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext();
const ProductContextProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [scanTracking, setScanTracing] = useState([]);
  const [scanTracking2,setScanTracing2] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading,setLoading] = useState(true);
  const[styleLoading,setStyleLoading]= useState(false);

  const MAX_RECORDS = 7000; // Limit to 5000 records per API
  const BATCH_SIZE = 500; // Fetch 500 records per batch
  const API_HEADERS = {
    "xc-token": "LsOnEY-1wS4Nqjz15D1_gxHu0pFVcmA_5LNqCAqK",
  };



  setTimeout(()=>{
    setLoading(false)
  },5000)


   // Location API Fetching (Limited to 5000 Records)
   const fetchLocation = async () => {
    let allLocations = [];
    const totalBatches = Math.ceil(MAX_RECORDS / BATCH_SIZE);

    try {
      // console.log(`📦 Fetching Locations: ${MAX_RECORDS} records in ${totalBatches} batches...`);

      for (let i = 0; i < totalBatches; i += 5) {
        const batchPromises = [];
        for (let j = 0; j < 5 && (i + j) < totalBatches; j++) {
          batchPromises.push(
            fetch(
              `https://nocodb.qurvii.com/api/v2/tables/mhhxiprapvyqjtf/records?offset=${(i + j) * BATCH_SIZE}&limit=${BATCH_SIZE}&viewId=vw7oelmdnxn5leeh`,
              { method: "GET", headers: API_HEADERS }
            ).then((res) => res.json())
          );
        }

        const batchResults = await Promise.all(batchPromises);
        const batchRecords = batchResults.flatMap((data) => data.list || []);
        allLocations = [...allLocations, ...batchRecords];

        // console.log(`✅ Locations Fetched: ${allLocations.length}/${MAX_RECORDS}`);
        if (allLocations.length >= MAX_RECORDS) break;
      }

      setScanTracing(allLocations);
      setScanTracing2(allLocations);
      // console.log(allLocations)
    } catch (error) {
      console.error("🚨 Error fetching Locations:", error);
    }
  };


  // Orders API Fetching (Limited to 5000 Records)
  const fetchOrders = async () => {
    setStyleLoading(true);
    let allOrders = [];
    const totalBatches = Math.ceil(MAX_RECORDS / BATCH_SIZE);

    try {
      // console.log(`📦 Fetching Orders: ${MAX_RECORDS} records in ${totalBatches} batches...`);

      for (let i = 0; i < totalBatches; i += 5) {
        const batchPromises = [];
        for (let j = 0; j < 5 && (i + j) < totalBatches; j++) {
          batchPromises.push(
            fetch(
              `https://nocodb.qurvii.com/api/v2/tables/m5rt138j272atfc/records?offset=${(i + j) * BATCH_SIZE}&limit=${BATCH_SIZE}&viewId=vwi961elxbm8g0gr`,
              { method: "GET", headers: API_HEADERS }
            ).then((res) => res.json())
          );
        }

        const batchResults = await Promise.all(batchPromises);
        const batchRecords = batchResults.flatMap((data) => data.list || []);
        allOrders = [...allOrders, ...batchRecords];

        // console.log(`✅ Orders Fetched: ${allOrders.length}/${MAX_RECORDS}`);
        if (allOrders.length >= MAX_RECORDS) break;
      }

      setOrders(allOrders);
      // console.log(allOrders)
      setStyleLoading(false)
    } catch (error) {
      console.error("🚨 Error fetching Orders:", error);
    }
  };

 
  
  useEffect(() => {
    fetchOrders();
    fetchLocation();
    
  }, []);

  // ✅ Filter Functionality Remains Unchanged
  const applyFilters = (data) => {
    const uniqueOrders = new Map();
    const now = new Date(); // Current timestamp

    data.forEach((item) => {
      const order = orders.find((o) => o.order_id === item.order_id) || {};
      const itemDateObj = new Date(item.scanned_timestamp);
      const itemDate = itemDateObj.toISOString().split("T")[0];

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
        isTimeMatch; 

      if (isMatch && !uniqueOrders.has(item.order_id)) {
        uniqueOrders.set(item.order_id, item);
      }
    });

    return Array.from(uniqueOrders.values());
  };

  const filteredOrders = applyFilters(scanTracking);

  return (
    <ProductContext.Provider
      value={{ orders, scanTracking: filteredOrders,scanTracking2, filters, setFilters,loading,styleLoading }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(ProductContext);
};

export { useGlobalContext, ProductContextProvider };
