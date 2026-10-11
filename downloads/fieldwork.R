# Rocky shore fieldwork · IB Biology · the analysis in R
# Dr Daniel Mompel Riera, NLCS Jeju · https://nlcsbiology.com/rocky-shore-fieldwork-pract/
# Code: AGPL-3.0. Teaching material: CC BY-NC-SA 4.0.
#
# How to run it: save this file in the same folder as transect.csv and random-quadrats.csv
# (download them from parts 3 and 4 of the page). In RStudio: Session > Set Working Directory >
# To Source File Location, then press Source. With no CSV files in the folder, the script uses the
# page's own data (a simulated shore).

# ---- 1. Read the data ---------------------------------------------------------------------------
if (file.exists("transect.csv")) {
  transect <- read.csv("transect.csv")
} else {
  transect <- read.csv(text = "distance_m,temperature_C,barnacles_pct,sea_lettuce_pct,brown_seaweed_pct,limpets_n
0,33.6,56,0,2,1
1,32.9,50,0,6,3
2,31.4,45,89,0,2
3,31.0,30,89,0,1
4,29.4,34,100,0,0
5,28.9,20,100,0,1
6,27.7,24,100,0,2
7,26.9,10,29,26,4
8,25.6,13,0,64,3
9,25.0,5,0,84,2
10,24.2,1,0,85,1")
}
if (file.exists("random-quadrats.csv")) {
  random <- read.csv("random-quadrats.csv")
} else {
  random <- read.csv(text = "quadrat,across,down,limpets,sea_lettuce
1,7,9,absent,present
2,9,9,present,absent
3,6,2,absent,present
4,3,5,absent,present
5,1,2,absent,present
6,5,0,absent,present
7,4,1,absent,absent
8,3,7,absent,present
9,9,5,present,absent
10,4,9,absent,present
11,0,1,absent,present
12,4,4,present,absent
13,9,8,present,absent
14,1,5,absent,present
15,8,9,present,absent
16,2,9,absent,present
17,9,4,present,absent
18,3,2,absent,present
19,1,7,present,present
20,3,9,present,present
21,1,8,absent,present
22,5,7,present,absent
23,9,3,absent,absent
24,2,8,absent,present
25,3,1,present,absent
26,6,4,absent,absent
27,1,3,absent,present
28,0,8,present,present
29,8,1,present,present
30,9,0,present,absent")
}
print(transect)

# ---- 2. Kite diagram: how each species changes along the transect --------------------------------
species <- c("barnacles_pct", "sea_lettuce_pct", "brown_seaweed_pct")
names   <- c("Barnacles", "Sea lettuce", "Brown seaweed")
colours <- c("grey45", "olivedrab4", "tan4")
old <- par(mar = c(5, 8, 4, 2))                     # room for the species names
plot(NULL, xlim = c(0, 10), ylim = c(0.5, 3.5), yaxt = "n",
     xlab = "Distance from the top of the shore / m", ylab = "",
     main = "Figure 1. Percentage cover along the transect")
axis(2, at = 3:1, labels = names, las = 1, cex.axis = 0.8)
for (i in 1:3) {
  y <- 4 - i
  half <- transect[[species[i]]] / 100 * 0.45          # 100 % cover = a kite 0.9 units wide
  polygon(c(transect$distance_m, rev(transect$distance_m)),
          c(y + half, rev(y - half)), col = colours[i], border = colours[i])
  abline(h = y, col = "grey70")
}
par(old)

# ---- 3. Correlation: barnacle cover and rock temperature (B4.1.4) --------------------------------
plot(transect$temperature_C, transect$barnacles_pct, pch = 19,
     xlab = "Rock temperature / °C", ylab = "Barnacle cover / %",
     main = "Figure 2. Barnacle cover and rock temperature")
fit <- lm(barnacles_pct ~ temperature_C, data = transect)
abline(fit, lty = 2)
print(cor.test(transect$temperature_C, transect$barnacles_pct))    # Pearson's r and its p-value
cat("R squared:", round(summary(fit)$r.squared, 3), "\n")
# Change barnacles_pct to sea_lettuce_pct or brown_seaweed_pct (three places in this section),
# and look at the graph first: Pearson's r measures only a straight-line pattern.

# ---- 4. Chi-squared: is there an association between limpets and sea lettuce? (C4.1.15) ----------
tab <- table(Limpets = random$limpets, Sea_lettuce = random$sea_lettuce)
print(tab)
test <- chisq.test(tab, correct = FALSE)   # correct = FALSE: the value you calculate by hand
print(test)
print(test$expected)                       # every expected value should be at least 5
