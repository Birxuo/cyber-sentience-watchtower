import React from 'react';
import { Search, Filter, X, Clock as ClockIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AlertLevel = 'critical' | 'warning' | 'info' | 'resolved';

interface AlertsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLevels: AlertLevel[];
  onLevelChange: (levels: AlertLevel[]) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const AlertsFilter: React.FC<AlertsFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedLevels,
  onLevelChange,
  timeRange,
  onTimeRangeChange
}) => {
  const toggleLevel = (level: AlertLevel) => {
    if (selectedLevels.includes(level)) {
      onLevelChange(selectedLevels.filter(l => l !== level));
    } else {
      onLevelChange([...selectedLevels, level]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onLevelChange(['critical', 'warning', 'info', 'resolved']);
    onTimeRangeChange('all');
  };

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
  ];

  const getLevelColor = (level: AlertLevel) => {
    switch (level) {
      case 'critical': return 'bg-cyber-danger hover:bg-cyber-danger/80';
      case 'warning': return 'bg-cyber-warning hover:bg-cyber-warning/80';
      case 'info': return 'bg-cyber-primary hover:bg-cyber-primary/80';
      case 'resolved': return 'bg-cyber-success hover:bg-cyber-success/80';
    }
  };

  const hasActiveFilters = searchTerm || selectedLevels.length < 4 || timeRange !== 'all';

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyber-text/50" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 bg-cyber-dark border-cyber-primary/20 focus-visible:ring-cyber-primary"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <span>Level</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-cyber-black border border-cyber-primary/30">
            <DropdownMenuLabel>Alert Levels</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-cyber-primary/20" />
            <DropdownMenuCheckboxItem
              checked={selectedLevels.includes('critical')}
              onCheckedChange={() => toggleLevel('critical')}
            >
              Critical
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedLevels.includes('warning')}
              onCheckedChange={() => toggleLevel('warning')}
            >
              Warning
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedLevels.includes('info')}
              onCheckedChange={() => toggleLevel('info')}
            >
              Info
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedLevels.includes('resolved')}
              onCheckedChange={() => toggleLevel('resolved')}
            >
              Resolved
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Time Range</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-cyber-black border border-cyber-primary/30">
            <DropdownMenuLabel>Time Period</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-cyber-primary/20" />
            {timeRangeOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={timeRange === option.value}
                onCheckedChange={() => option.value !== timeRange && onTimeRangeChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-cyber-primary hover:text-cyber-primary hover:bg-cyber-primary/10"
          >
            Clear filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedLevels.map(level => (
            <Badge 
              key={level} 
              variant="outline"
              className={`${getLevelColor(level)} text-white border-none`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 text-white/70 hover:text-white hover:bg-transparent"
                onClick={() => toggleLevel(level)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {timeRange !== 'all' && (
            <Badge variant="outline" className="bg-cyber-primary/20 border-none">
              {timeRangeOptions.find(o => o.value === timeRange)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 text-white/70 hover:text-white hover:bg-transparent"
                onClick={() => onTimeRangeChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsFilter;
