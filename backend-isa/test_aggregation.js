const mongoose = require("mongoose");
require("dotenv").config();

async function testAggregation() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/isa"
    );

    const User = require("./models/user.model");

    const matchQuery = {
      role: "student",
    };

    console.log("\n🔍 Test de l'agrégation avec matchQuery:", matchQuery);

    const result = await User.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          students: [
            { $skip: 0 },
            { $limit: 10 },
            {
              $project: {
                firstName: 1,
                name: 1,
                matricule: 1,
                field: 1,
                level: 1,
                isRestricted: 1,
                verified: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    console.log("\n📊 Résultat de l'agrégation:");
    console.log("Students:", JSON.stringify(result[0].students, null, 2));
    console.log("Total:", result[0].totalCount[0]?.count || 0);

    // Test simple sans agrégation
    console.log("\n🔍 Test simple avec find:");
    const simpleFind = await User.find({ role: "student" })
      .select("firstName name matricule field level isRestricted verified")
      .lean();
    console.log("Résultat find:", simpleFind);

    await mongoose.connection.close();
    console.log("\n✅ Test terminé");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

testAggregation();
