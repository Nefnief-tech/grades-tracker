import { NextResponse } from "next/server";
import {
  databases,
  DATABASE_ID,
  MAINTENANCE_COLLECTION_ID,
  serverID,
} from "@/lib/appwrite-server";

const MAINTENANCE_DOCUMENT_ID = "maintenance"; // Single document to store settings

async function ensureCollectionExists() {
  try {
    // Check if collection exists by trying to list documents
    await databases.listDocuments(DATABASE_ID, MAINTENANCE_COLLECTION_ID);
    console.log(`Collection ${MAINTENANCE_COLLECTION_ID} exists`);
  } catch (error) {
    console.log(`Error checking collection: ${error.toString()}`);
    // If collection doesn't exist, create it
    if (
      error
        .toString()
        .includes("Collection with the requested ID could not be found")
    ) {
      try {
        console.log(
          `Creating collection ${MAINTENANCE_COLLECTION_ID} in database ${DATABASE_ID}`
        );
        await databases.createCollection(
          DATABASE_ID,
          MAINTENANCE_COLLECTION_ID,
          "Maintenance Settings"
        );

        console.log("Collection created, adding attributes");
        // Create required attributes
        await databases.createBooleanAttribute(
          DATABASE_ID,
          MAINTENANCE_COLLECTION_ID,
          "enabled",
          true, // required
          false // default value
        );

        await databases.createStringAttribute(
          DATABASE_ID,
          MAINTENANCE_COLLECTION_ID,
          "message",
          500, // max length
          false, // not required
          "" // default value
        );

        await databases.createDatetimeAttribute(
          DATABASE_ID,
          MAINTENANCE_COLLECTION_ID,
          "updatedAt",
          false, // not required
          new Date().toISOString() // default value
        );

        // Wait a bit for the collection to be ready
        console.log("Waiting for collection to be ready");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Collection should be ready now");
      } catch (createError) {
        console.error("Failed to create maintenance collection:", createError);
        throw createError;
      }
    } else {
      throw error;
    }
  }
}

export async function GET() {
  try {
    // Ensure collection exists
    await ensureCollectionExists();

    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        MAINTENANCE_COLLECTION_ID,
        MAINTENANCE_DOCUMENT_ID
      );

      return NextResponse.json({
        isMaintenanceMode: document.enabled,
        maintenanceMessage: document.message || "Maintenance",
      });
    } catch (error) {
      console.log(`Error getting document: ${JSON.stringify(error)}`);
      // If document doesn't exist, create it with default values
      if (
        error
          .toString()
          .includes("Document with the requested ID could not be found")
      ) {
        console.log(
          `Creating initial maintenance document with ID: ${MAINTENANCE_DOCUMENT_ID}`
        );
        try {
          const created = await databases.createDocument(
            DATABASE_ID,
            MAINTENANCE_COLLECTION_ID,
            MAINTENANCE_DOCUMENT_ID,
            {
              enabled: false,
              message: "System under maintenance",
              updatedAt: new Date().toISOString(),
              createdBy: "system", // Adding the required createdBy attribute
            }
          );

          console.log(`Initial document created: ${JSON.stringify(created)}`);
          return NextResponse.json({
            isMaintenanceMode: created.enabled,
            maintenanceMessage: created.message || "Maintenance",
          });
        } catch (createError) {
          console.error(
            "Error creating initial maintenance document:",
            createError
          );
          // If creation fails, return defaults anyway
          return NextResponse.json(
            { isMaintenanceMode: false, maintenanceMessage: "Maintenance" },
            { status: 200 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching maintenance settings:", error);
    return NextResponse.json(
      { isMaintenanceMode: false, maintenanceMessage: "Maintenance" },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Log request details
    console.log("POST request to /api/admin/maintenance");

    // Ensure collection exists
    await ensureCollectionExists();

    const data = await request.json();
    console.log(`Request data: ${JSON.stringify(data)}`);

    // Try to update the existing document
    try {
      console.log(`Updating document ${MAINTENANCE_DOCUMENT_ID}`);
      const updated = await databases.updateDocument(
        DATABASE_ID,
        MAINTENANCE_COLLECTION_ID,
        MAINTENANCE_DOCUMENT_ID,
        {
          enabled: !!data.isMaintenanceMode,
          message: data.maintenanceMessage || "",
          updatedAt: new Date().toISOString(),
          // No need to include createdBy when updating
        }
      );

      console.log(`Document updated: ${JSON.stringify(updated)}`);
      return NextResponse.json({
        isMaintenanceMode: updated.enabled,
        maintenanceMessage: updated.message || "",
      });
    } catch (updateError) {
      console.log(`Update error: ${JSON.stringify(updateError)}`);

      // If update fails (document doesn't exist), create it
      if (
        updateError
          .toString()
          .includes("Document with the requested ID could not be found")
      ) {
        console.log(`Creating document ${MAINTENANCE_DOCUMENT_ID}`);
        const created = await databases.createDocument(
          DATABASE_ID,
          MAINTENANCE_COLLECTION_ID,
          MAINTENANCE_DOCUMENT_ID,
          {
            enabled: !!data.isMaintenanceMode,
            message: data.maintenanceMessage || "",
            updatedAt: new Date().toISOString(),
            createdBy: "system", // Adding the required createdBy attribute
          }
        );

        console.log(`Document created: ${JSON.stringify(created)}`);
        return NextResponse.json({
          isMaintenanceMode: created.enabled,
          maintenanceMessage: created.message || "",
        });
      }

      // Re-throw the error if it's not a "document not found" error
      console.error("Error updating maintenance document:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error updating maintenance settings:", error);
    return NextResponse.json(
      {
        error: `Failed to update maintenance settings: ${
          error.message || error
        }`,
      },
      { status: 500 }
    );
  }
}
