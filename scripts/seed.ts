const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
    try {
        await database.category.createMany({
            data: [
                { name: "Khmer" },
                { name: "English" },
                { name: "Spanish" },
                { name: "China" },
                { name: "French" },
                { name: "Vietnam" },
                { name: "Thai" }
            ]
        });
        console.log("Success");
    } catch (error) {
        console.log("Error seeding the database categories", error);
    } finally {
        await database.$disconnect();
    }
}

main();
