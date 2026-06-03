"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  Timer,
  Share,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

interface Preferences {
  enabled: boolean;
  schedule_type: "fixed_days" | "days_since";
  days: number[];
  interval: number;
  reminder_hour_utc: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // Mon=1 ... Sat=6, Sun=0
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5am - 10pm

function utcToLocal(utcHour: number): number {
  const offset = new Date().getTimezoneOffset() / 60;
  return (((utcHour - offset) % 24) + 24) % 24;
}

function localToUtc(localHour: number): number {
  const offset = new Date().getTimezoneOffset() / 60;
  return (((localHour + offset) % 24) + 24) % 24;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

const DEFAULT_PREFS: Preferences = {
  enabled: false,
  schedule_type: "fixed_days",
  days: [1, 3, 5],
  interval: 2,
  reminder_hour_utc: localToUtc(9),
};

export default function SettingsPage() {
  const [supported, setSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<
    "default" | "granted" | "denied"
  >("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const savePrefs = useCallback((newPrefs: Preferences) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/push/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrefs),
        });
      } catch (e) {
        console.error("Failed to save preferences", e);
      }
    }, 500);
  }, []);

  const updatePrefs = useCallback(
    (update: Partial<Preferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...update };
        savePrefs(next);
        return next;
      });
    },
    [savePrefs]
  );

  useEffect(() => {
    const init = async () => {
      const pushSupported = isPushSupported();
      setSupported(pushSupported);

      if (pushSupported && "Notification" in window) {
        setPermissionState(
          Notification.permission as "default" | "granted" | "denied"
        );
      }

      if (pushSupported) {
        try {
          const reg = await navigator.serviceWorker.getRegistration("/sw.js");
          if (reg) {
            const sub = await reg.pushManager.getSubscription();
            setSubscribed(!!sub);
          }
        } catch {
          // Service worker not registered yet
        }
      }

      try {
        const res = await fetch("/api/push/preferences");
        if (res.ok) {
          const data = await res.json();
          setPrefs((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // Use defaults
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      if (prefs.enabled) {
        await unsubscribeFromPush();
        setSubscribed(false);
        updatePrefs({ enabled: false });
      } else {
        const sub = await subscribeToPush();
        if (sub) {
          setSubscribed(true);
          setPermissionState("granted");
          updatePrefs({ enabled: true });
        } else {
          if ("Notification" in window) {
            setPermissionState(
              Notification.permission as "default" | "granted" | "denied"
            );
          }
        }
      }
    } catch (e) {
      console.error("Toggle failed", e);
    }
    setToggling(false);
  };

  const toggleDay = (day: number) => {
    const newDays = prefs.days.includes(day)
      ? prefs.days.filter((d) => d !== day)
      : [...prefs.days, day];
    updatePrefs({ days: newDays });
  };

  const localHour = utcToLocal(prefs.reminder_hour_utc);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get reminded to hit the gym on your schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supported ? (
            <p className="text-sm text-foreground-muted">
              Push notifications are not supported in this browser.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {prefs.enabled
                      ? "Notifications enabled"
                      : "Notifications disabled"}
                  </p>
                  {subscribed && prefs.enabled && (
                    <p className="text-xs text-foreground-muted">
                      You will receive workout reminders
                    </p>
                  )}
                </div>
                <Button
                  variant={prefs.enabled ? "secondary" : "default"}
                  size="sm"
                  onClick={handleToggle}
                  disabled={toggling || permissionState === "denied"}
                >
                  {toggling ? (
                    "..."
                  ) : prefs.enabled ? (
                    <>
                      <BellOff className="h-4 w-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      Enable
                    </>
                  )}
                </Button>
              </div>

              {permissionState === "denied" && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    Notifications are blocked in your browser. Please enable them
                    in your browser settings and reload this page.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reminder Schedule */}
      {prefs.enabled && supported && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reminder Schedule
            </CardTitle>
            <CardDescription>
              Choose when you want to be reminded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <button
                onClick={() => updatePrefs({ schedule_type: "fixed_days" })}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  prefs.schedule_type === "fixed_days"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-border-hover"
                )}
              >
                <Calendar className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fixed Days</p>
                  <p className="text-xs text-foreground-muted">
                    Get reminded on specific days of the week
                  </p>
                </div>
              </button>

              <button
                onClick={() => updatePrefs({ schedule_type: "days_since" })}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  prefs.schedule_type === "days_since"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-border-hover"
                )}
              >
                <Timer className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Days Since Last Workout
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Get reminded if you haven&apos;t worked out in a while
                  </p>
                </div>
              </button>
            </div>

            {prefs.schedule_type === "fixed_days" && (
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => {
                  const dayValue = DAY_VALUES[i];
                  const active = prefs.days.includes(dayValue);
                  return (
                    <button
                      key={dayValue}
                      onClick={() => toggleDay(dayValue)}
                      className={cn(
                        "h-10 w-12 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-background-tertiary text-foreground-muted hover:bg-border-hover"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {prefs.schedule_type === "days_since" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground-muted shrink-0">
                  Remind me if I haven&apos;t worked out in
                </span>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={prefs.interval}
                  onChange={(e) =>
                    updatePrefs({
                      interval: Math.min(
                        7,
                        Math.max(1, Number(e.target.value) || 1)
                      ),
                    })
                  }
                  className="w-16 text-center"
                />
                <span className="text-sm text-foreground-muted">days</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reminder Time */}
      {prefs.enabled && supported && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reminder Time
            </CardTitle>
            <CardDescription>
              What time should we send your reminder?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={localHour}
              onChange={(e) =>
                updatePrefs({
                  reminder_hour_utc: localToUtc(Number(e.target.value)),
                })
              }
            >
              {HOURS.map((h) => (
                <SelectOption key={h} value={h}>
                  {formatHour(h)}
                </SelectOption>
              ))}
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Add to Home Screen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Add to Home Screen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-foreground-muted">
            For the best experience and to receive notifications on iOS, add
            GymSesh to your home screen.
          </p>
          <p className="text-xs text-foreground-muted">
            In Safari, tap the share button and select &quot;Add to Home
            Screen&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
