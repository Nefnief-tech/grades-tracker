/**
 * Fallback data provider for the substitute plan service
 * Used when the API is unavailable
 */

import { SubstitutePlanResponse } from './substitute-plan-service';

/**
 * Sample substitute plan data that can be used as a fallback
 * when the API is not accessible
 */
export const FALLBACK_DATA: SubstitutePlanResponse = {
  success: true,
  timestamp: new Date().toISOString().replace(/:/g, '-'),
  speech: "Fallback substitute plan data is being displayed because the API is currently unavailable.",
  rawData: "Mo., 26.05.2025 - KW 22\nStd.\tVertretung\tFach\tRaum\tInfo\n1.\tTI\t F  F\tBIB\tRaumänderungF-SA\n2.\tTI\t M  F\tBIB\tSondereinsatzF-SA\nDi., 27.05.2025 - KW 22\nStd.\tVertretung\tFach\tRaum\tInfo\n5.\tEB\t PhÜ(NTG)  PhÜ(NTG)\t219\tBetreuungganze Klasse\n6.\tEB\t PhÜ(NTG)  PhÜ(NTG)\t219\tBetreuungganze Klasse\n7.\t \tWR\t312\tentfällt\n8.\t \tWR\t312\tentfällt\nMi., 28.05.2025 - KW 22\nStd.\tVertretung\tFach\tRaum\tInfo\n4.\tBO\t Ber  E\t312\tSondereinsatzE-SA 10D\n4.\tGU\tEth\t501\tRaumänderung\nStand: 23.05.2025 13:27:02\n\nDer hier dargestellte Vertretungsplan ist unverbindlich. Kurzfristige Änderungen sind jederzeit möglich."
};