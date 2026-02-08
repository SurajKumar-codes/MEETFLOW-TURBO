"use client";

import React, { useState } from "react";
import { Search, UserPlus, MoreHorizontal, Mail, Video, Users, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Person {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department?: string;
  isOnline?: boolean;
  isFavorite?: boolean;
}

// Sample people data
const samplePeople: Person[] = [
  {
    id: "1",
    name: "Calvin Verdonk",
    email: "calvin@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "Product Designer",
    department: "Design",
    isOnline: true,
    isFavorite: true,
  },
  {
    id: "2",
    name: "Van Der Sar",
    email: "vandersar@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Frontend Developer",
    department: "Engineering",
    isOnline: false,
  },
  {
    id: "3",
    name: "Windu Bakhtiar",
    email: "windu@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=13",
    role: "Backend Developer",
    department: "Engineering",
    isOnline: true,
    isFavorite: true,
  },
  {
    id: "4",
    name: "Sofa Marwa",
    email: "sofa@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=14",
    role: "Project Manager",
    department: "Management",
    isOnline: false,
  },
  {
    id: "5",
    name: "Aisyiyah Rahman",
    email: "aisyiyah@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "UI Designer",
    department: "Design",
    isOnline: true,
  },
  {
    id: "6",
    name: "Nicky Milanisty",
    email: "nicky@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=16",
    role: "DevOps Engineer",
    department: "Engineering",
    isOnline: false,
    isFavorite: true,
  },
  {
    id: "7",
    name: "Bruce Banner",
    email: "bruce@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=17",
    role: "Full Stack Developer",
    department: "Engineering",
    isOnline: true,
  },
  {
    id: "8",
    name: "Nita Kelly",
    email: "nita@meetflow.com",
    avatar: "https://i.pravatar.cc/150?img=18",
    role: "Marketing Lead",
    department: "Marketing",
    isOnline: false,
  },
];

type FilterType = "all" | "online" | "favorites";

function PersonCard({ person }: { person: Person }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-black rounded-lg md:rounded-xl p-3 md:p-4 border border-zinc-800/50 hover:border-zinc-700 transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          {person.isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-black" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white text-xs md:text-sm truncate">{person.name}</h3>
            {person.isFavorite && (
              <span className="text-yellow-500 text-xs">★</span>
            )}
          </div>
          <p className="text-[10px] md:text-xs text-primary truncate">{person.role}</p>
          <p className="text-[10px] md:text-[11px] text-zinc-500 truncate mt-0.5">{person.email}</p>
        </div>

        {/* Actions - always visible on mobile */}
        <div className={`flex items-center gap-0.5 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0 md:opacity-0'} md:group-hover:opacity-100`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
          >
            <Mail className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
          >
            <Video className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
          >
            <MoreHorizontal className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
        </div>
      </div>

      {/* Department Tag */}
      {person.department && (
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-zinc-800/50">
          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-500">
            {person.department}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredPeople = samplePeople.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "online") return matchesSearch && person.isOnline;
    if (filter === "favorites") return matchesSearch && person.isFavorite;
    return matchesSearch;
  });

  const onlineCount = samplePeople.filter(p => p.isOnline).length;
  const favoritesCount = samplePeople.filter(p => p.isFavorite).length;

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] flex flex-col p-3 md:p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-5 flex-shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">People</h1>
          <p className="text-zinc-500 text-xs md:text-sm">Manage your contacts and team members</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-9 text-sm w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5 flex-shrink-0">
        <div className="bg-black rounded-lg md:rounded-xl p-2 md:p-3 border border-zinc-800/50">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/20">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg md:text-xl font-semibold text-white">{samplePeople.length}</p>
              <p className="text-[8px] md:text-[10px] text-zinc-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-black rounded-lg md:rounded-xl p-2 md:p-3 border border-zinc-800/50">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-green-500/20">
              <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg md:text-xl font-semibold text-white">{onlineCount}</p>
              <p className="text-[8px] md:text-[10px] text-zinc-500">Online</p>
            </div>
          </div>
        </div>
        <div className="bg-black rounded-lg md:rounded-xl p-2 md:p-3 border border-zinc-800/50">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-yellow-500/20">
              <span className="text-yellow-500 text-xs md:text-sm">★</span>
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg md:text-xl font-semibold text-white">{favoritesCount}</p>
              <p className="text-[8px] md:text-[10px] text-zinc-500">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-black border-zinc-800 text-white placeholder:text-zinc-600 text-sm rounded-xl focus:border-primary/50"
          />
        </div>
        <div className="flex items-center bg-black rounded-xl p-1 border border-zinc-800 self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === "online"
                ? "bg-primary text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === "favorites"
                ? "bg-primary text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* People Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredPeople.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 pb-4">
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-zinc-700" />
              </div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">
                No people found
              </h3>
              <p className="text-zinc-600 text-xs">
                Try adjusting your search or filter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
