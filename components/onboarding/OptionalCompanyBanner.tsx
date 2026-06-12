type OptionalCompanyBannerProps = {
  className?: string
}

/** Company onboarding was removed; keep this no-op for older imports. */
export function OptionalCompanyBanner({ className = '' }: OptionalCompanyBannerProps) {
  void className
  return null
}
