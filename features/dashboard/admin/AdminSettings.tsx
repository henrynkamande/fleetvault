"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from "@/hooks/queries/useProfileMutations";
import { getErrorDetail } from "@/lib/apiErrors";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import { AppRoutesPaths } from "@/route/paths";
import { useAuthStore } from "@/store/useAuthStore";

type Tab = "profile" | "security" | "preferences";

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "border-b-2 border-indigo-600 pb-2 text-sm font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
          : "pb-2 text-sm font-medium ff-muted"
      }
    >
      {label}
    </button>
  );
}

export default function AdminSettings() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [tab, setTab] = useState<Tab>("profile");
  const userQuery = useCurrentUser();
  const user = userQuery.data;
  const updateProfile = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    const timer = window.setTimeout(() => {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setPhone(user.phone_number ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  const saveProfile = async () => {
    await updateProfile.mutateAsync({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
    });
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (newPassword === oldPassword) {
      toast.error("Choose a new password that is different from your current one.");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated. Sign in again with your new password.");
      clearSession();
      router.push(AppRoutesPaths.auth.signin);
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not change password.");
    }
  };

  if (userQuery.isLoading && !user) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 border-b border-slate-200 dark:border-slate-800">
        <TabButton label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        <TabButton label="Security" active={tab === "security"} onClick={() => setTab("security")} />
        <TabButton
          label="Preferences"
          active={tab === "preferences"}
          onClick={() => setTab("preferences")}
        />
      </div>

      {tab === "profile" ? (
        <section className="max-w-lg space-y-4 ff-card">
          <h3 className="text-lg font-semibold ff-heading">Profile settings</h3>
          <label className="block text-sm">
            <span className="ff-muted">Full name</span>
            <div className="mt-1 flex gap-2">
              <input
                className="ff-dashboard-select w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
              <input
                className="ff-dashboard-select w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="ff-muted">Email address</span>
            <input
              className="mt-1 ff-dashboard-select w-full opacity-70"
              value={user?.email ?? ""}
              readOnly
            />
          </label>
          <label className="block text-sm">
            <span className="ff-muted">Phone number</span>
            <input
              className="mt-1 ff-dashboard-select w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <p className="text-xs ff-muted">
            Profile photo uploads use the same account API as fleet owners when enabled on the
            server.
          </p>
          {updateProfile.isError ? (
            <p className="text-sm text-rose-600">{getErrorDetail(updateProfile.error)}</p>
          ) : null}
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={updateProfile.isPending}
            onClick={() => void saveProfile()}
          >
            Save profile
          </button>
        </section>
      ) : null}

      {tab === "security" ? (
        <section className="max-w-lg space-y-6">
          <form onSubmit={submitPasswordChange} className="space-y-4 ff-card">
            <h3 className="text-lg font-semibold ff-heading">Change password</h3>
            <p className="text-sm ff-muted">
              Enter your current password and a new one. No verification code is required while you
              are signed in.
            </p>
            <label className="block text-sm">
              <span className="ff-muted">Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                className="mt-1 ff-dashboard-select w-full"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="ff-muted">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1 ff-dashboard-select w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="block text-sm">
              <span className="ff-muted">Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1 ff-dashboard-select w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? "Updating…" : "Update password"}
            </button>
          </form>
          <div className="ff-card space-y-2">
            <p className="text-sm font-medium ff-heading">Login activity</p>
            <p className="text-sm ff-muted">
              Last login:{" "}
              {user?.last_login ? new Date(user.last_login).toLocaleString() : "Not recorded"}
            </p>
            <p className="text-sm ff-muted">Account created: {user?.date_joined?.slice(0, 10)}</p>
          </div>
        </section>
      ) : null}

      {tab === "preferences" ? (
        <section className="max-w-lg space-y-4 ff-card">
          <h3 className="text-lg font-semibold ff-heading">Preferences</h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
          </label>
          <label className="block text-sm">
            <span className="ff-muted">Language</span>
            <select
              className="mt-1 ff-dashboard-select w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
            </select>
          </label>
        </section>
      ) : null}
    </div>
  );
}
