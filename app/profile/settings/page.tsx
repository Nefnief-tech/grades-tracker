"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { HexColorPicker } from "react-colorful";
import { Check, Palette, RefreshCw, ChevronsUpDown, Save, Eye, Undo } from "lucide-react";
import { 
  ThemeConfig, ThemePreset, ColorScheme, useThemeStore, 
  presetThemes, colorSchemes, defaultThemeConfig 
} from "@/lib/theme-config";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [currentSettings, setCurrentSettings] = useState<ThemeConfig>({
    ...defaultThemeConfig
  });
  
  // Theme store from Zustand - for persistence
  const themeStore = useThemeStore();
  
  // Load current settings when component mounts
  useEffect(() => {
    setCurrentSettings(theme || themeStore.config || defaultThemeConfig);
  }, [theme, themeStore.config]);
  
  // Custom color state
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    background: '#ffffff',
    card: '#ffffff',
    accent: '#f3f4f6',
    text: '#1f2937',
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
    // Update theme in context and persist with Zustand
    setTheme(currentSettings);
    
    // Update Zustand store
    if (currentSettings.preset === 'custom') {
      themeStore.setCustomColors(currentSettings.customColors);
    }
    themeStore.setPreset(currentSettings.preset);
    themeStore.setColorScheme(currentSettings.colorScheme);
    themeStore.setRadius(currentSettings.radius);
    themeStore.setFont(currentSettings.font);
    themeStore.setAnimations(currentSettings.animations);
    
    toast({
      title: "Theme updated",
      description: "Your theme settings have been saved.",
    });
  };
  
  // Reset theme to defaults
  const resetTheme = () => {
    setCurrentSettings(defaultThemeConfig);
    setCustomColors({
      primary: '#3b82f6',
      background: '#ffffff',
      card: '#ffffff',
      accent: '#f3f4f6',
      text: '#1f2937',
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
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize your app appearance and preferences.
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="theme">
        <TabsList>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="space-y-6 mt-6">
          {/* Theme presets */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Preset</CardTitle>
              <CardDescription>Choose a pre-defined theme style</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(Object.keys(presetThemes) as ThemePreset[]).map(preset => (
                  <div 
                    key={preset}
                    className={`
                      rounded-md border p-4 cursor-pointer relative
                      ${currentSettings.preset === preset ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                    `}
                    onClick={() => handlePresetChange(preset)}
                  >
                    <div className={`w-full h-12 mb-2 rounded ${getPresetPreviewClass(preset)}`}></div>
                    <p className="text-sm font-medium text-center capitalize">{preset}</p>
                    
                    {currentSettings.preset === preset && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Color scheme */}
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
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
                        w-10 h-10 rounded-full border-2
                        ${currentSettings.colorScheme === color ? 'ring-2 ring-offset-2' : ''}
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
                  <h4 className="text-sm font-medium mb-3">Custom Colors</h4>
                  
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {Object.entries(customColors).map(([key, value]) => (
                      <div key={key} className="flex flex-col items-center">
                        <button
                          className={`
                            w-12 h-12 rounded-full border-2
                            ${editingColor === key ? 'ring-2 ring-offset-2' : ''}
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
                      <h5 className="text-sm font-medium mb-2 capitalize">{editingColor} Color</h5>
                      <HexColorPicker color={customColors[editingColor]} onChange={applyCustomColor} />
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
          <Card>
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
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
                      ${currentSettings.radius === 'none' ? 'border-primary bg-primary/5' : ''}
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
                      ${currentSettings.radius === 'sm' ? 'border-primary bg-primary/5' : ''}
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
                      ${currentSettings.radius === 'md' ? 'border-primary bg-primary/5' : ''}
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
                      ${currentSettings.radius === 'lg' ? 'border-primary bg-primary/5' : ''}
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
                      ${currentSettings.radius === 'full' ? 'border-primary bg-primary/5' : ''}
                    `}
                  >
                    Full
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Font Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Font</CardTitle>
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
                <SelectTrigger className="w-full">
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
              
              <div className="mt-6 p-4 border rounded-md" style={{ fontFamily: getFontPreview(currentSettings.font) }}>
                <p className="font-bold text-lg mb-2">The quick brown fox jumps over the lazy dog</p>
                <p>This is a preview of the {currentSettings.font === 'system' ? 'system default' : currentSettings.font} font.</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Animations toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Animations</CardTitle>
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
          
          <div className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={resetTheme}>
              <Undo className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={applyThemeChanges}>
              <Save className="mr-2 h-4 w-4" /> Save Theme
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Configure general app settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="pref-notifications" />
                  <Label htmlFor="pref-notifications">Enable notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="pref-sounds" />
                  <Label htmlFor="pref-sounds">Enable sound effects</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="pref-auto-save" checked/>
                  <Label htmlFor="pref-auto-save">Auto-save changes</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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