#!/usr/bin/env python3
"""Migrate Vite feature/components to Next.js-friendly imports."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRS = [ROOT / "features", ROOT / "components"]


def to_alias_import(line: str) -> str:
    m = re.match(r"from ['\"](\.+/)([^'\"]+)['\"]", line)
    if not m:
        return line
    rel = m.group(1)
    rest = m.group(2).removesuffix(".tsx").removesuffix(".ts")
    depth = rel.count("/")
    if depth <= 1:
        return line
    # ../../foo -> @/foo, ../foo -> @/foo (from features/x/file -> features/foo wrong)
    # Normalize: count .. segments
    parts = rel.rstrip("/").split("/")
    ups = sum(1 for p in parts if p == "..")
    # path after ups from features/home/Hero: ../../components -> @/components
    target = rest
    if ups == 2:
        # ../../X -> @/X
        pass
    elif ups == 1:
        # ../X from features/home -> features/X - wrong for cross-folder
        pass
    return re.sub(
        r"from ['\"]\.\./(?:\.\./)*(.*?)['\"]",
        lambda mm: f"from '@/{mm.group(1).removesuffix('.tsx').removesuffix('.ts')}'",
        line,
    )


def migrate_content(text: str) -> str:
    if "react-router-dom" in text:
        text = re.sub(
            r"import \{[^}]+\} from ['\"]react-router-dom['\"]\s*\n?",
            "",
            text,
        )
        needs_link = "<Link" in text or "<NavLink" in text or "Link " in text
        needs_router = "useNavigate" in text or "Navigate" in text
        needs_pathname = "useLocation" in text
        needs_params = "useParams" in text
        nav_parts = []
        if needs_router or "Navigate" in text:
            nav_parts.append("useRouter")
        if needs_pathname:
            nav_parts.append("usePathname")
        if needs_params:
            nav_parts.append("useParams")
        inject = []
        if nav_parts:
            inject.append(
                f"import {{ {', '.join(nav_parts)} }} from 'next/navigation';"
            )
        if needs_link:
            inject.append("import Link from 'next/link';")
        if inject:
            text = "\n".join(inject) + "\n" + text

        text = text.replace("useNavigate()", "useRouter()")
        text = re.sub(
            r"const navigate = useRouter\(\)",
            "const router = useRouter()",
            text,
        )
        text = text.replace("navigate(", "router.push(")
        text = re.sub(
            r"router\.push\(([^,)]+),\s*\{\s*replace:\s*true\s*\}\)",
            r"router.replace(\1)",
            text,
        )
        text = text.replace("useLocation()", "usePathname()")
        text = re.sub(
            r"const location = usePathname\(\)",
            "const pathname = usePathname()",
            text,
        )
        text = text.replace("location.pathname", "pathname")
        text = text.replace("<NavLink", "<Link")
        text = re.sub(r"\sto=", " href=", text)
        text = re.sub(r'\sprefetch="intent"', "", text)

        # Navigate -> client redirect component inline
        text = re.sub(
            r"return <Navigate to=\{([^}]+)\} replace(?: state=\{[^}]+\})? />",
            r"useRouter().replace(\1); return null",
            text,
        )
        text = re.sub(
            r"return <Navigate to=\{([^}]+)\} replace />",
            r"useRouter().replace(\1); return null",
            text,
        )

    text = re.sub(
        r"from ['\"]\.\./\.\./route/app_route['\"]",
        "from '@/route/paths'",
        text,
    )
    text = re.sub(
        r"from ['\"]\.\./\.\./route/paths['\"]",
        "from '@/route/paths'",
        text,
    )
    text = re.sub(
        r"from ['\"]\.\./route/app_route['\"]",
        "from '@/route/paths'",
        text,
    )
    text = re.sub(
        r"from ['\"]\.\./\.\./([^'\"]+)['\"]",
        lambda m: f"from '@/{m.group(1).removesuffix('.tsx').removesuffix('.ts')}'",
        text,
    )
    text = re.sub(
        r"from ['\"]\.\./([^'\"]+)['\"]",
        lambda m: f"from '@/{m.group(1).removesuffix('.tsx').removesuffix('.ts')}'",
        text,
    )

    text = re.sub(
        r"import fleetImage from ['\"]@/assets/fleet\.png['\"]",
        "const fleetImage = '/fleet-hero.png'",
        text,
    )
    text = re.sub(
        r"import fleetImage from ['\"]\.\./\.\./assets/fleet\.png['\"]",
        "const fleetImage = '/fleet-hero.png'",
        text,
    )

    # AppRoutesPaths + navigation helpers
    text = text.replace(
        "from '@/route/paths'",
        "from '@/route/paths'",
    )
    if "appPageToPath" in text and "from '@/route/paths'" in text:
        text = text.replace(
            "import { AppRoutesPaths, appPageToPath, resolveActiveAppPage } from '@/route/paths'",
            "import { AppRoutesPaths } from '@/route/paths'\nimport { appPageToPath, resolveActiveAppPage } from '@/route/dashboardNavigation'",
        )

    client_markers = (
        "useState",
        "useEffect",
        "useRouter",
        "usePathname",
        "useParams",
        "useMutation",
        "useQuery",
        "useQueryClient",
        "onClick",
    )
    if any(m in text for m in client_markers) and not text.lstrip().startswith(
        '"use client"'
    ):
        text = '"use client";\n\n' + text

    return text


def main() -> None:
    for base in DIRS:
        if not base.exists():
            continue
        for path in base.rglob("*.tsx"):
            original = path.read_text()
            updated = migrate_content(original)
            if updated != original:
                path.write_text(updated)


if __name__ == "__main__":
    main()
