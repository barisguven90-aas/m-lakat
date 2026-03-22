import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Monitor } from "lucide-react"

export function DesktopAppModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white overflow-hidden p-0">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-2xl mb-6 shadow-xl shadow-blue-900/10 border border-white/5">
                        <Monitor className="h-10 w-10 text-blue-400" />
                    </div>

                    <DialogTitle className="text-2xl font-bold tracking-tight mb-2">Try Our Desktop App</DialogTitle>

                    <DialogDescription className="text-neutral-400 text-base mb-8 max-w-[280px]">
                        Get Stealth Mode and other exclusive features directly on your desktop workspace.
                    </DialogDescription>

                    <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25">
                        Download (Coming Soon)
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
