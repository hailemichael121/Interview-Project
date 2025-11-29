// app/team/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  Trash2,
  GripVertical,
  User,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  avatar: string;
};

const initialMembers: Member[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    avatar: "JD",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    role: "member",
    avatar: "AS",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "member",
    avatar: "BJ",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "member",
    avatar: "EW",
  },
];

function DraggableRow({
  member,
  isSelected,
  onSelect,
  isOwner,
  onRemove,
}: {
  member: Member;
  isSelected: boolean;
  onSelect: () => void;
  isOwner: boolean;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={isSelected ? "selected" : undefined}
      className="hover:bg-light-100 dark:hover:bg-[hsl(var(--hover-700)] transition-colors"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing rounded p-1 hover:bg-light-200 dark:hover:bg-[hsl(var(--hover-700))]"
          >
            <GripVertical className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm font-medium">
              {member.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[hsl(var(--foreground))]">
              {member.name}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {member.email}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant={member.role === "owner" ? "default" : "secondary"}
          className={
            member.role === "owner"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              : ""
          }
        >
          {member.role === "owner" && <Crown className="h-3 w-3 mr-1" />}
          {member.role}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        {isOwner && member.role !== "owner" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={() => onRemove(member.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "owner">("member");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isOwner = true;
  const ownersCount = members.filter((m) => m.role === "owner").length;

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSendInvite = () => {
    console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
    setInviteEmail("");
    setInviteRole("member");
    setIsInviteOpen(false);
  };

  const handleCancelInvite = () => {
    setInviteEmail("");
    setInviteRole("member");
    setIsInviteOpen(false);
  };

  return (
    <DashboardLayout>
      {/* Ensure main content container uses responsive padding and maxWidth */}
      <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
            Team
          </h1>
          <p className="mt-2 text-lg text-[hsl(var(--muted-foreground))]">
            Manage organization members and permissions
          </p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="border-light-300 bg-[hsl(var(--card))]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.length}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Active users
              </p>
            </CardContent>
          </Card>

          <Card className="border-light-300 bg-[hsl(var(--card))]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ownersCount}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Full access
              </p>
            </CardContent>
          </Card>

          <Card className="border-light-300 bg-[hsl(var(--card))]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Awaiting acceptance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card className="border-light-300 bg-[hsl(var(--card))]">
          <CardHeader className="flex items-center justify-between flex-row">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {members.length} members • Drag to reorder
              </p>
            </div>

            {isOwner && (
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>

                {/* --- DIALOG CONTENT FIXES: WIDER & BACKGROUND --- */}
                <DialogContent
                  // Increased width for desktop screens: sm:max-w-[425px] -> sm:max-w-lg (512px)
                  className="sm:max-w-lg p-0 border-none rounded-xl shadow-2xl overflow-hidden 
                             bg-[hsl(var(--background))]"
                >
                  <DialogHeader className="p-6 border-b border-[hsl(var(--border))]">
                    <DialogTitle className="text-xl font-semibold">
                      Invite Team Member
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[hsl(var(--muted-foreground))]">
                      Send an invitation to join your organization.
                    </DialogDescription>
                    <DialogClose />
                  </DialogHeader>

                  {/* Form Body */}
                  <div className="p-6 space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value) =>
                          setInviteRole(value as "member" | "owner")
                        }
                      >
                        <SelectTrigger id="invite-role" className="h-11">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        {/* FIX: Set explicit background for SelectContent */}
                        <SelectContent className="bg-[hsl(var(--popover))]">
                          <SelectItem value="member" className="py-2">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                              <div>
                                <p className="font-medium">Member</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                  Can view and edit content
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="owner" className="py-2">
                            <div className="flex items-center gap-3">
                              <Crown className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="font-medium">Owner</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                  Full access + manage members
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Footer (Buttons) */}
                  <DialogFooter className="flex flex-row justify-end gap-3 p-6 border-t border-[hsl(var(--border))]">
                    <Button
                      variant="outline"
                      onClick={handleCancelInvite}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendInvite}
                      className="h-10"
                      disabled={!inviteEmail || !inviteEmail.includes("@")}
                    >
                      Send Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-light-300 overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[hsl(var(--muted)/0.3)]">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={members.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {members.map((member) => (
                        <DraggableRow
                          key={member.id}
                          member={member}
                          isSelected={selectedRows.has(member.id)}
                          onSelect={() => toggleRow(member.id)}
                          isOwner={isOwner}
                          onRemove={removeMember}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
