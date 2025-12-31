import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface FilterAreaProps {
  teamRegions: string[];
  oldestRookieYear: number;
  newestRookieYear: number;
  eventRegions: string[];
  eventTypes: string[];
}

export default function FilterArea(props: FilterAreaProps) {
  // For type="multiple", state must be an array of strings
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    const handleSidebarChange = (e: any) => {
      // If sidebar collapses, close all accordion sections
      if (e.detail.collapsed) {
        setValue([]);
      }
    };

    window.addEventListener("sidebar-changed", handleSidebarChange);
    return () =>
      window.removeEventListener("sidebar-changed", handleSidebarChange);
  }, []);

  const handleManualToggle = (newValues: string[]) => {
    setValue(newValues);

    // If the user opened a section (array is not empty), expand the sidebar
    if (newValues.length > 0) {
      const isCurrentlyCollapsed =
        document.documentElement.classList.contains("sidebar-collapsed");

      if (isCurrentlyCollapsed) {
        document.documentElement.classList.remove("sidebar-collapsed");
        localStorage.setItem("sidebar-collapsed", "false");

        // Notify the Toggle Button to update its icons
        window.dispatchEvent(
          new CustomEvent("sidebar-changed", {
            detail: { collapsed: false },
          })
        );
      }
    }
  };

  return (
    <div className="map-filters">
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={["team-filters", "event-filters"]}
        value={value}
        onValueChange={handleManualToggle}
      >
        <AccordionItem value="team-filters" className="px-4">
          <AccordionTrigger>
            <span className="flex items-center gap-4">
              <svg
                className="fill-zinc-600 dark:fill-zinc-400"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"></path>
              </svg>
              <span className="text-base">Teams</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ul className="ms-10">
              <li>Home Region</li>
              <li>Rookie Year</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="event-filters" className="px-4">
          <AccordionTrigger>
            <span className="  flex items-center gap-4">
              <svg
                className="fill-zinc-600 dark:fill-zinc-400"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"></path>
              </svg>
              <span className="text-base">Events</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ul className="ms-10">
              <li>Event types</li>
              <li>Region</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="outline" className="ms-14 my-2">
        Reset Filters
      </Button>
    </div>
  );
}
