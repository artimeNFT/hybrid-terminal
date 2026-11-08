# Hybrid System — חוזה החלטה מצומצם MTF (P1, תיעוד בלבד)

**גרסה:** P1 v1, 2026-11-08. **סמכות:** תיאור אופן השימוש והפערים בלבד; **לא** מנוע MTF ממומש, לא איתות מסחר חדש, לא הוראה ל־Claude/Work להפעיל קוד.  
**מקור אמת לכיוון:** [OPERATING_STRATEGY.md](OPERATING_STRATEGY.md). **בדיקת קוד:** `hybrid-terminal.html` ב־`main` commit `bfa8f5ffa9dee5e34c2df4ee0c07f75b89f5ecf1`, HTML blob `d01bcf6cf237d28800f1f14186fbe8100ab90327`. **חסם מוצר:** [STATUS.md](https://github.com/artimeNFT/hybrid-terminal/blob/main/STATUS.md).

## A. חוזה החלטה אחת — תהליך של סוחר, לא סוכן אוטומטי

`venue/product/symbol` → `style` (Scalp / Intraday / Swing) → `primary_setup_TF` → `context_TFs` → `execution_TF` → `closed_as_of` → `setup_family` (A continuation / B reversal / C session handoff / D existing mean reversion) → `observed_condition` → `invalidation` → `stop/target/horizon` → `cost_basis` → `human_decision` (WAIT / observe / draft plan).

**כל שדה שאינו ידוע:** מסמנים `unavailable`, לא ממלאים בהשערה. המודל הקיים מממש רק משפחה D בקירוב; A/B/C הם תסריטים מן המקורות, **לא** תנאי אות אוטומטיים בטרמינל. `human_decision` אינו שדה שמחושב או נשמר אוטומטית באפליקציה הנוכחית — זה מפרט עתידי/דף עבודה אנושי.

**תפקיד מסגרות הזמן:** 4h/1h עשויים לתת הקשר, 1h/15m יכולים לשמש setup, 15m/5m ביצוע לפי סגנון; Swing אינו חייב 5m. אם 4h↓ ו־1h↑, אין הצבעת רוב או איסור LONG/SHORT אוטומטי: מסווגים **תיקון / ניסיון היפוך / countertrend** רק כשיש מבנה ורמת ביטול מוגדרים בזמן; אחרת `unclassified → WAIT`.

**כלל זמן:** רק נרות סגורים עד `decision_as_of`. אם משתמשים ב־HTF, חייב להיות מצב HTF ההיסטורי *כפי שהיה זמין באותו רגע*. סגירת נר עתידי, שיא/שפל סופי של סשן שטרם הסתיים וצבע Vector סופי של נר פתוח אינם נתוני אישור.

**סגנון וסיכון:** מגדירים קודם Scalp/Intraday/Swing, אופק עסקה, סטופ/ביטול, יעד, עלויות ונזילות. אין להפוך Scalp מפסיד ל־Swing בדיעבד. לכל אחד משלושת ה־setups החדשים חסר עדיין מפרט מלא של תנאי כניסה/סיכון/יציאה וראיות net edge.

## B. ביקורת סגורה — LONG/SHORT, כשירות ו־suppressedOther

**עובדות קוד** `hybrid-terminal.html` שורות ~201–222: לכל צד `score` מתוך 5 בנפרד; `eligible = valid && score>=S.min && target && geometryEligible`. הבחירה מתרחשת באמצעות `short=SHORT.score>=LONG.score` **לפני** בדיקת הכשירות. `g.side` מחזיר `WAIT` אם הצד שנבחר אינו כשיר; אין fallback אל הצד האחר. `selection.suppressedOther` מסמן מצב שבו הצד שלא נבחר דווקא כשיר.

**מקרי ייחוס לוגיים (דוגמאות מסבירות, לא ספירת אירועים בשוק):**

| מועמד LONG | מועמד SHORT | צד שנבחר תחילה | תוצאה קיימת |
|---|---|---|---|
| score 3, eligible | score 3, ineligible | SHORT (תיקו) | `WAIT`; `suppressedOther=true` |
| score 3, eligible | score 4, ineligible | SHORT | `WAIT`; `suppressedOther=true` |
| score 4, ineligible | score 3, eligible | LONG | `WAIT`; `suppressedOther=true` |
| score 4, eligible | score 3, ineligible | LONG | `LONG`; אין suppression |
| score 4, eligible | score 4, eligible | SHORT (תיקו) | `SHORT`; לפי מדיניות קיימת |

**ממצא דיוק חשוב:** הכלל מתועד כבר ב־Help (`score-selection`, שורות ~369–372), חלונית `candidateHTML` מציגה שני מועמדים וכשירות (~1534), ו־`selectionText` מסביר suppression (~1532). ה־journal שומר גם `candidateDiagnostics` (~681–685). לכן **לא נמצאה הסתרה עקרונית של ההתנהגות** ולא מוצדק "תיקון אוטומטי". זו מדיניות קיימת עם trade-off, לא שגיאת ריצה מוכחת.

**גבולות הממצא:** אין בידינו תדירות אירועי suppression על נתוני Perp, מדגם תוצאות או אומדן השפעה נטו. ה־Backtest משתמש ב־`g.side`, ולכן הוא **לא מבצע עסקאות ב־WAIT** (~224–232). בחירה אלטרנטיבית לפי eligibility תייצר קבוצת עסקאות אחרת; שינוי כזה ידרוש אישור אסטרטגיה, ניסוי והתייחסות ל־Risk/QA. אין "לתקן" `SHORT` תיקו, לשנות RSI או score, או להסיק רווחיות מקיום פער לוגי.

## C. סיום תחום ומסירת עבודה

**Audit static (בוצע):** הושוו תנאי `candidate`, מנגנון `selection`, Help, Diagnostics, Journal ו־Backtest ב־main. **הכרעה:** התנהגות suppression מכוונת, קיימת ומוצהרת; אין צורך ב־PR מיידי. הביקורת היא *source-level בלבד*: לא בוצעה בדיקת דפדפן, לא run עם נרות שוק, לא אומתה שכיחות בפועל.

**P1 doc (בוצע):** חוזה החלטה אנושי מינימלי לעבודה ב־4 טווחים קיימים ועם משפחות A/B/C/D. **לא** להציג אותו כמנוע קיים, לא להוסיף שדות לממשק ללא אישור. סגנון `human_decision` הוא הבחנת UX עתידית בלבד.

**P0 נשאר בנפרד:** full QA regional reload `BLOCKED`; PR1 sizing `DRAFT`; perp-support-v2 `INCOMPLETE` בשל `F.tally`. אין תיקון סיבוב שני, merge או מחקר חדש בסמכות מסמך זה.

**המשך מוצע, עם גבול:** שימוש ב־P1 כמסגרת לביקורת מוצר אחת על המסך הנוכחי לאחר סגירת/הכרעת P0. תנאי כניסה לעבודה: פער החלטה מדיד, בעלות פיתוח, הגדרת acceptance. **אם אין פער — סוגרים, לא מייצרים roadmap נוסף.** הקפאת `1m/3m/1d/1w`, ווליום מתקדם, Brinks detector, פילטר MTF ושינוי מנוע נשמרת.
