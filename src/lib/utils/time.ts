export function formatRelativeTime(dateInput: Date | string | number, locale: string = "en"): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInSecs = Math.round(diffInMs / 1000);
  const diffInMins = Math.round(diffInSecs / 60);
  const diffInHours = Math.round(diffInMins / 60);
  const diffInDays = Math.round(diffInHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { numeric: "auto" });

  if (Math.abs(diffInDays) > 0) {
    if (Math.abs(diffInDays) > 30) {
      return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return rtf.format(diffInDays, "day");
  } else if (Math.abs(diffInHours) > 0) {
    return rtf.format(diffInHours, "hour");
  } else if (Math.abs(diffInMins) > 0) {
    return rtf.format(diffInMins, "minute");
  } else {
    return locale === "zh" ? "刚刚" : "Just now";
  }
}
