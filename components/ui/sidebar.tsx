"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  toggleSidebar: () => void;
  setCollapsed: (collapse: boolean) => void;
  isOpen: boolean;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultCollapsed = false, children, className, style }, ref) => {
    const [isOpen, setIsOpen] = React.useState(!defaultCollapsed);
    const isMobile = useIsMobile();

    // On mobile, sidebar is always collapsed by default
    React.useEffect(() => {
      if (isMobile) {
        setIsOpen(false);
      }
    }, [isMobile]);

    const toggleSidebar = React.useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const setCollapsed = React.useCallback((collapsed: boolean) => {
      setIsOpen(!collapsed);
    }, []);

    return (
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setCollapsed,
          isOpen,
        }}
      >
        <TooltipProvider>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isOpen, toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();

    // For mobile with offcanvas collapsible, render a Sheet component
    if (isMobile && collapsible === "offcanvas") {
      return (
        <React.Fragment>
          {/* Main button to toggle sidebar */}
          <Button
            size="icon"
            variant="ghost"
            className="z-10 absolute top-3 left-3"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {/* Mobile Sheet sidebar */}
          <Sheet open={isOpen} onOpenChange={(open) => toggleSidebar()}>
            <SheetContent
              className="p-0 bg-sidebar w-full max-w-[var(--sidebar-width-mobile)]"
              side={side}
            >
              <nav className="flex flex-col h-full overflow-hidden">
                {children}
              </nav>
            </SheetContent>
          </Sheet>
        </React.Fragment>
      );
    }

    // For desktop, render an expandable sidebar
    const state = isOpen ? "open" : "collapsed";

    return (
      <React.Fragment>
        {/* This preserves the space when sidebar is collapsible */}
        <nav
          ref={ref}
          className="group peer hidden md:block text-sidebar-foreground"
          data-state={state}
          data-collapsible={state === "collapsed" ? collapsible : ""}
          data-variant={variant}
          data-side={side}
        >
          {/* This is what handles the sidebar gap on desktop */}
          <div
            className={cn(
              "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset"
                ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
                : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
            )}
          />
          <div
            className={cn(
              "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
              side === "left"
                ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset"
                ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
                : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            )}
            {...props}
          >
            <div
              data-sidebar="sidebar"
              className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
            >
              {children}
            </div>
          </div>
        </nav>

        {/* Mobile sidebar toggle button (absolute positioned) */}
        {collapsible !== "none" && (
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden absolute top-3 left-3 z-10"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
      </React.Fragment>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 overflow-auto py-2",
        "scrollbar-none", // Hide scrollbar on all browsers
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background w-full",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      ref={ref}
      onClick={toggleSidebar}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
});
SidebarToggle.displayName = "SidebarToggle";

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item list-none", className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-[#2D1B69] hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-[#2D1B69] active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-[#2D1B69] data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-[#2D1B69] data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-7 text-xs",
        default: "h-8",
        lg: "h-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SidebarMenuLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  active?: boolean;
}

const SidebarMenuLink = React.forwardRef<
  HTMLAnchorElement,
  SidebarMenuLinkProps
>(({ active, size, asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-link"
      data-active={active}
      data-size={size}
      className={cn(
        sidebarMenuButtonVariants({ size }),
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuLink.displayName = "SidebarMenuLink";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarToggle,
};
