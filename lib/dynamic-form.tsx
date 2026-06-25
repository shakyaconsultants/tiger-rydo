"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseJson } from "@/lib/utils";

export type DynamicField = {
  id: string;
  name: string;
  slug: string;
  fieldType: string;
  required: boolean;
  options?: string | null;
};

export function DynamicFormFields({ fields, prefix = "" }: { fields: DynamicField[]; prefix?: string }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const name = `${prefix}${field.slug}`;
        const options = parseJson<string[]>(field.options, []);
        return (
          <div key={field.id}>
            <Label htmlFor={name}>{field.name}{field.required ? " *" : ""}</Label>
            {field.fieldType === "TEXTAREA" || field.fieldType === "RICH_TEXT" ? (
              <Textarea id={name} name={name} required={field.required} className="mt-1" />
            ) : field.fieldType === "SELECT" ? (
              <select id={name} name={name} required={field.required} className="mt-1 flex h-10 w-full border border-brand-lightGrey bg-white px-3 text-sm">
                <option value="">Select...</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : field.fieldType === "BOOLEAN" ? (
              <input id={name} name={name} type="checkbox" className="mt-2" />
            ) : field.fieldType === "IMAGE" || field.fieldType === "VIDEO" ? (
              <Input id={name} name={name} type="file" accept={field.fieldType === "VIDEO" ? "video/*" : "image/*"} required={field.required} className="mt-1" />
            ) : (
              <Input id={name} name={name} type={field.fieldType === "NUMBER" ? "number" : field.fieldType === "URL" ? "url" : "text"} required={field.required} className="mt-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
