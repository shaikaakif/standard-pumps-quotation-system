
```md
# CALCULATION FLOW

## Step 1
Input Bore Depth

Example:
500 FT

---

## Step 2
Convert Feet to Meter

Formula:
meters = feet / 3.28

Example:
500 / 3.28
= 152.44 meters

---

## Step 3
Calculate Cable Length

Formula:
cable_length = meters + 10

Example:
152.44 + 10
= 162.44 meters

---

## Step 4
Select Pipe Type

Example Rules:

0-200 FT → 10 KG
200-450 FT → 12.5 KG
450-700 FT → 16 KG

---

## Step 5
Select Cable Type

Example:
2.5 SQMM
4 SQMM

Based on bore depth.

---

## Step 6
Select Motor

Example:
500 FT
↓
2 HP 25 Stage

---

## Step 7
Calculate Costs

Pipe Cost
Cable Cost
Starter Cost
Fitting Cost
Accessory Cost
Motor Cost

---

## Step 8
Apply Discount

Default Discount:
2.5%

---

## Step 9
Generate Quotation JSON

Backend returns complete quotation object.

---

## Step 10
Render UI Preview

Frontend renders:
- quotation preview
- totals
- motor comparison
- recommendation cards
```

---

# FILE: docs/ui-guidelines.md

```md