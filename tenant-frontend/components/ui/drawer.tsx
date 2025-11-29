"use client";

import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent as SheetContentComp,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

// Drawer is a thin alias around Sheet but ensures a solid card background
function Drawer({ ...props }: React.ComponentProps<typeof Sheet>) {
  return <Sheet {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof SheetTrigger>) {
  return <SheetTrigger {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetContentComp>) {
  // Force an opaque card background so drawers are not transparent over backgrounds
  return (
    <SheetContentComp
      className={cn("bg-card backdrop-blur-sm", className)}
      {...props}
    >
      {children}
    </SheetContentComp>
  );
}

function DrawerHeader({ ...props }: React.ComponentProps<typeof SheetHeader>) {
  return <SheetHeader {...props} />;
}

function DrawerFooter({ ...props }: React.ComponentProps<typeof SheetFooter>) {
  return <SheetFooter {...props} />;
}

function DrawerTitle({ ...props }: React.ComponentProps<typeof SheetTitle>) {
  return <SheetTitle {...props} />;
}

function DrawerDescription({
  ...props
}: React.ComponentProps<typeof SheetDescription>) {
  return <SheetDescription {...props} />;
}

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  SheetClose as DrawerClose,
};

export default Drawer;
