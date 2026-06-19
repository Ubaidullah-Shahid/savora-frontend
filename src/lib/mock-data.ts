export type Category = "Starters" | "Mains" | "Fast Food" | "Drinks" | "Desserts";

export interface MenuItem {
  _id?: string;   // MongoDB id (present after backend fetch)
  id: string; name: string; description: string;
  price: number; category: Category; image: string;
  rating: number; prepTime: number; popular?: boolean;
}

export const categories: Category[] = ["Starters","Mains","Fast Food","Drinks","Desserts"];

// All images use the Unsplash "source" proxy which works without an API key
// The ?q=80&w=800 params help with loading speed
const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

// Verified working Unsplash photo IDs (June 2025)
export const menuItems: MenuItem[] = [
  {
    id: "1", name: "Truffle Mushroom Risotto",
    description: "Creamy arborio rice with wild mushrooms, shaved truffle and parmesan.",
    price: 18.5, category: "Mains", rating: 4.9, prepTime: 22, popular: true,
    image: u("photo-1476124369491-e7addf5db371"),
  },
  {
    id: "2", name: "Wood-Fired Margherita",
    description: "San Marzano tomato, fior di latte mozzarella, fresh basil.",
    price: 14.0, category: "Mains", rating: 4.8, prepTime: 15, popular: true,
    image: u("photo-1604068549290-dea0e4a305ca"),
  },
  {
    id: "3", name: "Smash Burger",
    description: "Double beef patty, aged cheddar, house sauce, brioche bun.",
    price: 12.5, category: "Fast Food", rating: 4.7, prepTime: 12, popular: true,
    image: u("photo-1568901346375-23c9450c58cd"),
  },
  {
    id: "4", name: "Crispy Calamari",
    description: "Lightly fried squid with lemon aioli and fresh herbs.",
    price: 10.0, category: "Starters", rating: 4.6, prepTime: 10,
    image: u("photo-1599487488170-d11ec9c172f0"),
  },
  {
    id: "5", name: "Burrata & Heirloom",
    description: "Creamy burrata, colourful heirloom tomatoes, basil oil, sourdough toast.",
    price: 13.0, category: "Starters", rating: 4.8, prepTime: 8,
    image: u("photo-1571877227200-a0d98ea607e9"),
  },
  {
    id: "6", name: "Tiramisu Classico",
    description: "Espresso-soaked ladyfingers, mascarpone cream, dusted cocoa.",
    price: 8.5, category: "Desserts", rating: 4.9, prepTime: 5, popular: true,
    image: u("photo-1606313564200-e75d5e30476c"),
  },
  {
    id: "7", name: "Molten Chocolate Cake",
    description: "Warm dark chocolate lava cake with vanilla bean ice cream.",
    price: 9.0, category: "Desserts", rating: 4.8, prepTime: 12,
    image: u("photo-1551024709-8f23befc6f87"),
  },
  {
    id: "8", name: "Aperol Spritz",
    description: "Aperol, prosecco, soda water, fresh orange slice.",
    price: 9.5, category: "Drinks", rating: 4.7, prepTime: 3,
    image: u("photo-1461023058943-07fcbe16d735"),
  },
  {
    id: "9", name: "Cold Brew Coffee",
    description: "24-hour cold-extracted single origin, served over ice.",
    price: 5.0, category: "Drinks", rating: 4.6, prepTime: 2,
    image: u("photo-1573080496219-bb080dd4f877"),
  },
  {
    id: "10", name: "Loaded Fries",
    description: "Hand-cut fries, melted cheddar, smoked bacon, pickled jalapeños.",
    price: 8.0, category: "Fast Food", rating: 4.5, prepTime: 10,
    image: u("photo-1467003909585-2f8a72700288"),
  },
  {
    id: "11", name: "Grilled Atlantic Salmon",
    description: "Pan-seared salmon fillet, lemon butter sauce, seasonal greens.",
    price: 22.0, category: "Mains", rating: 4.9, prepTime: 18,
    image: u("photo-1565299585323-38d6b0865b47"),
  },
  {
    id: "12", name: "Chicken Tikka Wrap",
    description: "Spiced chicken tikka, mint yoghurt, pickled onions, soft naan.",
    price: 11.0, category: "Fast Food", rating: 4.6, prepTime: 9,
    image: u("photo-1565299624946-b28f40a0ca4b"),
  },
];

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Served";

