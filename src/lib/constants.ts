export const GRADES = [
  { value: "1st_sec", label: "أولى ثانوي" },
  { value: "2nd_sec", label: "ثانية ثانوي" },
  { value: "3rd_sec", label: "ثالثة ثانوي" },
] as const;

export type GradeLevel = (typeof GRADES)[number]["value"];

export const gradeLabel = (g?: string | null) =>
  GRADES.find((x) => x.value === g)?.label ?? "—";

export const EVENT_TYPES = [
  { value: "sunday_school", label: "مدارس أحد" },
  { value: "activity", label: "نشاط" },
  { value: "recreation", label: "ترفيه" },
  { value: "liturgy", label: "قداس" },
  { value: "tasbeha", label: "تسبحة" },
] as const;

export const eventTypeLabel = (t?: string | null) =>
  EVENT_TYPES.find((x) => x.value === t)?.label ?? "حدث";

export const RECURRENCES = [
  { value: "once", label: "مرة واحدة" },
  { value: "weekly", label: "أسبوعي" },
  { value: "custom", label: "مخصص" },
] as const;

export const WEEK_DAYS = [
  { value: "0", label: "الأحد" },
  { value: "1", label: "الإثنين" },
  { value: "2", label: "الثلاثاء" },
  { value: "3", label: "الأربعاء" },
  { value: "4", label: "الخميس" },
  { value: "5", label: "الجمعة" },
  { value: "6", label: "السبت" },
] as const;

export const PRAYERS = [
  { key: "baker", label: "باكر" },
  { key: "ghroob", label: "غروب" },
  { key: "noom", label: "نوم" },
  { key: "free", label: "صلاة حرة" },
] as const;

export const OLD_TESTAMENT = [
  "التكوين",
  "الخروج",
  "اللاويين",
  "العدد",
  "التثنية",
  "يشوع",
  "القضاة",
  "راعوث",
  "صموئيل الأول",
  "صموئيل الثاني",
  "الملوك الأول",
  "الملوك الثاني",
  "أخبار الأيام الأول",
  "أخبار الأيام الثاني",
  "عزرا",
  "نحميا",
  "أستير",
  "أيوب",
  "المزامير",
  "الأمثال",
  "الجامعة",
  "نشيد الأناشيد",
  "إشعياء",
  "إرميا",
  "مراثي إرميا",
  "حزقيال",
  "دانيال",
  "هوشع",
  "يوئيل",
  "عاموس",
  "عوبديا",
  "يونان",
  "ميخا",
  "ناحوم",
  "حبقوق",
  "صفنيا",
  "حجي",
  "زكريا",
  "ملاخي",
];

export const NEW_TESTAMENT = [
  "إنجيل متى",
  "إنجيل مرقس",
  "إنجيل لوقا",
  "إنجيل يوحنا",
  "أعمال الرسل",
  "رومية",
  "كورنثوس الأولى",
  "كورنثوس الثانية",
  "غلاطية",
  "أفسس",
  "فيلبي",
  "كولوسي",
  "تسالونيكي الأولى",
  "تسالونيكي الثانية",
  "تيموثاوس الأولى",
  "تيموثاوس الثانية",
  "تيطس",
  "فليمون",
  "العبرانيين",
  "يعقوب",
  "بطرس الأولى",
  "بطرس الثانية",
  "يوحنا الأولى",
  "يوحنا الثانية",
  "يوحنا الثالثة",
  "يهوذا",
  "الرؤيا",
];
