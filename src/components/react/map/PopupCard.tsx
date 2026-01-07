import { Popup } from "react-map-gl/maplibre";
import type { FTCEvent, Team } from "@/content.config";
import { X, ArrowRight, Bot, Calendar, MapPin, Trophy } from "lucide-react";

interface PopupCardProps {
  content: Team | FTCEvent;
  year: number;
  onCloseCallback: () => void;
}

// Configuration for dynamic styling based on FTCEvent typeName
const EVENT_THEMES: Record<
  string,
  { color: string; darkColor: string; icon: any }
> = {
  Championship: {
    color: "bg-purple-600",
    darkColor: "dark:bg-purple-900/80",
    icon: Trophy,
  },
  Qualifier: {
    color: "bg-blue-600",
    darkColor: "dark:bg-blue-900/80",
    icon: Calendar,
  },
  Default: {
    color: "bg-teal-600",
    darkColor: "dark:bg-emerald-900/80",
    icon: Bot,
  },
};

export default function PopupCard({
  content,
  year,
  onCloseCallback,
}: PopupCardProps) {
  const isTeam = "number" in content;

  // Determine dynamic styles
  const theme = !isTeam
    ? EVENT_THEMES[content.typeName] || EVENT_THEMES.Default
    : EVENT_THEMES.Default;

  const Icon = theme.icon;

  // Extract varying data points
  const displayInfo = isTeam
    ? {
        subtitle: content.number,
        labelLeft: "Organisation",
        valueLeft: content.org,
        labelRight: "Rookie Year",
        valueRight: content.rookieYear,
        url: `https://ftc-events.firstinspires.org/${year}/team/${content.number}`,
      }
    : {
        subtitle: content.typeName,
        labelLeft: "Venue",
        valueLeft: content.venue,
        labelRight: "Date",
        valueRight: getDateString(content.dateStart, content.dateEnd),
        url: `https://ftc-events.firstinspires.org/${year}/${content.code}`,
      };

  return (
    <>
      <style>{`
        .maplibregl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
        .maplibregl-popup-tip { display: none !important; }
      `}</style>

      <Popup
        longitude={content.coords.lng}
        latitude={content.coords.lat}
        anchor="top"
        onClose={onCloseCallback}
        closeButton={false}
        maxWidth="none"
      >
        <div className="relative w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* Dynamic Header */}
          <div
            className={`relative h-32 w-full p-6 transition-colors ${theme.color} ${theme.darkColor}`}
          >
            <div className="absolute right-4 bottom-2 opacity-10">
              <Icon size={80} strokeWidth={1.5} color="white" />
            </div>

            <div className="relative z-10 flex justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                  {content.name}
                </h2>
                <p className="text-sm font-medium text-white/80">
                  {displayInfo.subtitle}
                </p>
              </div>

              <button
                onClick={onCloseCallback}
                className="group relative -mr-2 -mt-2 flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90"
                aria-label="Close"
              >
                <div className="absolute inset-0 scale-0 rounded-full bg-white/10 transition-transform group-hover:scale-100" />
                <X
                  size={18}
                  className="relative z-10 text-white/50 transition-colors group-hover:text-white"
                />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-500">
                  {displayInfo.labelLeft}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 line-clamp-1">
                  {displayInfo.valueLeft}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-500">
                  {displayInfo.labelRight}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  {displayInfo.valueRight}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-teal-600 bg-transparent py-2.5 text-sm font-bold text-teal-600 transition-all hover:bg-teal-600 hover:text-white dark:border-emerald-500 dark:text-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-zinc-900 cursor-pointer"
                onClick={() => window.open(displayInfo.url, "_blank")}
              >
                VIEW DETAILS
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
}

function getDateString(startDate: Date, endDate: Date): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatter.formatRange(startDate, endDate);
}
