setwd('~/Work/NZILBB/convergence_esp_2/ESP-bots-vs-humans/peter/')

library(dplyr)
library(lme4)

test2 <- read.csv('ESP2_nonce_verbs_gcm.txt')



fit1 <- glmer(postReg ~ gcm_reg * peerCondition + (1 | participant_id), data = test2, family="binomial", control=glmerControl(optimizer="bobyqa"))
fit1b <- glmer(postReg ~ gcm_reg + peerCondition + (1 | participant_id), data = test2, family="binomial", control=glmerControl(optimizer="bobyqa"))

summary(fit1)
round(summary(fit1)$coef,2)
vif.mer(fit1)
summary(fit1b)
plot(effect('gcm_reg:peerCondition', fit1))

fit1c <- glmer(postReg ~ gcm_reg + peerCondition * as.factor(botRegRate) + (1 | participant_id), data = test2, family="binomial", control=glmerControl(optimizer="bobyqa"))
summary(fit1c)
vif.mer(fit1c)
round(summary(fit1c)$coef,2)

test2$gcm_diff <- test2$gcm_reg - test2$celex_gcm_nof

fit1d <- glmer(postReg ~ celex_gcm_nof + gcm_diff + (1 | participant_id), data = test2, family="binomial", control=glmerControl(optimizer="bobyqa"))

summary(fit1d)
