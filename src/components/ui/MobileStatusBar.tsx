import { Battery, Signal, Wifi } from 'lucide-react'

// Faithful reproduction of the Figma "Status Bar - iPhone" component
// (Time/Wifi/Signal/Battery, icon/default token). Only rendered in the
// mobile-frame layout so it isn't shown redundantly next to a real phone's
// own OS status bar when viewed at desktop width.
export function MobileStatusBar() {
  return (
    <div className="flex h-54 items-center justify-between px-24 text-icon-default">
      <span className="text-style-body font-semibold">9:41</span>
      <div className="flex items-center gap-6">
        <Signal size={16} />
        <Wifi size={16} />
        <Battery size={20} />
      </div>
    </div>
  )
}
