import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const countryCodes = [
  { code: "+225", flag: "🇨🇮", label: "CI" },
  { code: "+223", flag: "🇲🇱", label: "ML" },
  { code: "+226", flag: "🇧🇫", label: "BF" },
  { code: "+228", flag: "🇹🇬", label: "TG" },
  { code: "+229", flag: "🇧🇯", label: "BJ" },
  { code: "+221", flag: "🇸🇳", label: "SN" },
  { code: "+224", flag: "🇬🇳", label: "GN" },
  { code: "+227", flag: "🇳🇪", label: "NE" },
  { code: "+233", flag: "🇬🇭", label: "GH" },
  { code: "+234", flag: "🇳🇬", label: "NG" },
  { code: "+237", flag: "🇨🇲", label: "CM" },
  { code: "+241", flag: "🇬🇦", label: "GA" },
  { code: "+242", flag: "🇨🇬", label: "CG" },
  { code: "+243", flag: "🇨🇩", label: "CD" },
  { code: "+33", flag: "🇫🇷", label: "FR" },
  { code: "+1", flag: "🇺🇸", label: "US" },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[100px] h-12 rounded-r-none border-r-0 shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-1.5">
              <span>{c.flag}</span>
              <span className="text-xs text-muted-foreground">{c.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
