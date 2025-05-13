"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, Save, Undo } from "lucide-react";
import { 
  ThemeConfig, ThemePreset, ColorScheme, 
  presetThemes, colorSchemes, defaultThemeConfig 
} from "@/lib/theme-config";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WikiHeading } from "@/components/ui/wiki-heading";

export default function ThemesPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [currentSettings, setCurrentSettings] = useState<ThemeConfig>({
    ...defaultThemeConfig
  });
    
  // Load current settings when component mounts
  useEffect(() => {
    if (theme) {
      setCurrentSettings(theme);
      
      // If we have custom colors in theme, initialize those
      if (theme.customColors) {
        setCustomColors(theme.customColors);
      }
    }
  }, [theme]);
  
  // Custom color state
  const [customColors, setCustomColors] = useState({
    primary: '#3366cc', // Wiki blue
    background: '#f8f9fa', // Wiki background
    card: '#ffffff',
    accent: '#eaecf0', // Wiki accent
    text: '#202122', // Wiki text
  });
  
  // Set which color is being edited currently
  const [editingColor, setEditingColor] = useState<null | keyof typeof customColors>(null);
  
  // Handler for changing preset
  const handlePresetChange = (preset: ThemePreset) => {
    const presetConfig = presetThemes[preset];
    setCurrentSettings({
      ...currentSettings,
      ...presetConfig,
      preset,
    });
  };
  
  // Handler for changing color scheme
  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setCurrentSettings({
      ...currentSettings,
      colorScheme,
      // When changing color scheme, we're no longer using custom colors
      customColors: undefined
    });
  };
  
  // Handler for applying theme changes
  const applyThemeChanges = () => {
    // Apply custom colors if using custom theme
    let themeToApply = {...currentSettings};
    if (currentSettings.preset === 'custom') {
      themeToApply.customColors = customColors;
    }
    
    // Update theme in context
    setTheme(themeToApply);
    
    toast({
      title: "Theme updated",
      description: "Your theme settings have been saved.",
    });
  };
  
  // Reset theme to defaults
  const resetTheme = () => {
    setCurrentSettings(defaultThemeConfig);
    setCustomColors({
      primary: '#3366cc',
      background: '#f8f9fa',
      card: '#ffffff',
      accent: '#eaecf0',
      text: '#202122',
    });
    toast({
      title: "Theme reset",
      description: "Theme settings have been reset to defaults.",
    });
  };
  
  // Apply custom color
  const applyCustomColor = (color: string) => {
    if (!editingColor) return;
    
    const updatedColors = {
      ...customColors,
      [editingColor]: color
    };
    
    setCustomColors(updatedColors);
    setCurrentSettings({
      ...currentSettings,
      preset: 'custom',
      customColors: updatedColors
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium wiki-heading pb-1">Theme Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of your Grade Tracker app.
        </p>
      </div>
      
      <Separator />
      
      {/* Theme presets */}
      <Card className="bg-gradient-to-b from-white to-[#f8f9fa] border-[#c8ccd1]">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Theme Preset</CardTitle>
          <CardDescription>Choose a pre-defined theme style</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(Object.keys(presetThemes) as ThemePreset[]).map(preset => (
              <div 
                key={preset}
                className={`
                  rounded-md border p-4 cursor-pointer relative theme-preview-card
                  ${currentSettings.preset === preset ? 'border-[#3366cc] ring-2 ring-[#3366cc]/20' : 'border-[#c8ccd1]'}
                `}
                onClick={() => handlePresetChange(preset)}
              >
                <div className={`w-full h-12 mb-2 rounded ${getPresetPreviewClass(preset)}`}></div>
                <p className="text-sm font-medium text-center capitalize">{preset}</p>
                
                {currentSettings.preset === preset && (
                  <div className="absolute top-2 right-2 bg-[#3366cc] rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Color scheme */}
      <Card className="bg-gradient-to-b from-white to-[#f8f9fa] border-[#c8ccd1]">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Color Scheme</CardTitle>
          <CardDescription>Select your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-4">
            {(Object.keys(colorSchemes) as ColorScheme[]).map(color => (
              <div
                key={color}
                className={`
                  flex flex-col items-center cursor-pointer
                `}
                onClick={() => handleColorSchemeChange(color)}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-full border-2 color-swatch
                    ${currentSettings.colorScheme === color ? 'ring-2 ring-offset-2 ring-[#3366cc]' : ''}
                  `}
                  style={{ backgroundColor: colorSchemes[color].primary, borderColor: colorSchemes[color].hover }}
                >
                  {currentSettings.colorScheme === color && (
                    <div className="flex items-center justify-center h-full">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 capitalize">{color}</span>
              </div>
            ))}
          </div>
          
          {currentSettings.preset === 'custom' && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 font-serif">Custom Colors</h4>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <button
                      className={`
                        w-12 h-12 rounded-full border-2
                        ${editingColor === key ? 'ring-2 ring-offset-2 ring-[#3366cc]' : ''}
                      `}
                      style={{ backgroundColor: value }}
                      onClick={() => setEditingColor(key as keyof typeof customColors)}
                    ></button>
                    <span className="text-xs mt-1 capitalize">{key}</span>
                  </div>
                ))}
              </div>
              
              {editingColor && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 capitalize font-serif">{editingColor} Color</h5>
                  {/* Simple color picker until we install react-colorful */}
                  <input 
                    type="color" 
                    value={customColors[editingColor]} 
                    onChange={(e) => applyCustomColor(e.target.value)}
                    className="w-full h-10 mb-2" 
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm uppercase">{customColors[editingColor]}</p>
                    <Button size="sm" variant="outline" onClick={() => setEditingColor(null)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Border Radius */}
      <Card className="bg-gradient-to-b from-white to-[#f8f9fa] border-[#c8ccd1]">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Border Radius</CardTitle>
          <CardDescription>Choose the roundness of elements</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentSettings.radius}
            onValueChange={(value) => 
              setCurrentSettings({
                ...currentSettings, 
                radius: value as ThemeConfig['radius']
              })
            }
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            <div>
              <RadioGroupItem value="none" id="radius-none" className="sr-only" />
              <Label
                htmlFor="radius-none"
                className={`
                  border rounded-none p-4 flex items-center justify-center cursor-pointer
                  ${currentSettings.radius === 'none' ? 'border-[#3366cc] bg-[#eaf3ff]' : 'border-[#c8ccd1]'}
                `}
              >
                None
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="sm" id="radius-sm" className="sr-only" />
              <Label
                htmlFor="radius-sm"
                className={`
                  border rounded-sm p-4 flex items-center justify-center cursor-pointer
                  ${currentSettings.radius === 'sm' ? 'border-[#3366cc] bg-[#eaf3ff]' : 'border-[#c8ccd1]'}
                `}
              >
                Small
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="md" id="radius-md" className="sr-only" />
              <Label
                htmlFor="radius-md"
                className={`
                  border rounded-md p-4 flex items-center justify-center cursor-pointer
                  ${currentSettings.radius === 'md' ? 'border-[#3366cc] bg-[#eaf3ff]' : 'border-[#c8ccd1]'}
                `}
              >
                Medium
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="lg" id="radius-lg" className="sr-only" />
              <Label
                htmlFor="radius-lg"
                className={`
                  border rounded-lg p-4 flex items-center justify-center cursor-pointer
                  ${currentSettings.radius === 'lg' ? 'border-[#3366cc] bg-[#eaf3ff]' : 'border-[#c8ccd1]'}
                `}
              >
                Large
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="full" id="radius-full" className="sr-only" />
              <Label
                htmlFor="radius-full"
                className={`
                  border rounded-full p-4 flex items-center justify-center cursor-pointer
                  ${currentSettings.radius === 'full' ? 'border-[#3366cc] bg-[#eaf3ff]' : 'border-[#c8ccd1]'}
                `}
              >
                Full
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Font Selection */}
      <Card className="bg-gradient-to-b from-white to-[#f8f9fa] border-[#c8ccd1]">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Font</CardTitle>
          <CardDescription>Choose a font family for the app</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={currentSettings.font}
            onValueChange={(value) => 
              setCurrentSettings({
                ...currentSettings,
                font: value as ThemeConfig['font']
              })
            }
          >
            <SelectTrigger className="w-full border-[#c8ccd1]">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Default</SelectItem>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="poppins">Poppins</SelectItem>
              <SelectItem value="nunito">Nunito</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-6 p-4 border rounded-md border-[#c8ccd1]" style={{ fontFamily: getFontPreview(currentSettings.font) }}>
            <p className="font-bold text-lg mb-2">The quick brown fox jumps over the lazy dog</p>
            <p>This is a preview of the {currentSettings.font === 'system' ? 'system default' : currentSettings.font} font.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Animations toggle */}
      <Card className="bg-gradient-to-b from-white to-[#f8f9fa] border-[#c8ccd1]">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Animations</CardTitle>
          <CardDescription>Control UI animation effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentSettings.animations}
              onCheckedChange={(checked) => 
                setCurrentSettings({
                  ...currentSettings,
                  animations: checked
                })
              }
              id="animations-toggle"
            />
            <Label htmlFor="animations-toggle">Enable animations</Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex space-x-2 justify-end theme-actions">
        <Button variant="outline" onClick={resetTheme} className="border-[#c8ccd1]">
          <Undo className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={applyThemeChanges} className="bg-[#3366cc] hover:bg-[#2a4b8d] text-white">
          <Save className="mr-2 h-4 w-4" /> Save Theme
        </Button>
      </div>
    </div>
  );
}

// Helper function for theme preset preview CSS classes
function getPresetPreviewClass(preset: ThemePreset): string {
  switch (preset) {
    case 'default':
      return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'wiki':
      return 'bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-300';
    case 'minimal':
      return 'bg-gray-100 border border-gray-200';
    case 'neumorphic':
      return 'bg-gray-100 shadow-[inset_5px_5px_10px_rgba(0,0,0,0.1),_inset_-5px_-5px_10px_rgba(255,255,255,0.8)]';
    case 'glassmorphic':
      return 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur border border-white/20';
    case 'dark':
      return 'bg-gray-800';
    case 'light':
      return 'bg-white border border-gray-200';
    case 'custom':
      return 'bg-gradient-to-r from-pink-500 to-orange-400';
    default:
      return 'bg-blue-500';
  }
}

// Helper function for font preview
function getFontPreview(font: string): string {
  switch (font) {
    case 'system':
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    case 'inter':
      return 'Inter, system-ui, sans-serif';
    case 'roboto':
      return 'Roboto, system-ui, sans-serif';
    case 'poppins':
      return 'Poppins, system-ui, sans-serif';
    case 'nunito':
      return 'Nunito, system-ui, sans-serif';
    default:
      return 'system-ui, sans-serif';
  }
}