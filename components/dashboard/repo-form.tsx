"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format, getYear, setYear, getMonth, setMonth } from "date-fns";
import {
  CalendarIcon,
  Trash2,
  Plus,
  Github,
  ArrowRight,
  Sparkles,
  Clock,
  Coins,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCoinsStore } from "@/lib/stores/coins-store";
import { useSession } from "next-auth/react";

export function RepoForm() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [keepOriginalDates, setKeepOriginalDates] = useState(true);
  const {
    coins: userCoins,
    setCoins,
    loading: isLoadingCoins,
    decrementCoins,
  } = useCoinsStore();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    source_repo: "",
    dest_repo: "",
    start_date: "",
    end_date: format(new Date(), "yyyy-MM-dd"),
    contributors: [""],
    keep_original_dates: true,
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Calendar navigation state
  const [startCalendarView, setStartCalendarView] = useState<Date>(new Date());
  const [endCalendarView, setEndCalendarView] = useState<Date>(new Date());

  // Generate years for dropdown (current year - 15 to current year + 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 18 }, (_, i) => currentYear - 15 + i);

  // Month names for dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch user's GitHub username
  useEffect(() => {
    async function fetchGithubUsername() {
      if (!session?.accessToken) return;

      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setGithubUsername(profile.login);
        }
      } catch (error) {
        console.error("Error fetching GitHub profile:", error);
      }
    }

    fetchGithubUsername();
  }, [session?.accessToken]);

  // Fetch user's coins
  useEffect(() => {
    async function fetchUserCoins() {
      if (userCoins !== null) return; // Skip if we already have coins data

      try {
        const response = await fetch("/api/user/coins");
        if (response.ok) {
          const data = await response.json();
          setCoins(data.coins);
        }
      } catch (error) {
        console.error("Failed to fetch user coins:", error);
      }
    }

    fetchUserCoins();
  }, [userCoins, setCoins]);

  // Calculate coin costs
  const dateCost = 2;
  const contributorCostPerUser = 2;

  // Calculate total cost based on selected features
  const calculateTotalCost = () => {
    let total = 0;
    if (!keepOriginalDates) total += dateCost;

    // Count non-empty contributors
    const contributorCount = formData.contributors.filter(
      (c) => c.trim() !== ""
    ).length;
    if (contributorCount > 0) {
      total += contributorCount * contributorCostPerUser;
    }

    return total;
  };

  const totalCost = calculateTotalCost();
  const hasEnoughCoins = userCoins !== null && userCoins >= totalCost;

  // Count non-empty contributors for display
  const contributorCount = formData.contributors.filter(
    (c) => c.trim() !== ""
  ).length;
  const contributorCost = contributorCount * contributorCostPerUser;

  // Validate destination repo belongs to the user
  const validateDestRepo = (repoUrl: string) => {
    if (!repoUrl || !githubUsername) return true;

    try {
      const url = new URL(repoUrl);
      if (url.hostname !== "github.com") return true;

      const pathParts = url.pathname.split("/");
      if (pathParts.length < 3) return true;

      const repoOwner = pathParts[1].toLowerCase();
      return repoOwner.toLowerCase() === githubUsername.toLowerCase();
    } catch (error) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear validation error when user edits the destination repo
    if (name === "dest_repo") {
      setValidationError(null);

      // Validate destination repo as user types
      if (value && githubUsername && !validateDestRepo(value)) {
        setValidationError(
          `Destination repository must belong to your GitHub account (${githubUsername})`
        );
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleKeepOriginalDatesChange = (checked: boolean) => {
    setKeepOriginalDates(checked);
    setFormData({
      ...formData,
      keep_original_dates: checked,
    });
  };

  const handleContributorChange = (index: number, value: string) => {
    const updatedContributors = [...formData.contributors];
    updatedContributors[index] = value;
    setFormData({
      ...formData,
      contributors: updatedContributors,
    });
  };

  const addContributor = () => {
    setFormData({
      ...formData,
      contributors: [...formData.contributors, ""],
    });
  };

  const removeContributor = (index: number) => {
    const updatedContributors = formData.contributors.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      contributors: updatedContributors.length ? updatedContributors : [""],
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setFormData({
        ...formData,
        start_date: format(date, "yyyy-MM-dd"),
      });
      // Update the calendar view to match the selected date
      setStartCalendarView(date);
    } else {
      setFormData({
        ...formData,
        start_date: "",
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      setFormData({
        ...formData,
        end_date: format(date, "yyyy-MM-dd"),
      });
      // Update the calendar view to match the selected date
      setEndCalendarView(date);
    }
  };

  // Calendar navigation handlers
  const handleStartYearChange = (year: string) => {
    const newDate = setYear(startCalendarView, Number.parseInt(year));
    setStartCalendarView(newDate);
  };

  const handleStartMonthChange = (month: string) => {
    const monthIndex = months.findIndex((m) => m === month);
    if (monthIndex !== -1) {
      const newDate = setMonth(startCalendarView, monthIndex);
      setStartCalendarView(newDate);
    }
  };

  const handleEndYearChange = (year: string) => {
    const newDate = setYear(endCalendarView, Number.parseInt(year));
    setEndCalendarView(newDate);
  };

  const handleEndMonthChange = (month: string) => {
    const monthIndex = months.findIndex((m) => m === month);
    if (monthIndex !== -1) {
      const newDate = setMonth(endCalendarView, monthIndex);
      setEndCalendarView(newDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.source_repo || !formData.dest_repo) {
      setMessage({
        type: "error",
        text: "Source and destination repositories are required",
      });
      return;
    }

    // Validate destination repo belongs to the user
    if (
      formData.dest_repo &&
      githubUsername &&
      !validateDestRepo(formData.dest_repo)
    ) {
      setValidationError(
        `Destination repository must belong to your GitHub account (${githubUsername})`
      );
      setMessage({
        type: "error",
        text: `Destination repository must belong to your GitHub account (${githubUsername})`,
      });
      return;
    }

    // Check if user has enough coins for premium features
    if (totalCost > 0 && !hasEnoughCoins) {
      setMessage({
        type: "error",
        text: `Not enough coins. You need ${totalCost} coins for the selected premium features.`,
      });
      return;
    }

    // Filter out empty contributors
    const filteredContributors = formData.contributors.filter(
      (c) => c.trim() !== ""
    );

    // Prepare data for submission
    const dataToSubmit = {
      ...formData,
      contributors: filteredContributors,
      // If start_date is not provided, use a random date from the past year
      start_date:
        formData.start_date ||
        format(
          new Date(
            Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
          ),
          "yyyy-MM-dd"
        ),
    };

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/transfer-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        const data = await response.json();

        // Update local coin count if coins were spent
        if (data.coinsSpent && data.coinsSpent > 0) {
          decrementCoins(data.coinsSpent);
        }

        setMessage({
          type: "success",
          text: `Repository data submitted successfully! ${
            data.coinsSpent ? `(${data.coinsSpent} coins spent)` : ""
          }`,
        });

        // Reset form after successful submission
        setFormData({
          source_repo: "",
          dest_repo: "",
          start_date: "",
          end_date: format(new Date(), "yyyy-MM-dd"),
          contributors: [""],
          keep_original_dates: true,
        });
        setStartDate(undefined);
        setKeepOriginalDates(true);
        setValidationError(null);
      } else {
        const errorData = await response.json().catch(() => null);

        // If error is due to insufficient coins, update the UI
        if (response.status === 402 && errorData?.requiredCoins) {
          setCoins(errorData.userCoins);
          setMessage({
            type: "error",
            text: `Not enough coins. You need ${errorData.requiredCoins} coins for this operation.`,
          });
        } else {
          setMessage({
            type: "error",
            text:
              errorData?.message ||
              `Error: ${response.status} ${response.statusText}`,
          });
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to submit: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card bg-noise max-w-3xl mx-auto w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          Repository Transfer Settings
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-4">
          {message && (
            <Alert
              className={cn(
                "border-0 glass-card",
                message.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-200"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
              )}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Coin Status */}
          <div className="flex items-center justify-between p-3 rounded-md bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-medium text-indigo-200">
                  Your Coins
                </h3>
                <p className="text-xs text-indigo-300/70">
                  {isLoadingCoins
                    ? "Loading..."
                    : `${userCoins ?? 0} available`}
                </p>
              </div>
            </div>

            {totalCost > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-indigo-200">
                  Cost: {totalCost} coins
                </span>
                <span
                  className={`text-xs ${
                    hasEnoughCoins ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {hasEnoughCoins
                    ? "Sufficient balance"
                    : "Insufficient balance"}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="source_repo"
              className="text-sm font-medium text-indigo-200"
            >
              Source Repository <span className="text-pink-400">*</span>
            </Label>
            <div className="relative">
              <Github className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
              <Input
                id="source_repo"
                name="source_repo"
                placeholder="https://github.com/username/repo.git"
                value={formData.source_repo}
                onChange={handleInputChange}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dest_repo"
              className="text-sm font-medium text-indigo-200"
            >
              Destination Repository <span className="text-pink-400">*</span>
            </Label>
            <div className="relative">
              <Github className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
              <Input
                id="dest_repo"
                name="dest_repo"
                placeholder={`https://github.com/${
                  githubUsername || "your-username"
                }/repo.git`}
                value={formData.dest_repo}
                onChange={handleInputChange}
                className={cn(
                  "glass-input pl-10",
                  validationError && "border-red-400"
                )}
                required
              />
            </div>
            {validationError ? (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <p>{validationError}</p>
              </div>
            ) : (
              <p className="text-xs text-indigo-300/70">
                {githubUsername
                  ? `Enter your repository URL (must belong to ${githubUsername}). Authentication will be handled automatically.`
                  : "Enter the standard GitHub repository URL. Your authentication will be handled automatically."}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 py-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Switch
                      id="keep-original-dates"
                      checked={keepOriginalDates}
                      onCheckedChange={handleKeepOriginalDatesChange}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                    <Label
                      htmlFor="keep-original-dates"
                      className="text-sm font-medium text-indigo-200 flex items-center ml-2"
                    >
                      <Clock className="mr-2 h-4 w-4 text-indigo-300" />
                      Keep original repository dates
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Turning this off costs {dateCost} coins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!keepOriginalDates && (
              <div className="flex items-center ml-2 text-amber-400">
                <Coins className="h-4 w-4 mr-1" />
                <span className="text-xs">{dateCost} coins</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-4",
              keepOriginalDates && "opacity-50"
            )}
          >
            <div className="space-y-2">
              <Label
                htmlFor="start_date"
                className="text-sm font-medium text-indigo-200"
              >
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-input",
                      !startDate && "text-muted-foreground",
                      "hover:border-indigo-500/50 transition-colors"
                    )}
                    disabled={
                      keepOriginalDates || (totalCost > 0 && !hasEnoughCoins)
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-300" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border border-indigo-500/30 bg-background/95 backdrop-blur-md rounded-lg shadow-lg"
                  align="start"
                  side="bottom"
                >
                  <div className="p-3 border-b border-indigo-500/20">
                    <h3 className="text-sm font-medium text-indigo-200">
                      Select start date
                    </h3>
                    <p className="text-xs text-indigo-300/70 mt-1">
                      Choose when to start the commit history
                    </p>
                  </div>

                  {/* Year and Month Navigation */}
                  <div className="p-3 border-b border-indigo-500/20 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <Select
                        value={months[getMonth(startCalendarView)]}
                        onValueChange={handleStartMonthChange}
                      >
                        <SelectTrigger className="h-8 w-[110px] text-xs bg-background/60 border-indigo-500/20">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 border-indigo-500/20">
                          {months.map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="text-xs"
                            >
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={getYear(startCalendarView).toString()}
                        onValueChange={handleStartYearChange}
                      >
                        <SelectTrigger className="h-8 w-[80px] text-xs bg-background/60 border-indigo-500/20">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 border-indigo-500/20 max-h-[200px]">
                          {years.map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className="text-xs"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    month={startCalendarView}
                    onMonthChange={setStartCalendarView}
                    initialFocus
                    className="bg-transparent rounded-b-lg"
                    classNames={{
                      months: "p-3",
                      day_selected:
                        "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
                      day_today: "bg-indigo-100/10 text-indigo-300 font-bold",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-indigo-500/20 rounded-md",
                      day_outside: "text-muted-foreground/50 opacity-50",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-indigo-500/20",
                      table: "border-collapse space-y-1 w-full",
                      head_cell: "text-indigo-300/80 font-medium text-xs",
                      cell: "p-0 relative [&:has([aria-selected])]:bg-indigo-500/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                      caption:
                        "flex justify-center pt-1 relative items-center text-indigo-200 px-2",
                      nav_button_previous:
                        "absolute left-1 bg-transparent hover:bg-indigo-500/20 p-1 rounded-md",
                      nav_button_next:
                        "absolute right-1 bg-transparent hover:bg-indigo-500/20 p-1 rounded-md",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="end_date"
                className="text-sm font-medium text-indigo-200"
              >
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal glass-input hover:border-indigo-500/50 transition-colors"
                    disabled={
                      keepOriginalDates || (totalCost > 0 && !hasEnoughCoins)
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-300" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border border-indigo-500/30 bg-background/95 backdrop-blur-md rounded-lg shadow-lg"
                  align="start"
                  side="bottom"
                >
                  <div className="p-3 border-b border-indigo-500/20">
                    <h3 className="text-sm font-medium text-indigo-200">
                      Select end date
                    </h3>
                    <p className="text-xs text-indigo-300/70 mt-1">
                      Choose when to end the commit history
                    </p>
                  </div>

                  {/* Year and Month Navigation */}
                  <div className="p-3 border-b border-indigo-500/20 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <Select
                        value={months[getMonth(endCalendarView)]}
                        onValueChange={handleEndMonthChange}
                      >
                        <SelectTrigger className="h-8 w-[110px] text-xs bg-background/60 border-indigo-500/20">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 border-indigo-500/20">
                          {months.map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="text-xs"
                            >
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={getYear(endCalendarView).toString()}
                        onValueChange={handleEndYearChange}
                      >
                        <SelectTrigger className="h-8 w-[80px] text-xs bg-background/60 border-indigo-500/20">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 border-indigo-500/20 max-h-[200px]">
                          {years.map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className="text-xs"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    month={endCalendarView}
                    onMonthChange={setEndCalendarView}
                    initialFocus
                    className="bg-transparent rounded-b-lg"
                    classNames={{
                      months: "p-3",
                      day_selected:
                        "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
                      day_today: "bg-indigo-100/10 text-indigo-300 font-bold",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-indigo-500/20 rounded-md",
                      day_outside: "text-muted-foreground/50 opacity-50",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-indigo-500/20",
                      table: "border-collapse space-y-1 w-full",
                      head_cell: "text-indigo-300/80 font-medium text-xs",
                      cell: "p-0 relative [&:has([aria-selected])]:bg-indigo-500/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                      caption:
                        "flex justify-center pt-1 relative items-center text-indigo-200 px-2",
                      nav_button_previous:
                        "absolute left-1 bg-transparent hover:bg-indigo-500/20 p-1 rounded-md",
                      nav_button_next:
                        "absolute right-1 bg-transparent hover:bg-indigo-500/20 p-1 rounded-md",
                    }}
                    fromDate={startDate || undefined}
                  />
                </PopoverContent>
              </Popover>
              {startDate && endDate && startDate > endDate && (
                <p className="text-xs text-pink-400 mt-1">
                  End date must be after start date
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label className="text-sm font-medium text-indigo-200">
                  Contributors
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ml-2">
                        <Coins className="h-4 w-4 text-amber-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Each contributor costs {contributorCostPerUser} coins
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addContributor}
                className="h-8 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20"
                disabled={
                  !hasEnoughCoins &&
                  formData.contributors.some((c) => c.trim() !== "")
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {formData.contributors.map((contributor, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-1">
                  {index === 0 &&
                    formData.contributors.some((c) => c.trim() !== "") &&
                    !hasEnoughCoins && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
                        <div className="flex items-center text-amber-400 gap-1">
                          <Lock className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Need coins
                          </span>
                        </div>
                      </div>
                    )}
                  <Input
                    value={contributor}
                    onChange={(e) =>
                      handleContributorChange(index, e.target.value)
                    }
                    placeholder="GitHub username"
                    className="glass-input"
                    disabled={
                      !hasEnoughCoins &&
                      formData.contributors.some((c) => c.trim() !== "")
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeContributor(index)}
                  className="h-10 w-10 text-indigo-300 hover:text-pink-400 hover:bg-pink-500/10"
                  disabled={formData.contributors.length === 1 && !contributor}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {contributorCount > 0 && (
              <div className="flex items-center text-amber-400 text-xs">
                <Coins className="h-3 w-3 mr-1" />
                <span>
                  {contributorCount} contributor
                  {contributorCount > 1 ? "s" : ""} × {contributorCostPerUser}{" "}
                  coins = {contributorCost} coins
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-indigo-500/10 bg-indigo-500/5 py-4">
          <button
            type="submit"
            className={cn(
              "glass-button w-full group",
              totalCost > 0 &&
                !hasEnoughCoins &&
                "opacity-70 cursor-not-allowed"
            )}
            disabled={
              isLoading ||
              (totalCost > 0 && !hasEnoughCoins) ||
              !!validationError
            }
          >
            <span className="button-glow"></span>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-indigo-50">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Sparkles className="mr-2 h-4 w-4 text-indigo-200 group-hover:animate-pulse" />
                <span className="text-indigo-50">Submit Transfer</span>
                <ArrowRight className="ml-2 h-4 w-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
