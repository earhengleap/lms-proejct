// app/api/bank-accounts/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON data instead of FormData
    const body = await request.json();
    const { bankName, accountName, accountNumber, publisherId, qrCodeUrl } = body;

    // Validate required fields
    if (!bankName || !accountName || !accountNumber || !publisherId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create bank account record
    const bankAccount = await db.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        publisherId,
        qrCodeUrl: qrCodeUrl || undefined, // Only include if URL was provided
      },
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch bank accounts for a publisher
export async function GET(
  request: Request,
  { params }: { params: { publisherId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.publisherId) {
      return NextResponse.json(
        { error: "Publisher ID is required" },
        { status: 400 }
      );
    }

    const bankAccounts = await db.bankAccount.findMany({
      where: {
        publisherId: params.publisherId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bankAccounts);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}