const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
    try {
        await database.category.createMany({
            data: [
                { name: "Khmer" },
                { name: "English" },
                { name: "Spanish" },
                { name: "Chinese" },
                { name: "French" },
                { name: "German" },
                { name: "Italian" },
                { name: "Japanese" },
                { name: "Korean" },
                { name: "Russian" },
                { name: "Dutch" },
                { name: "Swedish" },
                { name: "Finnish" },
                { name: "Norwegian" },
                { name: "Danish" },
                { name: "Polish" },
                { name: "Turkish" },
                { name: "Hindi" },
                { name: "Bengali" },
                { name: "Punjabi" },
                { name: "Persian" },
                { name: "Indonesian" },
                { name: "Malay" },
                { name: "Vietnamese" },
                { name: "Thai" },
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
