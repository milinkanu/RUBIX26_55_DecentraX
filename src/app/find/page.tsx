"use client";

import { Suspense } from "react";
import { FindItem } from "@/components/FindItem";

export default function FindPage() {
    return (
        <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
            <FindItem />
        </Suspense>
    );
}
