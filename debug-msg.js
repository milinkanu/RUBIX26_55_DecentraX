const mongoose = require('mongoose');

const uri = "mongodb+srv://milin:milin123@cluster0.rpophvc.mongodb.net/lostandfound?appName=Cluster0";

const messageSchema = new mongoose.Schema({
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    senderEmail: String,
    content: String,
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect(uri);
        console.log("Connected.");

        // 1. Find ANY unread message
        console.log("\nSearching for unread messages...");
        const unread = await Message.findOne({ isRead: { $ne: true } }).lean();

        if (!unread) {
            console.log("No unread messages found in DB!");
            return;
        }

        console.log("Found unread message:", unread);
        console.log("ClaimID Type:", typeof unread.claimId);
        console.log("ClaimID toString:", unread.claimId.toString());

        const claimId = unread.claimId.toString();
        const userEmail = "some-other-email@test.com"; // Pseudo email to ensure we don't block ourselves if we were the sender

        // 2. Simulate the Mark Read Query
        // We want to mark this message as read.
        // Condition: senderEmail != userEmail.
        // Let's pretend we are the receiver.
        // Receiver Email = (anyone who is NOT the sender).

        const sender = unread.senderEmail;
        const fakeReceiver = "receiver@test.com";

        console.log(`\nTesting Query with:`);
        console.log(`ClaimId: ${claimId} (cast to ObjectId)`);
        console.log(`UserEmail (Receiver): ${fakeReceiver}`);
        console.log(`Sender in DB: ${sender}`);

        const filter = {
            claimId: new mongoose.Types.ObjectId(claimId),
            senderEmail: { $ne: fakeReceiver }, // If I am receiver, sender is NOT me. Match!
            isRead: { $ne: true }
        };

        const count = await Message.countDocuments(filter);
        console.log(`\nMatches found with filter: ${count}`);

        if (count === 0) {
            console.log("❌ FILTER FAILED TO MATCH!");

            // Debugging why
            console.log("Check 1: ClaimID Match?");
            const c1 = await Message.countDocuments({ claimId: new mongoose.Types.ObjectId(claimId) });
            console.log(`- ID match count: ${c1}`);

            console.log("Check 2: Sender Email match?");
            const c2 = await Message.countDocuments({ senderEmail: { $ne: fakeReceiver } }); // Should be huge
            console.log(`- Sender match count (approx): ${c2}`);

            console.log("Check 3: isRead match?");
            const c3 = await Message.countDocuments({ _id: unread._id, isRead: { $ne: true } });
            console.log(`- isRead match count: ${c3}`);
        } else {
            console.log("✅ Filter matches! The query logic is correct.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
