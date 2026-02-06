// LocEssentials Introductions - Server
require("dotenv").config();

const path = require("path");
const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("./assets/js/db.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static(path.join(__dirname)));

async function getCollection(name) {
  const db = await connectDB();
  return db.collection(name);
}

const defaultFilterOptions = {
  profileTypes: [
    { value: "real-life", label: "Us In Real Life" },
    { value: "alter-ego", label: "Our Alter Egos" }
  ],
  languages: [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" }
  ],
  groups: []
};

function normalizeProfilePayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const { timestamp, submitted, profiles } = payload;
  if (!profiles || (!profiles.en && !profiles.es)) return null;
  return {
    timestamp: timestamp || new Date().toISOString(),
    submitted: Boolean(submitted),
    profiles
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/pending-profiles", async (req, res) => {
  try {
    const pending = await getCollection("pending_profiles");
    const results = await pending.find({}).sort({ createdAt: -1 }).toArray();
    res.json(results);
  } catch (error) {
    console.error("Failed to load pending profiles:", error);
    res.status(500).json({ error: "Failed to load pending profiles." });
  }
});

app.get("/api/accepted-profiles", async (req, res) => {
  try {
    const accepted = await getCollection("accepted_profiles");
    const results = await accepted.find({}).sort({ acceptedAt: -1 }).toArray();
    res.json(results);
  } catch (error) {
    console.error("Failed to load accepted profiles:", error);
    res.status(500).json({ error: "Failed to load accepted profiles." });
  }
});

app.get("/api/filter-options", async (req, res) => {
  try {
    const filters = await getCollection("filter_options");
    const doc = await filters.findOne({ _id: "global" });
    if (!doc) {
      await filters.updateOne(
        { _id: "global" },
        { $set: { ...defaultFilterOptions, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json(defaultFilterOptions);
    }
    const { _id, ...rest } = doc;
    res.json({
      profileTypes: rest.profileTypes || defaultFilterOptions.profileTypes,
      languages: rest.languages || defaultFilterOptions.languages,
      groups: rest.groups || []
    });
  } catch (error) {
    console.error("Failed to load filter options:", error);
    res.status(500).json({ error: "Failed to load filter options." });
  }
});

app.put("/api/filter-options", async (req, res) => {
  try {
    const { profileTypes, languages, groups } = req.body || {};
    const filters = await getCollection("filter_options");

    const payload = {
      profileTypes: Array.isArray(profileTypes) ? profileTypes : defaultFilterOptions.profileTypes,
      languages: Array.isArray(languages) ? languages : defaultFilterOptions.languages,
      groups: Array.isArray(groups) ? groups : [],
      updatedAt: new Date()
    };

    await filters.updateOne({ _id: "global" }, { $set: payload }, { upsert: true });
    res.json(payload);
  } catch (error) {
    console.error("Failed to update filter options:", error);
    res.status(500).json({ error: "Failed to update filter options." });
  }
});

app.post("/api/pending-profiles", async (req, res) => {
  try {
    const payload = normalizeProfilePayload(req.body);
    if (!payload) {
      return res.status(400).json({ error: "Invalid profile payload." });
    }

    const pending = await getCollection("pending_profiles");
    const doc = {
      ...payload,
      status: "pending",
      createdAt: new Date()
    };
    const result = await pending.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error("Failed to save pending profile:", error);
    res.status(500).json({ error: "Failed to save pending profile." });
  }
});

app.post("/api/pending-profiles/:id/accept", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const pending = await getCollection("pending_profiles");
    const accepted = await getCollection("accepted_profiles");

    const pendingDoc = await pending.findOne({ _id: id });
    if (!pendingDoc) {
      return res.status(404).json({ error: "Pending profile not found." });
    }

    const { _id, ...rest } = pendingDoc;
    const acceptedDoc = {
      ...rest,
      status: "accepted",
      acceptedAt: new Date()
    };

    await accepted.updateOne({ _id }, { $set: acceptedDoc }, { upsert: true });
    await pending.deleteOne({ _id });

    res.json({ _id, ...acceptedDoc });
  } catch (error) {
    console.error("Failed to accept profile:", error);
    res.status(500).json({ error: "Failed to accept profile." });
  }
});

app.post("/api/accepted-profiles/:id/move-to-pending", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const accepted = await getCollection("accepted_profiles");
    const pending = await getCollection("pending_profiles");

    const acceptedDoc = await accepted.findOne({ _id: id });
    if (!acceptedDoc) {
      return res.status(404).json({ error: "Accepted profile not found." });
    }

    const { _id, ...rest } = acceptedDoc;
    const pendingDoc = {
      ...rest,
      status: "pending",
      createdAt: new Date()
    };

    await pending.updateOne({ _id }, { $set: pendingDoc }, { upsert: true });
    await accepted.deleteOne({ _id });

    res.json({ _id, ...pendingDoc });
  } catch (error) {
    console.error("Failed to move profile to pending:", error);
    res.status(500).json({ error: "Failed to move profile to pending." });
  }
});

app.delete("/api/pending-profiles/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const pending = await getCollection("pending_profiles");
    const result = await pending.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Pending profile not found." });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete pending profile:", error);
    res.status(500).json({ error: "Failed to delete pending profile." });
  }
});

app.delete("/api/accepted-profiles/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const accepted = await getCollection("accepted_profiles");
    const result = await accepted.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Accepted profile not found." });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete accepted profile:", error);
    res.status(500).json({ error: "Failed to delete accepted profile." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
