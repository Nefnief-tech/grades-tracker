"use client";

import React, { useEffect, useState } from "react";
import { MfaDetector } from "@/components/mfa/mfa-detector";

export default function MfaProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add any MFA-related logic here
  return (
    <>
      {/* Add the MFA detector that will show when MFA is required */}
      <MfaDetector />
      {children}
    </>
  );
}