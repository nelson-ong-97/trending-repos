import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepoFiltersProps {
  search: string;
  language: string | undefined;
  onSearchChange: (value: string) => void;
  onLanguageChange: (value: string | undefined) => void;
  availableLanguages: string[];
}

export default function RepoFilters({
  search,
  language,
  onSearchChange,
  onLanguageChange,
  availableLanguages,
}: RepoFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Language Filter */}
      <div className="sm:w-48">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {language || "All Languages"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onLanguageChange(undefined)}
              className={!language ? "bg-accent" : ""}
            >
              All Languages
            </DropdownMenuItem>
            {availableLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={language === lang ? "bg-accent" : ""}
              >
                {lang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

