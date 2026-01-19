import { Suspense } from "react";
import { PostItem } from "@/components/PostItem";

export default function PostPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>}>
            <PostItem />
        </Suspense>
    );
}
