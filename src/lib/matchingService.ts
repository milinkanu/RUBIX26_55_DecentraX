import Item, { IItem } from "@/models/Item";
import Notification from "@/models/Notification";
import User from "@/models/User";

// Weights
const WEIGHTS = {
    CATEGORY: 0.4,
    CITY: 0.2,
    AREA: 0.1,
    KEYWORDS: 0.2,
    TIME: 0.1,
};

const THRESHOLD = 0.6; // 60%

export async function findMatchesAndNotify(newItem: IItem) {
    if (!newItem.type) return;

    const targetType = newItem.type.toLowerCase() === "lost" ? "Found" : "Lost";

    console.log(`[Matching] Service started for item: ${newItem._id} (${newItem.type}) - ${newItem.title}`);

    // 1. Initial Candidate Search (Broad Filter)
    const candidates = await Item.find({
        type: targetType,
        // "location.city": { $regex: new RegExp(`^${newItem.location.city}$`, "i") },
    }).select("+email").lean();

    console.log(`[Matching] Found ${candidates.length} candidates of type ${targetType}`);

    const matches: IItem[] = [];

    for (const candidate of candidates) {
        const score = calculateSimilarity(newItem, candidate as any);
        console.log(`[Matching] Candidate ${candidate._id} score: ${score.toFixed(2)} (Thresh: ${THRESHOLD})`);

        if (score >= THRESHOLD) {
            matches.push(candidate as any);
        }
    }

    // 2. Create Notifications
    for (const match of matches) {
        try {
            const score = calculateSimilarity(newItem, match);
            const percentage = Math.round(score * 100);

            await createNotification(newItem, match, percentage);
            await createNotification(match, newItem, percentage);
        } catch (err) {
            console.error(`[Matching] Error creating notification for match ${match._id}:`, err);
        }
    }
}

// Category Aliases for smarter matching
const CATEGORY_GROUPS = [
    ["mobile", "phone", "iphone", "smartphone", "cellphone", "android"],
    ["wallet", "purse", "pouch", "bag"],
    ["keys", "keychain", "car keys"],
    ["laptop", "computer", "macbook", "electronics"],
    ["watch", "smartwatch", "fitness band"],
];

function areCategoriesRelated(cat1: string = "", cat2: string = "") {
    const c1 = cat1.toLowerCase().trim();
    const c2 = cat2.toLowerCase().trim();
    if (c1 === c2) return true;
    return CATEGORY_GROUPS.some(group => group.includes(c1) && group.includes(c2));
}

function calculateSimilarity(item1: IItem, item2: IItem): number {
    let score = 0;

    // 1. Category (40%)
    if (areCategoriesRelated(item1.category, item2.category) ||
        areCategoriesRelated(item1.title, item2.category) ||
        areCategoriesRelated(item1.category, item2.title)) {
        score += WEIGHTS.CATEGORY;
    }

    // 2. City (20%)
    if (item1.location?.city?.trim().toLowerCase() === item2.location?.city?.trim().toLowerCase()) {
        score += WEIGHTS.CITY;
    }

    // 3. Area (10%)
    const area1 = item1.location?.area?.toLowerCase() || "";
    const area2 = item2.location?.area?.toLowerCase() || "";
    if (area1 && area2 && (area1.includes(area2) || area2.includes(area1))) {
        score += WEIGHTS.AREA;
    }

    // 4. Keywords (20%)
    const kw1 = getKeywords(item1);
    const kw2 = getKeywords(item2);

    let keywordMatches = 0;
    for (const w1 of kw1) {
        let found = false;
        for (const w2 of kw2) {
            // Check for exact match or significant substring (e.g. "phone" in "iphone")
            if (w1 === w2 || (w1.length > 3 && w2.includes(w1)) || (w2.length > 3 && w1.includes(w2))) {
                found = true;
                break;
            }
        }
        if (found) keywordMatches++;
    }

    if (kw1.length > 0) {
        const matchRatio = keywordMatches / Math.max(kw1.length, kw2.length);
        score += Math.min(matchRatio * WEIGHTS.KEYWORDS * 2, WEIGHTS.KEYWORDS);
    }

    console.log(`[Matching] Scored ${item1.title} vs ${item2.title}: ${score.toFixed(2)} (Keywords: ${keywordMatches})`);

    // 5. Time Proximity (10%)
    const timeDiff = Math.abs(new Date(item1.createdAt).getTime() - new Date(item2.createdAt).getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7) {
        score += WEIGHTS.TIME;
    } else if (daysDiff <= 30) {
        score += WEIGHTS.TIME * 0.5;
    }

    return score;
}

function getKeywords(item: IItem): string[] {
    const titleWords = (item.title || "").toLowerCase().split(/[\s,.-]+/);
    const descWords = (item.description || "").toLowerCase().split(/[\s,.-]+/);
    const manualKeywords = (item.keywords || []).map(k => k.toLowerCase());

    const allWords = [...titleWords, ...descWords, ...manualKeywords];
    const stopWords = ["the", "a", "an", "in", "on", "at", "for", "to", "of", "with", "is", "my", "i", "lost", "found", "its", "it"];

    return Array.from(new Set(allWords.filter(w => w.length > 2 && !stopWords.includes(w))));
}

async function createNotification(recipientItem: IItem, matchedItem: IItem, scorePercentage: number) {
    if (!recipientItem.email) {
        console.log(`[Matching] No email for item ${recipientItem._id}`);
        return;
    }

    const user = await User.findOne({ email: recipientItem.email });
    if (!user) {
        console.log(`[Matching] User not found for email ${recipientItem.email}`);
        return;
    }

    const exists = await Notification.findOne({
        userId: user._id,
        relatedItem: matchedItem._id,
        type: "MATCH_FOUND"
    });

    if (exists) {
        console.log(`[Matching] Notification already exists for user ${user._id}`);
        return;
    }

    await Notification.create({
        userId: user._id,
        title: `${scorePercentage}% Match Found!`,
        message: `We found a potential match for your ${recipientItem.category || "item"}. The item "${matchedItem.title}" matches ${scorePercentage}% of your criteria.`,
        relatedItem: matchedItem._id,
        sourceItem: recipientItem._id,
        type: "MATCH_FOUND"
    });
    console.log(`[Matching] Notification created for user ${user._id} (${scorePercentage}%)`);
}
