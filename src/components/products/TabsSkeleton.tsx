
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const TabsSkeleton = () => {
  return (
    <div className="mt-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-md w-full md:w-1/2">
        <Skeleton className="h-9 flex-1 rounded-sm" />
        <Skeleton className="h-9 flex-1 rounded-sm" />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="border-t pt-6 space-y-4">
             <Skeleton className="h-7 w-1/3" />
             <Skeleton className="h-10 w-1/2" />
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-10 w-1/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
