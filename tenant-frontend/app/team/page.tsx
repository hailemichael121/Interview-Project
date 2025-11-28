"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Mail, Trash2, Crown, User, Send, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Mock data
const mockMembers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "JD" },
  { id: "2", name: "Alice Smith", email: "alice@example.com", role: "member", avatar: "AS" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "member", avatar: "BJ" },
];

export default function TeamPage() {
  const [members, setMembers] = useState(mockMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const handleInvite = () => {
    if (inviteEmail) {
      // In real app, call API to send invite
      console.log("Inviting:", inviteEmail, "as", inviteRole);
      setInviteEmail("");
      setInviteRole("member");
    }
  };

  const handleRemove = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const isOwner = true; // In real app, check from organization context

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 bg-[#fefefe] dark:bg-[#101111] min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your organization members and permissions
            </p>
          </div>
          
          {isOwner && (
            <Sheet>
              <SheetTrigger asChild>
                <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl bg-[#101111] border-l border-gray-800">
                <div className="h-full overflow-y-auto">
                  <SheetHeader className="text-left space-y-3 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        Invite Team Member
                      </SheetTitle>
                    </div>
                    <SheetDescription className="text-base text-gray-600 dark:text-gray-400">
                      Send an invitation to join your organization. They will receive an email with instructions.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6 mx-6" >
                <div className="space-y-3 max-w-md  w-full">
                      <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-12 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label htmlFor="role" className="text-sm font-medium text-gray-900 dark:text-white">
                        Role
                      </label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectItem value="member" className="flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <User className="h-4 w-4 text-blue-500" />
                            Member
                          </SelectItem>
                          <SelectItem value="owner" className="flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <Crown className="h-4 w-4 text-amber-500" />
                            Owner
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 transition-all duration-200 rounded-xl shadow-sm"
                        onClick={() => {
                          setInviteEmail("");
                          setInviteRole("member");
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      <Button 
                        onClick={handleInvite}
                        disabled={!inviteEmail}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 transition-all duration-300 rounded-xl"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {members.filter(m => m.role === 'owner').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Owners</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {members.filter(m => m.role === 'member').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage team members and their permissions
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                    <AvatarFallback className={
                      member.role === 'owner' 
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" 
                        : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    }>
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </p>
                      <Badge 
                        className={
                          member.role === 'owner'
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/25"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25"
                        }
                      >
                        {member.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>
                
                {isOwner && member.role !== 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                    className="h-9 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600 hover:scale-110 transition-all duration-200 rounded-lg shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}