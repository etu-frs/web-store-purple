"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const ProductCardSkeleton = () => {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="aspect-square w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-baseline">
            <Skeleton className="h-6 w-1/4 mr-2" />
            <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-5 w-2/3" />
        <div className="space-y-1 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};
