"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VocabularyPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to the extractor page instead of study
		router.push("/vocabulary/extractor");
	}, [router]);

	return null;
}