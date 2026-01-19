import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, title, description, verify, file, category, location } = req.body;
    console.log("Received file value:", file);
    const newItem = new Item({ name, email, phone, title, description, verify, file, category, location });
    await newItem.save();
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, city, area } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (city) {
      query["location.city"] = new RegExp(`^${city}$`, "i"); // Case-insensitive exact match
    }

    if (area) {
      query["location.area"] = new RegExp(area, "i"); // Case-insensitive partial match
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
