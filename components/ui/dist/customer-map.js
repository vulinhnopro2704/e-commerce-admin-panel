"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var dynamic_1 = require("next/dynamic");
var card_1 = require("@/components/ui/card");
// Dynamically import map components to avoid SSR issues
var MapContainer = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.MapContainer; }); }, { ssr: false });
var TileLayer = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.TileLayer; }); }, { ssr: false });
var CircleMarker = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.CircleMarker; }); }, { ssr: false });
var Popup = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.Popup; }); }, { ssr: false });
var Tooltip = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.Tooltip; }); }, { ssr: false });
var ZoomControl = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.ZoomControl; }); }, { ssr: false });
var Rectangle = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("react-leaflet"); }).then(function (mod) { return mod.Rectangle; }); }, { ssr: false });
function CustomerMap(_a) {
    var customers = _a.customers, _b = _a.height, height = _b === void 0 ? "400px" : _b;
    var _c = react_1.useState(false), isClient = _c[0], setIsClient = _c[1];
    react_1.useEffect(function () {
        setIsClient(true);
        // Load Leaflet CSS
        if (typeof window !== "undefined") {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }
    }, []);
    // Function to get circle size based on customer count
    var getCircleSize = function (count) {
        if (count < 5000)
            return 8;
        if (count < 5200)
            return 12;
        if (count < 5350)
            return 16;
        return 20;
    };
    // Function to get circle color based on customer count
    var getCircleColor = function (count) {
        if (count < 5000)
            return "#3B82F6"; // Blue
        if (count < 5200)
            return "#EAB308"; // Yellow
        if (count < 5350)
            return "#F97316"; // Orange
        return "#EF4444"; // Red
    };
    // Function to get circle opacity based on customer count
    var getCircleOpacity = function (count) {
        var maxCount = Math.max.apply(Math, customers.map(function (c) { return c.count; }));
        return Math.max(0.4, count / maxCount);
    };
    if (!isClient) {
        return (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Customer Distribution Map"),
                React.createElement(card_1.CardDescription, null, "Geographic distribution of customers across Vietnam")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "flex items-center justify-center bg-gray-100 rounded-lg", style: { height: height } },
                    React.createElement("div", { className: "text-gray-500" }, "Loading map...")))));
    }
    // Vietnam center coordinates - adjusted to include all territories
    var vietnamCenter = [14.058, 110.2772];
    // Set bounds for Vietnam territory including Hoang Sa and Truong Sa
    var vietnamBounds = [
        [6.0, 102.0],
        [23.5, 118.0] // Northeast corner - expanded to include Hoang Sa
    ];
    // Coordinates for highlighting important Vietnamese territories
    var hoangSaCoords = [
        [15.5, 111.0],
        [17.0, 113.0]
    ];
    var truongSaCoords = [
        [8.0, 111.5],
        [12.0, 117.5]
    ];
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Customer Distribution Map"),
            React.createElement(card_1.CardDescription, null,
                "Geographic distribution of ",
                customers.length,
                " customer locations across Vietnam territory")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { style: { height: height }, className: "rounded-lg overflow-hidden border" },
                React.createElement(MapContainer, { center: vietnamCenter, zoom: 5, style: { height: "100%", width: "100%" }, scrollWheelZoom: true, maxBounds: vietnamBounds, minZoom: 5, maxZoom: 10, zoomControl: false, attributionControl: false, bounds: vietnamBounds },
                    React.createElement(TileLayer, { url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" }),
                    React.createElement(ZoomControl, { position: "topright" }),
                    React.createElement(Rectangle, { bounds: hoangSaCoords, pathOptions: { color: '#10B981', weight: 1, fillOpacity: 0.1 } },
                        React.createElement(Tooltip, { direction: "center", permanent: true, opacity: 0.9 },
                            React.createElement("div", { className: "text-center" },
                                React.createElement("div", { className: "font-semibold text-xs" }, "Ho\u00E0ng Sa"),
                                React.createElement("div", { className: "text-xs text-gray-600" }, "(Paracel Islands)")))),
                    React.createElement(Rectangle, { bounds: truongSaCoords, pathOptions: { color: '#10B981', weight: 1, fillOpacity: 0.1 } },
                        React.createElement(Tooltip, { direction: "center", permanent: true, opacity: 0.9 },
                            React.createElement("div", { className: "text-center" },
                                React.createElement("div", { className: "font-semibold text-xs" }, "Tr\u01B0\u1EDDng Sa"),
                                React.createElement("div", { className: "text-xs text-gray-600" }, "(Spratly Islands)")))),
                    customers.map(function (customer) { return (React.createElement(CircleMarker, { key: customer.id, center: [customer.lat, customer.lng], radius: getCircleSize(customer.count), pathOptions: {
                            color: getCircleColor(customer.count),
                            fillColor: getCircleColor(customer.count),
                            fillOpacity: getCircleOpacity(customer.count),
                            weight: 2,
                            opacity: 0.8
                        } },
                        React.createElement(Tooltip, { direction: "top", offset: [0, -10], opacity: 0.9 },
                            React.createElement("div", { className: "text-center" },
                                React.createElement("div", { className: "font-semibold text-sm" }, customer.city),
                                React.createElement("div", { className: "text-xs text-gray-600" },
                                    customer.count,
                                    " customers"))),
                        React.createElement(Popup, null,
                            React.createElement("div", { className: "p-2" },
                                React.createElement("h3", { className: "font-semibold text-sm" },
                                    "\uD83D\uDCCD ",
                                    customer.city),
                                React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, customer.address),
                                React.createElement("div", { className: "mt-2 flex items-center justify-between" },
                                    React.createElement("div", { className: "px-2 py-1 bg-purple-100 rounded text-xs" },
                                        React.createElement("strong", null, customer.count),
                                        " customers"),
                                    React.createElement("div", { className: "w-4 h-4 rounded-full border-2 border-white shadow-sm", style: { backgroundColor: getCircleColor(customer.count) } })))))); }))),
            React.createElement("div", { className: "text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2 mb-2" },
                React.createElement("strong", null, "Note:"),
                " Map displays Vietnam's full territorial claims including Ho\u00E0ng Sa (Paracel Islands) and Tr\u01B0\u1EDDng Sa (Spratly Islands)."),
            React.createElement("div", { className: "mt-4 space-y-3" },
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement("h4", { className: "text-sm font-medium text-gray-700 mb-2" }, "Customer Density"),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "flex items-center space-x-2 text-xs" },
                                React.createElement("div", { className: "w-4 h-4 bg-blue-500 rounded-full" }),
                                React.createElement("span", null, "Less than 5,000 customers")),
                            React.createElement("div", { className: "flex items-center space-x-2 text-xs" },
                                React.createElement("div", { className: "w-6 h-6 bg-yellow-500 rounded-full" }),
                                React.createElement("span", null, "5,000-5,200 customers")),
                            React.createElement("div", { className: "flex items-center space-x-2 text-xs" },
                                React.createElement("div", { className: "w-8 h-8 bg-orange-500 rounded-full" }),
                                React.createElement("span", null, "5,200-5,350 customers")),
                            React.createElement("div", { className: "flex items-center space-x-2 text-xs" },
                                React.createElement("div", { className: "w-10 h-10 bg-red-500 rounded-full" }),
                                React.createElement("span", null, "5,350+ customers")))),
                    React.createElement("div", null,
                        React.createElement("h4", { className: "text-sm font-medium text-gray-700 mb-2" }, "Statistics"),
                        React.createElement("div", { className: "space-y-1 text-xs text-gray-600" },
                            React.createElement("div", null,
                                "Total locations: ",
                                React.createElement("strong", null, customers.length)),
                            React.createElement("div", null,
                                "Total customers: ",
                                React.createElement("strong", null, customers.reduce(function (sum, c) { return sum + c.count; }, 0))),
                            React.createElement("div", null,
                                "Average per location:",
                                " ",
                                React.createElement("strong", null, Math.round(customers.reduce(function (sum, c) { return sum + c.count; }, 0) / customers.length))),
                            React.createElement("div", null,
                                "Largest location: ",
                                React.createElement("strong", null,
                                    Math.max.apply(Math, customers.map(function (c) { return c.count; })),
                                    " customers"))))),
                React.createElement("div", { className: "text-xs text-gray-500 bg-gray-50 p-2 rounded" },
                    "\uD83D\uDCA1 ",
                    React.createElement("strong", null, "Tip:"),
                    " Hover over circles to see quick info, click for detailed information. Circle size and color represent customer density.")))));
}
exports["default"] = CustomerMap;
