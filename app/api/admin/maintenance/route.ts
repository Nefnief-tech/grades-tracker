import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const maintenanceFile = path.join(process.cwd(), "data", "maintenance.json");

export async function GET() {
  try {
    const content = await fs.readFile(maintenanceFile, "utf-8");
    const settings = JSON.parse(content);
    return NextResponse.json(settings);
  } catch (error) {
    // Return defaults if missing
    return NextResponse.json(
      { isMaintenanceMode: false, maintenanceMessage: "Maintenance" },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const settings = {
      isMaintenanceMode: !!data.isMaintenanceMode,
      maintenanceMessage: data.maintenanceMessage || "",
      updatedAt: new Date().toISOString(),
    };
    await fs.mkdir(path.dirname(maintenanceFile), { recursive: true });
    await fs.writeFile(maintenanceFile, JSON.stringify(settings, null, 2));
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update maintenance settings" },
      { status: 500 }
    );
  }
}
