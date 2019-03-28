library(ggplot2)
library(usmap)
library(gtable)
library(grid)
library(gridExtra)
library(reshape2)
library(tidyverse)

mpg

# count up how many of each kind of 'fl':
b <- ggplot(mpg, aes(x=fl))
b + geom_bar()

# count up how much 'hwy' is in each 'fl':
g <- ggplot(mpg, aes(x=fl, y=hwy))
g+geom_bar(stat="identity")