export interface Order {
  id: string; customer: string; table?: number;
  items: { name: string; qty: number; price: number; notes?: string }[];
  total: number; status: OrderStatus; placedAt: string;
  type: "Dine-in" | "Delivery" | "Takeaway";
}

export const orders: Order[] = [
  { id:"ORD-1042", customer:"Amelia Stone",   table:4, type:"Dine-in",  placedAt:"2m ago",  status:"Preparing",       total:37.5, items:[{name:"Truffle Risotto",qty:1,price:18.5},{name:"Aperol Spritz",qty:2,price:9.5}] },
  { id:"ORD-1043", customer:"Marco Bellini",         type:"Delivery",  placedAt:"Just now",status:"Pending",         total:33,   items:[{name:"Smash Burger",qty:2,price:12.5,notes:"No onions"},{name:"Loaded Fries",qty:1,price:8}] },
  { id:"ORD-1044", customer:"Yuki Tanaka",    table:7, type:"Dine-in",  placedAt:"8m ago",  status:"Ready",           total:31,   items:[{name:"Margherita",qty:1,price:14},{name:"Tiramisu",qty:2,price:8.5}] },
  { id:"ORD-1045", customer:"Sara Khan",             type:"Delivery",  placedAt:"22m ago", status:"Out for Delivery",total:27,   items:[{name:"Grilled Salmon",qty:1,price:22},{name:"Cold Brew",qty:1,price:5}] },
  { id:"ORD-1046", customer:"Liam O'Connor",  table:2, type:"Dine-in",  placedAt:"1h ago",  status:"Served",          total:24,   items:[{name:"Burrata",qty:1,price:13},{name:"Chicken Tikka Wrap",qty:1,price:11}] },
  { id:"ORD-1047", customer:"Priya Mehta",           type:"Takeaway",  placedAt:"2h ago",  status:"Delivered",       total:28,   items:[{name:"Calamari",qty:1,price:10},{name:"Molten Cake",qty:2,price:9}] },
];

export type TableStatus = "Available" | "Occupied" | "Reserved";
export interface RTable { id:number; seats:number; status:TableStatus; guest?:string }

export const tables: RTable[] = [
  { id:1, seats:2, status:"Available" },
  { id:2, seats:4, status:"Occupied",  guest:"Liam O'Connor" },
  { id:3, seats:2, status:"Reserved",  guest:"Chen 7:30pm" },
  { id:4, seats:6, status:"Occupied",  guest:"Amelia Stone" },
  { id:5, seats:4, status:"Available" },
  { id:6, seats:2, status:"Reserved",  guest:"Patel 8:00pm" },
  { id:7, seats:4, status:"Occupied",  guest:"Yuki Tanaka" },
  { id:8, seats:8, status:"Available" },
];

export const customers = [
  { id:"C-01", name:"Amelia Stone",   email:"amelia@mail.com",  orders:24, spent:612 },
  { id:"C-02", name:"Marco Bellini",  email:"marco@mail.com",   orders:18, spent:489 },
  { id:"C-03", name:"Yuki Tanaka",    email:"yuki@mail.com",    orders:31, spent:892 },
  { id:"C-04", name:"Sara Khan",      email:"sara@mail.com",    orders:12, spent:305 },
  { id:"C-05", name:"Liam O'Connor",  email:"liam@mail.com",    orders:9,  spent:248 },
  { id:"C-06", name:"Priya Mehta",    email:"priya@mail.com",   orders:22, spent:540 },
];

export const salesData = [
  { day:"Mon", sales:1240, orders:42 },
  { day:"Tue", sales:1580, orders:51 },
  { day:"Wed", sales:1320, orders:47 },
  { day:"Thu", sales:1820, orders:58 },
  { day:"Fri", sales:2480, orders:78 },
  { day:"Sat", sales:3120, orders:96 },
  { day:"Sun", sales:2650, orders:84 },
];

export const testimonials = [
  { name:"Sofia R.",  text:"The truffle risotto is unreal. Best meal I've had this year.",             rating:5 },
  { name:"James K.",  text:"Cozy atmosphere, attentive staff — the smash burger is a 10/10.",          rating:5 },
  { name:"Aria P.",   text:"We come back every Friday. The tiramisu alone is worth the trip.",         rating:5 },
];
