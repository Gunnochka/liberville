/*
  ДАНІ КВАРТИР (демо).
  Щоб наповнити каталог реальними квартирами — заміни масив нижче
  (можна згенерувати з твого Excel/CSV).
  Поля кожної квартири:
    rooms   — кількість кімнат (1, 2, 3, 4)
    area    — площа, м²
    floor   — поверх
    section — секція ("S01"–"S04")
    price   — ціна в $ (число) або null, якщо «за запитом»
    status  — "available" (вільна) або "reserved" (заброньована)
*/
window.FLATS = [
  // 1-кімнатні
  { rooms: 1, area: 40, floor: 2,  section: "S01", price: null, status: "available" },
  { rooms: 1, area: 42, floor: 3,  section: "S01", price: null, status: "available" },
  { rooms: 1, area: 44, floor: 4,  section: "S02", price: null, status: "reserved"  },
  { rooms: 1, area: 45, floor: 5,  section: "S02", price: null, status: "available" },
  { rooms: 1, area: 46, floor: 6,  section: "S03", price: null, status: "available" },
  { rooms: 1, area: 48, floor: 7,  section: "S03", price: null, status: "available" },
  { rooms: 1, area: 43, floor: 8,  section: "S04", price: null, status: "reserved"  },
  // 2-кімнатні
  { rooms: 2, area: 60, floor: 2,  section: "S01", price: null, status: "available" },
  { rooms: 2, area: 62, floor: 3,  section: "S01", price: null, status: "available" },
  { rooms: 2, area: 64, floor: 5,  section: "S02", price: null, status: "available" },
  { rooms: 2, area: 66, floor: 6,  section: "S02", price: null, status: "reserved"  },
  { rooms: 2, area: 68, floor: 7,  section: "S03", price: null, status: "available" },
  { rooms: 2, area: 70, floor: 8,  section: "S03", price: null, status: "available" },
  { rooms: 2, area: 72, floor: 9,  section: "S04", price: null, status: "available" },
  // 3-кімнатні
  { rooms: 3, area: 86, floor: 6,  section: "S01", price: null, status: "available" },
  { rooms: 3, area: 89, floor: 7,  section: "S02", price: null, status: "available" },
  { rooms: 3, area: 95, floor: 9,  section: "S03", price: null, status: "reserved"  },
  { rooms: 3, area: 98, floor: 10, section: "S01", price: null, status: "available" },
  // 4-кімнатна
  { rooms: 4, area: 120, floor: 10, section: "S01", price: null, status: "available" }
];
