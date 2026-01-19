import express from "express";
import Claim from "../models/Claim.js";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { itemId, claimantName, claimantEmail, answer } = req.body;
    const item = await Item.findById(itemId).select("+email +phone");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const newClaim = new Claim({
      itemId,
      finderEmail: item.email, // person who posted the item
      claimantName,
      claimantEmail,
      answer,
      status: "pending",
    });

    await newClaim.save();
    res.status(201).json(newClaim);
  } catch (error) {
    res.status(500).json({ message: "Error creating claim", error });
  }
});
router.get("/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const claims = await Claim.find({
      finderEmail: email,
      status: "pending",
    }).populate("itemId");
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: "itemId",
        select: "title description file name verify", // ❌ no phone/email
      });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claim", error });
  }
});

router.get("/:id/contact", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate({
      path: "itemId",
      select: "+phone +email",
    });


    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.status !== "approved") {
      return res.status(403).json({ message: "Claim not approved yet" });
    }

    res.json({
      phone: claim.itemId.phone,
      email: claim.itemId.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching contact details", error });
  }
});



router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error updating claim", error });
  }
});

export default router;
