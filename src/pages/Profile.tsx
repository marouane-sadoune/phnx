import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    User, Lock, ShoppingBag, LogOut,
    Camera, Check, Loader2, Package, ChevronRight, Clock
} from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProductCard } from "@/components/ProductCard";

/* ── Avatar with initials fallback ─────────────────────────── */
function Avatar({ name, email, src, size = 20 }: { name?: string; email?: string; src?: string; size?: number }) {
    const initials = name
        ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : email?.[0]?.toUpperCase() ?? "?";

    if (src) {
        return (
            <div className="shrink-0 overflow-hidden rounded-full border border-border shadow-sm" style={{ width: size, height: size }}>
                <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className="rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 shadow-sm transition-transform"
            style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
            {initials}
        </div>
    );
}

/* ── Tab type ───────────────────────────────────────────────── */
type Tab = "account" | "security" | "orders" | "recent";

/* ── Mock orders ────────────────────────────────────────────── */
const MOCK_ORDERS = [
    { id: "#1024", date: "Mar 10, 2026", status: "Delivered", total: "349.00 MAD", items: 2 },
    { id: "#1018", date: "Feb 28, 2026", status: "Shipped", total: "199.00 MAD", items: 1 },
    { id: "#1007", date: "Feb 12, 2026", status: "Delivered", total: "598.00 MAD", items: 3 },
];

const STATUS_COLORS: Record<string, string> = {
    Delivered: "bg-green-500/10 text-green-600",
    Shipped: "bg-blue-500/10 text-blue-600",
    Processing: "bg-yellow-500/10 text-yellow-600",
    Cancelled: "bg-red-500/10 text-red-600",
};

/* ── Main page ──────────────────────────────────────────────── */
const Profile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!user) {
        navigate("/auth");
        return null;
    }

    const displayName: string = user.user_metadata?.display_name ?? "";
    const email = user.email ?? "";

    const [activeTab, setActiveTab] = useState<Tab>("account");

    /* Account info state */
    const [name, setName] = useState(displayName);
    const [savingName, setSavingName] = useState(false);

    /* Security state */
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [savingPw, setSavingPw] = useState(false);

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingName(true);
        const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
        setSavingName(false);
        if (error) toast.error(error.message);
        else toast.success("Display name updated!");
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
        if (newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setSavingPw(true);
        const { error } = await supabase.auth.updateUser({ password: newPw });
        setSavingPw(false);
        if (error) toast.error(error.message);
        else {
            toast.success("Password updated!");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        }
    };

    /* Avatar state */
    const avatarUrl = user.user_metadata?.avatar_url ?? "";
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingAvatar(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update User Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            toast.success("Profile image updated!");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload image");
            console.error(error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out");
        navigate("/");
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
        { id: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
        { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
        { id: "recent", label: "Recent", icon: <Clock className="h-4 w-4" /> },
    ];

    const { viewedProducts } = useRecentlyViewed();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-16">
                <section className="w-full max-w-4xl mx-auto px-6 md:px-10 py-14">

                    {/* ── Profile hero card ─────────────────────────── */}
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5 bg-card border border-border rounded-2xl p-6 mb-8 overflow-hidden">
                        {/* subtle gradient accent */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                        {/* Avatar */}
                        <div className="relative group">
                            <Avatar name={name || displayName} email={email} src={avatarUrl} size={88} />
                            <label className={`
                                absolute bottom-0 right-0 rounded-full bg-background border border-border p-1.5 
                                cursor-pointer hover:bg-secondary transition-all shadow-md active:scale-95
                                ${uploadingAvatar ? "animate-pulse opacity-50 cursor-wait" : ""}
                            `}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                />
                                {uploadingAvatar ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                ) : (
                                    <Camera className="h-3 w-3 text-muted-foreground" />
                                )}
                            </label>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-bold tracking-tight">
                                {name || displayName || "PHENIX Member"}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </p>
                        </div>

                        {/* Sign out */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSignOut}
                            className="flex items-center gap-2 shrink-0"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </Button>
                    </div>

                    {/* ── Tabs ─────────────────────────────────────── */}
                    <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200
                  ${activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"}
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab content ──────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">

                        {/* ACCOUNT INFO */}
                        {activeTab === "account" && (
                            <form onSubmit={handleSaveName} className="space-y-6 max-w-md">
                                <div>
                                    <h2 className="text-base font-semibold mb-1">Account Information</h2>
                                    <p className="text-sm text-muted-foreground">Update your personal details</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="disp-name">Display Name</Label>
                                    <Input
                                        id="disp-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="bg-secondary border-border"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email-field">Email</Label>
                                    <Input
                                        id="email-field"
                                        value={email}
                                        disabled
                                        className="bg-secondary/50 border-border opacity-60 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                                </div>

                                <Button type="submit" disabled={savingName} className="flex items-center gap-2">
                                    {savingName
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                                        : <><Check className="h-4 w-4" /> Save Changes</>}
                                </Button>
                            </form>
                        )}

                        {/* SECURITY */}
                        {activeTab === "security" && (
                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                <div>
                                    <h2 className="text-base font-semibold mb-1">Change Password</h2>
                                    <p className="text-sm text-muted-foreground">Choose a strong password (min. 6 characters)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-pw">New Password</Label>
                                    <Input
                                        id="new-pw"
                                        type="password"
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="bg-secondary border-border"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-pw">Confirm Password</Label>
                                    <Input
                                        id="confirm-pw"
                                        type="password"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="bg-secondary border-border"
                                    />
                                </div>

                                <Button type="submit" disabled={savingPw} className="flex items-center gap-2">
                                    {savingPw
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
                                        : <><Lock className="h-4 w-4" /> Update Password</>}
                                </Button>
                            </form>
                        )}

                        {/* ORDERS */}
                        {activeTab === "orders" && (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-base font-semibold mb-1">Order History</h2>
                                    <p className="text-sm text-muted-foreground">Your recent purchases</p>
                                </div>

                                {MOCK_ORDERS.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                                        <p className="font-medium">No orders yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Start shopping to see your orders here</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => navigate("/collections")}
                                        >
                                            Browse Collection
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {MOCK_ORDERS.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between py-4 group cursor-pointer hover:bg-secondary/30 -mx-2 px-2 rounded-lg transition-colors"
                                            >
                                                <div className="flex gap-4 items-center">
                                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{order.id}</p>
                                                        <p className="text-xs text-muted-foreground">{order.date} · {order.items} item{order.items !== 1 ? "s" : ""}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? ""}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-sm font-semibold hidden sm:block">{order.total}</span>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* RECENT VIEWS */}
                        {activeTab === "recent" && (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-base font-semibold mb-1">Recently Viewed</h2>
                                    <p className="text-sm text-muted-foreground">Products you've looked at recently</p>
                                </div>

                                {viewedProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Clock className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                                        <p className="font-medium">No recent views</p>
                                        <p className="text-sm text-muted-foreground mt-1">Start browsing to build your history</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => navigate("/collections")}
                                        >
                                            Browse Collection
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
                                        {viewedProducts.map((p) => (
                                            <ProductCard key={p.node.id} product={p} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
