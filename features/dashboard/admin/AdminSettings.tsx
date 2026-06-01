"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { useUpdateProfileMutation } from "@/hooks/queries/useProfileMutations";
import { getErrorDetail } from "@/lib/apiErrors";

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
  const [tab, setTab] = useState<Tab>("profile");
  const userQuery = useCurrentUser();
  const user = userQuery.data;
  const updateProfile = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setPhone(user.phone_number ?? "");
  }, [user]);

  const saveProfile = async () => {
    await updateProfile.mutateAsync({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
    });
  };

  if (userQuery.isLoading && !user) {
    return <p className="ff-muted">Loading settings…</p>;
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
        <section className="max-w-lg space-y-4 ff-card">
          <h3 className="text-lg font-semibold ff-heading">Security settings</h3>
          <p className="text-sm ff-muted">
            Change password and two-factor authentication can be wired to your auth provider. Use
            the platform sign-in flow password reset if you need to rotate credentials today.
          </p>
          <div>
            <p className="text-sm font-medium ff-heading">Login activity</p>
            <p className="mt-1 text-sm ff-muted">
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
