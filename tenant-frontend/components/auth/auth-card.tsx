import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="border-0 shadow-2xl backdrop-blur-xl">
      <CardHeader className="text-center pb-10">
        <CardTitle className="text-4xl font-bold text-muted-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}